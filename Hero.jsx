'use client'
import Image from 'next/image'
import React from 'react'
import { BsFillPatchCheckFill } from "react-icons/bs";
import { FaCode, FaServer, FaDatabase } from "react-icons/fa";
import { IoRocketSharp } from "react-icons/io5";
import { SiNextdotjs } from "react-icons/si";
import Soical from './Soical';

const Hero = () => {
    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 pt-24 sm:pt-28">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute w-[800px] h-[800px] bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl -top-1/4 -left-1/4 animate-pulse"></div>
                <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-full blur-3xl -bottom-1/4 -right-1/4 animate-pulse delay-1000"></div>
                <div className="absolute inset-0 bg-black/5 backdrop-blur-3xl"></div>
            </div>

            {/* Main Content Container */}
            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Text Content */}
                    <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
                        {/* Main Heading */}
                        <div className="relative inline-block">
                            <div className="relative backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-8 rounded-2xl border border-green-500/20">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                                    <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                                        Full Stack Developer
                                    </span>
                                </h1>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-300 flex items-center justify-center lg:justify-start gap-4 mb-6">
                                    Hi, I'm Kerlos Hany <BsFillPatchCheckFill className="text-green-400 animate-pulse" />
                                </h2>
                                <p className="text-lg sm:text-xl text-gray-400   font-bold leading-relaxed mb-6">
                                    Computer Science Student & Full Stack Developer specializing in modern web applications. Building scalable solutions from frontend to backend.
                                </p>

                                {/* Tech Stack Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                    <div className="group p-4 rounded-xl bg-white/5 backdrop-blur-md border border-green-500/20 transition-all duration-300 hover:bg-white/10 hover:scale-105">
                                        <FaCode className="text-2xl text-green-400 mb-2 mx-auto lg:mx-0 transition-transform group-hover:scale-110" />
                                        <p className="text-gray-300">Frontend Development</p>
                                    </div>
                                    <div className="group p-4 rounded-xl bg-white/5 backdrop-blur-md border border-green-500/20 transition-all duration-300 hover:bg-white/10 hover:scale-105">
                                        <FaServer className="text-2xl text-green-400 mb-2 mx-auto lg:mx-0 transition-transform group-hover:scale-110" />
                                        <p className="text-gray-300">Backend APIs</p>
                                    </div>
                                    <div className="group p-4 rounded-xl bg-white/5 backdrop-blur-md border border-green-500/20 transition-all duration-300 hover:bg-white/10 hover:scale-105">
                                        <FaDatabase className="text-2xl text-green-400 mb-2 mx-auto lg:mx-0 transition-transform group-hover:scale-110" />
                                        <p className="text-gray-300">Database Design</p>
                                    </div>
                                    <div className="group p-4 rounded-xl bg-white/5 backdrop-blur-md border border-green-500/20 transition-all duration-300 hover:bg-white/10 hover:scale-105">
                                        <IoRocketSharp className="text-2xl text-green-400 mb-2 mx-auto lg:mx-0 transition-transform group-hover:scale-110" />
                                        <p className="text-gray-300">DevOps & Deployment</p>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="flex justify-center lg:justify-start">
                                    <Soical />
                                </div>

                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 opacity-50" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Image */}
                    <div className="order-1 lg:order-2">
                        <div className="relative group">
                            {/* Profile Image Container */}
                            <div className="relative z-10 mx-auto w-fit">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-2xl transition-all duration-500 group-hover:blur-3xl"></div>
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 opacity-20 animate-pulse"></div>
                                    <Image
                                        className="rounded-full p-2 relative z-10 transition-transform duration-500 group-hover:scale-105"
                                        src="/prof.jpg"
                                        alt="Kerlos Hany"
                                        width={400}
                                        height={400}
                                        priority
                                    />
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute -inset-4 border-2 border-dashed border-green-500/20 rounded-full animate-spin-slow"></div>
                                <div className="absolute -inset-8 border-2 border-dashed border-emerald-500/10 rounded-full animate-spin-slow-reverse"></div>

                                {/* Floating Tech Icons */}
                                <div className="absolute -right-4 top-1/4 p-2 bg-white/5 backdrop-blur-xl rounded-full border border-green-500/20 animate-float">
                                    <SiNextdotjs className="text-2xl text-green-400" />
                                </div>
                                <div className="absolute -left-4 top-1/3 p-2 bg-white/5 backdrop-blur-xl rounded-full border border-green-500/20 animate-float delay-150">
                                    <FaServer className="text-2xl text-green-400" />
                                </div>
                                <div className="absolute -right-6 bottom-1/3 p-2 bg-white/5 backdrop-blur-xl rounded-full border border-green-500/20 animate-float delay-300">
                                    <FaDatabase className="text-2xl text-green-400" />
                                </div>
                            </div>

                            {/* Background SVG */}
                            <img
                                src="pal.svg"
                                alt="Decorative background"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] opacity-10 blur-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero