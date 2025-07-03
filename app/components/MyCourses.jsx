'use client'
import { useState, useEffect } from 'react';
import { Book, Play, Calendar, Clock, ChevronRight, FileText } from 'lucide-react';
import { FaAtom, FaFlask, FaMicroscope } from "react-icons/fa";
import { GiMolecule } from "react-icons/gi";
import Cookies from 'js-cookie';
import axios from 'axios';
import Link from 'next/link';

// Chemistry background component reused from main profile
 

export default function MyCourses({ onBack }) {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('chapters');

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const fetchEnrolledCourses = async () => {
        setIsLoading(true);

        // 1. Check cache first
        const cached = localStorage.getItem('enrolledCourses');
        if (cached) {
            try {
                const parsedCache = JSON.parse(cached);
                // Filter out courses with null courseId from cache
                const validCourses = parsedCache.filter(course => course.courseId !== null);
                setEnrolledCourses(validCourses);
            } catch {
                localStorage.removeItem('enrolledCourses');
            }
        }

        try {
            const token = Cookies.get('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/active`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.isHeEnrolled && response.data.coursesAreEnrolled?.length > 0) {
                // Filter out courses with null courseId
                const validCourses = response.data.coursesAreEnrolled.filter(course => course.courseId !== null);
                setEnrolledCourses(validCourses);

                // 2. Store filtered courses in localStorage
                localStorage.setItem('enrolledCourses', JSON.stringify(validCourses));
            } else {
                setEnrolledCourses([]);
                localStorage.removeItem('enrolledCourses');
            }
        } catch (err) {
            console.error('Error fetching enrolled courses:', err);
            setError('فشل في تحميل الكورسات المشترك بها. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };


    // Format date function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Select a course to view details
    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
    };

    // Return to course list
    const handleBackToCourses = () => {
        setSelectedCourse(null);
    };

    // Course subject icon mapper
    const getSubjectIcon = (courseName) => {
        if (courseName.includes("كيمياء")) {
            return <FaFlask className="text-green-400" size={28} />;
        } else if (courseName.includes("فيزياء")) {
            return <FaAtom className="text-blue-400" size={28} />;
        } else if (courseName.includes("أحياء")) {
            return <FaMicroscope className="text-purple-400" size={28} />;
        } else {
            return <GiMolecule className="text-indigo-400" size={28} />;
        }
    };

    // Empty state component
    const EmptyCoursesState = () => (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-600/30 flex items-center justify-center">
                    <Book size={36} className="text-blue-300" />
                </div>
                <h3 className="text-2xl font-arabicUI2 text-white/90">لم تشترك في أي كورسات بعد</h3>
                <p className="text-white/70 max-w-md mx-auto">استكشف مجموعتنا الواسعة من الكورسات التعليمية واشترك فيما يناسب احتياجاتك التعليمية.</p>
                <Link href="/">
                    <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2">
                        <span>استكشف الكورسات المتاحة</span>
                        <ChevronRight size={18} />
                    </button>
                </Link>

                 
            </div>
        </div>
    );

    // Render course cards with the new design
    const renderCourseList = () => (
        <>
            {/* Header Section */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />

                <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                            <Book className="text-3xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-arabicUI3">كورساتي</h1>
                            <p className="text-blue-100 mt-1">الكورسات التي قمت بالاشتراك بها</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center gap-2">
                            <FileText size={18} className="text-white/70" />
                            <h3 className="text-lg font-arabicUI3">{enrolledCourses.length} كورسات مشترك بها</h3>
                        </div>
                    </div>
                </div>
            </div>

            {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrolledCourses.map((course) => (
                        <div
                            key={course._id}
                            className="group bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-500 overflow-hidden cursor-pointer hover:transform hover:scale-105"
                        >
                            <div className="relative h-40 bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />

                                <div className="relative flex items-center gap-4">
                                    <div className="h-16 w-16 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                        {getSubjectIcon(course.courseId.name)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-arabicUI2 text-white group-hover:text-blue-300 transition-colors duration-300">
                                            {course.courseId.name}
                                        </h3>
                                        <p className="text-blue-100 text-sm">{course.courseId.level}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="text-white/80 mb-4 line-clamp-2">{course.courseId.description}</p>

                                <div className="flex flex-wrap gap-3 mb-4">
                                    <div className="bg-white/5 px-3 py-1 rounded-full text-xs flex items-center gap-1 text-white/70">
                                        <Calendar size={12} />
                                        <span>تاريخ الاشتراك: {formatDate(course.enrolledAt)}</span>
                                    </div>

                                    <div className="bg-white/5 px-3 py-1 rounded-full text-xs flex items-center gap-1 text-white/70">
                                        <Clock size={12} />
                                        <span>حالة الدفع: {course.paymentStatus === 'paid' ? 'مدفوع' : 'قيد الانتظار'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <FileText size={14} className="text-blue-400" />
                                        <span className="text-white/70 text-sm">{course.courseId.chapters?.length || 0} فصول</span>
                                    </div>

                                    <Link href={`/Courses/${course.courseId._id}`}>
                                        <button className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-sm flex items-center gap-1 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all">
                                            <span>عرض الكورس</span>
                                            <Play size={14} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyCoursesState />
            )}
        </>
    );

    return (
        <div className="min-h-screen font-arabicUI3 relative" dir="rtl">
 
            <div className="relative z-20 container mx-auto px-4 py-8">
                {/* Back to profile button */}
                {!selectedCourse && (
                    <div className="flex justify-start mb-6">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                        >
                            <ChevronRight size={20} className="text-white" />
                            <span className="text-white">العودة للملف الشخصي</span>
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/20 backdrop-blur-xl rounded-xl p-4 text-white text-center">
                        {error}
                    </div>
                ) : selectedCourse ? (
                    renderCourseDetails()
                ) : (
                    renderCourseList()
                )}
            </div>
        </div>
    );
}