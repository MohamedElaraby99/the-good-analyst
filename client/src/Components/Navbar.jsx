import React, { useEffect, useState } from "react";
import { FaSun, FaMoon, FaBars, FaHome, FaUser, FaGraduationCap, FaBlog, FaQuestionCircle, FaSignOutAlt, FaPlus, FaList, FaInfoCircle, FaPhone, FaHistory, FaLightbulb, FaRocket } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/Slices/AuthSlice";
import viteLogo from "../assets/images/vite.svg.png";
import logo from "../assets/logo.png";
import useScrollToTop from "../Helpers/useScrollToTop";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user, role } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  // Debug: Simple check to see what's happening
  console.log("🔍 Navbar - User state:", { 
    user, 
    role, 
    hasUser: !!user?.fullName,
    userFullName: user?.fullName,
    userEmail: user?.email,
    isLoggedIn: !!user
  });

  // Use scroll to top utility
  useScrollToTop();

  // Dark mode is the only mode: enforce it on mount

  const toggleMenu = () => {
    // Trigger the Sidebar drawer instead of mobile menu
    const drawerToggle = document.getElementById('sidebar-drawer');
    
    if (drawerToggle) {
      console.log("Navbar burger clicked - toggling drawer");
      drawerToggle.checked = !drawerToggle.checked;
    } else {
      console.log("Drawer element not found");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    // Navigate to home page and scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const element = document.querySelector("html");
    element.classList.remove("light");
    element.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  // Already enforcing dark mode above

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const menuItems = [
    { name: "الرئيسية", path: "/", icon: FaHome },
    { name: "الكورسات ", path: "/subjects", icon: FaGraduationCap },
    { name: "الكورسات", path: "/courses", icon: FaList },
    
    { name: "المدونة", path: "/blogs", icon: FaBlog },
    { name: "الأسئلة والأجوبة", path: "/qa", icon: FaQuestionCircle },
    { name: "تاريخ الامتحانات", path: "/exam-history", icon: FaHistory },
    { name: "حول", path: "/about", icon: FaInfoCircle },
    { name: "اتصل بنا", path: "/contact", icon: FaPhone },
  ];

  const adminMenuItems = [
    { name: "لوحة التحكم", path: "/admin", icon: FaUser },
    
    { name: "إدارة المستخدمين", path: "/admin/users", icon: FaUser },
    { name: "إدارة المدونة", path: "/admin/blogs", icon: FaBlog },
    { name: "إدارة الأسئلة والأجوبة", path: "/admin/qa", icon: FaQuestionCircle },
    { name: "إدارة المواد", path: "/admin/subjects", icon: FaGraduationCap },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-[#0F172A]/80 backdrop-blur-3xl border-b border-gray-200/40 dark:border-[#4D6D8E]/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0.5">
                 <div className="flex justify-between items-center h-20 md:h-24">
          {/* Modern Logo */}
                     <Link to="/" onClick={handleLogoClick} className="flex items-center space-x-2 md:space-x-4 group logo-hover">
        
            <div className="relative">
              {/* Logo Image */}
                             <img 
                 src={logo} 
                 alt="  thegoodanalyst" 
                 className="w-16 h-16 md:w-20 md:h-20 object-contain group-hover:scale-110 transition-transform duration-300 dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] dark:group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
               />
            </div>
            <div className="hidden sm:flex flex-col mr-3">
              <span className="text-xs md:text-sm font-semibold text-[#0F172A] dark:text-white tracking-wide">
                The Good Analyst
              </span>
              <span className="text-[10px] md:text-xs text-[#4D6D8E] dark:text-[#A5B7CD]">
                Tech • Finance • Data Analytics Platform
              </span>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Mobile Login Button - Show only on mobile when not logged in */}
            {!user?.fullName && (
              <Link
                to="/login"
                className="sm:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#4D6D8E] to-[#3A5A7A] hover:from-[#3A5A7A] hover:to-[#2A4A6A] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <FaUser className="w-3 h-3" />
                <span>دخول</span>
              </Link>
            )}
            
            {/* Burger Menu Button - Always visible */}
            <button
              onClick={toggleMenu}
              className="burger-menu-button p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-[#4D6D8E] dark:hover:text-[#4D6D8E] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 md:inline-flex"
              aria-label="Toggle menu"
            >
              <FaBars className="w-6 h-6" />
            </button>

            {/* Sign Up Button - ONLY show when NO user is logged in */}
            {!user?.fullName && (
              <Link
                to="/signup"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-white bg-[#4D6D8E] hover:bg-[#3A5A7A] shadow-lg hover:shadow-xl transition-all duration-300 border border-[#4D6D8E]/40"
              >
                <FaPlus className="w-4 h-4" />
                <span>سجل الآن</span>
              </Link>
            )}

            {!user?.fullName && (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold border-2 border-[#4D6D8E] text-[#4D6D8E] dark:text-[#A5B7CD] hover:bg-[#4D6D8E] hover:text-white transition-all duration-300 shadow-md hover:shadow-xl"
              >
                <FaUser className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Link>
            )}

           
          </div>
        </div>

        {/* Mobile Menu - Enhanced Design */}
        <div
          className={`md:hidden mobile-menu-container transition-all duration-500 ease-in-out overflow-hidden ${
            isMenuOpen
              ? "max-h-screen opacity-100 visible"
              : "max-h-0 opacity-0 invisible"
          }`}
        >
          <div className="py-8 space-y-6 border-t border-gray-200/50 dark:border-[#4D6D8E]/30 bg-gradient-to-b from-white/95 to-white/90 dark:from-[#0F172A]/95 dark:to-[#0F172A]/90 backdrop-blur-xl">
            {/* Navigation Links */}
            <div className="space-y-3">
              <div className="px-6 py-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  التنقل
                </p>
              </div>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-4 px-6 py-4 mx-4 rounded-2xl font-medium transition-all duration-300 mobile-menu-item ${
                    location.pathname === item.path
                      ? "text-[#181eae] dark:text-[#181eae] bg-gradient-to-r from-[#4D6D8E]/10 to-[#4D6D8E]/10 dark:from-[#4D6D8E]/20 dark:to-[#4D6D8E]/20 shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:text-[#181eae] dark:hover:text-[#181eae] hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#4D6D8E]/10 dark:hover:from-transparent dark:hover:to-[#4D6D8E]/20"
                  }`}
                >
                  <div className={`p-3 rounded-xl shadow-lg ${
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-[#A5B7CD]/40 to-[#A5B7CD]/40 dark:from-[#4D6D8E]/30 dark:to-[#4D6D8E]/30"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Menu Items */}
            {user && (
              <>
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
                  <div className="px-6 py-4 mx-4 bg-gradient-to-r from-[#4D6D8E]/10 to-[#4D6D8E]/10 dark:from-[#4D6D8E]/20 dark:to-[#4D6D8E]/20 rounded-2xl shadow-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-[#3A5A7A]-600 to-[#3A5A7A]-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <span className="text-white font-bold text-lg">
                          {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                          {user.fullName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                        <p className="text-xs text-[#181eae] dark:text-[#181eae] font-semibold uppercase tracking-wider">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Menu */}
                {user.role === "ADMIN" && (
                  <div className="space-y-3">
                    <div className="px-6 py-3">
                      <p className="text-xs font-bold text-[#181eae] dark:text-[#181eae] uppercase tracking-wider">
                        لوحة الإدارة
                      </p>
                    </div>
                    {adminMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-4 px-6 py-4 mx-4 rounded-2xl font-medium transition-all duration-300 mobile-menu-item ${
                          location.pathname === item.path
                            ? "text-[#3A5A7A]-600 dark:text-[#4D6D8E] bg-gradient-to-r from-[#3A5A7A]-50 to-[#3A5A7A]-50 dark:from-[#3A5A7A]-900/20 dark:to-[#3A5A7A]-900/20 shadow-lg"
                            : "text-gray-700 dark:text-gray-300 hover:text-[#3A5A7A]-600 dark:hover:text-[#4D6D8E] hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#3A5A7A]-50 dark:hover:from-gray-800 dark:hover:to-[#3A5A7A]-900/20"
                        }`}
                      >
                        <div className={`p-3 rounded-xl shadow-lg ${
                          location.pathname === item.path
                            ? "bg-gradient-to-r from-[#A5B7CD]/40 to-[#A5B7CD]/40 dark:from-[#4D6D8E]/30 dark:to-[#4D6D8E]/30"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
                        }`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* User Actions */}
                <div className="space-y-3">
                  <div className="px-6 py-3">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الحساب
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-4 px-6 py-4 mx-4 rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:text-[#181eae] dark:hover:text-[#181eae] hover:bg-gradient-to-r hover:from-gray-50 hover:to-[#4D6D8E]/10 dark:hover:from-gray-800 dark:hover:to-[#4D6D8E]/20 transition-all duration-300 mobile-menu-item"
                  >
                    <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                      <FaUser className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">الملف الشخصي</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-4 px-6 py-4 mx-4 rounded-2xl font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-300 w-full text-left mobile-menu-item"
                  >
                    <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30">
                      <FaSignOutAlt className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">تسجيل الخروج</span>
                  </button>
                </div>
              </>
            )}

            {/* Guest Actions */}
            {!user && (
              <div className="space-y-4 px-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    انضم إلينا الآن
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ابدأ رحلة التعلم مع   thegoodanalyst
                  </p>
                </div>
                
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 text-center bg-[#4D6D8E] hover:bg-[#3A5A7A] text-white rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 mobile-menu-item shadow-lg hover:shadow-xl border-2 border-[#4D6D8E]/40"
                >
                  <FaUser className="w-4 h-4" />
                  تسجيل الدخول
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 text-center border-2 border-[#4D6D8E] text-[#4D6D8E] dark:text-[#A5B7CD] hover:bg-[#4D6D8E] hover:text-white rounded-xl font-semibold text-sm transition-all duration-300 mobile-menu-item shadow-lg hover:shadow-xl"
                >
                  <FaPlus className="w-4 h-4" />
                  إنشاء حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
