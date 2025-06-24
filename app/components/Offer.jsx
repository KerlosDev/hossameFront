'use client';

import { useState } from 'react';
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
    // Static countdown values instead of dynamic calculation
    const timeLeft = {
        days: 2,
        hours: 14,
        minutes: 35,
        seconds: 42
    };

    // Use the static offer data
    const offer = offerData;

    return (
        <div dir="rtl" className="min-h-[60vh] font-arabicUI2 py-3 sm:py-6 px-2 sm:px-4 overflow-hidden relative">
            {/* Enhanced Background Elements - Matching Hero.jsx and Courses.jsx */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-20 sm:w-40 h-20 sm:h-40 bg-blue-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center">
                    <FaPrint className="text-3xl sm:text-6xl text-blue-500/50" />
                </div>
                <div className="absolute top-20 sm:top-40 left-10 sm:left-20 w-24 sm:w-48 h-24 sm:h-48 bg-red-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center">
                    <FaSquareRootAlt className="text-4xl sm:text-7xl text-red-500/50" />
                </div>
                <div className="absolute left-5 sm:left-10 bottom-5 sm:bottom-10 w-24 sm:w-48 h-24 sm:h-48 bg-green-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center">
                    <TbMathIntegral className="text-4xl sm:text-7xl text-green-500/50" />
                </div>
                {/* New decorative elements */}
                <div className="absolute bottom-10 sm:bottom-20 right-1/4 w-16 sm:w-32 h-16 sm:h-32 bg-yellow-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center">
                    <FaInfinity className="text-3xl sm:text-5xl text-yellow-500/50" />
                </div>
                <div className="absolute inset-0 opacity-10 bg-repeat mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-4 sm:mb-8 md:mb-16" dir="rtl">
                    <div className="inline-flex items-center gap-2 sm:gap-4 px-3 sm:px-8 py-2 sm:py-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-xl sm:rounded-2xl
                                  border border-blue-500/20 mb-4 sm:mb-6">
                        <h1 className="text-xl sm:text-3xl md:text-5xl font-arabicUI2 text-slate-800 dark:text-white">العروض المميزة</h1>
                        <FiZap className="text-xl sm:text-3xl md:text-4xl text-red-500" />
                    </div>
                    <p className="text-sm sm:text-base md:text-xl text-slate-600 dark:text-slate-300 font-arabicUI3 px-2">
                        احصل على أفضل العروض لتعلم الرياضيات مع حسام ميرا
                    </p>
                </div>

                {/* Main Offer Card */}
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl overflow-hidden 
                              border border-blue-500/20 relative">
                    {/* Subtle Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-lg sm:rounded-xl md:rounded-2xl"></div>
                    <div className="relative">
                        {/* Enhanced Discount Badge */}
                        <div className="absolute top-3 sm:top-6 left-3 sm:left-6 z-10" dir="rtl">
                            <div className="relative">
                                <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white px-2 sm:px-4 py-1 sm:py-2 
                                              rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg shadow-lg border border-red-400/30
                                              flex items-center gap-1 sm:gap-2 font-arabicUI2">
                                    <FiTag className="text-sm sm:text-lg" />
                                    خصم {offer.discountPercentage}%
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-red-400/40 to-transparent 
                                              rounded-lg sm:rounded-xl blur-lg -z-10 scale-110"></div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-3 sm:gap-6 md:gap-8 p-3 sm:p-6 md:p-8">
                            {/* Right Section - Offer Details (Arabic RTL) */}
                            <div className="order-2 lg:order-1" dir="rtl">
                                {/* Countdown Grid-Style Offer Title */}
                                <div className="mb-4 sm:mb-8">
                                    <div className="relative group">
                                        {/* Background glow */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 
                                                      rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-30 scale-110"></div>

                                        {/* Main countdown-style card */}
                                        <div className="relative bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 
                                                      rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-white/20 overflow-hidden">
                                            {/* Glass effect overlay */}
                                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl"></div>

                                            {/* Background particles */}
                                            <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>

                                            <div className="relative z-10 text-center">
                                                {/* Subtitle with timer-style badge */}
                                                <div className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-1 sm:py-2 bg-white/20 backdrop-blur-md 
                                                             rounded-full border border-white/30 mb-2 sm:mb-4">
                                                    <span className="text-lg sm:text-2xl">🔥</span>
                                                    <span className="text-sm sm:text-lg font-bold text-white drop-shadow-lg font-arabicUI3">
                                                        {offer.subtitle}
                                                    </span>
                                                    <span className="text-lg sm:text-xl">⚡</span>
                                                </div>

                                                {/* Grid-style main title */}
                                                <h2 className="text-xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white 
                                                             drop-shadow-2xl font-arabicUI2 mb-2 sm:mb-4 tracking-tight leading-tight">
                                                    {offer.title}
                                                </h2>

                                                {/* Timer-style decorative elements */}
                                                <div className="flex items-center justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
                                                    <div className="w-6 sm:w-12 h-0.5 sm:h-1 bg-white/40 rounded-full"></div>

                                                    <div className="relative w-8 sm:w-12 h-8 sm:h-12 bg-white/20 backdrop-blur-md 
                                                                  rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl 
                                                                  border border-white/30">
                                                        <FiClock className="text-lg sm:text-xl text-white drop-shadow-lg" />
                                                        <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl blur-lg scale-150" />
                                                    </div>

                                                    <div className="w-6 sm:w-12 h-0.5 sm:h-1 bg-white/40 rounded-full"></div>
                                                </div>

                                                {/* Urgency message in countdown style */}
                                                <div className="mt-3 sm:mt-6 px-3 sm:px-6 py-2 sm:py-3 bg-white/15 backdrop-blur-md rounded-xl sm:rounded-2xl 
                                                             border border-white/20 inline-block">
                                                    <span className="text-sm sm:text-lg font-bold text-white drop-shadow-lg font-arabicUI3">
                                                        ⏰ عرض محدود الوقت - احجز الآن!
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Corner accent indicators like countdown grid */}
                                            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-2 sm:w-4 h-2 sm:h-4 bg-white/50 rounded-full" />
                                            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-2 sm:w-4 h-2 sm:h-4 bg-white/50 rounded-full" />

                                            {/* Progress indicator similar to countdown seconds */}
                                            <div className="absolute bottom-1 sm:bottom-3 left-1/2 transform -translate-x-1/2 w-16 sm:w-32 h-0.5 sm:h-1 
                                                          bg-white/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-white/60 rounded-full w-3/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-lg leading-relaxed font-arabicUI3 px-2">
                                    {offer.description}
                                </p>

                                {/* Stats */}
                                <div className="flex flex-wrap gap-3 sm:gap-6 mb-4 sm:mb-8 justify-center">
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                                        <FiBookOpen className="ml-1 sm:ml-2 text-blue-500" />
                                        <span className="font-semibold">{offer.courses}</span> دورة
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                                        <FiUsers className="ml-1 sm:ml-2 text-green-500" />
                                        <span className="font-semibold">{offer.students.toLocaleString()}</span> طالب
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                                        <FiStar className="ml-1 sm:ml-2 text-yellow-500" />
                                        <span className="font-semibold">{offer.rating}</span> تقييم
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="mb-6">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 font-arabicUI2 text-center">ما يشمله العرض:</h3>
                                    <div className="grid gap-2 sm:gap-3">
                                        {offer.features.map((feature, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center text-gray-700 dark:text-gray-300 text-sm sm:text-base"
                                            >
                                                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full ml-2 sm:ml-3 flex-shrink-0"></div>
                                                <span className="font-arabicUI3">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Class Level Selection */}
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 font-arabicUI2 text-center">
                                        اختر صفك الدراسي:
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                        <button className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 
                                                      hover:border-blue-500 hover:from-blue-500/20 hover:to-blue-600/20
                                                      text-blue-700 dark:text-blue-300 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold
                                                      transition-all duration-300 backdrop-blur-sm relative overflow-hidden group
                                                      font-arabicUI3 text-sm sm:text-base">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 
                                                          to-blue-400/0 translate-y-[100%] group-hover:translate-y-0 
                                                          transition-transform duration-300"></div>
                                            <span className="relative z-10">أولى ثانوي</span>
                                        </button>

                                        <button className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/30 
                                                      hover:border-green-500 hover:from-green-500/20 hover:to-green-600/20
                                                      text-green-700 dark:text-green-300 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold
                                                      transition-all duration-300 backdrop-blur-sm relative overflow-hidden group
                                                      font-arabicUI3 text-sm sm:text-base">
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/20 
                                                          to-green-400/0 translate-y-[100%] group-hover:translate-y-0 
                                                          transition-transform duration-300"></div>
                                            <span className="relative z-10">تانية ثانوي</span>
                                        </button>

                                        <button className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-2 border-purple-500/30 
                                                      hover:border-purple-500 hover:from-purple-500/20 hover:to-purple-600/20
                                                      text-purple-700 dark:text-purple-300 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold
                                                      transition-all duration-300 backdrop-blur-sm relative overflow-hidden group
                                                      font-arabicUI3 text-sm sm:text-base">
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 
                                                          to-purple-400/0 translate-y-[100%] group-hover:translate-y-0 
                                                          transition-transform duration-300"></div>
                                            <span className="relative z-10">تالتة ثانوي</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Left Section - Pricing & CTA (Arabic RTL) */}
                            <div className="flex flex-col justify-center order-1 lg:order-2" dir="rtl">
                                {/* Static Countdown Timer */}
                                <div className="mb-4 sm:mb-8">
                                    <div className="text-center mb-4 sm:mb-6">
                                        {/* Modern Header */}
                                        <div className="relative inline-block mb-4 sm:mb-8">
                                            {/* Background blur effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 
                                                          rounded-xl sm:rounded-2xl blur-xl scale-110"></div>

                                            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl 
                                                          border border-white/40 dark:border-slate-700/40 rounded-xl sm:rounded-2xl 
                                                          px-4 sm:px-8 py-2 sm:py-4 shadow-2xl">
                                                <div className="flex items-center gap-2 sm:gap-4">
                                                    <div className="relative">
                                                        <div className="w-8 sm:w-12 h-8 sm:h-12 bg-gradient-to-br from-red-500 to-orange-500 
                                                                      rounded-full flex items-center justify-center shadow-lg">
                                                            <FiClock className="text-lg sm:text-2xl text-white" />
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-red-400/40 to-orange-400/40 
                                                                      rounded-full blur-lg scale-150"></div>
                                                    </div>

                                                    <div className="text-right">
                                                        <h3 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 
                                                                     bg-clip-text text-transparent font-arabicUI2">
                                                            انتهاء العرض خلال
                                                        </h3>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 font-arabicUI3">
                                                            لا تفوت الفرصة الذهبية
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Static Countdown Display */}
                                        <div className="relative max-w-3xl mx-auto">
                                            {/* Background glow */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 
                                                          rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl scale-110"></div>

                                            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl 
                                                          rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/30 dark:border-slate-700/30 shadow-2xl">

                                                {/* Countdown Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
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
                                                            <div key={unit} className="relative group">
                                                                {/* Card container */}
                                                                <div className="relative perspective-1000">
                                                                    {/* Outer glow ring */}
                                                                    <div className="absolute -inset-1 sm:-inset-2 rounded-xl sm:rounded-2xl opacity-75"
                                                                        style={{
                                                                            background: `linear-gradient(${index * 90}deg, transparent, ${gradients[unit].split(' to ')[1]}, transparent)`
                                                                        }}
                                                                    />

                                                                    {/* Main card */}
                                                                    <div className={`relative bg-gradient-to-br ${gradients[unit]} 
                                                                                  rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-2xl ${shadowColors[unit]} 
                                                                                  border border-white/20 overflow-hidden 
                                                                                  transition-all duration-300 transform-gpu`}>

                                                                        {/* Glass effect overlay */}
                                                                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl"></div>

                                                                        {/* Background particles */}
                                                                        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/20 via-transparent to-white/10" />

                                                                        {/* Time value */}
                                                                        <div className="relative z-10 text-center">
                                                                            <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white 
                                                                                          drop-shadow-lg mb-1 sm:mb-2 tracking-tight">
                                                                                {String(value).padStart(2, '0')}
                                                                            </div>

                                                                            <div className="text-white/90 text-xs sm:text-sm font-bold font-arabicUI3 
                                                                                          uppercase tracking-wider">
                                                                                {arabicUnits[unit]}
                                                                            </div>
                                                                        </div>

                                                                        {/* Progress indicator for seconds */}
                                                                        {unit === 'seconds' && (
                                                                            <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 h-0.5 sm:h-1 bg-white/20 rounded-full 
                                                                                          overflow-hidden">
                                                                                <div className="h-full bg-white/60 rounded-full"
                                                                                    style={{ width: `${((60 - value) / 60) * 100}%` }}
                                                                                />
                                                                            </div>
                                                                        )}

                                                                        {/* Corner accent */}
                                                                        <div className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 w-1.5 sm:w-3 h-1.5 sm:h-3 bg-white/40 rounded-full"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Progress bar */}
                                                <div className="mt-4 sm:mt-8 relative h-1 sm:h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 
                                                                  rounded-full shadow-lg"
                                                        style={{
                                                            width: `${Math.max(10, ((timeLeft.days * 24 * 60 * 60 + timeLeft.hours * 60 * 60 + timeLeft.minutes * 60 + timeLeft.seconds) / (10 * 60)) * 100)}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Static Urgency Message */}
                                        <div className="mt-4 sm:mt-8 relative inline-block">
                                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 
                                                          rounded-xl sm:rounded-2xl blur-lg scale-110"></div>
                                            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl 
                                                          border-2 border-red-200 dark:border-red-800 rounded-xl sm:rounded-2xl 
                                                          px-3 sm:px-6 py-2 sm:py-4 shadow-xl">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <span className="text-lg sm:text-2xl">🔥</span>

                                                    <div className="text-center">
                                                        <div className="text-sm sm:text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 
                                                                      bg-clip-text text-transparent font-arabicUI2">
                                                            عرض محدود الوقت
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-arabicUI3">
                                                            احجز مكانك الآن
                                                        </div>
                                                    </div>

                                                    <span className="text-lg sm:text-2xl">⚡</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Static Pricing Section */}
                                <div className="text-center mb-4 sm:mb-8">
                                    <div className="relative max-w-2xl mx-auto">
                                        {/* Background glow */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 
                                                      rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl scale-110"></div>

                                        <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl 
                                                      rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/30 dark:border-slate-700/30 shadow-2xl">

                                            {/* Price Cards Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
                                                {/* Original Price Card */}
                                                <div className="relative group">
                                                    <div className="relative bg-gradient-to-br from-gray-500/20 to-gray-600/20 
                                                                  rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gray-400/30 overflow-hidden">

                                                        {/* Strike-through effect */}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-full h-0.5 sm:h-1 bg-red-500 rounded-full" />
                                                        </div>

                                                        <div className="text-center relative z-10">
                                                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2 font-arabicUI3">
                                                                السعر العادي
                                                            </div>
                                                            <div className="text-xl sm:text-3xl font-black text-gray-500 dark:text-gray-400 line-through">
                                                                ${offer.originalPrice}
                                                            </div>
                                                            <div className="text-xs text-red-500 mt-1 font-arabicUI3">
                                                                منتهي الصلاحية
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Special Price Card */}
                                                <div className="relative group">
                                                    <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 
                                                                  rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 overflow-hidden shadow-2xl">

                                                        {/* Glass effect overlay */}
                                                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl"></div>

                                                        {/* Background particles */}
                                                        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/20 via-transparent to-white/10" />

                                                        <div className="text-center relative z-10">
                                                            <div className="text-xs sm:text-sm text-white/90 mb-1 sm:mb-2 font-arabicUI3 flex items-center justify-center gap-1">
                                                                <span>⭐</span>
                                                                السعر الخاص
                                                                <span>⭐</span>
                                                            </div>
                                                            <div className="text-3xl sm:text-5xl font-black text-white drop-shadow-lg mb-1">
                                                                ${offer.discountPrice}
                                                            </div>
                                                            <div className="text-xs text-white/80 font-arabicUI3">
                                                                بدلاً من ${offer.originalPrice}
                                                            </div>
                                                        </div>

                                                        {/* Corner decorations */}
                                                        <div className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 w-1.5 sm:w-3 h-1.5 sm:h-3 bg-white/40 rounded-full"></div>
                                                        <div className="absolute bottom-1.5 sm:bottom-3 left-1.5 sm:left-3 w-1 sm:w-2 h-1 sm:h-2 bg-white/30 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Savings Banner */}
                                            <div className="relative mb-4 sm:mb-8">
                                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-red-500/30 
                                                              rounded-xl sm:rounded-2xl blur-lg scale-110"></div>

                                                <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 
                                                              text-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-2xl border border-orange-400/50 overflow-hidden">
                                                    <div className="relative z-10 text-center">
                                                        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-1 sm:mb-2">
                                                            <span className="text-xl sm:text-3xl">💎</span>
                                                            <div>
                                                                <div className="text-lg sm:text-2xl font-black font-arabicUI2">
                                                                    وفر ${offer.originalPrice - offer.discountPrice} اليوم!
                                                                </div>
                                                                <div className="text-sm sm:text-lg opacity-90 font-arabicUI3">
                                                                    خصم {offer.discountPercentage}% حصري
                                                                </div>
                                                            </div>
                                                            <span className="text-xl sm:text-3xl">🎯</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Offer;