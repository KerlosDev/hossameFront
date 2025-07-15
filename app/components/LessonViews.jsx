'use client'
import { useState, useEffect } from 'react';
import { BookOpen, BarChart2, Award, Clock, Calendar, Eye, BookMarked, PlayCircle, CheckCircle2, FileText, Play } from 'lucide-react';
import { FaLock, FaSquareRootAlt, FaInfinity, FaCalculator } from "react-icons/fa";
import axios from 'axios';
import Cookies from 'js-cookie';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('chapters');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [watchHistory, setWatchHistory] = useState([]);
    const [error, setError] = useState(null);
    const [groupedLessons, setGroupedLessons] = useState({});

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
    }, []);

    // Listen for theme changes from other components (like header)
    useEffect(() => {
        const handleThemeChange = () => {
            const savedTheme = localStorage.getItem('theme');
            const isDark = savedTheme === 'dark';
            setIsDarkMode(isDark);
        };

        // Listen for storage changes (when theme is changed in other tabs/components)
        window.addEventListener('storage', handleThemeChange);

        // Also check periodically in case theme is changed by other components in same tab
        const interval = setInterval(() => {
            const savedTheme = localStorage.getItem('theme');
            const isDark = savedTheme === 'dark';
            if (isDark !== isDarkMode) {
                setIsDarkMode(isDark);
            }
        }, 100);

        return () => {
            window.removeEventListener('storage', handleThemeChange);
            clearInterval(interval);
        };
    }, [isDarkMode]);

    // Chemistry background component
    const ChemBackground = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 opacity-5 mix-blend-overlay bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900"></div>
            <div className="absolute top-20 left-20 text-7xl text-gray-300/30 dark:text-white/10">
                <FaSquareRootAlt className="animate-float" />
            </div>
            <div className="absolute bottom-40 right-20 text-8xl text-gray-300/30 dark:text-white/10">
                <FaInfinity className="animate-spin-slow" />
            </div>
            <div className="absolute top-1/2 left-1/3 text-6xl text-gray-300/30 dark:text-white/10">
                <FaCalculator className="animate-bounce-slow" />
            </div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/40 dark:bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/40 dark:bg-purple-500/20 rounded-full filter blur-3xl animate-pulse-delayed"></div>
        </div>
    );

    useEffect(() => {
        fetchEnrolledCourses();
        fetchWatchHistory();
    }, []);

    // Group lessons by chapters when watchHistory changes
    useEffect(() => {
        if (watchHistory.length > 0) {
            const grouped = groupLessonsByChapter(watchHistory);
            setGroupedLessons(grouped);
        }
    }, [watchHistory]);

    const groupLessonsByChapter = (lessons) => {
        const grouped = {};

        // Group lessons by chapterId
        lessons.forEach(lesson => {
            // Skip lessons without chapterId
            if (!lesson.chapterId) return;

            const chapterId = lesson.chapterId._id;

            if (!grouped[chapterId]) {
                grouped[chapterId] = {
                    chapterInfo: lesson.chapterId,
                    courseInfo: lesson.courseId,
                    lessons: []
                };
            }

            grouped[chapterId].lessons.push(lesson);
        });

        return grouped;
    };

    const fetchEnrolledCourses = async () => {
        setIsLoading(true);
        try {
            // Get token from cookies
            const token = Cookies.get('token');

            // Make request to the endpoint
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/active`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Check if enrolled in any courses
            if (response.data.isHeEnrolled) {
                setEnrolledCourses(response.data.coursesAreEnrolled);
                // Set the first course as selected course if available
                if (response.data.coursesAreEnrolled.length > 0) {
                    setSelectedCourse(response.data.coursesAreEnrolled[0]);
                }
            } else {
                setEnrolledCourses([]);
            }
        } catch (err) {
            console.error('Error fetching enrolled courses:', err);
            setError('فشل في تحميل الكورسات المشترك بها. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWatchHistory = async () => {
        try {
            // Get token from cookies
            const token = Cookies.get('token');

            // Make request to the watch history endpoint
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/watchHistory/my`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success && response.data.data) {
                setWatchHistory(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching watch history:', err);
            setError('فشل في تحميل سجل المشاهدة. يرجى المحاولة مرة أخرى.');
        }
    };

    // Format date to Arabic style
    const formatDate = (dateString) => {
        if (!dateString) return 'غير متوفر';

        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('ar-SA', options);
    };

    // Calculate time since last opened
    const getTimeSince = (dateString) => {
        if (!dateString) return 'غير متوفر';

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) {
            return `${diffDays} يوم`;
        } else {
            return `${diffHours} ساعة`;
        }
    };

    // Calculate total views from watch history
    const getTotalViews = () => {
        if (!watchHistory || watchHistory.length === 0) return 0;
        return watchHistory.reduce((total, item) => total + item.watchedCount, 0);
    };

    // Get the last watched lesson details
    const getLastWatchedLesson = () => {
        if (!watchHistory || watchHistory.length === 0) return null;

        // Sort by lastWatchedAt to get the most recent
        const sortedHistory = [...watchHistory].sort((a, b) =>
            new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt)
        );

        return sortedHistory[0];
    };

    const lastWatchedLesson = getLastWatchedLesson();
    const totalViews = getTotalViews();

    // Calculate a completion percentage based on watch history
    const calculateCompletionPercentage = () => {
        // For demonstration purposes, we'll use a placeholder
        // In a real app, you would calculate this based on total lessons in course vs watched
        if (!watchHistory || watchHistory.length === 0) return 0;
        return Math.min(Math.round((watchHistory.length / 10) * 100), 100);
    };

    const progress = calculateCompletionPercentage();

    return (
        <div className="min-h-screen relative bg-gradient-to-br   dark:bg-gradient-to-br transition-colors duration-300">
            {/* Chemistry Background */}
 
            <div className="relative z-20 text-gray-900 dark:text-white p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-white/10 pb-4 rtl-space-x-reverse">
                        <button
                            onClick={() => setActiveTab('chapters')}
                            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'chapters'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            الدروس بالتفصيل
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600 dark:text-red-400">
                            <div className="bg-red-100 dark:bg-red-500/20 backdrop-blur-xl rounded-xl p-4 border border-red-200 dark:border-red-500/30">
                                <p>{error}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'chapters' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-arabicUI2 text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <BookOpen className="text-blue-600 dark:text-blue-400" />
                                        الفصول والدروس
                                    </h3>

                                    {Object.keys(groupedLessons).length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {Object.values(groupedLessons).map((chapterData, chapterIndex) => (
                                                <div key={chapterData.chapterInfo._id} className="bg-white/80 border-gray-200 hover:border-gray-300 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 backdrop-blur-xl rounded-xl overflow-hidden transition-all group border shadow-lg">
                                                    <div className="border-b border-gray-200 dark:border-white/5 p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                                                                <span className="text-blue-600 dark:text-blue-300 font-bold">{chapterIndex + 1}</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors font-arabicUI2">
                                                                    {chapterData.chapterInfo.title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 text-gray-600 dark:text-white/60 text-sm mt-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <BookOpen size={12} />
                                                                        <span>{chapterData.lessons.length} دروس</span>
                                                                    </div>
                                                                    <span>•</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock size={12} />
                                                                        <span>45 دقيقة</span>
                                                                    </div>
                                                                    <span>•</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <FileText size={12} />
                                                                        <span>2 اختبارات</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-gray-600 dark:text-white/60 text-sm flex items-center gap-1">
                                                                <span>100%</span>
                                                                <span>مكتمل</span>
                                                            </div>
                                                            <button className="h-10 w-10 rounded-full bg-blue-500/20 hover:bg-blue-500/40 flex items-center justify-center transition-all">
                                                                <Play size={12} className="text-blue-600 dark:text-blue-300 mr-0.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="px-4 py-2 bg-gray-50 dark:bg-white/5">
                                                        {chapterData.lessons.map((lesson, lessonIndex) => (
                                                            <div key={lesson._id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-white/5 last:border-0">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                                                        <span className="text-gray-600 dark:text-white/70 text-sm">{lessonIndex + 1}</span>
                                                                    </div>
                                                                    <span className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors">
                                                                        {lesson.lessonTitle}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-gray-600 dark:text-white/60 text-xs">
                                                                        {lesson.watchedCount} مشاهدة
                                                                    </span>
                                                                    <button className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center transition-all">
                                                                        <Play size={10} className="text-gray-600 dark:text-white/70 mr-0.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-600 dark:text-white/60">
                                            <div className="bg-white/80 border-gray-200 dark:bg-white/10 dark:border-white/20 backdrop-blur-xl rounded-2xl p-8 border">
                                                <p>لا توجد فصول متاحة حالياً</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}