import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserData, updateUserData } from "../../Redux/Slices/AuthSlice";
import { FaPhone, FaEnvelope, FaUser, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { IoIosLock, IoIosRefresh } from "react-icons/io";
import { FiMoreVertical } from "react-icons/fi";
import Layout from "../../Layout/Layout";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.data);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInput, setUserInput] = useState({
    name: userData?.fullName || "",
    phoneNumber: userData?.phoneNumber || "",
    userId: null,
  });
  const [isChanged, setIschanged] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function onFormSubmit(e) {
    setIsUpdating(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("fullName", userInput.name);
    formData.append("phoneNumber", userInput.phoneNumber);
    
    const data = { formData, id: userInput.userId };
    const response = await dispatch(updateUserData(data));
    if (response?.payload?.success) {
      await dispatch(getUserData());
      setIschanged(false);
      setIsEditing(false); // Exit edit mode after successful save
    }
    setIsUpdating(false);
  }

  function handleEditClick() {
    setIsEditing(true);
    // Reset form to current user data
    setUserInput({
      name: userData?.fullName || "",
      phoneNumber: userData?.phoneNumber || "",
      userId: userData?._id,
    });
    console.log('Edit mode - userInput set to:', {
      name: userData?.fullName || "",
      phoneNumber: userData?.phoneNumber || "",
    });
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setIschanged(false);
    // Reset to original values
    setUserInput({
      name: userData?.fullName || "",
      phoneNumber: userData?.phoneNumber || "",
      userId: userData?._id,
    });
  }

  useEffect(() => {
    if (isEditing) {
      let hasChanges = 
        userInput.name !== userData?.fullName || 
        userInput.phoneNumber !== userData?.phoneNumber;
      
      console.log('Change detection:', {
        nameChanged: userInput.name !== userData?.fullName,
        phoneChanged: userInput.phoneNumber !== userData?.phoneNumber,
        hasChanges
      });
      
      setIschanged(hasChanges);
    } else {
      setIschanged(false);
    }
  }, [userInput, userData, isEditing]);

  useEffect(() => {
    async function fetchUser() {
      console.log('Fetching user data...');
      const result = await dispatch(getUserData());
      console.log('User data fetch result:', result);
    }
    if (Object.keys(userData).length < 1) fetchUser();
  }, []);

  // Debug: Log user data to see what's being received
  useEffect(() => {
    console.log('Current userData:', userData);
  }, [userData]);

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
    setUserInput({
      ...userInput,
        name: userData?.fullName || "",
        phoneNumber: userData?.phoneNumber || "",
      userId: userData?._id,
    });
    }
  }, [userData]);

  return (
    <Layout hideFooter={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900" dir="rtl">
        <section className="flex flex-col gap-8 items-center py-8 px-4 min-h-screen">
          <div className="w-full max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                إدارة معلوماتك الشخصية
              </p>
            </div>
        <form
          autoComplete="off"
          noValidate
          onSubmit={onFormSubmit}
          className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Header Card */}
          <div className="relative bg-gradient-to-r from-gray-600 to-blue-500 p-8 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">مرحباً، {userData?.fullName || 'المستخدم'}</h2>
                <p className="text-indigo-100 text-sm md:text-base">
                  آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
                </p>
              </div>
              
              {/* Profile Avatar Placeholder */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaUser className="text-2xl md:text-3xl text-white" />
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  المعلومات الشخصية
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  قم بتحديث معلوماتك الشخصية هنا
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Name Field */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <FaUser className="text-indigo-600 dark:text-indigo-400" size={16} />
                  </div>
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={isEditing ? userInput.name : (userData?.fullName || "")}
                  onChange={(e) => setUserInput({ ...userInput, name: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-4 border rounded-xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
                    !isEditing 
                      ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-indigo-400 dark:hover:border-blue-500'
                  }`}
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              {/* Email Field */}
              <div className="group">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <FaEnvelope className="text-green-600 dark:text-green-400" size={16} />
                  </div>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                  placeholder="البريد الإلكتروني"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  لا يمكن تعديل البريد الإلكتروني
                </p>
              </div>

              {/* Phone Number Field */}
              <div className="group lg:col-span-2">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <FaPhone className="text-blue-600 dark:text-blue-400" size={16} />
                  </div>
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={isEditing ? userInput.phoneNumber : (userData?.phoneNumber || "")}
                  onChange={(e) => setUserInput({ ...userInput, phoneNumber: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full px-4 py-4 border rounded-xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${
                    !isEditing 
                      ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                  placeholder="أدخل رقم هاتفك"
                />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium"
                    disabled={isUpdating}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaTimes size={16} />
                      <span>إلغاء</span>
                    </div>
                  </button>
                  
                  <button
                    type="submit"
                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 min-w-[140px] ${
                      !isChanged || isUpdating 
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                    disabled={!isChanged || isUpdating}
                    onClick={() => {
                      console.log('Save button clicked. isChanged:', isChanged, 'isUpdating:', isUpdating);
                    }}
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <FaSave size={16} />
                        <span>حفظ التغييرات</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="px-8 py-3 bg-gradient-to-r from-gray-600 to-blue-500 hover:from-gray-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaEdit size={16} />
                    <span>
                    تعديل الملف الشخصي
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </form>
          </div>
        </section>
      </div>
    </Layout>
  );
}