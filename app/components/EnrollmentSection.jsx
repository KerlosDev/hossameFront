'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { FaLock, FaUnlock, FaGraduationCap, FaPlay } from "react-icons/fa";
import { BsLightningChargeFill } from "react-icons/bs";
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import axios from 'axios';

const EnrollmentSection = ({ courseInfo }) => {
    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Debug courseInfo to see what properties are available
        console.log('courseInfo:', courseInfo);

        // Check if user is logged in by looking for token in cookies
        const token = Cookies.get('token');
        if (token) {
            setIsLoggedIn(true);
            // Get user data from cookies or localStorage if available
            const userDataStr = localStorage.getItem('username');
            if (userDataStr) {
                setUserData(JSON.parse(userDataStr));
            }

            // Get the correct course ID - handle different possible formats
            const courseId = courseInfo._id || courseInfo.id || courseInfo.nicknameforcourse;
            console.log('Using courseId:', courseId);

            if (courseId) {
                // Check enrollment status
                checkEnrollmentStatus(token, courseId);
            }
        }
    }, [courseInfo]);

    const checkEnrollmentStatus = async (token, courseId) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/active/${courseId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data && response.data.isHeEnrolled) {
                setEnrolled(true);
            }
        } catch (error) {
            console.error('Error checking enrollment status:', error);
            // If there's an error, assume not enrolled
            setEnrolled(false);
        }
    };

    const handleEnrollFree = async () => {
        if (!isLoggedIn) {
            toast.error('يرجى تسجيل الدخول أولاً');
            return;
        }

        setLoading(true);
        try {
            const token = Cookies.get('token');

            // Get the correct course ID - handle different possible formats
            const courseId = courseInfo._id || courseInfo.id || courseInfo.nicknameforcourse;

            // Create enrollment for free course - same format as payment page
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/active`, {
                courseId: courseId,
                price: courseInfo.price || 0,
                phoneNumber: '01000000000' // Replace with actual phone number if needed

            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200 || response.status === 201) {
                // Update payment status to paid for free course
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/active/payment/${response.data.enrollment._id}`,
                    { paymentStatus: 'paid' },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                setEnrolled(true);
                toast.success('تم التسجيل في الكورس بنجاح');
                // Optionally reload to update the UI
                window.location.reload();
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('حدث خطأ في التسجيل');
            }
        } finally {
            setLoading(false);
        }
    };

    if (courseInfo.isFree) {
        return (
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="space-y-6">
                    <div className="text-center">
                        <span className="inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full">
                            <FaUnlock className="text-green-400" />
                            <span className="text-green-400 font-medium">كورس مجاني</span>
                        </span>
                    </div>
                    {!isLoggedIn ? (
                        <Link href="/login" className="block">
                            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 
                                transition flex items-center justify-center gap-2">
                                <span>تسجيل دخول للمشاهدة</span>
                                <FaLock />
                            </button>
                        </Link>
                    ) : enrolled ? (
                        <div className="text-center">
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 
                                transition flex items-center justify-center gap-2">
                                <span>شاهد المحتوى</span>
                                <FaPlay className="text-sm" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleEnrollFree}
                            disabled={loading}
                            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 
                                text-white rounded-lg p-4 transition flex items-center justify-center gap-2"
                        >
                            <span>{loading ? 'جاري التسجيل...' : 'ابدأ التعلم مجاناً'}</span>
                            <FaGraduationCap />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="space-y-6">
                {isLoggedIn ? (
                    enrolled ? (
                        <div className="space-y-4 text-center">
                            <div className="inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full">
                                <BsLightningChargeFill className="text-green-400" />
                                <span className="text-green-400 font-medium">تم تفعيل الكورس</span>
                            </div>
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 
                                             transition flex items-center justify-center gap-2">
                                <span>شاهد المحتوى</span>
                                <FaPlay className="text-sm" />
                            </button>
                        </div>
                    ) : (
                        <Link href={`/payment/${courseInfo._id || courseInfo.id || courseInfo.nicknameforcourse}`} className="block">
                            <div className="space-y-4">
                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-white mb-1">{courseInfo.price} جنيه</h3>
                                    <p className="text-gray-400">اشتراك لمرة واحدة</p>
                                </div>
                                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 
                                                 transition flex items-center justify-center gap-2">
                                    <span>اشترك الآن</span>
                                    <BsLightningChargeFill />
                                </button>
                            </div>
                        </Link>
                    )
                ) : (
                    <Link href="/login" className="block">
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="text-3xl font-bold text-white mb-1">{courseInfo.price} جنيه</h3>
                                <p className="text-gray-400">سجل دخول للاشتراك</p>
                            </div>
                            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 
                                             transition flex items-center justify-center gap-2">
                                <span>تسجيل دخول</span>
                                <FaLock />
                            </button>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default EnrollmentSection;