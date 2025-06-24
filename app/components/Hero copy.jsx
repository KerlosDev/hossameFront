'use client'
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaFlask, FaAtom, FaMicroscope, FaChalkboardTeacher, FaPlay, FaStar } from 'react-icons/fa';
import { BiTestTube, BiAtom, BiBookOpen } from 'react-icons/bi';
import { GiMolecule, GiChemicalDrop } from 'react-icons/gi';

// Custom particle component that doesn't rely on external libraries
const ParticleBackground = () => {
    // Create an array of particles with random properties
    const particles = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.2 + 0.05,
        duration: Math.random() * 15 + 20,
        delay: Math.random() * 5
    }));

    return (
        <div className="absolute inset-0 overflow-hidden">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute rounded-full bg-blue-500/20"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}rem`,
                        height: `${particle.size}rem`,
                        opacity: particle.opacity,
                        animation: `float ${particle.duration}s linear infinite`,
                        animationDelay: `${particle.delay}s`
                    }}
                />
            ))}
        </div>
    );
};

const Hero = () => {
    return (
        <section className="relative font-arabicUI3 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 overflow-hidden">
            {/* Custom particles background */}
            <ParticleBackground />

            {/* Molecular structures overlay */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute top-1/4 left-1/5 w-64 h-64 border-2 border-blue-500/20 rounded-full"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 border-2 border-indigo-500/20 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/3 w-80 h-80 border-2 border-cyan-500/20 rounded-full"></div>

                <div className="absolute top-1/4 left-1/4 text-blue-500/20 text-6xl">
                    <FaAtom className="animate-spin-slow" />
                </div>
                <div className="absolute bottom-1/3 right-1/4 text-indigo-500/20 text-8xl">
                    <GiMolecule />
                </div>
            </div>

            {/* Main content */}
            <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    {/* Text content - 7 columns */}
                    <motion.div
                        className="lg:col-span-7 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/40 text-blue-300 text-sm font-medium mb-6 shadow-lg">
                            <BiAtom className="mr-2 text-lg" />
                            World-Class Chemistry Education
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                            Unlock the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">Molecular World</span> of Chemistry
                        </h1>

                        <p className="text-xl text-gray-300 max-w-3xl leading-relaxed mb-8">
                            Master complex chemical concepts through our innovative learning platform designed by industry-leading experts with cutting-edge visualization tools.
                        </p>

                        <div className="flex flex-wrap gap-x-6 gap-y-4 mb-12">
                            <Link href="/courses" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition duration-300 flex items-center gap-2 shadow-lg transform hover:-translate-y-1">
                                <BiBookOpen className="text-xl" /> Browse Curriculum
                            </Link>
                            <Link href="/demo" className="group px-8 py-4 bg-white/5 hover:bg-white/10 border border-blue-400/30 text-blue-300 hover:text-white font-medium rounded-lg transition duration-300 flex items-center gap-2 backdrop-blur-sm transform hover:-translate-y-1">
                                <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 group-hover:bg-blue-400 transition-colors">
                                    <FaPlay className="text-xs ml-0.5" />
                                </div>
                                Watch Demo
                            </Link>
                        </div>

                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-6 max-w-2xl">
                            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
                                <span className="block text-3xl font-bold text-blue-300 mb-1">98%</span>
                                <span className="text-sm text-gray-400">Success Rate</span>
                            </div>
                            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
                                <span className="block text-3xl font-bold text-blue-300 mb-1">12K+</span>
                                <span className="text-sm text-gray-400">Students</span>
                            </div>
                            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
                                <span className="block text-3xl font-bold text-blue-300 mb-1">140+</span>
                                <span className="text-sm text-gray-400">Universities</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Instructor showcase - 5 columns */}
                    <motion.div
                        className="lg:col-span-5"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="relative">
                            {/* Glass card effect */}
                            <div className="relative bg-gradient-to-b from-blue-900/30 to-indigo-900/30 backdrop-blur-md p-8 rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="bg-gradient-to-r from-blue-600/40 to-indigo-600/40 px-4 py-2 rounded-lg text-white text-sm font-medium">
                                        Lead Instructor
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className="text-yellow-400" />
                                        ))}
                                    </div>
                                </div>

                                {/* Profile section */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                                    <div className="relative">
                                        {/* Animated ring */}
                                        <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping-slow opacity-70"></div>

                                        {/* Profile image */}
                                        <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-blue-400/30 shadow-inner shadow-blue-900/50">
                                            <Image
                                                src="/prof.jpg"
                                                alt="Dr. Walter White"
                                                width={128}
                                                height={128}
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Badge */}
                                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-full border-2 border-white/10 shadow-lg">
                                            <FaAtom className="text-white text-sm" />
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">Dr. Walter White</h2>
                                        <p className="text-blue-200 mb-3">Ph.D. in Chemistry, Former Research Scientist</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-blue-900/40 px-3 py-1 rounded-full text-blue-300 text-xs">
                                                Organic Chemistry
                                            </span>
                                            <span className="bg-blue-900/40 px-3 py-1 rounded-full text-blue-300 text-xs">
                                                15+ Years Experience
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Course preview */}
                                <div className="bg-gradient-to-r from-slate-900/60 to-blue-900/60 rounded-xl p-5 border border-blue-500/20 mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                                        <FaFlask className="mr-2 text-blue-400" /> Featured Course
                                    </h3>
                                    <p className="text-gray-300 mb-3">Advanced Organic Chemistry: Molecular Structures and Reactions</p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="h-2 w-full bg-blue-900/50 rounded-full overflow-hidden">
                                                <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                                            </div>
                                            <span className="ml-2 text-blue-300 text-sm">75%</span>
                                        </div>
                                        <button className="bg-blue-600/80 hover:bg-blue-600 text-white p-2 rounded-lg">
                                            <FaPlay className="text-xs" />
                                        </button>
                                    </div>
                                </div>

                                {/* Testimonial */}
                                <div className="bg-blue-950/50 rounded-lg p-4 border border-blue-800/30">
                                    <p className="text-gray-300 italic text-sm">
                                        "Dr. White's teaching methods transformed my understanding of complex chemical concepts. His clear explanations and practical examples are unmatched."
                                    </p>
                                    <div className="flex items-center mt-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold mr-2">JS</div>
                                        <div>
                                            <p className="text-white text-sm">Jesse Pinkman</p>
                                            <p className="text-blue-300 text-xs">Chemistry Major, UNM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0 z-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
                    <path fill="rgba(59, 130, 246, 0.1)" fillOpacity="1" d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,128C672,128,768,160,864,170.7C960,181,1056,171,1152,144C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* Add keyframes for floating animation to global styles */}
            <style jsx global>{`
                @keyframes float {
                    0% {
                        transform: translate(0, 0);
                    }
                    25% {
                        transform: translate(10px, 10px);
                    }
                    50% {
                        transform: translate(5px, 15px);
                    }
                    75% {
                        transform: translate(-5px, 10px);
                    }
                    100% {
                        transform: translate(0, 0);
                    }
                }
                
                @keyframes ping-slow {
                    0% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.4;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0.8;
                    }
                }
                
                .animate-ping-slow {
                    animation: ping-slow 3s ease-in-out infinite;
                }
                
                .animate-spin-slow {
                    animation: spin 15s linear infinite;
                }
            `}</style>
        </section>
    );
};

export default Hero;
