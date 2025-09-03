import { useState } from "react";
import { toast } from "react-hot-toast";
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../Layout/Layout";
import { createAccount } from "../Redux/Slices/AuthSlice";
import InputBox from "../Components/InputBox/InputBox";
import CaptchaComponent from "../Components/CaptchaComponent";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaGraduationCap, FaCamera, FaUpload, FaPhone, FaMapMarkerAlt, FaBook, FaExclamationTriangle, FaTimes, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { axiosInstance } from "../Helpers/axiosInstance";
import { useEffect } from "react";
import { egyptianCities } from "../utils/governorateMapping";
import { generateDeviceFingerprint, getDeviceType, getBrowserInfo, getOperatingSystem } from "../utils/deviceFingerprint";
import logo from "../assets/logo.png";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stages, setStages] = useState([]);
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    fatherPhoneNumber: "",
    governorate: "",
    stage: "",
    age: "",
    avatar: "",
    adminCode: "",
  });

  // Check if this is an admin registration
  const isAdminRegistration = signupData.adminCode === 'ADMIN123';

  // Fetch stages on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stages
        const stagesResponse = await axiosInstance.get('/stages');
        if (stagesResponse.data.success) {
          setStages(stagesResponse.data.data.stages);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  function handleUserInput(e) {
    const { name, value } = e.target;
    
    setSignupData({
      ...signupData,
      [name]: value,
    });
  }

  function getImage(event) {
    event.preventDefault();
    // getting the image
    const uploadedImage = event.target.files[0];

    if (uploadedImage) {
      setSignupData({
        ...signupData,
        avatar: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setPreviewImage(this.result);
      });
    }
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
    
    
    // Basic required fields for all users
    if (!signupData.password || !signupData.fullName || !signupData.username || !signupData.avatar) {
      toast.error("الاسم، اسم المستخدم، كلمة المرور، والصورة الشخصية مطلوبة");
      return;
    }
    
    // Role-specific validation
    if (isAdminRegistration) {
      // For admin users: email is required
      if (!signupData.email) {
        toast.error("البريد الإلكتروني مطلوب للمشرفين");
        return;
      }
      // Validate email format for admin
      if (!signupData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
        toast.error("بريد إلكتروني غير صحيح");
        return;
      }
    } else {
      // For regular users: phone number is required, email is optional
      if (!signupData.phoneNumber || !signupData.governorate || !signupData.stage || !signupData.age) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        return;
      }
      // Validate phone number for regular users
      if (!signupData.phoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        toast.error("يرجى إدخال رقم هاتف مصري صحيح");
        return;
      }
      // Validate email if provided (optional for regular users)
      if (signupData.email && !signupData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
        toast.error("بريد إلكتروني غير صحيح");
        return;
      }
    }

    // checking name field length
    if (signupData.fullName.length < 3) {
      toast.error("يجب أن يكون الاسم 3 أحرف أقل");
      return;
    }
    // checking username field length
    if (signupData.username.length < 3) {
      toast.error("يجب أن يكون اسم المستخدم 3 أحرف أقل");
      return;
    }
    // checking username format
    if (!signupData.username.match(/^[a-zA-Z0-9_]+$/)) {
      toast.error("يمكن أن يحتوي اسم المستخدم على أحرف وأرقام وشرطة سفلية فقط");
      return;
    }
    
    // For regular users, validate additional fields
    if (!isAdminRegistration) {
      // father phone optional - validate only if provided
      if (signupData.fatherPhoneNumber && !signupData.fatherPhoneNumber.match(/^(\+20|0)?1[0125][0-9]{8}$/)) {
        toast.error("يرجى إدخال رقم هاتف ولي الامر الصحيح");
        return;
      }
      // checking valid age
      const age = parseInt(signupData.age);
      if (isNaN(age) || age < 5 || age > 100) {
        toast.error("يرجى إدخال عمر صحيح بين 5 و 100");
        return;
      }
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
      username: signupData.username,
      password: signupData.password,
      adminCode: signupData.adminCode,
      captchaSessionId: captchaSessionId,
      deviceInfo: deviceInfo
    };
    
    // Add role-specific fields
    if (isAdminRegistration) {
      // For admin users: email is required
      requestData.email = signupData.email;
    } else {
      // For regular users: phone number is required, email is optional
      requestData.phoneNumber = signupData.phoneNumber;
      if (signupData.email) {
        requestData.email = signupData.email; // Include email if provided
      }
      if (signupData.fatherPhoneNumber) {
        requestData.fatherPhoneNumber = signupData.fatherPhoneNumber;
      }
      requestData.governorate = signupData.governorate;
      requestData.stage = signupData.stage;
      requestData.age = signupData.age;
    }

    // Handle avatar file separately if present
    if (signupData.avatar) {
      const formData = new FormData();
      formData.append("avatar", signupData.avatar);
      
      // Add captchaSessionId at the top level for middleware access
      formData.append("captchaSessionId", captchaSessionId);
      
      // Add device info as separate fields for device fingerprint middleware
      formData.append("deviceInfo[platform]", deviceInfo.platform);
      formData.append("deviceInfo[screenResolution]", deviceInfo.screenResolution);
      formData.append("deviceInfo[timezone]", deviceInfo.timezone);
      formData.append("deviceInfo[additionalInfo][browser]", deviceInfo.additionalInfo.browser);
      formData.append("deviceInfo[additionalInfo][browserVersion]", deviceInfo.additionalInfo.browserVersion);
      formData.append("deviceInfo[additionalInfo][os]", deviceInfo.additionalInfo.os);
      formData.append("deviceInfo[additionalInfo][language]", deviceInfo.additionalInfo.language);
      formData.append("deviceInfo[additionalInfo][colorDepth]", deviceInfo.additionalInfo.colorDepth);
      formData.append("deviceInfo[additionalInfo][touchSupport]", deviceInfo.additionalInfo.touchSupport);
      
      // Add all other data as JSON string
      formData.append("data", JSON.stringify(requestData));
      
      // Debug: Log what's being sent
      console.log('=== SENDING FORMDATA REQUEST ===');
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('captchaSessionId from state:', captchaSessionId);
      console.log('=== END DEBUG ===');
      
      // dispatch create account action with FormData
      const response = await dispatch(createAccount(formData));
      if (response?.payload?.success) {
        setSignupData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          phoneNumber: "",
          fatherPhoneNumber: "",
          governorate: "",
          stage: "",
          age: "",
          avatar: "",
          adminCode: "",
        });

        setPreviewImage("");
        setIsCaptchaVerified(false);
        setCaptchaSessionId("");

        navigate("/");
      }
    } else {
      // No avatar file, send as JSON
      console.log('=== SENDING JSON REQUEST ===');
      console.log('Request data:', requestData);
      console.log('captchaSessionId from state:', captchaSessionId);
      console.log('=== END DEBUG ===');
      
      const response = await dispatch(createAccount(requestData));
      if (response?.payload?.success) {
        setSignupData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          phoneNumber: "",
          fatherPhoneNumber: "",
          governorate: "",
          stage: "",
          age: "",
          avatar: "",
          adminCode: "",
        });

        setPreviewImage("");
        setIsCaptchaVerified(false);
        setCaptchaSessionId("");

        navigate("/");
      }
    }
  }

  return (
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

              {/* Username Field */}
              <div className="group">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                    placeholder="أدخل اسم المستخدم"
                    value={signupData.username}
                    onChange={handleUserInput}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                  يمكن استخدام الأحرف والأرقام والشرطة السفلية فقط
                </p>
              </div>

              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  البريد الإلكتروني {!isAdminRegistration && "(اختياري)"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required={isAdminRegistration}
                    className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                    placeholder={isAdminRegistration ? "أدخل بريدك الإلكتروني" : "أدخل بريدك الإلكتروني (اختياري)"}
                    value={signupData.email}
                    onChange={handleUserInput}
                  />
                </div>
                {!isAdminRegistration && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                    يمكنك ترك هذا الحقل فارغاً إذا كنت لا تريد استخدام البريد الإلكتروني
                  </p>
                )}
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

              {/* Phone Number Field - Only for regular users */}
              {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    رقم الهاتف *
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
                      placeholder="أدخل رقم هاتفك المصري"
                      value={signupData.phoneNumber}
                      onChange={handleUserInput}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                    سيتم استخدام هذا الرقم لتسجيل الدخول إلى حسابك
                  </p>
                </div>
              )}

              {/* Father's Phone Number Field - Only for regular users */}
              {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="fatherPhoneNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    رقم هاتف ولي الامر
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />
                    </div>
                    <input
                      id="fatherPhoneNumber"
                      name="fatherPhoneNumber"
                      type="tel"
                      required={false}
                      className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                      placeholder="أدخل رقم هاتف ولي الامر"
                      value={signupData.fatherPhoneNumber}
                      onChange={handleUserInput}
                    />
                  </div>
                </div>
              )}

              {/* Governorate Field - Only for regular users */}
              {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="governorate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    المدينة
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />
                    </div>
                    <select
                      id="governorate"
                      name="governorate"
                      required
                      className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                      value={signupData.governorate}
                      onChange={handleUserInput}
                    >
                      <option value="">اختر المدينة</option>
                      {egyptianCities.map((gov) => (
                        <option key={gov.value} value={gov.value}>
                          {gov.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Stage Field - Only for regular users */}
              {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="stage" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    المرحلة الدراسية
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <FaBook className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />
                    </div>
                    <select
                      id="stage"
                      name="stage"
                      required
                      className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                      value={signupData.stage}
                      onChange={handleUserInput}
                    >
                      <option value="">اختر المرحلة الدراسية</option>
                      {stages.map((stage) => (
                        <option key={stage._id} value={stage._id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Age Field - Only for regular users */}
              {!isAdminRegistration && (
                <div className="group">
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                    العمر
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-[#4D6D8E] group-focus-within:text-[#3A5A7A]-600 transition-colors duration-200" />
                    </div>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="5"
                      max="100"
                      required
                      className="block w-full pr-12 pl-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4D6D8E]/20 focus:border-[#4D6D8E] transition-all duration-300 text-right shadow-sm hover:shadow-md"
                      placeholder="أدخل عمرك"
                      value={signupData.age}
                      onChange={handleUserInput}
                    />
                  </div>
                </div>
              )}

              {/* Enhanced Avatar Upload */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-right">
                  الصورة الشخصية
                </label>
                <div className="flex items-center space-x-reverse space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#3A5A7A]-100 to-[#3A5A7A]-100 dark:from-[#3A5A7A]-900/20 dark:to-[#3A5A7A]-900/20 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BsPersonCircle className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    {previewImage && (
                      <div className="absolute -top-1 -left-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <FaCamera className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="image_uploads" className="cursor-pointer">
                      <div className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-[#4D6D8E] dark:hover:border-[#4D6D8E] transition-all duration-300 hover:shadow-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <FaUpload className="w-5 h-5 text-[#4D6D8E] ml-2" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {previewImage ? "تغيير الصورة" : "رفع صورة"}
                        </span>
                      </div>
                    </label>
                    <input
                      id="image_uploads"
                      onChange={getImage}
                      type="file"
                      accept=".jpg, .jpeg, .png, image/*"
                      required
                      className="hidden"
                    />
                  </div>
                </div>
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
  );
}
