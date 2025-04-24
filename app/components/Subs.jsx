'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import GlobalApi from '../api/GlobalApi';
import Link from 'next/link';
import QuizV from './QuizV';
import { GiMolecule, GiChemicalDrop } from 'react-icons/gi';
import { FaFlask, FaAtom, FaMicroscope, FaPlay } from 'react-icons/fa';
import { IoMdFlask } from "react-icons/io";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { BiTime } from "react-icons/bi";
import { BsBookmarkStar } from "react-icons/bs";
import ChemBackground from './ChemBackground';
const { encrypt, decrypt } = require('../utils/encryption');
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';

const Subs = () => {
    const { user, isLoaded } = useUser();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && !user) {
            setIsLoading(false);
            return;
        }
        if (user?.primaryEmailAddress?.emailAddress) {
            checkEnrollments();
        }
    }, [user, isLoaded]);

    const checkEnrollments = async () => {
        setIsLoading(true);
        try {
            const allCourses = await GlobalApi.getAllCourseList();
            const activationData = await GlobalApi.getActivationData();

            // Get and decrypt activations data
            let activations = [];
            if (activationData?.actvition?.activit) {
                try {
                    // If data is string (encrypted), decrypt it
                    if (typeof activationData.actvition.activit === 'string') {
                        const decrypted = decrypt(activationData.actvition.activit);
                        activations = JSON.parse(decrypted);
                    } else {
                        // If data is already an array
                        activations = activationData.actvition.activit;
                    }
                } catch (error) {
                    console.error('Decryption error:', error);
                    activations = [];
                }
            }

            // Filter enrolled courses
            const checkedCourses = allCourses.courses.filter(course => {
                return activations.some(activation =>
                    activation.userEmail === user.primaryEmailAddress.emailAddress &&
                    activation.courseId === course.nicknameforcourse &&
                    activation.status === 'approved'
                );
            });

            setEnrolledCourses(checkedCourses);
        } catch (error) {
            console.error('Error checking enrollments:', error);
            setEnrolledCourses([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoaded && !user) {
        return (
            <div className="min-h-screen font-arabicUI3 relative" dir="rtl">
                <ChemBackground />
                <div className="relative z-20 container mx-auto px-4 py-8">
                    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 text-center">
                        <div className="mb-6">
                            <IoMdFlask className="text-5xl text-blue-500 mx-auto" />
                        </div>
                        <h2 className="text-2xl font-arabicUI2 text-white mb-4">مرحباً بك في منصة الكيمياء</h2>
                        <p className="text-gray-300 mb-6">قم بتسجيل الدخول لعرض الكورسات المسجلة</p>
                        <Link href="/sign-in">
                            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition duration-300">
                                تسجيل الدخول
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-arabicUI3 relative" dir="rtl">
            <ChemBackground />
            <div className="relative z-20">
                <div className="container mx-auto px-4 py-8">
                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Right Side - Welcome Card & Courses */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Welcome Card */}
                            <div className="h-fit bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />

                                <div className="relative ">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                                            <HiOutlineAcademicCap className="text-3xl text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-arabicUI2">
                                                {user?.fullName ? `مرحباً, ${user.fullName}` : 'مرحباً بك'}
                                            </h1>
                                            <p className="text-blue-100 mt-1">استمر في رحلة التعلم الخاصة بك</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 mt-8">
                                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                            <p className="text-blue-100 text-sm mb-1">الدورات المسجلة</p>
                                            <h3 className="text-2xl font-arabicUI2">{enrolledCourses.length}</h3>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                            <p className="text-blue-100 text-sm mb-1">معدل الإنجاز</p>
                                            <h3 className="text-2xl font-arabicUI2">65%</h3>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                            <p className="text-blue-100 text-sm mb-1">ساعات التعلم</p>
                                            <h3 className="text-2xl font-arabicUI2">12</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Courses Section */}
                            <div className="mt-6">
                                <h2 className="text-2xl font-arabicUI2 text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                    <FaFlask className="text-blue-600" />
                                    كورساتك
                                </h2>
                                <div className="">
                                    {isLoading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="animate-pulse">
                                                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : enrolledCourses.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {enrolledCourses.map((course) => (
                                                <div key={course.nicknameforcourse}
                                                    className="group relative bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 
                                                    dark:to-slate-800/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-blue-100/50 
                                                    dark:border-blue-500/10 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                                                    {/* Chemistry Decorative Elements */}
                                                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
                                                    <div className="absolute left-1/2 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />

                                                    {/* Course Preview Image */}
                                                    <div className="relative h-48 overflow-hidden">
                                                        <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-slate-800/90 
                                                            rounded-xl backdrop-blur-sm flex items-center justify-center z-10 
                                                            shadow-lg transform group-hover:scale-110 transition-transform">
                                                            <IoMdFlask className="text-2xl text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <img
                                                            src={course.imageUrl || "/chbg.jpg"}
                                                            alt={course.nameofcourse}
                                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                        <div className="absolute bottom-4 left-4 flex items-center gap-2 backdrop-blur-sm 
                                                            bg-white/10 rounded-full px-3 py-1">
                                                            <BiTime className="text-white" />
                                                            <span className="text-sm text-white font-arabicUI3">120 دقيقة</span>
                                                        </div>
                                                    </div>

                                                    {/* Course Content */}
                                                    <div className="p-6 relative">
                                                        {/* Molecule decoration */}
                                                        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-5">
                                                            <GiMolecule className="text-7xl text-blue-600" />
                                                        </div>

                                                        <div className="flex items-start justify-between mb-4">
                                                            <h3 className="text-xl font-arabicUI2 text-slate-900 dark:text-white 
                                                                group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                {course.nameofcourse}
                                                            </h3>
                                                            <button className="text-blue-600 hover:text-blue-800 transition-colors 
                                                                transform hover:scale-110">
                                                                <BsBookmarkStar className="text-xl" />
                                                            </button>
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div className="mb-6">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-arabicUI3 text-slate-600 dark:text-slate-400">
                                                                    تقدم الكورس
                                                                </span>
                                                                <span className="text-sm font-arabicUI2 text-blue-600">65%</span>
                                                            </div>
                                                            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div className="h-full w-[65%] bg-gradient-to-r from-blue-600 to-indigo-600 
                                                                    rounded-full relative overflow-hidden">
                                                                    <div className="absolute inset-0 bg-grid-white/10 animate-pulse"></div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Button */}
                                                        <Link href={`/Courses/${course.nicknameforcourse}`}>
                                                            <button className="w-full group/btn relative px-6 py-3 rounded-xl overflow-hidden
                                                                font-arabicUI2 transition-all duration-300 transform hover:-translate-y-1">
                                                                {/* Background Layers */}
                                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                                                                {/* Bubble Effects */}
                                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400/20 rounded-full 
                                                                    blur-md transform translate-y-4 translate-x-4 group-hover/btn:translate-y-0 
                                                                    group-hover/btn:translate-x-0 transition-transform duration-700"></div>
                                                                <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-indigo-400/20 rounded-full 
                                                                    blur-md transform -translate-y-4 -translate-x-4 group-hover/btn:translate-y-0 
                                                                    group-hover/btn:translate-x-0 transition-transform duration-700"></div>

                                                                {/* Molecule Decoration */}
                                                                <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-50
                                                                    transform group-hover/btn:rotate-180 transition-transform duration-700">
                                                                    <GiMolecule className="text-white/30 text-xl" />
                                                                </div>

                                                                {/* Button Content */}
                                                                <div className="relative flex items-center justify-center gap-3 text-white">
                                                                    <span className="relative">
                                                                        متابعة التعلم
                                                                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/40
                                                                            group-hover/btn:w-full transition-all duration-300"></div>
                                                                    </span>
                                                                    <FaFlask className="text-sm opacity-70 transform rotate-[-15deg] 
                                                                        group-hover/btn:rotate-[15deg] transition-transform duration-300" />
                                                                </div>

                                                                {/* Hover Glow Effect */}
                                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 
                                                                    opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300
                                                                    blur-md -z-10"></div>
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl 
                                              rounded-2xl border border-blue-500/20">
                                            <h4 className="text-3xl font-arabicUI3 text-slate-800 dark:text-white">
                                                لم يتم الاشتراك في أي كورس بعد
                                            </h4>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Left Side - Quiz Stats */}
                        <div className="lg:col-span-4">
                            <QuizV />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subs;
