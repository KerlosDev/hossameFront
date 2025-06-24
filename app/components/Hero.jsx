'use client';
import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaStar, FaGraduationCap, FaUsers, FaTrophy, FaPlay } from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";
import { FaCalculator, FaSquareRootAlt, FaInfinity, FaChartLine, FaPrint, FaQuoteLeft, FaAward } from "react-icons/fa";
import { MdFunctions, MdVideoLibrary, MdSchool } from "react-icons/md";
import { TbMathSymbols, TbMathIntegral, TbCertificate } from "react-icons/tb";
import { BsCheckCircleFill } from "react-icons/bs";
import Link from 'next/link';

const Hero = () => {
    return (
        <div className="relative min-h-screen py-8 sm:py-12 px-2 sm:px-4 overflow-hidden">            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 right-10 w-40 h-40 bg-blue-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center animate-float">
                    <FaPrint className="text-6xl text-blue-500/50 animate-spin-slow" />
                </div>
                <div className="absolute top-40 left-20 w-48 h-48 bg-red-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center animate-float-delayed">
                    <FaSquareRootAlt className="text-7xl text-red-500/50 animate-bounce" />
                </div>
                {/* New decorative elements */}
                <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-yellow-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center animate-pulse">
                    <FaInfinity className="text-5xl text-yellow-500/50 animate-spin" />
                </div>
                <div className="absolute inset-0 opacity-10   bg-repeat mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-16 items-center">
                    {/* Image Section - Moved to top for mobile */}
                    <div className="relative order-1 lg:order-1 -mt-4 sm:mt-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-red-500/30 
                                      rounded-full blur-3xl transform -rotate-6 animate-pulse"></div>
                        <div className="relative">
                            <img
                                src="/sha.png"
                                className="relative z-10 w-full h-[300px] sm:h-auto max-w-lg mx-auto 
                                         object-contain sm:object-cover drop-shadow-2xl 
                                         hover:scale-102 transition-transform duration-300"
                                alt="Shahad Image"
                            />
                        </div>
                    </div>

                    {/* Content Section - Adjusted for mobile */}
                    <div className="relative z-10 order-2 lg:order-2 space-y-3 sm:space-y-4 lg:space-y-8 px-2 sm:px-0">
                        {/* Title Section */}
                        <div dir='rtl' className="relative">
                            <div className="bg-white/40  dark:bg-slate-800/40 backdrop-blur-xl 
                                          p-3 sm:p-4 lg:p-8 rounded-2xl border border-blue-500/20 
                                          shadow-lg hover:shadow-xl transition-all duration-300">                                <div className="flex flex-col items-center sm:flex-row sm:items-center 
                                              gap-2 sm:gap-3 mb-2 sm:mb-4 lg:mb-6">
                                    <h2 className="text-2xl sm:text-4xl lg:text-7xl font-arabicUI2 
                                                 bg-clip-text text-transparent bg-gradient-to-l 
                                                 from-blue-600 to-blue-400 text-center sm:text-right">
                                        حسام ميرا
                                    </h2>
                                    <div className="relative hidden sm:block">
                                        <FaCalculator className="text-4xl text-blue-500 animate-spin-slow" />
                                    </div>
                                </div>
                                <div className="flex justify-center sm:justify-start items-baseline gap-2 
                                              text-xl sm:text-3xl lg:text-5xl font-arabicUI3 
                                              text-slate-700 dark:text-slate-300">
                                    <h3>أستاذ الرياضيات المتميز</h3>
                                </div>
                            </div>
                        </div>

                        {/* Rest of the content sections with mobile optimizations */}
                        <div dir='rtl' className="bg-gradient-to-br from-blue-500/5 to-transparent 
                                                 p-3 sm:p-4 lg:p-8 rounded-2xl border border-blue-500/20 
                                                 backdrop-blur-sm">
                            <div className="absolute -right-10 top-0 w-1 h-full bg-gradient-to-b from-red-500 to-transparent" />
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-arabicUI3 text-slate-800 dark:text-slate-200">
                                يرحب بدفعة{' '}
                                <span className="text-4xl sm:text-5xl lg:text-6xl text-red-500 font-bold">2026</span>                            </h1>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <h3 className="text-xl sm:text-2xl lg:text-3xl font-arabicUI3 text-slate-600 dark:text-slate-300">
                                    منهج الرياضيات المتطور
                                </h3>
                                <FaChartLine className="text-3xl text-blue-500" />
                            </div>
                            <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                                <div className="flex flex-col items-center p-3 bg-blue-500/30 dark:bg-blue-800/30 dark:text-blue-500 rounded-xl">
                                    <TbMathIntegral className="text-2xl text-blue-500 mb-2" />
                                    <span className="text-sm font-arabicUI3">حلول تفاعلية</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-white/30 dark:bg-red-800/30 dark:text-red-500 rounded-xl">
                                    <MdFunctions className="text-2xl text-red-500 mb-2" />
                                    <span className="text-sm font-arabicUI3">شرح مبسط</span>
                                </div>
                                <div className="flex flex-col items-center p-3 bg-white/30 dark:bg-green-800/30 dark:text-green-500 rounded-xl">
                                    <TbMathSymbols className="text-2xl text-green-500 mb-2" />
                                    <span className="text-sm font-arabicUI3">أمثلة متنوعة</span>
                                </div>
                            </div>
                        </div>

                        {/* Quote and Promotional sections - Hide some decorative elements on mobile */}
                        <div className="hidden sm:block">
                            <div dir='rtl' className="relative group px-2 sm:px-4">
                                {/* Animated background with molecule pattern */}
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-red-500/20 to-orange-500/20 
                                          blur-2xl transform group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute inset-0   bg-repeat opacity-5 mix-blend-overlay"></div>
                                </div>


                            </div>
                        </div>


                        {/* Promotional Banner - Enhanced for all screens */}
                        <div dir='rtl' className="relative group">
                            <div className="bg-gradient-to-br from-yellow-500/20 to-red-500/20 p-4 sm:p-6 rounded-2xl 
                                          border border-yellow-500/30 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                                <div className="flex flex-col sm:flex-row items-center gap-4">                                    <div className="flex-1 space-y-2">
                                    <h3 className="text-xl sm:text-2xl font-arabicUI2 text-yellow-600 dark:text-yellow-400">
                                        احصل على كتاب الرياضيات الآن!
                                    </h3>
                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                                        كتاب شامل يغطي جميع المواضيع بأسلوب سهل وممتع
                                    </p>
                                </div>
                                    <Link
                                        href="/book-order"
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full 
                                                 font-arabicUI3 text-lg transition-colors duration-300 
                                                 flex items-center gap-2"
                                    >
                                        <span>اطلب الآن</span>
                                        <GiTakeMyMoney className="text-xl" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
