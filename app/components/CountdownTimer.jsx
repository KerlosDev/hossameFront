'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';

const CountdownTimer = ({ endDate, className = "" }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Countdown timer logic
    useEffect(() => {
        const endTime = endDate.getTime();

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
    }, [endDate]);

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={itemVariants} className={`mb-8 ${className}`}>
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
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            rotateY: 5
                                        }}
                                    >
                                        {/* Card container */}
                                        <div className="relative perspective-1000">
                                            {/* Outer glow ring */}
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
                                                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl"></div>

                                                {/* Animated background particles */}
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
                                                >
                                                    <motion.div
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
                        >
                            <motion.div
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
    );
};

 