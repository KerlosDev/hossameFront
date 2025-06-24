'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiBookOpen, FiUsers, FiStar, FiArrowRight, FiArrowLeft, FiTag, FiZap } from 'react-icons/fi';
import { FaCalculator, FaSquareRootAlt, FaInfinity, FaChartLine, FaPrint } from "react-icons/fa";
import { MdFunctions } from "react-icons/md";
import { TbMathSymbols, TbMathIntegral } from "react-icons/tb";
import { GiTakeMyMoney } from "react-icons/gi";
import { IoMdClose } from 'react-icons/io';

// Move offer data outside component to prevent recreation on every render
const offerData = {
    id: 1,
    title: "عرض خاص - مجموعة إتقان الرياضيات",
    subtitle: "حسام ميرا يقدم",
    description: "احصل على الوصول لجميع الدورات المتميزة، المحتوى الحصري، والإرشاد الشخصي بسعر لا يُقاوم!",
    originalPrice: 299,
    discountPrice: 99,
    discountPercentage: 67,
    courses: 12,
    students: 2847,
    rating: 4.9,
    features: [
        "12 دورة رياضيات كاملة",
        "+150 ساعة من المحتوى المرئي",
        "جلسات إرشاد شخصية",
        "مصادر قابلة للتحميل",
        "وصول مدى الحياة",
        "شهادة إتمام معتمدة"
    ],
    endDate: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    isLimited: true,
    spotsLeft: 23
};

const Offer = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Use the static offer data
    const offer = offerData;    // Countdown timer logic - simplified for debugging
    useEffect(() => {
        const endTime = offer.endDate.getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            return { days, hours, minutes, seconds };
        };

        // Set initial time
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            // Clear timer if countdown finished
            if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 &&
                newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);// Empty dependency array since we're using a static end time

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }; return (
        <div dir="rtl" className="min-h-[60vh] font-arabicUI2 bg-gradient-to-br from-blue-50 via-white to-slate-50 
                    dark:from-blue-950 dark:via-slate-900 dark:to-slate-950 py-6 px-4 overflow-hidden relative">{/* Enhanced Background Elements - Matching Hero.jsx and Courses.jsx */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 right-10 w-40 h-40 bg-blue-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center animate-float">
                    <FaPrint className="text-6xl text-blue-500/50 animate-spin-slow" />
                </div>
                <div className="absolute top-40 left-20 w-48 h-48 bg-red-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center animate-float-delayed">
                    <FaSquareRootAlt className="text-7xl text-red-500/50 animate-bounce" />
                </div>
                <div className="absolute left-10 bottom-10 w-48 h-48 bg-green-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center animate-float-delayed">
                    <TbMathIntegral className="text-7xl text-green-500/50 animate-bounce" />
                </div>
                {/* New decorative elements */}
                <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-yellow-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center animate-pulse">
                    <FaInfinity className="text-5xl text-yellow-500/50 animate-spin" />
                </div>
                <div className="absolute inset-0 opacity-10 bg-repeat mix-blend-overlay"></div>
            </div>            <motion.div
                className="max-w-7xl mx-auto relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-16" dir="rtl">
                    <div className="inline-flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-2 sm:py-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-2xl
                                  border border-blue-500/20 mb-6">
                        <h1 className="text-3xl sm:text-5xl font-arabicUI2 text-slate-800 dark:text-white">العروض المميزة</h1>
                        <FiZap className="text-3xl sm:text-4xl text-red-500 animate-pulse" />
                    </div>
                    <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 font-arabicUI3">
                        احصل على أفضل العروض لتعلم الرياضيات مع حسام ميرا
                    </p>
                </motion.div>                {/* Main Offer Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden 
                              border border-blue-500/20 relative"
                >                    {/* Subtle Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-xl sm:rounded-2xl"></div>
                    <div className="relative">{/* Enhanced Discount Badge */}
                        <motion.div
                            className="absolute top-6 left-6 z-10"
                            dir="rtl"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: -3 }}
                            transition={{ type: "spring", delay: 0.5 }}
                            whileHover={{ scale: 1.1, rotate: 0 }}
                        >
                            <div className="relative">
                                <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white px-4 py-2 
                                              rounded-xl font-bold text-lg shadow-lg border border-red-400/30
                                              flex items-center gap-2 font-arabicUI2">
                                    <FiTag className="text-lg animate-pulse" />
                                    خصم {offer.discountPercentage}%
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-red-400/40 to-transparent 
                                              rounded-xl blur-lg -z-10 scale-110"></div>
                            </div>
                        </motion.div>                        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8">                            {/* Right Section - Offer Details (Arabic RTL) */}
                            <div className="order-2 lg:order-1" dir="rtl">                                {/* Countdown Grid-Style Offer Title */}
                                <motion.div
                                    variants={itemVariants}
                                    className="mb-8"
                                >
                                    <div className="relative group">
                                        {/* Animated background glow */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 
                                                      rounded-3xl blur-2xl opacity-30 scale-110"
                                            animate={{
                                                scale: [1.1, 1.3, 1.1],
                                                opacity: [0.3, 0.5, 0.3]
                                            }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                        />

                                        {/* Main countdown-style card */}
                                        <motion.div
                                            className="relative bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 
                                                      rounded-3xl p-8 shadow-2xl border border-white/20 overflow-hidden"
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Glass effect overlay */}
                                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl"></div>

                                            {/* Animated background particles */}
                                            <motion.div
                                                className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/20 via-transparent to-white/10"
                                                animate={{
                                                    opacity: [0.2, 0.4, 0.2]
                                                }}
                                                transition={{ duration: 6, repeat: Infinity }}
                                            />

                                            <div className="relative z-10 text-center">
                                                {/* Subtitle with timer-style badge */}
                                                <motion.div
                                                    className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md 
                                                             rounded-full border border-white/30 mb-4"
                                                    animate={{
                                                        scale: [1, 1.05, 1],
                                                        borderOpacity: [0.3, 0.6, 0.3]
                                                    }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    <motion.span
                                                        className="text-2xl"
                                                        animate={{
                                                            rotate: [0, 10, -10, 0],
                                                            scale: [1, 1.1, 1]
                                                        }}
                                                        transition={{
                                                            duration: 1.5,
                                                            repeat: Infinity,
                                                            repeatDelay: 0.5
                                                        }}
                                                    >
                                                        🔥
                                                    </motion.span>
                                                    <span className="text-lg font-bold text-white drop-shadow-lg font-arabicUI3">
                                                        {offer.subtitle}
                                                    </span>
                                                    <motion.span
                                                        className="text-xl"
                                                        animate={{
                                                            scale: [1, 1.2, 1],
                                                            opacity: [0.8, 1, 0.8]
                                                        }}
                                                        transition={{ duration: 1.2, repeat: Infinity }}
                                                    >
                                                        ⚡
                                                    </motion.span>
                                                </motion.div>

                                                {/* Grid-style main title */}
                                                <motion.h2
                                                    className="text-4xl lg:text-5xl xl:text-6xl font-black text-white 
                                                             drop-shadow-2xl font-arabicUI2 mb-4 tracking-tight leading-tight"
                                                    animate={{
                                                        scale: [1, 1.02, 1],
                                                        filter: [
                                                            "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
                                                            "drop-shadow(0 0 25px rgba(255,255,255,0.8))",
                                                            "drop-shadow(0 0 10px rgba(255,255,255,0.5))"
                                                        ]
                                                    }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                >
                                                    {offer.title}
                                                </motion.h2>

                                                {/* Timer-style decorative elements */}
                                                <div className="flex items-center justify-center gap-4 mt-4">
                                                    <motion.div
                                                        className="w-12 h-1 bg-white/40 rounded-full"
                                                        animate={{ scaleX: [0, 1, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    />

                                                    <motion.div
                                                        className="relative w-12 h-12 bg-white/20 backdrop-blur-md 
                                                                  rounded-2xl flex items-center justify-center shadow-xl 
                                                                  border border-white/30"
                                                        animate={{
                                                            rotate: [0, 360],
                                                            scale: [1, 1.1, 1]
                                                        }}
                                                        transition={{
                                                            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                                                            scale: { duration: 2, repeat: Infinity }
                                                        }}
                                                    >
                                                        <FiClock className="text-xl text-white drop-shadow-lg" />
                                                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg scale-150" />
                                                    </motion.div>

                                                    <motion.div
                                                        className="w-12 h-1 bg-white/40 rounded-full"
                                                        animate={{ scaleX: [0, 1, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                                    />
                                                </div>

                                                {/* Urgency message in countdown style */}
                                                <motion.div
                                                    className="mt-6 px-6 py-3 bg-white/15 backdrop-blur-md rounded-2xl 
                                                             border border-white/20 inline-block"
                                                    animate={{
                                                        opacity: [0.8, 1, 0.8],
                                                        scale: [1, 1.02, 1]
                                                    }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    <span className="text-lg font-bold text-white drop-shadow-lg font-arabicUI3">
                                                        ⏰ عرض محدود الوقت - احجز الآن قبل انتهاء العرض!
                                                    </span>
                                                </motion.div>
                                            </div>

                                            {/* Corner accent indicators like countdown grid */}
                                            <div className="absolute top-4 right-4 w-4 h-4 bg-white/50 rounded-full animate-pulse" />
                                            <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/50 rounded-full animate-pulse"
                                                style={{ animationDelay: '0.5s' }} />

                                            {/* Progress indicator similar to countdown seconds */}
                                            <motion.div
                                                className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 
                                                          bg-white/20 rounded-full overflow-hidden"
                                            >
                                                <motion.div
                                                    className="h-full bg-white/60 rounded-full"
                                                    animate={{ width: ['0%', '100%', '0%'] }}
                                                    transition={{ duration: 4, repeat: Infinity }}
                                                />
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                </motion.div>

                                <motion.p
                                    variants={itemVariants}
                                    className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed font-arabicUI3"
                                >
                                    {offer.description}
                                </motion.p>

                                {/* Stats */}
                                <motion.div variants={itemVariants} className="flex flex-wrap gap-6 mb-8">
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <FiBookOpen className="ml-2 text-blue-500" />
                                        <span className="font-semibold">{offer.courses}</span> دورة
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <FiUsers className="ml-2 text-green-500" />
                                        <span className="font-semibold">{offer.students.toLocaleString()}</span> طالب
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <FiStar className="ml-2 text-yellow-500" />
                                        <span className="font-semibold">{offer.rating}</span> تقييم
                                    </div>
                                </motion.div>

                                {/* Features */}
                                <motion.div variants={itemVariants}>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 font-arabicUI2">ما يشمله العرض:</h3>
                                    <div className="grid gap-3">
                                        {offer.features.map((feature, index) => (
                                            <motion.div
                                                key={index}
                                                variants={itemVariants}
                                                className="flex items-center text-gray-700 dark:text-gray-300"
                                            >
                                                <div className="w-2 h-2 bg-green-500 rounded-full ml-3"></div>
                                                <span className="font-arabicUI3">{feature}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Class Level Selection */}
                                <motion.div variants={itemVariants} className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 font-arabicUI2 text-center">
                                        اختر صفك الدراسي:
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <motion.button
                                            className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 
                                                      hover:border-blue-500 hover:from-blue-500/20 hover:to-blue-600/20
                                                      text-blue-700 dark:text-blue-300 py-3 px-4 rounded-xl font-semibold
                                                      transition-all duration-300 backdrop-blur-sm relative overflow-hidden group
                                                      font-arabicUI3"
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 
                                                          to-blue-400/0 translate-y-[100%] group-hover:translate-y-0 
                                                          transition-transform duration-300"></div>
                                            <span className="relative z-10">أولى ثانوي</span>
                                        </motion.button>

                                        <motion.button
                                            className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/30 
                                                      hover:border-green-500 hover:from-green-500/20 hover:to-green-600/20
                                                      text-green-700 dark:text-green-300 py-3 px-4 rounded-xl font-semibold
                                                      transition-all duration-300 backdrop-blur-sm relative overflow-hidden group
                                                      font-arabicUI3"
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/20 
                                                          to-green-400/0 translate-y-[100%] group-hover:translate-y-0 
                                                          transition-transform duration-300"></div>
                                            <span className="relative z-10">تانية ثانوي</span>
                                        </motion.button>

                                        <motion.button
                                            className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-2 border-purple-500/30 
                                                      hover:border-purple-500 hover:from-purple-500/20 hover:to-purple-600/20
                                                      text-purple-700 dark:text-purple-300 py-3 px-4 rounded-xl font-semibold
                                                      transition-all duration-300 backdrop-blur-sm relative overflow-hidden group
                                                      font-arabicUI3"
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 
                                                          to-purple-400/0 translate-y-[100%] group-hover:translate-y-0 
                                                          transition-transform duration-300"></div>
                                            <span className="relative z-10">تالتة ثانوي</span>
                                        </motion.button>
                                    </div>
                                </motion.div>

                            </div>              {/* Left Section - Pricing & CTA (Arabic RTL) */}
                            <div className="flex flex-col justify-center order-1 lg:order-2" dir="rtl">                                {/* Ultra Modern Countdown Timer */}
                                <motion.div variants={itemVariants} className="mb-8">
                                    <div className="text-center mb-6">
                                        {/* Modern Header */}
                                        <motion.div
                                            className="relative inline-block mb-8"
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8 }}
                                        >
                                            {/* Background blur effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 
                                                          rounded-2xl blur-xl scale-110"></div>

                                            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl 
                                                          border border-white/40 dark:border-slate-700/40 rounded-2xl 
                                                          px-8 py-4 shadow-2xl">
                                                <div className="flex items-center gap-4">
                                                    <motion.div
                                                        className="relative"
                                                        animate={{
                                                            rotate: [0, 360],
                                                            scale: [1, 1.1, 1]
                                                        }}
                                                        transition={{
                                                            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                                                            scale: { duration: 2, repeat: Infinity }
                                                        }}
                                                    >
                                                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 
                                                                      rounded-full flex items-center justify-center shadow-lg">
                                                            <FiClock className="text-2xl text-white" />
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-red-400/40 to-orange-400/40 
                                                                      rounded-full blur-lg scale-150"></div>
                                                    </motion.div>

                                                    <div className="text-right">
                                                        <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 
                                                                     bg-clip-text text-transparent font-arabicUI2">
                                                            انتهاء العرض خلال
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-arabicUI3">
                                                            لا تفوت هذه الفرصة الذهبية
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Modern Countdown Display */}
                                        <div className="relative max-w-3xl mx-auto">
                                            {/* Background glow */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 
                                                          rounded-3xl blur-2xl scale-110"></div>

                                            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl 
                                                          rounded-3xl p-8 border border-white/30 dark:border-slate-700/30 shadow-2xl">

                                                {/* Countdown Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                                    {Object.entries(timeLeft).map(([unit, value], index) => {
                                                        const arabicUnits = {
                                                            days: 'يوم',
                                                            hours: 'ساعة',
                                                            minutes: 'دقيقة',
                                                            seconds: 'ثانية'
                                                        };

                                                        const gradients = {
                                                            days: 'from-cyan-400 to-blue-600',
                                                            hours: 'from-emerald-400 to-green-600',
                                                            minutes: 'from-amber-400 to-orange-600',
                                                            seconds: 'from-rose-400 to-red-600'
                                                        };

                                                        const shadowColors = {
                                                            days: 'shadow-cyan-500/25',
                                                            hours: 'shadow-emerald-500/25',
                                                            minutes: 'shadow-amber-500/25',
                                                            seconds: 'shadow-rose-500/25'
                                                        };

                                                        return (
                                                            <motion.div
                                                                key={unit}
                                                                className="relative group"
                                                                initial={{
                                                                    opacity: 0,
                                                                    scale: 0,
                                                                    rotateY: -90
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    scale: 1,
                                                                    rotateY: 0
                                                                }}
                                                                transition={{
                                                                    delay: index * 0.2,
                                                                    type: "spring",
                                                                    stiffness: 200,
                                                                    damping: 20
                                                                }} whileHover={{
                                                                    scale: 1.05,
                                                                    rotateY: 5
                                                                }}
                                                            >
                                                                {/* Card container */}
                                                                <div className="relative perspective-1000">                                                                    {/* Outer glow ring */}
                                                                    <motion.div
                                                                        className="absolute -inset-2 rounded-2xl opacity-75"
                                                                        style={{
                                                                            background: `linear-gradient(${index * 90}deg, transparent, ${gradients[unit].split(' to ')[1]}, transparent)`
                                                                        }}
                                                                        animate={{ rotate: 360 }}
                                                                        transition={{
                                                                            duration: unit === 'seconds' ? 4 : 12,
                                                                            repeat: Infinity,
                                                                            ease: "linear"
                                                                        }}
                                                                    />

                                                                    {/* Main card */}
                                                                    <div className={`relative bg-gradient-to-br ${gradients[unit]} 
                                                                                  rounded-2xl p-6 shadow-2xl ${shadowColors[unit]} 
                                                                                  border border-white/20 overflow-hidden group-hover:shadow-3xl 
                                                                                  transition-all duration-300 transform-gpu`}>

                                                                        {/* Glass effect overlay */}
                                                                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>                                                                        {/* Animated background particles */}
                                                                        <motion.div
                                                                            className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/20 via-transparent to-white/10"
                                                                            animate={{
                                                                                opacity: [0.2, 0.4, 0.2]
                                                                            }}
                                                                            transition={{ duration: 6, repeat: Infinity }}
                                                                        />

                                                                        {/* Time value */}
                                                                        <motion.div
                                                                            className="relative z-10 text-center"
                                                                            key={value}
                                                                            initial={{ scale: 1.3, opacity: 0 }}
                                                                            animate={{ scale: 1, opacity: 1 }}
                                                                            transition={{ duration: 0.3 }}
                                                                        >                                                                            <motion.div
                                                                            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white 
                                                                                          drop-shadow-lg mb-2 tracking-tight"
                                                                            animate={unit === 'seconds' ? {
                                                                                scale: [1, 1.1, 1],
                                                                                filter: [
                                                                                    "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
                                                                                    "drop-shadow(0 0 20px rgba(255,255,255,0.8))",
                                                                                    "drop-shadow(0 0 10px rgba(255,255,255,0.5))"
                                                                                ]
                                                                            } : {}}
                                                                            transition={{
                                                                                duration: 1,
                                                                                repeat: unit === 'seconds' ? Infinity : 0
                                                                            }}
                                                                        >
                                                                                {String(value).padStart(2, '0')}
                                                                            </motion.div>

                                                                            <div className="text-white/90 text-sm font-bold font-arabicUI3 
                                                                                          uppercase tracking-wider">
                                                                                {arabicUnits[unit]}
                                                                            </div>
                                                                        </motion.div>

                                                                        {/* Progress indicator for seconds */}
                                                                        {unit === 'seconds' && (
                                                                            <motion.div
                                                                                className="absolute bottom-2 left-2 right-2 h-1 bg-white/20 rounded-full 
                                                                                          overflow-hidden"
                                                                            >
                                                                                <motion.div
                                                                                    className="h-full bg-white/60 rounded-full"
                                                                                    style={{ width: `${((60 - value) / 60) * 100}%` }}
                                                                                    transition={{ duration: 0.5 }}
                                                                                />
                                                                            </motion.div>
                                                                        )}

                                                                        {/* Corner accent */}
                                                                        <div className="absolute top-3 right-3 w-3 h-3 bg-white/40 rounded-full 
                                                                                      animate-pulse"></div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Progress bar */}
                                                <motion.div
                                                    className="mt-8 relative h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden"
                                                    initial={{ opacity: 0, scaleX: 0 }}
                                                    animate={{ opacity: 1, scaleX: 1 }}
                                                    transition={{ delay: 1, duration: 0.8 }}
                                                >                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 
                                                                  rounded-full shadow-lg"
                                                        style={{
                                                            width: `${Math.max(10, ((timeLeft.days * 24 * 60 * 60 + timeLeft.hours * 60 * 60 + timeLeft.minutes * 60 + timeLeft.seconds) / (10 * 60)) * 100)}%`
                                                        }}
                                                        animate={{
                                                            filter: [
                                                                "drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))",
                                                                "drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))",
                                                                "drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))"
                                                            ]
                                                        }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    />
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Modern Urgency Message */}
                                        <motion.div
                                            className="mt-8 relative inline-block"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.2 }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 
                                                          rounded-2xl blur-lg scale-110"></div>
                                            <motion.div
                                                className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl 
                                                          border-2 border-red-200 dark:border-red-800 rounded-2xl 
                                                          px-6 py-4 shadow-xl"
                                                animate={{
                                                    scale: [1, 1.02, 1],
                                                    borderWidth: [2, 3, 2]
                                                }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <motion.span
                                                        className="text-2xl"
                                                        animate={{
                                                            rotate: [0, 15, -15, 0],
                                                            scale: [1, 1.2, 1]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            repeatDelay: 1
                                                        }}
                                                    >
                                                        🔥
                                                    </motion.span>

                                                    <div className="text-center">
                                                        <div className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 
                                                                      bg-clip-text text-transparent font-arabicUI2">
                                                            عرض محدود الوقت
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 font-arabicUI3">
                                                            احجز مكانك الآن قبل انتهاء العرض
                                                        </div>
                                                    </div>

                                                    <motion.span
                                                        className="text-2xl"
                                                        animate={{
                                                            scale: [1, 1.3, 1],
                                                            opacity: [1, 0.7, 1]
                                                        }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        ⚡
                                                    </motion.span>
                                                </div>
                                            </motion.div>
                                        </motion.div>

                                    </div>


                                </motion.div>
                                {/* Ultra Modern Pricing Section */}
                                <motion.div variants={itemVariants} className="text-center mb-8">
                                    <div className="relative max-w-2xl mx-auto">
                                        {/* Background glow */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 
                                                      rounded-3xl blur-2xl scale-110"></div>

                                        <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl 
                                                      rounded-3xl p-8 border border-white/30 dark:border-slate-700/30 shadow-2xl">

                                            {/* Header */}


                                            {/* Price Cards Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                                {/* Original Price Card */}
                                                <motion.div
                                                    className="relative group"
                                                    initial={{ opacity: 0, scale: 0.8, x: -50 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                    transition={{ delay: 0.4, type: "spring" }}
                                                >
                                                    <div className="relative bg-gradient-to-br from-gray-500/20 to-gray-600/20 
                                                                  rounded-2xl p-6 border border-gray-400/30 overflow-hidden">

                                                        {/* Strike-through effect */}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <motion.div
                                                                className="w-full h-1 bg-red-500 rounded-full"
                                                                initial={{ scaleX: 0 }}
                                                                animate={{ scaleX: 1 }}
                                                                transition={{ delay: 1, duration: 0.8 }}
                                                            />
                                                        </div>

                                                        <div className="text-center relative z-10">
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-arabicUI3">
                                                                السعر العادي
                                                            </div>
                                                            <div className="text-3xl font-black text-gray-500 dark:text-gray-400 line-through">
                                                                ${offer.originalPrice}
                                                            </div>
                                                            <div className="text-xs text-red-500 mt-1 font-arabicUI3">
                                                                منتهي الصلاحية
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Special Price Card */}
                                                <motion.div
                                                    className="relative group"
                                                    initial={{ opacity: 0, scale: 0.8, x: 50 }}
                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                    transition={{ delay: 0.6, type: "spring" }}
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    {/* Rotating glow ring */}


                                                    <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 
                                                                  rounded-2xl p-6 border border-white/20 overflow-hidden shadow-2xl">

                                                        {/* Glass effect overlay */}
                                                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>

                                                        {/* Animated particles */}
                                                        <motion.div
                                                            className="absolute inset-0 opacity-30"
                                                            animate={{
                                                                background: [
                                                                    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 70%)",
                                                                    "radial-gradient(circle at 70% 80%, rgba(255,255,255,0.4) 0%, transparent 70%)",
                                                                    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 70%)"
                                                                ]
                                                            }}
                                                            transition={{ duration: 4, repeat: Infinity }}
                                                        />

                                                        <div className="text-center relative z-10">
                                                            <motion.div
                                                                className="text-sm text-white/90 mb-2 font-arabicUI3 flex items-center justify-center gap-1"
                                                                animate={{ scale: [1, 1.1, 1] }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                            >
                                                                <span>⭐</span>
                                                                السعر الخاص
                                                                <span>⭐</span>
                                                            </motion.div>
                                                            <motion.div
                                                                className="text-5xl font-black text-white drop-shadow-lg mb-1"
                                                                animate={{
                                                                    scale: [1, 1.05, 1],
                                                                    filter: [
                                                                        "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
                                                                        "drop-shadow(0 0 20px rgba(255,255,255,0.8))",
                                                                        "drop-shadow(0 0 10px rgba(255,255,255,0.5))"
                                                                    ]
                                                                }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                            >
                                                                ${offer.discountPrice}
                                                            </motion.div>
                                                            <div className="text-xs text-white/80 font-arabicUI3">
                                                                بدلاً من ${offer.originalPrice}
                                                            </div>
                                                        </div>

                                                        {/* Corner decorations */}
                                                        <div className="absolute top-3 right-3 w-3 h-3 bg-white/40 rounded-full animate-pulse"></div>
                                                        <div className="absolute bottom-3 left-3 w-2 h-2 bg-white/30 rounded-full animate-pulse delay-500"></div>
                                                    </div>
                                                </motion.div>
                                            </div>

                                            {/* Savings Banner */}
                                            <motion.div
                                                className="relative mb-8"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-red-500/30 
                                                              rounded-2xl blur-lg scale-110"></div>

                                                <motion.div
                                                    className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 
                                                              text-white rounded-2xl p-6 shadow-2xl border border-orange-400/50 overflow-hidden"
                                                    animate={{ scale: [1, 1.02, 1] }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                >
                                                    {/* Animated shine effect */}                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                        animate={{ x: ['-100vw', '100vw'] }}
                                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                                    />

                                                    <div className="relative z-10 text-center">
                                                        <div className="flex items-center justify-center gap-4 mb-2">
                                                            <motion.span
                                                                className="text-3xl"
                                                                animate={{ rotate: [0, 360] }}
                                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                            >
                                                                💎
                                                            </motion.span>
                                                            <div>
                                                                <div className="text-2xl font-black font-arabicUI2">
                                                                    وفر ${offer.originalPrice - offer.discountPrice} اليوم!
                                                                </div>
                                                                <div className="text-lg opacity-90 font-arabicUI3">
                                                                    خصم {offer.discountPercentage}% حصري
                                                                </div>
                                                            </div>
                                                            <motion.span
                                                                className="text-3xl"
                                                                animate={{ scale: [1, 1.3, 1] }}
                                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                            >
                                                                🎯
                                                            </motion.span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </motion.div>

                                          
                                        </div>
                                    </div>
                                </motion.div>{/* Enhanced Limited Spots */}


                            </div>
                        </div>
                    </div>
                </motion.div>        {/* Enhanced Additional Benefits */}

            </motion.div>
        </div>
    );
};

export default Offer;