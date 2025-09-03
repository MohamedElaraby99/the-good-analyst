import React, { useState, useEffect } from "react";
import { BsFacebook, BsLinkedin } from "react-icons/bs";
import { FaShieldAlt, FaUnlock } from "react-icons/fa";
import { Link } from "react-router-dom";
import { disableProtection, enableProtection, isProtectionDisabled } from "../utils/deviceDetection";
import logo from "../assets/logo.png";

export default function Footer() {
  const curDate = new Date();
  const year = curDate.getFullYear();
  
  const [protectionEnabled, setProtectionEnabled] = useState(true);
  
  useEffect(() => {
    // Check initial protection status
    setProtectionEnabled(!isProtectionDisabled());
  }, []);
  
  const handleProtectionToggle = () => {
    if (protectionEnabled) {
      // Disable protection
      disableProtection();
      setProtectionEnabled(false);
    } else {
      // Enable protection
      enableProtection();
      setProtectionEnabled(true);
    }
  };
  return (
    <footer className="py-12 md:px-16 px-3 bg-slate-100 dark:bg-gray-900">
      <div className="flex md:flex-row flex-col md:justify-between justify-center items-center gap-4 mb-8">
        <span className="md:text-xl text-lg font-[600] text-gray-700 dark:text-white">
          حقوق النشر {year} | جميع الحقوق محفوظة
        </span>
        <div className="flex gap-5 items-center">
             
          <a
            href="https://www.facebook.com/share/16Vq29HcXH/"
            target="_blank"
            rel="noopener noreferrer"
            className="md:text-3xl text-xl text-gray-900 dark:text-slate-50 hover:text-gray-500 dark:hover:text-slate-300 transition-colors"
          >
            <BsFacebook />
          </a>
        </div>
      </div>
      
      {/* Legal Links */}
      <div className="flex justify-center items-center mb-6">
        <div className="flex gap-6 text-sm">
          <Link 
            to="/terms" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 font-medium"
          >
            شروط الخدمة
          </Link>
          <span className="text-gray-400 dark:text-gray-600">|</span>
          <Link 
            to="/privacy" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300 font-medium"
          >
            سياسة الخصوصية
          </Link>
        </div>
      </div>
    </footer>
  );
}
