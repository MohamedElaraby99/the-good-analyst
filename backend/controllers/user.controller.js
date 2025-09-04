import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import bcrypt from 'bcrypt';

import cloudinary from 'cloudinary';
import { OAuth2Client } from 'google-auth-library';
import AppError from "../utils/error.utils.js";
import sendEmail from "../utils/sendEmail.js";
import UserDevice from '../models/userDevice.model.js';
import { generateDeviceFingerprint, parseDeviceInfo, generateDeviceName } from '../utils/deviceUtils.js';
import { generateProductionFileUrl } from '../utils/fileUtils.js';
import { getDeviceLimit } from '../config/device.config.js';

const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: true, 
    sameSite: 'none'
}

// Google OAuth2 Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth Registration Helper
const registerWithGoogle = async (req, res, next, googleToken, deviceInfo) => {
    try {
        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;
        
        if (!email || !name) {
            return next(new AppError("Invalid Google token", 400));
        }
        
        // Check if user already exists
        let existingUser = await userModel.findOne({ email });
        if (existingUser) {
            // User exists, log them in
            const token = await existingUser.generateJWTToken();
            existingUser.password = undefined;
            
            res.cookie('token', token, cookieOptions);
            return res.status(200).json({
                success: true,
                message: 'User logged in successfully with Google',
                user: existingUser,
            });
        }
        
        // Create new user with Google data
        const generatedUsername = email.split('@')[0] + Math.random().toString(36).substr(2, 5);
        

        
        const userData = {
            fullName: name,
            username: generatedUsername,
            email,
            password: googleId, // Use Google ID as password
            role: 'USER',
            googleId,
            isGoogleAuth: true
        };
        
        const user = await userModel.create(userData);
        
        if (!user) {
            return next(new AppError("Google registration failed, please try again", 400));
        }
        
        console.log('Google OAuth - Created user:', {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isGoogleAuth: user.isGoogleAuth
        });
        
        const token = await user.generateJWTToken();
        user.password = undefined;
        
        res.cookie('token', token, cookieOptions);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully with Google',
            user,
        });
        
    } catch (error) {
        console.error('Google OAuth error:', error);
        return next(new AppError("Google authentication failed", 400));
    }
};


// Register  
const register = async (req, res, next) => {
    try {
        // Handle FormData requests where data comes as JSON string
        let requestBody = req.body;
        if (req.body.data && typeof req.body.data === 'string') {
            try {
                requestBody = JSON.parse(req.body.data);
            } catch (e) {
                console.log('Failed to parse FormData JSON:', e.message);
                return next(new AppError("Invalid request format", 400));
            }
        }

        const { fullName, username, email, password, phoneNumber, fatherPhoneNumber, governorate, age, adminCode, deviceInfo, googleToken } = requestBody;

        // Handle Google OAuth registration
        if (googleToken) {
            return await registerWithGoogle(req, res, next, googleToken, deviceInfo);
        }

        // Regular registration logic
        // Determine user role based on admin code
        let userRole = 'USER';
        if (adminCode === 'ADMIN123') {
            userRole = 'ADMIN';
        }

        // Check required fields for regular registration
        if (!fullName || !email || !password || !phoneNumber) {
            return next(new AppError("Name, email, password, and phone number are required", 400));
        }

        // Check if the user already exists by email or phone number
        const userExist = await userModel.findOne({ 
            $or: [{ email }, { phoneNumber }] 
        });
        if (userExist) {
            if (userExist.email === email) {
                return next(new AppError("Email already exists, please login", 400));
            }
            if (userExist.phoneNumber === phoneNumber) {
                return next(new AppError("Phone number already exists, please login", 400));
            }
        }

        // Generate a unique username from email if not provided
        const generatedUsername = username || email.split('@')[0] + Math.random().toString(36).substr(2, 5);
        
        // Check if username already exists
        const usernameExist = await userModel.findOne({ username: generatedUsername });
        if (usernameExist) {
            return next(new AppError("Username already exists, please choose another", 400));
        }

        // Prepare user data
        const userData = {
            fullName,
            username: generatedUsername,
            email,
            password,
            phoneNumber,
            role: 'USER'
        };

        // Save user in the database and log the user in
        const user = await userModel.create(userData);

        if (!user) {
            return next(new AppError("User registration failed, please try again", 400));
        }

        await user.save();

        user.password = undefined;

        // Register device automatically after successful registration
        try {
            if (deviceInfo) {
                let parsedDeviceInfo = deviceInfo;
                
                // If deviceInfo is a string, try to parse it as JSON
                if (typeof deviceInfo === 'string') {
                    try {
                        parsedDeviceInfo = JSON.parse(deviceInfo);
                    } catch (e) {
                        console.log('Failed to parse deviceInfo JSON:', e.message);
                        return next(new AppError("Invalid device information format", 400));
                    }
                }
                
                // Validate required device info fields
                if (!parsedDeviceInfo.platform || !parsedDeviceInfo.screenResolution || !parsedDeviceInfo.timezone) {
                    return next(new AppError("Invalid device information format. Please refresh the page and try again.", 400));
                }
                
                const deviceFingerprint = generateDeviceFingerprint(req, parsedDeviceInfo);
                const deviceName = generateDeviceName(parsedDeviceInfo, req);
                const finalDeviceInfo = parseDeviceInfo(req.get('User-Agent'));
                
                // Ensure all required fields are present
                const completeDeviceInfo = {
                    userAgent: req.get('User-Agent') || '',
                    platform: parsedDeviceInfo?.platform || finalDeviceInfo.platform || 'Unknown',
                    browser: parsedDeviceInfo?.additionalInfo?.browser || finalDeviceInfo.browser || 'Unknown',
                    os: parsedDeviceInfo?.additionalInfo?.os || finalDeviceInfo.os || 'Unknown',
                    ip: req.ip || req.connection.remoteAddress || '',
                    screenResolution: parsedDeviceInfo?.screenResolution || '',
                    timezone: parsedDeviceInfo?.timezone || ''
                };
                
                // Create the first device for the user
                await UserDevice.create({
                    user: user._id,
                    deviceFingerprint,
                    deviceName,
                    deviceInfo: completeDeviceInfo,
                    isActive: true,
                    firstLogin: new Date(),
                    lastActivity: new Date(),
                    loginCount: 1
                });
                
                console.log('Device registered automatically for new user:', user._id);
            }
        } catch (deviceError) {
            console.error('Device registration error during signup:', deviceError);
            // Continue with registration even if device registration fails
            console.log('Device registration failed, but user registration successful');
        }

        const token = await user.generateJWTToken();


        res.cookie("token", token, cookieOptions);

        res.status(201).json({
            success: true,
            message: `User registered successfully as ${userRole}`,
            user,
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};



// login
const login = async (req, res, next) => {
    try {
        const { email, phoneNumber, password, deviceInfo } = req.body;

        // check if user provided either email or phone number and password
        if ((!email && !phoneNumber) || !password) {
            return next(new AppError('Please provide either email or phone number and password', 400))
        }

        // Find user by email or phone number
        let user;
        if (email) {
            user = await userModel.findOne({ email }).select('+password');
        } else if (phoneNumber) {
            user = await userModel.findOne({ phoneNumber }).select('+password');
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError('Invalid credentials', 400))
        }

        console.log('=== LOGIN ATTEMPT ===');
        console.log('User identifier:', email || phoneNumber);
        console.log('User role:', user.role);
        console.log('Device info provided:', !!deviceInfo);

        // Skip device check for admin users
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            console.log('=== DEVICE REGISTRATION FOR NON-ADMIN USER ===');
            console.log('User role:', user.role);
            console.log('Device info received:', deviceInfo);
            
            // Check device authorization before allowing login
            try {
                const deviceFingerprint = generateDeviceFingerprint(req, deviceInfo || {});
                
                console.log('=== LOGIN DEVICE CHECK ===');
                console.log('User ID:', user._id);
                console.log('Device fingerprint:', deviceFingerprint);
                
                // Check if this device is already authorized
                const existingDevice = await UserDevice.findOne({
                    user: user._id,
                    deviceFingerprint,
                    isActive: true
                });

                if (existingDevice) {
                    // Device is authorized, update last login
                    existingDevice.lastActivity = new Date();
                    existingDevice.loginCount += 1;
                    await existingDevice.save();
                    console.log('Device already authorized, login allowed');
                } else {
                    // Check if user has reached device limit
                    const userDeviceCount = await UserDevice.countDocuments({
                        user: user._id,
                        isActive: true
                    });

                    // Get current device limit from shared config
                    const currentDeviceLimit = getDeviceLimit();
                    
                    if (userDeviceCount >= currentDeviceLimit) {
                        console.log(`User has reached device limit: ${userDeviceCount}/${currentDeviceLimit}`);
                        return next(new AppError(
                            `تم الوصول للحد الأقصى من الأجهزة المسموحة (${currentDeviceLimit} أجهزة). يرجى التواصل مع الإدارة لإعادة تعيين الأجهزة المصرحة.`,
                            403
                        ));
                    }

                    // Register new device automatically on login
                    const deviceName = generateDeviceName(deviceInfo || {}, req);
                    const parsedDeviceInfo = parseDeviceInfo(req.get('User-Agent'));
                    
                    // Ensure all required fields are present
                    const finalDeviceInfo = {
                        userAgent: req.get('User-Agent') || '',
                        platform: deviceInfo?.platform || parsedDeviceInfo.platform || 'Unknown',
                        browser: deviceInfo?.additionalInfo?.browser || parsedDeviceInfo.browser || 'Unknown',
                        os: deviceInfo?.additionalInfo?.os || parsedDeviceInfo.os || 'Unknown',
                        ip: req.ip || req.connection.remoteAddress || '',
                        screenResolution: deviceInfo?.screenResolution || '',
                        timezone: deviceInfo?.timezone || ''
                    };

                    const newDevice = await UserDevice.create({
                        user: user._id,
                        deviceFingerprint,
                        deviceName,
                        deviceInfo: finalDeviceInfo,
                        isActive: true,
                        firstLogin: new Date(),
                        lastActivity: new Date(),
                        loginCount: 1
                    });

                    console.log('New device registered successfully:', {
                        deviceId: newDevice._id,
                        deviceName: newDevice.deviceName,
                        deviceInfo: newDevice.deviceInfo
                    });
                }
            } catch (deviceError) {
                console.error('Device check error during login:', deviceError);
                // Continue with login if device check fails (fallback)
                console.log('Device check failed, allowing login as fallback');
            }
        } else {
            console.log('=== DEVICE REGISTRATION SKIPPED FOR ADMIN USER ===');
            console.log('Admin users do not have device restrictions');
        }

        const token = await user.generateJWTToken();

        user.password = undefined;


        res.cookie('token', token, cookieOptions)

        res.status(200).json({
            success: true,
            message: 'User loggedin successfully',
            user,
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}


// logout
const logout = async (req, res, next) => {
    try {
        res.cookie('token', null, {
            secure: true,
            maxAge: 0,
            httpOnly: true
        })

        res.status(200).json({
            success: true,
            message: 'User loggedout successfully'
        })
    }
    catch (e) {
        return next(new AppError(e.message, 500))
    }
}


// getProfile
const getProfile = async (req, res, next) => {
    try {
        const { id } = req.user;
        const user = await userModel.findById(id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        console.log('User profile data being sent:', {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            fatherPhoneNumber: user.fatherPhoneNumber,
            governorate: user.governorate,
            age: user.age,
            role: user.role
        });

        res.status(200).json({
            success: true,
            message: 'User details',
            user
        })
    } catch (e) {
        return next(new AppError('Failed to fetch user profile', 500))
    }
}

// forgot password
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    // check if user does'nt pass email
    if (!email) {
        return next(new AppError('Email is required', 400))
    }

    const user = await userModel.findOne({ email });
    // check if user not registered with the email
    if (!user) {
        return next(new AppError('Email not registered', 400))
    }

    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    const resetPasswordURL = `${process.env.CLIENT_URL}/user/profile/reset-password/${resetToken}`

    const subject = 'Reset Password';
    const message = `You can reset your password by clicking ${resetPasswordURL} Reset your password</$>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;

    try {
        await sendEmail(email, subject, message);

        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email}`,
        });
    } catch (e) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();
        return next(new AppError(e.message, 500));
    }

}


// reset password
const resetPassword = async (req, res, next) => {
    try {
        const { resetToken } = req.params;

        const { password } = req.body; 

        const forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await userModel.findOne({
            forgotPasswordToken,
            forgotPasswordExpiry: { $gt: Date.now() }
        })

        if (!user) {
            return next(new AppError("Token is invalid or expired, please try again", 400));
        }

        user.password = password;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

// change password
const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { id } = req.user;

        if (!oldPassword || !newPassword) {
            return next(new AppError("All fields are requared", 400));
        }

        const user = await userModel.findById(id).select('+password');

        if (!user) {
            return next(new AppError("User does not exist", 400));
        }

        if (!(await bcrypt.compare(oldPassword, user.password))) {
            return next(new AppError("Invalid Old Password", 400));
        }

        user.password = newPassword;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }

}

// update profile
const updateUser = async (req, res, next) => {
    try {
        const { fullName, username, phoneNumber, fatherPhoneNumber, governorate, age } = req.body;
        const { id } = req.user;

        console.log('Update user data:', { fullName, username, phoneNumber, fatherPhoneNumber, governorate, age });

        const user = await userModel.findById(id);

        if (!user) {
            return next(new AppError("user does not exist", 400));
        }

        // Update user fields if provided
        if (fullName) {
            user.fullName = fullName;
        }
        if (username) {
            // Check if username is already taken by another user
            const existingUser = await userModel.findOne({ 
                username: username, 
                _id: { $ne: id } 
            });
            if (existingUser) {
                return next(new AppError("Username already exists, please choose another", 400));
            }
            user.username = username;
        }
        if (phoneNumber) {
            user.phoneNumber = phoneNumber;
        }
        if (fatherPhoneNumber) {
            user.fatherPhoneNumber = fatherPhoneNumber;
        }
        if (governorate) {
            user.governorate = governorate;
        }
        if (age) {
            user.age = parseInt(age);
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "User update successfully",
            user
        })
    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    updateUser
}