import { useState } from "react";
import { toast } from "react-hot-toast";

import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { createAccount, createAccountWithGoogle } from "../Redux/Slices/AuthSlice";
import InputBox from "../Components/InputBox/InputBox";
import CaptchaComponent from "../Components/CaptchaComponent";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaPhone } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { axiosInstance } from "../Helpers/axiosInstance";
import { useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { generateDeviceFingerprint, getDeviceType, getBrowserInfo, getOperatingSystem } from "../utils/deviceFingerprint";
import logo from "../assets/logo.png";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [googleAuthInProgress, setGoogleAuthInProgress] = useState(false);
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: ""
  });

  // Google OAuth Client ID - You'll need to get this from Google Cloud Console
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id-here";

  // Google Login Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    // Prevent multiple concurrent Google auth attempts
    if (googleAuthInProgress) {
      console.log('Google auth already in progress, ignoring duplicate request');
      return;
    }
    
    try {
      console.log('Google OAuth Success:', credentialResponse);
      setGoogleAuthInProgress(true);
      setIsLoading(true);
      
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }
      
      // Generate device information for fingerprinting
      const deviceInfo = {
        platform: getDeviceType(),
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        additionalInfo: {
          browser: getBrowserInfo().browser,
          browserVersion: getBrowserInfo().version,
          os: getOperatingSystem(),
          language: navigator.language,
          colorDepth: screen.colorDepth,
          touchSupport: 'ontouchstart' in window,
        }
      };

      const requestData = {
        googleToken: credentialResponse.credential,
        deviceInfo: deviceInfo
        // Note: No CAPTCHA required for Google OAuth
      };

      console.log('Sending Google OAuth data to backend:', {
        ...requestData,
        googleToken: 'TOKEN_HIDDEN_FOR_SECURITY'
      });
      
      // Call backend to handle Google authentication
      const response = await dispatch(createAccountWithGoogle(requestData));
      if (response?.payload?.success) {
        const user = response.payload.user;
        const message = user.isGoogleAuth ? 
          `Welcome ${user.fullName}! Your account has been created with Google.` :
          `Welcome back ${user.fullName}! You've been logged in.`;
        toast.success(message);
        navigate("/");
      } else {
        throw new Error(response?.payload?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = 'Google authentication failed. Please try again.';
      
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'Google services are temporarily busy. Please try again in a moment.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setGoogleAuthInProgress(false);
    }
  };

  // Google Login Error Handler
  const handleGoogleError = (error) => {
    console.error('Google Login Failed:', error);
    toast.error('Google authentication failed. Please try again.');
  };

  function handleUserInput(e) {
    const { name, value } = e.target;
    
    setSignupData({
      ...signupData,
      [name]: value,
    });
  }



  // CAPTCHA handlers
  function handleCaptchaVerified(sessionId) {
    console.log('CAPTCHA verified with session ID:', sessionId);
    console.log('Setting captchaSessionId to:', sessionId);
    console.log('Setting isCaptchaVerified to true');
    setCaptchaSessionId(sessionId);
    setIsCaptchaVerified(true);
    
    // Add a small delay to ensure state is updated
    setTimeout(() => {
      console.log('State update delay completed');
      console.log('Current captchaSessionId:', sessionId);
      console.log('Current isCaptchaVerified:', true);
    }, 100);
  }

  function handleCaptchaError(error) {
    console.log('CAPTCHA error:', error);
    console.log('Setting isCaptchaVerified to false');
    console.log('Clearing captchaSessionId');
    setIsCaptchaVerified(false);
    setCaptchaSessionId("");
  }

  async function createNewAccount(event) {
    event.preventDefault();
    
    // Check CAPTCHA verification first
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form submission - CAPTCHA verified:', isCaptchaVerified);
    console.log('Form submission - CAPTCHA session ID:', captchaSessionId);
    console.log('Form submission - CAPTCHA session ID type:', typeof captchaSessionId);
    console.log('Form submission - CAPTCHA session ID length:', captchaSessionId ? captchaSessionId.length : 0);
    console.log('Form submission - Form data:', signupData);
    console.log('=== END DEBUG ===');
    
    if (!isCaptchaVerified) {
      toast.error("يرجى التحقق من رمز الأمان أولاً");
      return;
    }
    
    if (!captchaSessionId) {
      toast.error("رمز التحقق مفقود، يرجى المحاولة مرة أخرى");
      return;
    }
    
    
    // Basic required fields validation
    if (!signupData.password || !signupData.fullName || !signupData.email || !signupData.phoneNumber) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    // Validate email format
    if (!signupData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
      toast.error("بريد إلكتروني غير صحيح");
      return;
    }
    
    // Validate phone number
    if (!signupData.phoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
      toast.error("يرجى إدخال رقم هاتف مصري صحيح");
      return;
    }

    // checking name field length
    if (signupData.fullName.length < 3) {
      toast.error("يجب أن يكون الاسم 3 أحرف على الأقل");
      return;
    }
    
    // checking password length
    if (signupData.password.length < 6) {
      toast.error("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }

    // Generate device information for fingerprinting
    const deviceInfo = {
      platform: getDeviceType(),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      additionalInfo: {
        browser: getBrowserInfo().browser,
        browserVersion: getBrowserInfo().version,
        os: getOperatingSystem(),
        language: navigator.language,
        colorDepth: screen.colorDepth,
        touchSupport: 'ontouchstart' in window,
      }
    };

    // Create request data with device info as JSON object
    const requestData = {
      fullName: signupData.fullName,
      email: signupData.email,
      password: signupData.password,
      phoneNumber: signupData.phoneNumber,
      captchaSessionId: captchaSessionId,
      deviceInfo: deviceInfo
    };

    // Send as JSON since no file upload
    console.log('=== SENDING JSON REQUEST ===');
    console.log('Request data:', requestData);
    console.log('captchaSessionId from state:', captchaSessionId);
    console.log('=== END DEBUG ===');
    
    const response = await dispatch(createAccount(requestData));
    if (response?.payload?.success) {
      setSignupData({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: ""
      });

      setIsCaptchaVerified(false);
      setCaptchaSessionId("");

      navigate("/");
    }
  }

  return (
    <GoogleOAuthProvider 
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={() => console.error('Google OAuth script failed to load')}
      onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
    >
      <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#3A5A7A]-50 via-white to-[#3A5A7A]-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-md w-full space-y-8">
          {/* Enhanced Header with Logo */}
          <div className="text-center">
            {/* Modern Logo Container */}
            <div className="flex justify-center items-center mb-8">
              <div className="relative">
                {/* Glowing Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#4D6D8E] via-[#4D6D8E] to-indigo-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                
                {/* Logo Container */}
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-2xl border-4 border-[#3A5A7A]-200 dark:border-[#3A5A7A]-700 transform hover:scale-110 transition-all duration-500">
                  <img 
                    src={logo} 
                    alt="  thegoodanalyst Logo" 
                    className="w-16 h-16 object-contain drop-shadow-lg"
                  />
                </div>
                
                {/* Floating Decorative Elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#4D6D8E] rounded-full animate-bounce z-10 shadow-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-pulse z-10 shadow-lg"></div>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-[#3A5A7A]-600 to-[#3A5A7A]-600 bg-clip-text text-transparent">
              انضم إلى منصتنا التعليمية
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              أنشئ حسابك وابدأ رحلة التعلم
            </p>
          </div>

          {/* Enhanced Modern Form */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#3A5A7A]-200/50 dark:border-[#3A5A7A]-700/50 transform hover:scale-[1.02] transition-all duration-500">
            <form onSubmit={createNewAccount} className="space-y-6">
              {/* Full Name Field */}
              <div className="group">
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                    placeholder="أدخل اسمك الكامل"
                    value={signupData.fullName}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={signupData.email}
                    onChange={handleUserInput}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pr-12 pl-12 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                    placeholder="أنشئ كلمة مرور قوية"
                    value={signupData.password}
                    onChange={handleUserInput}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Phone Number Field */}
              <div className="group">
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaPhone className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                    placeholder="أدخل رقم هاتفك"
                    value={signupData.phoneNumber}
                    onChange={handleUserInput}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  سيتم استخدام هذا الرقم لتسجيل الدخول إلى حسابك
                </p>
              </div>

              {/* CAPTCHA Component */}
              <CaptchaComponent
                onVerified={handleCaptchaVerified}
                onError={handleCaptchaError}
              />

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isCaptchaVerified}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-[#3A5A7A]-600 via-[#3A5A7A]-600 to-indigo-600 hover:from-[#3A5A7A]-700 hover:via-[#3A5A7A]-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg overflow-hidden"
              >
                {/* Button Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#3A5A7A]-600 via-[#4D6D8E] to-[#3A5A7A]-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <span className="relative flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      إنشاء الحساب
                    </>
                  )}
                </span>
                
                {/* Creative Button Border Animation */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#4D6D8E] via-[#4D6D8E] to-[#4D6D8E] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </button>
            </form>

            {/* Google Sign Up Button */}
                        <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                    أو سجل باستخدام
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <div className={`w-full max-w-sm ${googleAuthInProgress ? 'opacity-50 pointer-events-none' : ''} transition-all duration-300`}>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        size="large"
                        text="signup_with"
                        locale="ar"
                        theme="outline"
                        shape="rectangular"
                        useOneTap={false}
                        promptMomentNotification={(notification) => {
                          console.log('Google prompt notification:', notification);
                        }}
                        flow="auth-code"
                      />
                    </div>
                    
                    {googleAuthInProgress && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            جاري التسجيل...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                    لديك حساب بالفعل؟
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Login Link */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-semibold text-[#3A5A7A]-600 dark:text-[#4D6D8E] hover:text-[#3A5A7A]-700 dark:hover:text-[#3A5A7A]-300 transition-all duration-200 hover:scale-105"
              >
                <span>تسجيل الدخول إلى حسابك</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700">
              <div className="w-2 h-2 bg-[#4D6D8E] rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                بإنشاء حساب، فإنك توافق على{" "}
                <Link to="/terms" className="text-[#3A5A7A]-600 dark:text-[#4D6D8E] hover:underline font-semibold">
                  شروط الخدمة
                </Link>{" "}
                و{" "}
                <Link to="/privacy" className="text-[#3A5A7A]-600 dark:text-[#4D6D8E] hover:underline font-semibold">
                  سياسة الخصوصية
                </Link>
              </p>
              <div className="w-2 h-2 bg-[#4D6D8E] rounded-full animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </GoogleOAuthProvider>
  );
}
