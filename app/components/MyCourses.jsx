'use client'
import { useState, useEffect } from 'react';
import { Book, Play, Calendar, Clock, ChevronRight, FileText } from 'lucide-react';
import { FaAtom, FaFlask, FaMicroscope, FaSquareRootAlt, FaInfinity, FaCalculator } from "react-icons/fa";
import { GiMolecule } from "react-icons/gi";
import Cookies from 'js-cookie';
import axios from 'axios';
import Link from 'next/link';

export default function MyCourses({ onBack }) {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('chapters');

    // Theme state - synced with header theme toggle
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Load theme preference and sync with document class
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme ? savedTheme === 'dark' : true;
        setIsDarkMode(isDark);

        // Sync with document class
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Listen for theme changes from other components (like header)
        const handleThemeChange = (e) => {
            if (e && e.key === 'theme') {
                const isDark = e.newValue === 'dark';
                setIsDarkMode(isDark);
            }
        };

        // Listen for storage changes (when theme is changed in other tabs/components)
        window.addEventListener('storage', handleThemeChange);

        // Use MutationObserver instead of interval for better performance
        const observer = new MutationObserver(() => {
            const currentIsDark = document.documentElement.classList.contains('dark');
            if (currentIsDark !== isDarkMode) {
                setIsDarkMode(currentIsDark);
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => {
            window.removeEventListener('storage', handleThemeChange);
            observer.disconnect();
        };
    }, []);

    // Course Skeleton for loading state
    const CourseSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/20 overflow-hidden">
                    <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse"></div>
                    <div className="p-6">
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-4"></div>
                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-2"></div>
                        <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-4"></div>

                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                            <div className="h-8 w-28 bg-blue-200 dark:bg-blue-700 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    const fetchEnrolledCourses = async () => {
        setIsLoading(true);

        // Set up cache expiration time (24 hours)
        const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Check if we have valid cache
        const cachedData = localStorage.getItem('enrolledCourses');
        const cacheTimestamp = localStorage.getItem('enrolledCoursesTimestamp');
        const now = Date.now();
        const isCacheValid = cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < CACHE_EXPIRATION);

        // Use cache if it's valid and not expired
        if (isCacheValid) {
            try {
                const parsedCache = JSON.parse(cachedData);
                // Filter out courses with null courseId from cache
                const validCourses = parsedCache.filter(course => course.courseId !== null);
                setEnrolledCourses(validCourses);
                setIsLoading(false);

                // Refresh data in background after using cache
                fetchFromAPI(false);
                return;
            } catch (error) {
                // If cache parsing fails, clear it
                localStorage.removeItem('enrolledCourses');
                localStorage.removeItem('enrolledCoursesTimestamp');
            }
        }

        // If no valid cache, fetch from API with loading indicator
        await fetchFromAPI(true);
    };

    // Separate function to fetch from API
    const fetchFromAPI = async (showLoading = true) => {
        if (showLoading) {
            setIsLoading(true);
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

                // Update state only if we're showing loading or if data has changed
                if (showLoading || JSON.stringify(validCourses) !== JSON.stringify(enrolledCourses)) {
                    setEnrolledCourses(validCourses);
                }

                // Store filtered courses in localStorage with timestamp
                localStorage.setItem('enrolledCourses', JSON.stringify(validCourses));
                localStorage.setItem('enrolledCoursesTimestamp', Date.now().toString());
            } else {
                if (showLoading || enrolledCourses.length > 0) {
                    setEnrolledCourses([]);
                }
                localStorage.removeItem('enrolledCourses');
                localStorage.removeItem('enrolledCoursesTimestamp');
            }
        } catch (err) {
            console.error('Error fetching enrolled courses:', err);
            if (showLoading) {
                setError('فشل في تحميل الكورسات المشترك بها. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
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
        <div className="bg-white/80 border-gray-200 dark:bg-white/10 dark:border-white/20 backdrop-blur-xl rounded-2xl p-8 border text-center">
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-600/30 flex items-center justify-center">
                    <Book size={36} className="text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-2xl font-arabicUI2 text-gray-900 dark:text-white/90">لم تشترك في أي كورسات بعد</h3>
                <p className="text-gray-600 dark:text-white/70 max-w-md mx-auto">استكشف مجموعتنا الواسعة من الكورسات التعليمية واشترك فيما يناسب احتياجاتك التعليمية.</p>
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
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden mb-6 shadow-lg">
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
                            className="group bg-white/80 border-gray-200 hover:border-gray-300 dark:bg-white/10 dark:border-white/20 dark:hover:border-white/40 backdrop-blur-xl rounded-2xl border transition-all duration-500 overflow-hidden cursor-pointer hover:transform hover:scale-105 shadow-lg"
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
                                <p className="text-gray-700 dark:text-white/80 mb-4 line-clamp-2">{course.courseId.description}</p>

                                <div className="flex flex-wrap gap-3 mb-4">
                                    <div className="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full text-xs flex items-center gap-1 text-gray-600 dark:text-white/70">
                                        <Calendar size={12} />
                                        <span>تاريخ الاشتراك: {formatDate(course.enrolledAt)}</span>
                                    </div>

                                    <div className="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full text-xs flex items-center gap-1 text-gray-600 dark:text-white/70">
                                        <Clock size={12} />
                                        <span>حالة الدفع: {course.paymentStatus === 'paid' ? 'مدفوع' : 'قيد الانتظار'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                                        <span className="text-gray-600 dark:text-white/70 text-sm">{course.courseId.chapters?.length || 0} فصول</span>
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

    // Render course details (placeholder for future enhancement)
    const renderCourseDetails = () => (
        <div className="bg-white/80 border-gray-200 dark:bg-white/10 dark:border-white/20 backdrop-blur-xl rounded-2xl p-8 border">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={handleBackToCourses}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-lg transition-all text-gray-700 dark:text-white"
                >
                    <ChevronRight size={20} />
                    <span>العودة للكورسات</span>
                </button>
                <h2 className="text-2xl font-arabicUI3 text-gray-900 dark:text-white">{selectedCourse?.courseId.name}</h2>
            </div>
            <p className="text-gray-600 dark:text-white/70">تفاصيل الكورس ستكون متاحة قريباً...</p>
        </div>
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
                    <>
                        {/* Header Section Skeleton */}
                        <div className="bg-gradient-to-br from-blue-500/70 to-indigo-500/70 rounded-2xl p-6 text-white relative overflow-hidden mb-6 shadow-lg animate-pulse">
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-xl"></div>
                                    <div>
                                        <div className="h-8 w-40 bg-white/30 rounded-md"></div>
                                        <div className="h-4 w-64 bg-white/30 rounded-md mt-2"></div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 mt-6">
                                    <div className="h-10 w-40 bg-white/20 rounded-xl"></div>
                                </div>
                            </div>
                        </div>

                        {/* Course cards skeleton */}
                        <CourseSkeleton />
                    </>
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