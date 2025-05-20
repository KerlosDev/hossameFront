'use client';
import { useEffect, useRef, useState } from 'react';
 import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { FaUser, FaEye, FaClock, FaList, FaTimes, FaWhatsapp, FaDownload, FaFilePdf, FaImage, FaGraduationCap, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";
const { decrypt } = require('../utils/encryption');
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';
import Cookies from 'js-cookie';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Cookies.get('token')}`
});

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const StudentFollowup = () => {
    const [stats, setStats] = useState({
        totalViews: 0,
        uniqueStudents: 0,
        mostViewedLesson: '',
        mostActiveStudent: ''
    });
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });
    const [studentList, setStudentList] = useState([]);
    const [sortBy, setSortBy] = useState('views'); // 'views', 'recent', or 'inactive'
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showLessonsModal, setShowLessonsModal] = useState(false);
    const [whatsappNumbers, setWhatsappNumbers] = useState({});
    const [studentChartData, setStudentChartData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'details'
    const [quizResults, setQuizResults] = useState([]);
    const reportRef = useRef(null);
    const [allCourses, setAllCourses] = useState([]);
    const [allChapters, setAllChapters] = useState([]);
    const [allExams, setAllExams] = useState([]);
    const [studentProgress, setStudentProgress] = useState(null);
    const [expandedCourses, setExpandedCourses] = useState({});
    const [lessonFilter, setLessonFilter] = useState({}); // 'watched', 'unwatched', or null
    const [examFilter, setExamFilter] = useState('all'); // 'all', 'completed', 'pending'
    const [filteredExams, setFilteredExams] = useState([]);
    const [inactivityThreshold] = useState(7); // Days to consider a student inactive

    useEffect(() => {
        fetchLessonData();
        fetchAllCoursesAndChapters();
    }, []);

    const fetchLessonData = async () => {
        try {
            const response = await fetch('http://localhost:9000/user/all-students-status', {
                headers: getAuthHeaders()
            });

            const studentsData = await response.json();

            if (studentsData.success) {
                // Process student data
                const whatsappObject = studentsData.data.reduce((acc, student) => {
                    acc[student.studentInfo.email] = {
                        studentId: student.studentInfo.id,
                        studentWhatsApp: student.studentInfo.phoneNumber,
                        parentWhatsApp: student.studentInfo.parentPhoneNumber,
                        name: student.studentInfo.name,
                        lastActive: student.activityStatus.lastActivity,
                        status: student.activityStatus.status,
                        totalWatchedLessons: student.activityStatus.totalWatchedLessons,
                        isEnrolled: student.enrollmentStatus.isEnrolled,
                        enrolledCourses: student.enrollmentStatus.enrolledCourses,
                        totalEnrollments: student.enrollmentStatus.totalEnrollments
                    };
                    return acc;
                }, {});
                setWhatsappNumbers(whatsappObject);

                // Process activity data for the student list
                const processedStudents = studentsData.data.map(student => ({
                    email: student.studentInfo.email,
                    userName: student.studentInfo.name,
                    totalViews: student.activityStatus.totalWatchedLessons || 0,
                    lastViewed: student.activityStatus.lastActivity,
                    status: getStudentStatus(student.activityStatus),
                    uniqueLessons: student.activityStatus.totalWatchedLessons || 0,
                    lessons: [], // Since we don't have specific lesson data in this response
                    lessonViews: {},
                    hasWatchHistory: student.activityStatus.totalWatchedLessons > 0
                }));

                setStudentList(processedStudents);

                // Update stats
                const totalViews = processedStudents.reduce((sum, student) => sum + student.totalViews, 0);
                const mostActiveStudent = processedStudents.reduce((prev, current) =>
                    (current.totalViews > (prev?.totalViews || 0)) ? current : prev, null);

                setStats({
                    totalViews,
                    uniqueStudents: studentsData.count,
                    mostViewedLesson: 'لم يتم تحديده', // This info is not available in the new API
                    mostActiveStudent: mostActiveStudent?.email || 'لا يوجد'
                });

                // Set basic chart data
                setChartData({
                    labels: processedStudents.map(student => student.userName),
                    datasets: [{
                        label: 'عدد الدروس المشاهدة',
                        data: processedStudents.map(student => student.totalViews),
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 1,
                        borderRadius: 4,
                    }]
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getStudentStatus = (activityStatus) => {
        const status = activityStatus.status;
        const lastActivity = activityStatus.lastActivity;
        const totalWatchedLessons = activityStatus.totalWatchedLessons;

        if (status === 'not enrolled') {
            return { status: 'never_active', label: 'لم يتم التسجيل', color: 'text-red-400' };
        }

        if (totalWatchedLessons === 0) {
            return { status: 'never_active', label: 'لم يبدأ الدراسة', color: 'text-red-400' };
        }

        if (!lastActivity) {
            return { status: 'inactive', label: 'غير نشط', color: 'text-yellow-400' };
        }

        const daysSinceActive = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));

        if (daysSinceActive > inactivityThreshold) {
            return { status: 'inactive', label: 'غير نشط', color: 'text-yellow-400' };
        }

        return { status: 'active', label: 'نشط', color: 'text-green-400' };
    };

    const fetchAllCoursesAndChapters = async () => {
        try {
            const response = await fetch('http://localhost:9000/course/allCourses', {
                headers: getAuthHeaders()
            });
            const coursesData = await response.json();

            if (Array.isArray(coursesData)) {
                // Process courses
                const processedCourses = coursesData.map(course => ({
                    id: course._id,
                    nameofcourse: course.name,
                    nicknameforcourse: course._id,
                    level: course.level,
                    isPublished: course.isPublished
                }));

                // Process chapters
                const processedChapters = coursesData.flatMap(course =>
                    course.chapters.map(chapter => ({
                        id: chapter._id,
                        title: chapter.title,
                        courseNickname: course._id,
                        lessons: chapter.lessons.map(lesson => ({
                            id: lesson._id,
                            title: lesson.title,
                            videoUrl: lesson.videoUrl
                        }))
                    }))
                );

                // Process exams
                const processedExams = coursesData.flatMap(course =>
                    course.exams.map(exam => ({
                        id: exam._id,
                        title: exam.title,
                        duration: exam.duration,
                        courseId: course._id,
                        courseName: course.name,
                        questions: exam.questions
                    }))
                );

                setAllCourses(processedCourses);
                setAllChapters(processedChapters);
                setAllExams(processedExams);
            }
        } catch (error) {
            console.error('Error fetching course data:', error);
        }
    };

    const sortStudents = (students) => {
        return [...students].sort((a, b) => {
            switch (sortBy) {
                case 'views':
                    return b.views - a.views;
                case 'inactive':
                    // First check if both students have a status
                    if (!a.status || !b.status) return 0;

                    // Sort by status priority (never_active > inactive > active)
                    const statusPriority = { never_active: 2, inactive: 1, active: 0 };
                    const priorityA = statusPriority[a.status.status] || 0;
                    const priorityB = statusPriority[b.status.status] || 0;

                    // If priorities are equal, sort by last activity date
                    if (priorityA === priorityB) {
                        const dateA = new Date(a.lastViewed || whatsappNumbers[a.email]?.lastActive || 0);
                        const dateB = new Date(b.lastViewed || whatsappNumbers[b.email]?.lastActive || 0);
                        return dateB - dateA;
                    }

                    return priorityB - priorityA;
                default: // 'recent'
                    const dateA = new Date(b.lastViewed || whatsappNumbers[b.email]?.lastActive || 0);
                    const dateB = new Date(a.lastViewed || whatsappNumbers[a.email]?.lastActive || 0);
                    return dateA - dateB;
            }
        });
    };

    const exportAsImage = async () => {
        try {
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                backgroundColor: '#0A1121',
                scale: 2
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `تقرير-${selectedStudent ? selectedStudent.email : 'الطلاب'}.png`;
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Update getWhatsAppLink function to handle local numbers
    const getWhatsAppLink = (number) => {
        if (!number) return '#';
        // Remove any non-digit characters
        const cleanNumber = number.replace(/\D/g, '');
        // Add country code if it's a local number (assuming Egypt)
        const fullNumber = cleanNumber.startsWith('0') ?
            '20' + cleanNumber.substring(1) :
            cleanNumber;
        return `https://wa.me/${fullNumber}`;
    };

    const prepareStudentChartData = (student) => {
        // Sort lessons by date
        const sortedLessons = Array.from(student.lessons).map(lesson => ({
            name: lesson,
            views: student.lessonViews[lesson],
            // Assuming we have timestamp data for each view
            dates: student.viewDates?.[lesson] || []
        }));

        return {
            labels: sortedLessons.map(l => l.name),
            datasets: [{
                label: 'عدد المشاهدات',
                data: sortedLessons.map(l => l.views),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        };
    };

    const fetchQuizResults = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:9000/examResult/result/${studentId}`, {
                headers: getAuthHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // Transform the new response format into the expected format
            if (data && data.results) {
                const processedResults = data.results.map(result => ({
                    nameofquiz: result.examTitle,
                    numofqus: result.totalQuestions,
                    quizGrade: result.correctAnswers,
                    submittedAt: result.examDate,
                    attemptNumber: result.attemptNumber
                }));
                setQuizResults(processedResults);
            } else {
                console.error('Unexpected response format:', data);
                setQuizResults([]);
            }
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            setQuizResults([]);
        }
    };

    const getWatchedLessonsByCourse = (student, course, chapters) => {
        const courseChapters = chapters.filter(ch => ch.courseNickname === course.nicknameforcourse);
        const watchedLessons = student.lessons.filter(lesson => {
            const [chapterTitle] = lesson.split(' - ');
            return courseChapters.some(ch => ch.title === chapterTitle);
        });
        return watchedLessons;
    };

    const calculateStudentProgress = (student) => {
        const progress = allCourses.map(course => {
            const courseChapters = allChapters.filter(ch =>
                ch.courseNickname === course.nicknameforcourse
            );

            const courseLessons = courseChapters.flatMap(ch => ch.lessons || []);
            const totalLessons = courseLessons.length;

            const watchedLessons = getWatchedLessonsByCourse(student, course, allChapters);

            // Get exams for this course
            const courseExams = allExams.filter(exam =>
                exam.courseId === course.id || exam.courseName === course.nameofcourse
            );

            // Calculate completed exams
            const completedExams = quizResults.filter(quiz =>
                courseExams.some(exam => exam.title === quiz.nameofquiz)
            );

            // Find unwatched lessons
            const unwatchedLessons = courseChapters.flatMap(chapter => {
                return (chapter.lessons || [])
                    .filter(lesson => {
                        const fullLessonName = `${chapter.title} - ${lesson.title}`;
                        return !student.lessons.includes(fullLessonName);
                    })
                    .map(lesson => ({
                        chapterTitle: chapter.title,
                        lessonTitle: lesson.title
                    }));
            });

            return {
                courseId: course.id,
                courseName: course.nameofcourse,
                courseNickname: course.nicknameforcourse,
                totalLessons,
                watchedLessons: watchedLessons,
                watchedLessonsCount: watchedLessons.length,
                completion: totalLessons > 0 ? (watchedLessons.length / totalLessons) * 100 : 0,
                examsTotal: courseExams.length,
                examsCompleted: completedExams.length,
                unwatchedLessons,
                courseChapters // Add this
            };
        }).filter(course => course.totalLessons > 0); // Only show courses with lessons

        setStudentProgress(progress);
    };

    const filterExams = (allExams, quizResults) => {
        // Group quiz results by exam title to get the latest attempt
        const latestAttempts = quizResults.reduce((acc, result) => {
            if (!acc[result.nameofquiz] ||
                acc[result.nameofquiz].attemptNumber < result.attemptNumber) {
                acc[result.nameofquiz] = result;
            }
            return acc;
        }, {});

        const completedExamIds = new Set(Object.keys(latestAttempts));

        switch (examFilter) {
            case 'completed':
                return allExams.filter(exam => completedExamIds.has(exam.title));
            case 'pending':
                return allExams.filter(exam => !completedExamIds.has(exam.title));
            default:
                return allExams;
        }
    };

    useEffect(() => {
        if (allExams.length > 0 && quizResults.length > 0) {
            setFilteredExams(filterExams(allExams, quizResults));
        }
    }, [examFilter, allExams, quizResults]);

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setActiveTab('details');
        const studentData = whatsappNumbers[student.email];
        if (studentData && studentData.studentId) {
            fetchQuizResults(studentData.studentId);
        }
        calculateStudentProgress(student);
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'white',
                    font: {
                        family: 'arabicUI3'
                    }
                }
            },
            tooltip: {
                backgroundColor: '#1a1a1a',
                titleColor: 'white',
                bodyColor: 'white',
                bodyFont: {
                    family: 'arabicUI3'
                },
                titleFont: {
                    family: 'arabicUI3'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'white',
                    font: {
                        family: 'arabicUI3'
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                ticks: {
                    color: 'white',
                    font: {
                        family: 'arabicUI3'
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };

    const ExamSection = () => (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">الاختبارات</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setExamFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${examFilter === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                    >
                        جميع الاختبارات
                    </button>
                    <button
                        onClick={() => setExamFilter('completed')}
                        className={`px-4 py-2 rounded-lg transition-colors ${examFilter === 'completed'
                            ? 'bg-green-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FaCheckCircle />
                            <span>تم الإجتياز</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setExamFilter('pending')}
                        className={`px-4 py-2 rounded-lg transition-colors ${examFilter === 'pending'
                            ? 'bg-red-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FaTimesCircle />
                            <span>لم يتم الإجتياز</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExams.map((exam, index) => {
                    // Group attempts for this exam
                    const examAttempts = quizResults
                        .filter(r => r.nameofquiz === exam.title)
                        .sort((a, b) => b.attemptNumber - a.attemptNumber);

                    const latestAttempt = examAttempts[0];
                    const isCompleted = !!latestAttempt;
                    const attemptsCount = examAttempts.length;
                    const bestScore = Math.max(...examAttempts.map(a => a.quizGrade) || [0]);

                    return (
                        <div key={index}
                            className={`p-4 rounded-xl border ${isCompleted
                                ? 'bg-green-500/10 border-green-500/20'
                                : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-white">
                                        {exam.title}
                                    </h4>
                                    <div className="flex flex-col gap-1">
                                        {isCompleted && (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <FaClock className="text-purple-400" />
                                                    <p className="text-sm text-white/60">
                                                        آخر محاولة: {new Date(latestAttempt.submittedAt).toLocaleDateString('ar-EG')}
                                                    </p>
                                                </div>
                                                <div className="text-sm text-white/60">
                                                    عدد المحاولات: {attemptsCount}
                                                </div>
                                                <div className="text-sm text-white/60">
                                                    أفضل نتيجة: {bestScore}/{latestAttempt.numofqus}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {isCompleted && (
                                    <div className="px-3 py-1 bg-green-500/20 rounded-lg text-green-400 text-sm">
                                        {latestAttempt.quizGrade} / {latestAttempt.numofqus}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div ref={reportRef} className="p-6 space-y-6">
            {/* Tabs Navigation */}
            <div className="flex justify-between gap-4 mb-6">
                <div>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 rounded-xl font-arabicUI3 transition-colors ${activeTab === 'overview'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                    >
                        نظرة عامة
                    </button>

                    {selectedStudent && (
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-6 py-3 rounded-xl font-arabicUI3 transition-colors ${activeTab === 'details'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                                }`}
                        >
                            تفاصيل الطالب
                        </button>
                    )}
                </div>

                <button
                    onClick={exportAsImage}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors text-white"
                >
                    <FaImage />
                    <span>تصدير كصورة</span>
                </button>
            </div>

            {activeTab === 'overview' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h3 className="text-white/80 font-arabicUI3 text-lg mb-2">إجمالي المشاهدات</h3>
                            <p className="text-4xl font-bold text-white">{stats.totalViews}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h3 className="text-white/80 font-arabicUI3 text-lg mb-2">عدد الطلاب</h3>
                            <p className="text-4xl font-bold text-white">{stats.uniqueStudents}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h3 className="text-white/80 font-arabicUI3 text-lg mb-2">الدرس الأكثر مشاهدة</h3>
                            <p className="text-xl font-bold text-white">{stats.mostViewedLesson}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h3 className="text-white/80 font-arabicUI3 text-lg mb-2">الطالب الأكثر نشاطاً</h3>
                            <p className="text-lg font-bold text-white">{stats.mostActiveStudent}</p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h3 className="text-white font-arabicUI3 text-xl mb-6">مشاهدات الدروس</h3>
                        <div className="h-[400px]">
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Student List Section */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-arabicUI3 text-xl">قائمة الطلاب</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSortBy('views')}
                                    className={`px-4 py-2 rounded-lg font-arabicUI3 transition-colors
                                        ${sortBy === 'views'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                                >
                                    ترتيب حسب المشاهدات
                                </button>
                                <button
                                    onClick={() => setSortBy('recent')}
                                    className={`px-4 py-2 rounded-lg font-arabicUI3 transition-colors
                                        ${sortBy === 'recent'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                                >
                                    ترتيب حسب آخر نشاط
                                </button>
                                <button
                                    onClick={() => setSortBy('inactive')}
                                    className={`px-4 py-2 rounded-lg font-arabicUI3 transition-colors
                                        ${sortBy === 'inactive' ? 'bg-red-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <FaExclamationTriangle />
                                        <span>الطلاب غير النشطين</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr className="text-white/70">
                                        <th className="py-3 px-4 text-right">الطالب</th>
                                        <th className="py-3 px-4 text-center">رقم الطالب</th>
                                        <th className="py-3 px-4 text-center">رقم ولي الأمر</th>
                                        <th className="py-3 px-4 text-center">عدد المشاهدات</th>
                                        <th className="py-3 px-4 text-center">الدروس المشاهدة</th>
                                        <th className="py-3 px-4 text-center">آخر نشاط</th>
                                        <th className="py-3 px-4 text-center">تفاصيل</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {sortStudents(studentList).map((student, index) => (
                                        <tr key={student.email} className={`text-white/90 hover:bg-white/5 ${student.status.status !== 'active' ? 'bg-red-500/5' : ''
                                            }`}>
                                            {/* Email cell */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center`}>
                                                        <FaUser className={student.status.color} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{whatsappNumbers[student.email]?.name || student.email}</div>
                                                        <div className={`text-sm ${student.status.color}`}>
                                                            {student.status.label}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Student WhatsApp cell */}
                                            <td className="py-4 px-4 text-center">
                                                {whatsappNumbers[student.email]?.studentWhatsApp ? (
                                                    <a
                                                        href={getWhatsAppLink(whatsappNumbers[student.email].studentWhatsApp)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors group"
                                                    >
                                                        <FaWhatsapp className="text-green-400 text-xl group-hover:text-green-300" />
                                                        <span className="text-sm text-white/70">{whatsappNumbers[student.email].studentWhatsApp}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-white/30">لا يوجد</span>
                                                )}
                                            </td>

                                            {/* Parent WhatsApp cell */}
                                            <td className="py-4 px-4 text-center">
                                                {whatsappNumbers[student.email]?.parentWhatsApp ? (
                                                    <a
                                                        href={getWhatsAppLink(whatsappNumbers[student.email].parentWhatsApp)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors group"
                                                    >
                                                        <FaWhatsapp className="text-green-400 text-xl group-hover:text-green-300" />
                                                        <span className="text-sm text-white/70">{whatsappNumbers[student.email].parentWhatsApp}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-white/30">لا يوجد</span>
                                                )}
                                            </td>

                                            {/* ...rest of existing cells... */}
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <FaEye className="text-blue-400" />
                                                    <span>{student.views}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                {student.uniqueLessons} درس
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <FaClock className="text-blue-400" />
                                                    <span>{formatDate(student.lastViewed)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleStudentSelect(student)}
                                                    className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                                                >
                                                    <FaList className="text-blue-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                selectedStudent && (
                    <div className="space-y-6">
                        {/* Student Info Cards */}


                        {/* Course Progress Section */}


                        {/* Redesigned Student Profile Section */}
                        {activeTab === 'details' && selectedStudent && (
                            <div className="space-y-6">
                                {/* Student Profile Header */}
                                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                            <span className="text-3xl text-white font-bold">
                                                {selectedStudent.userName[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-white mb-2">{selectedStudent.userName}</h2>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1">
                                                    <FaEye className="text-blue-400" />
                                                    <span className="text-white">{selectedStudent.activityStatus?.totalWatchedLessons || 0} مشاهدة</span>
                                                </div>
                                                {selectedStudent.activityStatus?.lastActivity && (
                                                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1">
                                                        <FaClock className="text-green-400" />
                                                        <span className="text-white">
                                                            آخر نشاط: {new Date(selectedStudent.activityStatus.lastActivity).toLocaleDateString('ar-EG')}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`flex items-center gap-2 rounded-full px-4 py-1 ${selectedStudent.enrollmentStatus?.isEnrolled
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {selectedStudent.enrollmentStatus?.isEnrolled
                                                        ? <FaGraduationCap />
                                                        : <FaTimes />}
                                                    <span>
                                                        {selectedStudent.enrollmentStatus?.isEnrolled
                                                            ? 'مشترك'
                                                            : 'غير مشترك'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {whatsappNumbers[selectedStudent.email]?.studentWhatsApp && (
                                                    <a href={`https://wa.me/${whatsappNumbers[selectedStudent.email].studentWhatsApp}`}
                                                        target="_blank"
                                                        className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 px-4 py-2 rounded-lg transition-colors">
                                                        <FaWhatsapp className="text-green-400" />
                                                        <span className="text-white">رقم الطالب: {whatsappNumbers[selectedStudent.email].studentWhatsApp}</span>
                                                    </a>
                                                )}
                                                {whatsappNumbers[selectedStudent.email]?.parentWhatsApp && (
                                                    <a href={`https://wa.me/${whatsappNumbers[selectedStudent.email].parentWhatsApp}`}
                                                        target="_blank"
                                                        className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 px-4 py-2 rounded-lg transition-colors">
                                                        <FaWhatsapp className="text-green-400" />
                                                        <span className="text-white">رقم ولي الأمر: {whatsappNumbers[selectedStudent.email].parentWhatsApp}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enrollment Status */}
                                {selectedStudent.enrollmentStatus?.enrolledCourses?.length > 0 && (
                                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                        <h3 className="text-xl font-bold text-white mb-4">الكورسات المشترك بها</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedStudent.enrollmentStatus.enrolledCourses.map((course, idx) => (
                                                <div key={idx} className="bg-white/5 rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-lg font-medium text-white">{course.courseName}</h4>
                                                        <span className={`px-2 py-1 rounded text-sm ${course.paymentStatus === 'paid'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                            }`}>
                                                            {course.paymentStatus === 'paid' ? 'مفعل' : 'قيد الانتظار'}
                                                        </span>
                                                    </div>
                                                    <div className="text-white/60 text-sm">
                                                        تاريخ التسجيل: {new Date(course.enrollmentDate).toLocaleDateString('ar-EG')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Activity Status */}
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                    <h3 className="text-xl font-bold text-white mb-4">حالة النشاط</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <div className="text-sm text-white/70 mb-1">إجمالي المشاهدات</div>
                                            <div className="text-2xl text-white font-bold">
                                                {selectedStudent.activityStatus?.totalWatchedLessons || 0}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <div className="text-sm text-white/70 mb-1">الحالة</div>
                                            <div className={`text-2xl font-bold ${selectedStudent.status?.color}`}>
                                                {selectedStudent.status?.label}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <div className="text-sm text-white/70 mb-1">آخر نشاط</div>
                                            <div className="text-2xl text-white font-bold">
                                                {selectedStudent.activityStatus?.lastActivity
                                                    ? new Date(selectedStudent.activityStatus.lastActivity).toLocaleDateString('ar-EG')
                                                    : 'لم يبدأ بعد'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Course Progress Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {studentProgress?.map((course, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white">{course.courseName}</h3>
                                        <div className="text-2xl font-bold text-blue-400">
                                            {Math.round(course.completion)}%
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="w-full bg-white/10 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${course.completion}%` }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 rounded-lg p-4">
                                                <div className="text-sm text-white/70 mb-1">الدروس المكتملة</div>
                                                <div className="text-xl text-white font-bold">
                                                    {course.watchedLessonsCount} / {course.totalLessons}
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-4">
                                                <div className="text-sm text-white/70 mb-1">الاختبارات المكتملة</div>
                                                <div className="text-xl text-white font-bold">
                                                    {course.examsCompleted} / {course.examsTotal}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lesson List Controls */}
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={() => setExpandedCourses(prev => ({
                                                    ...prev,
                                                    [course.courseId]: !prev[course.courseId]
                                                }))}
                                                className="text-white/70 hover:text-white flex items-center gap-2"
                                            >
                                                {expandedCourses[course.courseId] ? 'إخفاء الدروس' : 'عرض الدروس'}
                                                <FaList className="text-blue-400" />
                                            </button>
                                            {expandedCourses[course.courseId] && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setLessonFilter(prev => ({
                                                            ...prev,
                                                            [course.courseId]: prev[course.courseId] === 'watched' ? null : 'watched'
                                                        }))}
                                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${lessonFilter[course.courseId] === 'watched'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-white/5 text-white/70'
                                                            }`}
                                                    >
                                                        تم المشاهدة
                                                    </button>
                                                    <button
                                                        onClick={() => setLessonFilter(prev => ({
                                                            ...prev,
                                                            [course.courseId]: prev[course.courseId] === 'unwatched' ? null : 'unwatched'
                                                        }))}
                                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${lessonFilter[course.courseId] === 'unwatched'
                                                            ? 'bg-red-500/20 text-red-400'
                                                            : 'bg-white/5 text-white/70'
                                                            }`}
                                                    >
                                                        لم تتم المشاهدة
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Lessons List */}
                                        {expandedCourses[course.courseId] && (
                                            <div className="mt-4 space-y-2">
                                                {lessonFilter[course.courseId] !== 'watched' &&
                                                    course.unwatchedLessons
                                                        .map((lesson, idx) => (
                                                            <div key={`unwatched-${idx}`}
                                                                className="flex items-center gap-2 bg-red-500/10 text-white/70 p-3 rounded-lg"
                                                            >
                                                                <FaTimes className="text-red-400" />
                                                                <span>{lesson.chapterTitle} - {lesson.lessonTitle}</span>
                                                            </div>
                                                        ))
                                                }
                                                {lessonFilter[course.courseId] !== 'unwatched' &&
                                                    course.watchedLessons
                                                        .map((lesson, idx) => (
                                                            <div key={`watched-${idx}`}
                                                                className="flex items-center justify-between bg-green-500/10 text-white/70 p-3 rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <FaEye className="text-green-400" />
                                                                    <span>{lesson}</span>
                                                                </div>
                                                                <span className="text-sm text-green-400">
                                                                    {selectedStudent.lessonViews[lesson]} مشاهدة
                                                                </span>
                                                            </div>
                                                        ))
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Exam Section */}
                        <ExamSection />

                        {/* Recent Activity Chart */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-6">نشاط المشاهدة</h3>
                            <div className="h-[400px]">
                                <Bar
                                    data={prepareStudentChartData(selectedStudent)}
                                    options={{
                                        ...chartOptions,
                                        indexAxis: 'y',
                                        maintainAspectRatio: false
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default StudentFollowup;
