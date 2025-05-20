'use client';
import React, { useState, useEffect } from 'react';
import { FaLightbulb } from "react-icons/fa";
import { GiTakeMyMoney, GiMolecule, GiChemicalDrop } from "react-icons/gi";
import { IoMdFlask } from "react-icons/io";
import { FaAtom, FaFlask, FaMicroscope } from "react-icons/fa";

const Offer = () => {
    const [offerData, setOfferData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const response = await fetch(`http://localhost:9000/offers/published`);
                if (!response.ok) {
                    throw new Error('Failed to fetch offer');
                }
                const data = await response.json();
                setOfferData(data.offer);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchOffer();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950">
                <div className="text-white space-y-4 text-center">
                    <IoMdFlask className="text-6xl animate-bounce mx-auto" />
                    <p className="font-arabicUI2">جاري تحميل العرض...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950">
                <div className="text-white space-y-4 text-center">
                    <p className="font-arabicUI2 text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    // No offer data or stage is not PUBLISHED
    if (!offerData || offerData.stage !== 'PUBLISHED') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950">
                <div className="text-white space-y-4 text-center">
                    <p className="font-arabicUI2">لا يوجد عروض متاحة حالياً</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative  py-8 sm:py-12 px-2 sm:px-4 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Chemistry pattern overlay */}
                <div className="absolute inset-0 opacity-5 bg-[url('/chemistry-pattern.png')] bg-repeat mix-blend-overlay"></div>

                {/* Floating molecules */}
                <div className="absolute top-20 right-10 w-40 h-40 bg-blue-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center animate-float">
                    <GiMolecule className="text-6xl text-blue-400/50 animate-spin-slow" />
                </div>
                <div className="absolute top-40 left-20 w-48 h-48 bg-purple-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center animate-float-delayed">
                    <FaFlask className="text-7xl text-purple-400/50 animate-bounce" />
                </div>
                <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-yellow-500/10 backdrop-blur-3xl rounded-full 
                              flex items-center justify-center animate-pulse">
                    <FaAtom className="text-5xl text-yellow-400/50 animate-spin" />
                </div>

                {/* Gradient orbs */}
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse-delayed"></div>
            </div>

            {/* Main content container */}
            <div className="relative w-full max-w-5xl mx-auto">
                <div className="relative overflow-hidden rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                             transform hover:scale-[1.01] transition-all duration-700">
                    <div className="relative overflow-hidden w-full max-w-5xl rounded-[2rem] min-h-[600px] lg:min-h-[400px] 
                          flex flex-col lg:flex-row shadow-2xl transform hover:scale-[1.02] transition-all duration-700">
                        {/* Left Side - Main Offer */}
                        <div className="flex-1 group relative overflow-hidden backdrop-blur-xl border-t border-l border-white/10">
                            {/* Enhanced gradient background with new effects */}
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/95 via-blue-700/95 to-indigo-800/95"></div>
                                <div className="absolute inset-0 bg-[url('/chemistry-pattern.png')] animate-slide-slow bg-repeat opacity-10 mix-blend-overlay"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                                {/* Enhanced molecular animations with new positions */}
                                <div className="hidden lg:block absolute inset-0">
                                    <div className="absolute top-8 right-8 transform-gpu hover:scale-110 transition-transform duration-500">
                                        <GiMolecule className="text-6xl text-white/20 animate-spin-slow" />
                                        <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full"></div>
                                    </div>
                                    <FaAtom className="absolute bottom-8 left-8 text-5xl text-white/20 animate-float" />
                                    <IoMdFlask className="absolute top-1/2 right-1/4 text-4xl text-white/20 animate-bounce-slow" />
                                    <div className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full bg-blue-400/10 blur-2xl animate-pulse"></div>
                                    <div className="absolute bottom-1/3 right-1/4 w-32 h-32 rounded-full bg-yellow-300/10 blur-2xl animate-pulse-delayed"></div>
                                </div>
                            </div>

                            {/* Content wrapper with reduced spacing for desktop */}
                            <div dir='rtl' className="relative p-8 sm:p-6 lg:p-8 h-full backdrop-blur-sm">
                                <div className="max-w-6xl mx-auto space-y-6 lg:space-y-4">
                                    {/* Header section with compact styling */}
                                    <div className="flex flex-col gap-4">
                                        <div className="inline-flex w-fit justify-center mx-auto items-center gap-3 px-6 py-3 rounded-2xl
                                              bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl
                                              border border-white/20 hover:border-white/40 
                                              transform hover:scale-105 transition-all duration-500
                                              shadow-lg hover:shadow-xl">
                                            <div className="relative group/beaker">
                                                <IoMdFlask className="text-3xl text-yellow-300 animate-bounce-slow" />
                                                <div className="absolute -inset-2 bg-yellow-300/20 rounded-full blur-xl 
                                                  opacity-0 group-hover/beaker:opacity-100 transition-opacity"></div>
                                            </div>
                                            <span className="text-xl  font-arabicUI2 bg-gradient-to-r from-yellow-300 to-yellow-200 
                                               bg-clip-text text-transparent">
                                                عرض حصري
                                            </span>
                                        </div>

                                        {/* Enhanced title section */}
                                        <div className="space-y-4">
                                            <h2 className="text-2xl lg:text-4xl font-arabicUI2 text-white leading-tight">
                                                {offerData.name}
                                                <span className="block text-sm lg:text-base text-yellow-300/90 mt-1">
                                                    {offerData.docname}
                                                </span>
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Compact pricing section */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-baseline gap-3 bg-blue-900/30 px-6 py-3 rounded-xl backdrop-blur-sm">
                                            <span className="text-2xl lg:text-3xl font-arabicUI2 text-yellow-300/75 line-through">{offerData.pricebefore}ج</span>
                                            <span className="text-3xl lg:text-5xl font-arabicUI2 text-white drop-shadow-glow">{offerData.priceafter}ج</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-300/20 rounded-xl border border-yellow-300/30">
                                            <GiTakeMyMoney className="text-xl text-yellow-300" />
                                            <span className="font-arabicUI2 text-yellow-300">
                                                خصم {Math.round(((offerData.pricebefore - offerData.priceafter) / offerData.pricebefore) * 100)}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Compact features grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { icon: <IoMdFlask />, text: offerData.first },
                                            { icon: <FaMicroscope />, text: offerData.second },
                                            { icon: <FaAtom />, text: offerData.third },
                                            { icon: <GiMolecule />, text: offerData.fourth }
                                        ].map((feature, index) => (
                                            <div key={index}
                                                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 
                                                    border border-white/10 hover:bg-white/10 transition-all 
                                                    group/feature cursor-pointer">
                                                <div className="relative">
                                                    <div className="text-2xl text-yellow-300 group-hover/feature:scale-110 
                                                          transition-transform">
                                                        {feature.icon}
                                                    </div>
                                                    <div className="absolute inset-0 blur-xl bg-yellow-300/20 
                                                          opacity-0 group-hover/feature:opacity-100 scale-150 
                                                          transition-opacity"></div>
                                                </div>
                                                <span className="font-arabicUI2 text-white/90">{feature.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Compact CTA section */}
                                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">                                        <a
                                        href={offerData.courseLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/btn relative w-full overflow-hidden px-8 py-4 
                                              bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300
                                              rounded-xl font-arabicUI2 text-blue-900 text-xl
                                              hover:shadow-[0_0_20px_rgba(253,224,71,0.4)]
                                              active:scale-95 transition-all duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                                              via-white/30 to-transparent -translate-x-full 
                                              group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                        <div className="relative flex items-center justify-center gap-3">
                                            <span> اشترك فالكورس الان</span>
                                            <GiTakeMyMoney className="text-2xl animate-bounce" />
                                        </div>
                                    </a>

                                        {/* Enhanced info badge */}
                                        <div className="hidden lg:flex items-center justify-center gap-3 
                                              text-white/70 text-sm font-arabicUI2 bg-white/5 
                                              rounded-xl px-6 py-3 border border-white/10
                                              transform hover:scale-105 transition-all duration-300">
                                            <IoMdFlask className="text-yellow-300 animate-bounce-slow" />
                                            <span>مقاعد محدودة</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side with reduced width */}
                        <div className="lg:w-[320px] relative overflow-hidden 
                              bg-gradient-to-br from-yellow-500/90 via-amber-600/90 to-orange-700/90
                              border-t border-r border-white/10">
                            {/* Chemistry-themed background */}
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-[url('/chemistry-pattern.png')] opacity-5 mix-blend-overlay"></div>
                                {/* Decorative elements */}
                                <FaAtom className="absolute top-8 right-8 text-4xl text-white/10 animate-spin-slow" />
                                <FaFlask className="absolute bottom-8 left-8 text-4xl text-white/10 animate-float" />
                                <div className="absolute inset-0 backdrop-blur-[1px]"></div>
                            </div>

                            {/* Compact content layout */}
                            <div dir='rtl' className="relative h-full p-6 flex flex-col justify-center items-center text-center">
                                <div className="space-y-4">
                                    {/* Icon */}
                                    <div className="relative mx-auto w-16 h-16">
                                        <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                                        <div className="relative bg-white/10 rounded-full p-4 backdrop-blur-sm border border-white/30">
                                            <FaLightbulb className="text-3xl text-yellow-300" />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-arabicUI2 text-white">
                                            نقترح عليك هذا العرض
                                        </h3>
                                        <p className="text-lg font-arabicUI2 text-white/80">
                                            فرصة ذهبية للتعلم مع أفضل مدرس كيمياء
                                        </p>
                                    </div>

                                    {/* Benefits list */}
                                    <div className="space-y-3 text-right">
                                        {offerData.fetures.split('\n').filter(Boolean).map((benefit, index) => (
                                            <div key={index} className="flex items-center gap-2 text-white/90">
                                                <GiMolecule className="text-yellow-300" />
                                                <span className="font-arabicUI2">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Time-limited badge */}
                                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full 
                                          backdrop-blur-sm border border-white/20">
                                        <IoMdFlask className="text-yellow-300 animate-bounce" />
                                        <span className="font-arabicUI2 text-white text-sm">
                                            العرض متاح لفترة محدودة
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Offer;