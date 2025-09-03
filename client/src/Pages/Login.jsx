import { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { login, createAccountWithGoogle } from "../Redux/Slices/AuthSlice";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaSignInAlt } from "react-icons/fa";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { generateDeviceFingerprint, getDeviceType, getBrowserInfo, getOperatingSystem } from "../utils/deviceFingerprint";
import logo from "../assets/logo.png";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('phone'); // 'phone' or 'email'
  const [googleAuthInProgress, setGoogleAuthInProgress] = useState(false);
  const [loginData, setLoginData] = useState({
    phoneNumber: "",
    email: "",
    password: "",
  });

  // Google OAuth Client ID
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id-here";

  function handleUserInput(e) {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  }

  async function onLogin(event) {
    event.preventDefault();
    
    // Validate based on login type
    if (loginType === 'phone') {
      if (!loginData.phoneNumber || !loginData.password) {
        toast.error("يرجى ملء جميع البيانات المطلوبة");
        return;
      }
      // Validate Egyptian phone number format
      if (!loginData.phoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        toast.error("يرجى إدخال رقم هاتف مصري صحيح");
        return;
      }
    } else {
      if (!loginData.email || !loginData.password) {
        toast.error("يرجى ملء جميع البيانات المطلوبة");
        return;
      }
      // Validate email format
      if (!loginData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
        toast.error("يرجى إدخال بريد إلكتروني صحيح");
        return;
      }
    }

    setIsLoading(true);
    
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

    const Data = { 
      password: loginData.password,
      deviceInfo: deviceInfo
    };

    // Add identifier based on login type
    if (loginType === 'phone') {
      Data.phoneNumber = loginData.phoneNumber;
    } else {
      Data.email = loginData.email;
    }

    // dispatch login action
    const response = await dispatch(login(Data));
    if (response?.payload?.success) {
      setLoginData({
        phoneNumber: "",
        email: "",
        password: "",
      });
      navigate("/");
    }
    setIsLoading(false);
  }

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
      };

      console.log('Sending Google OAuth data to backend for login/signup');
      
      // Call backend to handle Google authentication (login or signup)
      const response = await dispatch(createAccountWithGoogle(requestData));
      if (response?.payload?.success) {
        const user = response.payload.user;
        const message = user.isGoogleAuth ? 
          `Welcome back ${user.fullName}!` :
          `Welcome ${user.fullName}! You've been logged in.`;
        toast.success(message);
        navigate("/");
      } else {
        throw new Error(response?.payload?.message || 'Authentication failed');
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
                <div className="absolute inset-0 bg-gradient-to-r from-[#4D6D8E] via-[#4D6D8E] to-[#3A5A7A]-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                
                {/* Logo Container */}
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-2xl border-4 border-[#3A5A7A]-200 dark:border-[#3A5A7A]-700 transform hover:scale-110 transition-all duration-500">
                  <img 
                    src={logo} 
                    alt="  The Good Analyst Logo" 
                    className="w-16 h-16 object-contain drop-shadow-lg"
                  />
                </div>
                
                {/* Floating Decorative Elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#4D6D8E] rounded-full animate-bounce z-10 shadow-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#4D6D8E] rounded-full animate-pulse z-10 shadow-lg"></div>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-[#3A5A7A]-600 to-[#3A5A7A]-600 bg-clip-text text-transparent">
              مرحباً بعودتك
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              سجل دخولك إلى حسابك لمتابعة التعلم
            </p>
          </div>

          {/* Enhanced Modern Form */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-[#3A5A7A]-200/50 dark:border-[#3A5A7A]-700/50 transform hover:scale-[1.02] transition-all duration-500">
            <form onSubmit={onLogin} className="space-y-6">
              {/* Login Type Toggle */}
              <div className="w-full">
                <div className="relative mx-auto w-full max-w-sm">
                  <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => setLoginType('phone')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm sm:text-base transition-all duration-200 ${loginType === 'phone' ? 'bg-white dark:bg-gray-800 text-[#3A5A7A]-600 dark:text-[#4D6D8E] shadow' : 'text-gray-600 dark:text-gray-300'}`}
                      aria-pressed={loginType === 'phone'}
                    >
                      <FaPhone className="h-5 w-5" />
                      <span>رقم الهاتف</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginType('email')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm sm:text-base transition-all duration-200 ${loginType === 'email' ? 'bg-white dark:bg-gray-800 text-[#3A5A7A]-600 dark:text-[#4D6D8E] shadow' : 'text-gray-600 dark:text-gray-300'}`}
                      aria-pressed={loginType === 'email'}
                    >
                      <FaEnvelope className="h-5 w-5" />
                      <span>البريد الإلكتروني</span>
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                  {loginType === 'phone' ? 'سجّل الدخول باستخدام رقم هاتفك المصري' : 'سجّل الدخول باستخدام بريدك الإلكتروني'}
                </p>
              </div>

              {/* Email/Phone Field */}
              <div className="group">
                <label htmlFor={loginType === 'phone' ? 'phoneNumber' : 'email'} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  {loginType === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    {loginType === 'phone' ? <FaPhone className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" /> : <FaEnvelope className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />}
                  </div>
                  <input
                    id={loginType === 'phone' ? 'phoneNumber' : 'email'}
                    name={loginType === 'phone' ? 'phoneNumber' : 'email'}
                    type={loginType === 'phone' ? 'tel' : 'email'}
                    required
                    className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                    placeholder={loginType === 'phone' ? 'أدخل رقم هاتفك' : 'أدخل بريدك الإلكتروني'}
                    value={loginType === 'phone' ? loginData.phoneNumber : loginData.email}
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
                    placeholder="أدخل كلمة المرور"
                    value={loginData.password}
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

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-[#3A5A7A]-600 via-[#4D6D8E] to-[#3A5A7A]-600 hover:from-[#3A5A7A]-700 hover:via-[#3A5A7A]-600 hover:to-[#3A5A7A]-700 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg overflow-hidden"
              >
                {/* Button Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#3A5A7A]-600 via-[#4D6D8E] to-[#3A5A7A]-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <span className="relative flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      تسجيل الدخول
                    </>
                  )}
                </span>
                
                {/* Creative Button Border Animation */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#4D6D8E] via-[#4D6D8E] to-[#4D6D8E] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </button>
            </form>

            {/* Google Sign In Button */}
            <div className="mt-6">
              <div className="text-center mb-4">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">أو سجل دخولك باستخدام</span>
              </div>
              <div className="flex justify-center relative">
                <div className={`${googleAuthInProgress || isLoading ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-200`}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="large"
                    text="signin_with"
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4D6D8E]"></div>
                  </div>
                )}
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
                    جديد في   The Good Analyst؟
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Sign Up Link */}
            <div className="mt-6 text-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 font-semibold text-[#3A5A7A]-600 dark:text-[#4D6D8E] hover:text-[#3A5A7A]-700 dark:hover:text-[#3A5A7A]-300 transition-all duration-200 hover:scale-105"
              >
                <span>إنشاء حسابك</span>
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
                بتسجيل الدخول، أنت توافق على{" "}
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
