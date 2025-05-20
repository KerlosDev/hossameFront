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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950">
                <div className="text-slate-800 dark:text-white space-y-4 text-center">
                    <IoMdFlask className="text-6xl animate-bounce mx-auto" />
                    <p className="font-arabicUI2">جاري تحميل العرض...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950">
                <div className="text-red-600 space-y-4 text-center">
                    <p className="font-arabicUI2">{error}</p>
                </div>
            </div>
        );
    }

    // No offer data or stage is not PUBLISHED
    if (!offerData || offerData.stage !== 'PUBLISHED') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950">
                <div className="text-slate-800 dark:text-white space-y-4 text-center">
                    <p className="font-arabicUI2">لا يوجد عروض متاحة حالياً</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative py-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 right-10 w-40 h-40 bg-blue-500/10 backdrop-blur-3xl rounded-full flex items-center justify-center animate-float">
                    <GiMolecule className="text-6xl text-blue-500/50 animate-spin-slow" />
                </div>
                <div className="absolute top-40 left-20 w-48 h-48 bg-red-500/10 backdrop-blur-3xl rounded-full flex items-center justify-center animate-float-delayed">
                    <FaFlask className="text-7xl text-red-500/50 animate-bounce" />
                </div>
                <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-yellow-500/10 backdrop-blur-3xl rounded-full flex items-center justify-center animate-pulse">
                    <FaAtom className="text-5xl text-yellow-500/50 animate-spin" />
                </div>
                <div className="absolute inset-0 opacity-10 bg-[url('/chemistry-pattern.png')] bg-repeat mix-blend-overlay"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4">
                <div dir="rtl" className="grid lg:grid-cols-3 gap-8">
                    {/* Main Offer Card */}
                    <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl border-2 border-blue-500/30 shadow-xl hover:shadow-2xl transition-all duration-500">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-arabicUI2 bg-gradient-to-l from-blue-600 to-blue-400 bg-clip-text text-transparent">
                                        {offerData.name}
                                    </h2>
                                    <p className="text-xl text-slate-600 dark:text-slate-300 font-arabicUI3">
                                        {offerData.docname}
                                    </p>
                                </div>
                                <div className="bg-yellow-500/20 p-3 rounded-2xl">
                                    <FaLightbulb className="text-3xl text-yellow-500" />
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="flex items-center gap-4 bg-blue-500/10 dark:bg-blue-500/20 p-4 rounded-2xl">
                                <div className="space-y-1">
                                    <span className="text-2xl line-through text-slate-500 dark:text-slate-400 font-arabicUI2">{offerData.pricebefore}ج</span>
                                    <span className="block text-4xl text-blue-600 dark:text-blue-400 font-arabicUI2">{offerData.priceafter}ج</span>
                                </div>
                                <div className="bg-yellow-500/20 px-4 py-2 rounded-xl">
                                    <span className="font-arabicUI2 text-yellow-600 dark:text-yellow-400">
                                        خصم {Math.round(((offerData.pricebefore - offerData.priceafter) / offerData.pricebefore) * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: <IoMdFlask />, text: offerData.first },
                                    { icon: <FaMicroscope />, text: offerData.second },
                                    { icon: <FaAtom />, text: offerData.third },
                                    { icon: <GiMolecule />, text: offerData.fourth }
                                ].map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-4 bg-white/40 dark:bg-slate-700/40 rounded-xl hover:scale-105 transition-transform"
                                    >
                                        <div className="text-2xl text-blue-500">{feature.icon}</div>
                                        <span className="font-arabicUI2 text-slate-700 dark:text-slate-200">
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>


                            {/* CTA Button */}
                            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-xl font-arabicUI2 text-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3">
                                <span>احجز مكانك الآن</span>
                                <GiTakeMyMoney className="text-2xl animate-bounce" />
                            </button>
                        </div>
                    </div>

                    {/* Side Card */}
                    <div className="bg-gradient-to-br from-yellow-500/10 to-red-500/10 dark:from-yellow-500/20 dark:to-red-500/20 backdrop-blur-xl p-8 rounded-3xl border-2 border-yellow-500/30 shadow-lg">
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="bg-white/40 dark:bg-slate-800/40 p-4 rounded-full">
                                    <FaLightbulb className="text-4xl text-yellow-500" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-arabicUI2 text-slate-800 dark:text-slate-200">مميزات العرض</h3>
                                <div className="space-y-3">
                                    {offerData.fetures.split('\n').filter(Boolean).map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <GiMolecule className="text-yellow-500" />
                                            <span className="font-arabicUI2">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/40 dark:bg-slate-800/40 p-4 rounded-xl text-center">
                                <p className="font-arabicUI2 text-slate-700 dark:text-slate-300">العرض متاح لفترة محدودة</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Offer;