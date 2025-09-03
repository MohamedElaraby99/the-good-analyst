import React, { useEffect, useState } from 'react';
import { FaArrowRight, FaPlay, FaStar, FaUsers, FaGraduationCap, FaAward, FaRocket, FaGlobe, FaLightbulb, FaGraduationCap as FaGrad, FaBookOpen, FaChalkboardTeacher, FaMicroscope, FaFlask, FaLeaf, FaBrain, FaDna, FaSearch, FaSun, FaMoon, FaUser, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../assets/logo.png';

const AnimatedHero = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Check for dark mode from HTML class (set by Navbar)
  useEffect(() => {
    const checkDarkMode = () => {
      const htmlElement = document.documentElement;
      const isDark = htmlElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Check initially
    checkDarkMode();

    // Listen for changes to the HTML class
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleButtonClick = () => {
    if (isLoggedIn) {
      navigate('/courses');
    } else {
      onGetStarted();
    }
  };

  const buttonText = isLoggedIn ? 'ابدأ التعلم الآن' : 'سجل الآن';

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`} dir="rtl">
      {/* Background Pattern */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}>
        {/* Subtle gradient background */}
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-[#4D6D8E]/30 via-[#4D6D8E]/20 to-[#4D6D8E]/30' : 'bg-gradient-to-br from-[#4D6D8E]/10 via-[#4D6D8E]/5 to-[#4D6D8E]/10'}`}></div>
        
        {/* Geometric shapes */}
        <div className={`absolute top-20 left-20 w-32 h-32 rounded-full ${isDarkMode ? 'bg-[#181eae]/10' : 'bg-[#181eae]/20'}`}></div>
        <div className={`absolute top-40 right-40 w-24 h-24 rounded-full ${isDarkMode ? 'bg-[#181eae]/10' : 'bg-[#181eae]/20'}`}></div>
        <div className={`absolute bottom-40 left-40 w-20 h-20 rounded-full ${isDarkMode ? 'bg-[#181eae]/10' : 'bg-[#181eae]/20'}`}></div>
        
        {/* Subtle chart pattern (grid + line) */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDarkMode ? '#A5B7CD' : '#0F172A'} strokeOpacity="0.25" strokeWidth="1" />
              </pattern>
              <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#4D6D8E" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#181eae" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <polyline points="0,300 150,260 280,320 420,240 600,280 780,200 1000,260" fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Hero Section - New layout */}
      <section className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12 relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div className="order-2 lg:order-1 text-right space-y-6">
            <h1 className="text-white text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
              محلل ذكي للتقنية والمال والبيانات
            </h1>
            <p className={`text-lg lg:text-xl max-w-2xl ${isDarkMode ? 'text-white/80' : 'text-[#0F172A]/80'}`}>
              تعلّم بناء النماذج المالية، لوحات التحكم، وتحليل البيانات باستخدام أدوات عمليّة وحديثة.
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3">
              {['تحليلات الأعمال', 'لوحات قياس', 'SQL', 'Python', 'Financial Models'].map((chip) => (
                <span key={chip} className="px-3 py-1 rounded-full text-sm bg-[#4D6D8E]/30 text-white">
                  {chip}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={handleButtonClick}
                className="px-8 py-4 rounded-xl text-lg font-semibold bg-[#4D6D8E] hover:bg-[#3A5A7A] text-white shadow-lg transition-all"
              >
                {buttonText}
              </button>
              <Link
                to="/courses"
                className="px-6 py-4 rounded-xl text-lg font-semibold border border-[#181eae] text-[#181eae] hover:bg-[#181eae]/10 transition-all"
              >
                استكشف الكورسات
              </Link>
            </div>
            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {[{n:'10K+',l:'متعلم'}, {n:'150+',l:'درس عملي'}, {n:'4.9',l:'تقييم'}].map((s)=> (
                <div key={s.l} className="text-center rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-2xl font-bold text-white">{s.n}</div>
                  <div className="text-sm text-white/70">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Analytics Illustration */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative mx-auto w-full max-w-md">
              {/* Chart card */}
              <div className="rounded-2xl bg-[#0F172A]/80 border border-[#4D6D8E]/30 p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white/80 text-sm">Monthly Revenue</div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-[#181eae]/20 text-[#181eae]">+12%</span>
                </div>
                <svg className="w-full h-40" viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="heroLine" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#4D6D8E" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#181eae" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#heroLine)"
                    strokeWidth="4"
                    points="0,120 50,110 100,125 150,90 200,100 250,70 300,95 350,60 400,80"
                  />
                </svg>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[{k:'MRR',v:'$24k'},{k:'ARPU',v:'$18'},{k:'CAC',v:'$3.2'}].map((m)=> (
                    <div key={m.k} className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                      <div className="text-xs text-white/60">{m.k}</div>
                      <div className="text-sm font-semibold text-white">{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating KPI cards */}
              <div className="absolute -top-6 -left-4 rounded-xl bg-[#4D6D8E] text-white px-4 py-3 shadow-xl">
                <div className="text-xs">Conversion</div>
                <div className="text-lg font-bold">3.4%</div>
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-xl bg-[#181eae] text-white px-4 py-3 shadow-xl">
                <div className="text-xs">Retention</div>
                <div className="text-lg font-bold">92%</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnimatedHero; 