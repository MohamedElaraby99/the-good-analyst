import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../Layout/Layout";
import heroPng from "../assets/images/hero.png";
import { getAllBlogs } from "../Redux/Slices/BlogSlice";
import { getFeaturedSubjects } from "../Redux/Slices/SubjectSlice";
import { getFeaturedCourses } from "../Redux/Slices/CourseSlice";
import { generateImageUrl } from "../utils/fileUtils";
import AnimatedHero from "../Components/AnimatedHero";
import fikraLogo from "../assets/Asset 2@3x.png";
import logo from "../assets/logo.png";
// Lazy load components
const FAQAccordion = lazy(() => import("../Components/FAQAccordion"));
const SubjectCard = lazy(() => import("../Components/SubjectCard"));
const InstructorSection = lazy(() => import("../Components/InstructorSection"));
const NewsletterSection = lazy(() => import("../Components/NewsletterSection"));


import { 
  FaEye, 
  FaHeart, 
  FaCalendar, 
  FaUser, 
  FaArrowRight, 
  FaPlay, 
  FaStar, 
  FaUsers, 
  FaGraduationCap,
  FaRocket,
  FaLightbulb,
  FaShieldAlt,
  FaGlobe,
  FaCode,
  FaPalette,
  FaChartLine,
  FaBookOpen,
  FaAward,
  FaClock,
  FaCheckCircle,
  FaQuestionCircle,
  FaArrowUp,
  FaMobile,
  FaDownload,
  FaGooglePlay,
  FaAndroid,
  FaPhone,
  FaWhatsapp,
  FaFacebook,
  FaYoutube,
  FaComments
} from "react-icons/fa";
import { placeholderImages } from "../utils/placeholderImages";
// Using a public URL for now - replace with your actual image URL
const fikraCharacter = "/fikra_character-removebg-preview.png";

export default function HomePage() {
  const dispatch = useDispatch();
  const { blogs } = useSelector((state) => state.blog);
  const { featuredSubjects } = useSelector((state) => state.subject);
  const { courses, featuredCourses, featuredLoading } = useSelector((state) => state.course);

  const { role } = useSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Hero entrance animation state
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    // Progressive loading - fetch data in sequence for better performance
    const loadData = async () => {
      // First, fetch essential data (subjects and courses)
      await Promise.all([
        dispatch(getFeaturedSubjects()),
        dispatch(getFeaturedCourses())
      ]);
      
      // Then fetch blogs after a short delay for better perceived performance
      setTimeout(() => {
        dispatch(getAllBlogs({ page: 1, limit: 3 }));
      }, 500);
    };

    loadData();
    
    // Trigger animations
    setIsVisible(true);

    // Hero entrance animation
    const timer = setTimeout(() => {
      setHeroVisible(true);
      setTimeout(() => {
        setHeroLoaded(true);
      }, 300);
    }, 100);

    // Add scroll event listener
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setShowScrollTop(scrolled > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [dispatch]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Get Started Handler
  const onGetStarted = () => {
    // Navigate to signup page
    window.location.href = '/signup';
  };

  // APK Download Handler
  const handleAPKDownload = () => {
    // Create a download link for the APK file
    const link = document.createElement('a');
    link.href = '/downloads/mrayman.apk'; // Update this path to your APK file location
    link.download = 'mrayman.apk';
    link.target = '_blank';
    
    // Fallback for mobile browsers
    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
      // For Android devices, open the download directly
      window.open('/downloads/mrayman.apk', '_blank');
    } else {
      // For other devices, trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Show download started message
    if (window.toast) {
      window.toast.success('بدأ تحميل التطبيق...');
    }
  };

  // Google Play Store redirect (for future when app is published)
  const handlePlayStoreRedirect = () => {
    // Replace with your actual Google Play Store URL when published
    // Show a "Coming Soon" message instead of redirecting
    if (window.toast) {
      window.toast.info('قريباً على Google Play!');
    } else {
      alert('قريباً على Google Play!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = [
    { icon: FaUsers, number: "10K+", label: "طالب مسجل", color: "text-[#181eae]" },
    { icon: FaGraduationCap, number: "100+", label: "مادة متاحة", color: "text-[#4D6D8E]" },
    { icon: FaStar, number: "4.9", label: "متوسط التقييم", color: "text-[#A5B7CD]" },
    { icon: FaAward, number: "50+", label: "مدرس خبير", color: "text-[#181eae]" }
  ];

  const features = [
    {
      icon: FaRocket,
      title: "تعلم بوتيرتك الخاصة",
      description: "جداول تعلم مرنة تناسب نمط حياتك والتزاماتك.",
      color: "text-[#3A5A7A]-600",
      bgColor: "bg-[#3A5A7A]-50 dark:bg-[#3A5A7A]-900/20"
    },
    {
      icon: FaLightbulb,
      title: "دورات بقيادة الخبراء",
      description: "تعلم من المحترفين في المجال مع سنوات من الخبرة العملية.",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: FaShieldAlt,
      title: "التعلم المعتمد",
      description: "احصل على شهادات معترف بها من أفضل الشركات في العالم.",
      color: "text-[#3A5A7A]-600",
      bgColor: "bg-[#3A5A7A]-50 dark:bg-[#3A5A7A]-900/20"
    },
    {
      icon: FaGlobe,
      title: "المجتمع العالمي",
      description: "تواصل مع المتعلمين من جميع أنحاء العالم وشارك الخبرات.",
      color: "text-[#3A5A7A]-600",
      bgColor: "bg-[#3A5A7A]-50 dark:bg-[#3A5A7A]-900/20"
    }
  ];

  const categories = [
    { icon: FaCode, name: "البرمجة", count: "150+ دورة", color: "bg-[#4D6D8E]" },
    { icon: FaPalette, name: "التصميم", count: "120+ دورة", color: "bg-[#4D6D8E]" },
    { icon: FaChartLine, name: "الأعمال", count: "200+ دورة", color: "bg-green-500" },
    { icon: FaBookOpen, name: "التسويق", count: "180+ دورة", color: "bg-[#4D6D8E]" }
  ];

  return (
    <Layout>
      {/* Hero Section - Clean & Modern RTL */}
      <div className={`transition-all duration-1000 ease-out ${
        heroVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
        <AnimatedHero onGetStarted={onGetStarted} />
      </div>

      {/* Features Section - What You'll Find on the Platform */}
      <section className={`py-20 bg-white dark:bg-[#0F172A] transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '400ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Accent Strip */}
          <div className="w-full h-2 bg-[#181eae] mb-8"></div>
          
          {/* Section Header */}
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '600ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              ماذا ستجد في منصة المحلل الذكي؟
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Interactive Dashboards */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '800ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#4D6D8E] rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                لوحات قياس وتحليلات تفاعلية
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                أنشئ لوحات تحكم تتابع الإيرادات، الاكتساب، والاحتفاظ في الوقت الفعلي لقرارات أسرع.
              </p>
            </div>

            {/* Feature 2 - Financial Models */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '900ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#4D6D8E] rounded-lg flex items-center justify-center">
                  <FaAward className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                نماذج مالية احترافية
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                تعلم بناء نماذج للتوقعات، التدفقات النقدية، وتحليل الحساسية بأساليب عملية.
              </p>
            </div>

            {/* Feature 3 - Predictive Analytics */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1000ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#4D6D8E] rounded-lg flex items-center justify-center">
                  <FaLightbulb className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                تحليلات تنبؤية ذكية
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                اكتشف اتجاهاتك المستقبلية باستخدام النماذج الإحصائية وأساليب التعلم الآلي.
              </p>
            </div>

            {/* Feature 4 - Real-time Reports */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1100ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#4D6D8E] rounded-lg flex items-center justify-center">
                  <FaClock className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                تقارير ولوحات فورية
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                أنشئ تقارير فورية تتحدّث تلقائياً مع مصادر البيانات وتعرض مؤشرات الأداء.
              </p>
            </div>

            {/* Feature 5 - Integrations */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1200ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#4D6D8E] rounded-lg flex items-center justify-center">
                  <FaGlobe className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                تكاملات جاهزة مع أدواتك
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                اربط بياناتك من CSV, Excel, قواعد البيانات، وواجهات REST API بسهولة.
              </p>
            </div>

            {/* Feature 6 - Practical Learning Paths */}
            <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-6 relative transition-all duration-500 ease-out ${
              heroLoaded 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
            style={{ transitionDelay: '1300ms' }}>
              <div className="absolute top-4 right-4">
                <div className="w-12 h-12 bg-[#4D6D8E] rounded-lg flex items-center justify-center">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-right pr-16">
                مسارات تعلم عملية
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-right leading-relaxed">
                تقدّم خطوة بخطوة من الأساسيات إلى بناء مشاريع فعلية في البيانات والتمويل.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className={`py-20 bg-white dark:bg-gray-800 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '2200ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '2400ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              الكورسات المتاحة
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف مجموعة واسعة من الكورسات التعليمية المميزة بقيادة خبراء الصناعة
            </p>
          </div>

          {featuredLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A5A7A]-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل الكورسات المميزة...</p>
            </div>
          ) : featuredCourses && featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(() => {
                console.log('🎯 HomePage rendering featuredCourses from Redux state:', {
                  totalCourses: featuredCourses.length,
                  allCourses: featuredCourses.map(c => ({
                    id: c._id,
                    title: c.title,
                    stage: c.stage,
                    stageName: c.stage?.name,
                    hasStage: !!c.stage,
                    hasName: !!c.stage?.name
                  }))
                });
                return null;
              })()}
              {featuredCourses.slice(0, 6).map((course, index) => (
                <div
                  key={course._id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ease-out overflow-hidden group border border-gray-200 dark:border-gray-700 ${
                    heroLoaded 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${2600 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  {/* Course Image */}
                  <div className="h-48 relative overflow-hidden">
                    {course.image?.secure_url ? (
                      <>
                        <img
                          src={generateImageUrl(course.image.secure_url)}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-full bg-gradient-to-br from-[#4D6D8E] to-[#2E4863]"></div>
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaBookOpen className="text-6xl text-white opacity-80" />
                        </div>
                      </>
                    )}
                    
                    {/* Fallback gradient for broken images */}
                    <div className="hidden w-full h-full bg-gradient-to-br from-[#4D6D8E] to-[#2E4863]">
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaBookOpen className="text-6xl text-white opacity-80" />
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-white bg-opacity-90 text-gray-800 text-xs font-medium rounded-full">
                        {(() => {
                          const stageName = course.stage?.name;
                          const fallback = 'غير محدد';
                          const result = stageName || fallback;
                          
                          console.log('🏷️ HomePage Stage Debug for course:', course.title, {
                            stage: course.stage,
                            stageName: stageName,
                            stageType: typeof course.stage,
                            hasStage: !!course.stage,
                            hasName: !!stageName,
                            finalResult: result,
                            willShowFallback: result === fallback
                          });
                          
                          if (result === fallback && course.stage) {
                            console.error('🚨 ISSUE: Stage exists but name is missing!', {
                              courseTitle: course.title,
                              stage: course.stage,
                              stageKeys: Object.keys(course.stage || {}),
                              stageName: course.stage?.name,
                              stageNameType: typeof course.stage?.name
                            });
                          }
                          
                          return result;
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Course Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Course Description */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Meta */}
                    <div className="space-y-3 mb-4">
                      {/* Instructor */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaUser className="text-gray-400" />
                        <span>{course.instructor?.name || 'غير محدد'}</span>
                      </div>

                                             {/* Subject */}
                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                         <FaBookOpen className="text-gray-400" />
                         <span>{course.subject?.title || 'غير محدد'}</span>
                       </div>

                                             {/* Lessons Count */}
                       <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                         <FaPlay className="text-gray-400" />
                         <span>
                           {(course.directLessons?.length || 0) + 
                            (course.units?.reduce((total, unit) => total + (unit.lessons?.length || 0), 0) || 0)} درس متاح
                         </span>
                       </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/courses/${course._id}`}
                        className="flex-1 bg-[#4D6D8E] hover:bg-[#3A5A7A] text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FaEye />
                        <span>عرض التفاصيل</span>
                      </Link>
                      <Link
                        to="/courses"
                        className="px-4 py-2 border border-[#4D6D8E] text-[#4D6D8E] hover:bg-[#A5B7CD]/20 dark:hover:bg-[#4D6D8E]/20 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد دورات متاحة حالياً
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                سيتم إضافة دورات جديدة قريباً!
              </p>
            </div>
          )}

          {/* View All Courses Button */}
          {featuredCourses && featuredCourses.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#4D6D8E] hover:bg-[#3A5A7A] text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>عرض جميع الكورسات  </span>
                <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Instructor Section */}
      {/* <Suspense fallback={
        <div className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <InstructorSection />
      </Suspense> */}
      {/* Latest Blogs Section */}
      <section className={`py-20 bg-gray-50 dark:bg-gray-900 transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`} 
      dir="rtl"
      style={{ transitionDelay: '3000ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '3200ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              أحدث الأخبار من مدونتنا
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف الأفكار والنصائح والقصص من مجتمع التعلم لدينا
            </p>
          </div>

          {blogs && blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.slice(0, 3).map((blog, index) => (
                <div 
                  key={blog._id} 
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-2 ${
                    heroLoaded 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: `${3400 + (index * 100)}ms`,
                    transitionProperty: 'opacity, transform, scale'
                  }}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={generateImageUrl(blog.image?.secure_url)}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = placeholderImages.blog;
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <FaUser />
                        {blog.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendar />
                        {formatDate(blog.createdAt)}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-right">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-right">
                      {blog.excerpt || blog.content.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaEye />
                          {blog.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart />
                          {blog.likes || 0}
                        </span>
                      </div>
                      
                      <Link
                        to={`/blog/${blog._id}`}
                        className="text-[#3A5A7A]-600 hover:text-[#3A5A7A]-700 dark:text-[#3A5A7A]-400 dark:hover:text-[#3A5A7A]-300 font-medium flex items-center gap-1 group"
                      >
                        اقرأ المزيد
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                لا توجد منشورات مدونة حتى الآن
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                تابعونا قريبا للحصول على محتوى مذهل!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 bg-gradient-to-r from-[#4D6D8E] via-[#3A5A7A] to-[#2E4863] transition-all duration-700 ease-out ${
        heroLoaded 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: '3600ms' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '3800ms' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                          هل أنت مستعد لبدء رحلة التعلم؟
            </h2>
            <p className="text-xl text-[#A5B7CD] mb-8 max-w-3xl mx-auto">
              انضم إلى آلاف المتعلمين الذين نجحوا بالفعل في تغيير حياتهم المهنية من خلال دوراتنا التدريبية التي يقدمها خبراؤنا.
            </p>
          </div>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 ease-out ${
            heroLoaded 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
          }`}
          style={{ transitionDelay: '4000ms' }}>
            <Link to="/signup">
              <button className="px-8 py-4 bg-[#181eae] hover:bg-[#C06C42] text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                ابدأ مجاناً
              </button>
            </Link>
            
            <Link to="/qa">
              <button className="px-8 py-4 bg-[#4D6D8E] hover:bg-[#3A5A7A] text-white font-semibold rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <FaQuestionCircle className="w-5 h-5" />
                اطرح سؤالاً
              </button>
            </Link>
          </div>
        </div>
      </section>


      {/* Mobile App Download Section */}
      <section className="py-20 bg-gradient-to-br from-[#A5B7CD]/20 via-white to-white dark:from-[#0F172A] dark:via-[#0F172A] dark:to-[#0F172A]" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content Side */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-[#A5B7CD]/30 dark:bg-[#4D6D8E]/20 text-[#0F172A] dark:text-white px-4 py-2 rounded-full text-sm font-medium">
                  <FaMobile className="w-4 h-4 ml-2" />
                  <span>تطبيق الجوال متاح الآن</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                  حمّل التطبيق
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#4D6D8E] to-[#181eae]">
                    وتعلم في أي مكان
                  </span>
                </h2>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  احصل على أفضل تجربة تعليمية مع تطبيقنا المتطور. تعلم في أي وقت ومن أي مكان مع واجهة سهلة الاستخدام ومحتوى تفاعلي.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#A5B7CD]/30 dark:bg-[#4D6D8E]/20 rounded-full flex items-center justify-center">
                    <FaDownload className="w-4 h-4 text-[#4D6D8E] dark:text-[#A5B7CD]" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 mr-3">اتصال بالانترنت  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#181eae]/20 dark:bg-[#181eae]/20 rounded-full flex items-center justify-center">
                    <FaPlay className="w-4 h-4 text-[#181eae]" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 mr-3">فيديوهات عالية الجودة</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#181eae]/20 dark:bg-[#181eae]/20 rounded-full flex items-center justify-center">
                    <FaBookOpen className="w-4 h-4 text-[#181eae]" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 mr-3">مكتبة شاملة</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#181eae]/20 dark:bg-[#181eae]/20 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="w-4 h-4 text-[#181eae]" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 mr-3">تتبع التقدم</span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {/* Direct APK Download Button */}
                <button
                  onClick={handleAPKDownload}
                  className="group relative overflow-hidden bg-[#4D6D8E] hover:bg-[#3A5A7A] text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3A5A7A] to-[#2E4863] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaAndroid className="w-6 h-6 relative z-10 ml-3" />
                  <div className="text-right relative z-10">
                    <div className="text-sm opacity-90">حمّل مباشرة</div>
                    <div className="font-bold">APK ملف</div>
                  </div>
                  <FaDownload className="w-5 h-5 relative z-10 mr-3" />
                </button>

                {/* Google Play Store Button (Future) */}
                <button
                  onClick={handlePlayStoreRedirect}
                  className="group relative overflow-hidden bg-[#181eae] hover:bg-[#C06C42] text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C06C42] to-[#A35635] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaGooglePlay className="w-6 h-6 relative z-10 ml-3" />
                  <div className="text-right relative z-10">
                    <div className="text-sm opacity-90">قريباً على</div>
                    <div className="font-bold">Google Play</div>
                  </div>
                </button>
              </div>

              {/* Download Stats */}
              <div className="flex items-center space-x-8 pt-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <FaStar className="w-4 h-4 text-[#A5B7CD] ml-1" />
                  <span>4.8 تقييم</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaDownload className="w-4 h-4 text-[#4D6D8E] ml-1" />
                  <span>+10k تحميل</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaUsers className="w-4 h-4 text-[#181eae] ml-1" />
                  <span>مجاني 100%</span>
                </div>
              </div>
            </div>

            {/* Phone Mockup Side */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="bg-gray-50 h-12 flex items-center justify-between px-6 text-sm">
                      <span className="font-medium">9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-2 bg-gray-900 rounded-sm"></div>
                        <div className="w-1 h-2 bg-gray-900 rounded-sm"></div>
                        <div className="w-6 h-2 bg-green-500 rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* App Content Preview */}
                    <div className="p-6 space-y-6">
                      {/* App Header */}
                      <div className="flex items-center space-x-4" dir="rtl">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#4D6D8E] to-[#3A5A7A]-600 rounded-xl flex items-center justify-center">
                          <img src={logo} alt="logo" className="w-12 h-12" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">تطبيق  The Good Analyst</h3>
                          <p className="text-sm text-gray-600"> التعلم الذكية</p>
                        </div>
                      </div>

                      {/* Course Cards Preview */}
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-[#3A5A7A]-50 to-[#3A5A7A]-50 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">التحليل</h4>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">جديد</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3"> التحليل </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-[#3A5A7A]-600 font-medium">30% مكتمل</span>
                            <button className="bg-[#3A5A7A]-600 text-white px-4 py-1 rounded-full text-xs">متابعة</button>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-[#3A5A7A]-50 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">قواعد الSQL </h4>
                            <span className="text-xs bg-[#3A5A7A]-100 text-[#3A5A7A]-800 px-2 py-1 rounded-full">شائع</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">  قواعد الSQL </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-600 font-medium">75% مكتمل</span>
                            <button className="bg-[#3A5A7A]-600 text-white px-4 py-1 rounded-full text-xs">متابعة</button>
                          </div>
                        </div>
                      </div>

                      {/* Features Preview */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">مميزات التطبيق</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-green-500 w-4 h-4 ml-2" />
                            <span className="text-sm text-gray-700">دروس تفاعلية</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-green-500 w-4 h-4 ml-2" />
                            <span className="text-sm text-gray-700">اختبارات ذكية</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCheckCircle className="text-green-500 w-4 h-4 ml-2" />
                            <span className="text-sm text-gray-700">شهادات معتمدة</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-[#A5B7CD] to-[#4D6D8E] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <FaDownload className="text-white text-2xl" />
                </div>
                
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-[#181eae] to-[#4D6D8E] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <FaMobile className="text-white text-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Static FAQ Section */}
      <section className="py-16 px-4 lg:px-20 bg-gradient-to-br from-gray-50 to-[#3A5A7A]-50 dark:from-gray-900 dark:to-gray-800" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 text-right">
              الأسئلة الشائعة
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 text-right">
              كل ما تحتاج معرفته عن منصتنا
            </p>
          </div>
          <Suspense fallback={
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse text-right">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 mr-auto"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mr-auto"></div>
                </div>
              ))}
            </div>
          }>
            <FAQAccordion />
          </Suspense>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                تواصل معنا
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                لديك أسئلة؟ نحب أن نسمع منك. تواصل معنا من خلال أي من هذه القنوات. نحن هنا لمساعدتك!
              </p>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3A5A7A]-100 dark:bg-[#3A5A7A]-900/20 rounded-full flex items-center justify-center mr-4">
                  <FaPhone className="text-[#3A5A7A]-600 dark:text-[#3A5A7A]-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">الهاتف</h3>
                  <a href="tel:01080808667" className="text-[#3A5A7A]-600 dark:text-[#3A5A7A]-400 hover:underline">
                    01080808667
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
                  <FaWhatsapp className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">واتساب</h3>
                  <a href="https://wa.me/+201555559887" className="text-green-600 dark:text-green-400 hover:underline">
                  +201555559887
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
                تابعنا
              </h3>
              <div className="flex flex-wrap justify-center gap-6 max-w-md mx-auto">
                <a
                  href="https://www.facebook.com/share/16Vq29HcXH/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-[#3A5A7A]-600 hover:scale-105"
                  title="Facebook"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaFacebook className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Facebook
                  </span>
                </a>
                <a
                  href="https://youtube.com/@_aymanthegoodanalyst9685?si=X_KXTLDEsxNG5tAs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-[#3A5A7A]-600 hover:scale-105"
                  title="YouTube"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaYoutube className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    YouTube
                  </span>
                </a>
                <a
                  href="https://wa.me/01555559887"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:text-green-500 hover:scale-105"
                  title="WhatsApp"
                >
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-opacity-80 transition-colors">
                    <FaWhatsapp className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    WhatsApp
                  </span>
                </a>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-[#3A5A7A]-50 to-yellow-50 dark:from-[#3A5A7A]-900/20 dark:to-yellow-900/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  لماذا تختار منصتنا؟
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#3A5A7A]-100 dark:bg-[#3A5A7A]-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUser className="text-2xl text-[#3A5A7A]-600 dark:text-[#3A5A7A]-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">دعم متخصص</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      دعم العملاء على مدار الساعة لمساعدتك في أي أسئلة
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#3A5A7A]-100 dark:bg-[#3A5A7A]-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaGlobe className="text-2xl text-[#3A5A7A]-600 dark:text-[#3A5A7A]-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">مجتمع عالمي</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      تواصل مع المتعلمين من جميع أنحاء العالم
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#3A5A7A]-100 dark:bg-[#3A5A7A]-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaComments className="text-2xl text-[#3A5A7A]-600 dark:text-[#3A5A7A]-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">استجابة سريعة</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      احصل على إجابات لأسئلتك خلال 24 ساعة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Partner Section */}
        <section className="py-16 bg-white dark:bg-gray-800" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              شركاؤنا
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              شريكنا التقني: 
              <a
                href=""
                rel="noopener noreferrer"
                className="font-semibold text-[#3A5A7A]-600 hover:text-[#3A5A7A]-700 dark:text-[#3A5A7A]-400 dark:hover:text-[#3A5A7A]-300"
              >
                Fikra Software
              </a>
            </p>
          </div>
          <div className="flex items-center justify-center">
            <a href="https://fikra.solutions/" rel="noopener noreferrer" className="flex items-center justify-center">
              <img
                src={fikraLogo}
                alt="Fikra Software Logo"
                className="h-24 md:h-32 object-contain drop-shadow-lg hover:opacity-90 transition"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-[#4D6D8E] to-[#3A5A7A]-600 hover:from-[#3A5A7A]-600 hover:to-[#3A5A7A]-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-5 h-5 group-hover:animate-bounce" />
        </button>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/+201555559887"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed left-8 bottom-8 z-50 p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group animate-bounce"
        aria-label="Contact us on WhatsApp"
        title="تواصل معنا على واتساب"
      >
        <FaWhatsapp className="w-6 h-6" />
      </a>
    </Layout>
  );
}
