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
    const [sortBy, setSortBy] = useState('views'); // 'views', 'recent' or 'inactive'
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
    const [lessonFilter, setLessonFilter] = useState({}); // 'watched', 'unwatched' or null
    const [examFilter, setExamFilter] = useState('all'); // 'all', 'completed', 'pending'
    const [filteredExams, setFilteredExams] = useState([]);
    const [inactivityThreshold] = useState(7); // Days to consider a student inactive
    const [watchHistory, setWatchHistory] = useState([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLessonData();
        fetchAllCoursesAndChapters();
    }, [currentPage, sortBy, searchTerm]);

    const fetchLessonData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: studentsPerPage.toString(),
                sortBy: sortBy,
                ...(searchTerm && { search: searchTerm })
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/all-students-status?${queryParams}`, {
                headers: getAuthHeaders()
            });

            const studentsData = await response.json();

            if (studentsData.success) {
                // Update pagination info
                setTotalPages(studentsData.totalPages);
                setTotalStudents(studentsData.totalStudents);

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
                    uniqueStudents: studentsData.totalStudents, // Use total from server
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
        } finally {
            setLoading(false);
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course/allCourses`, {
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
                );                // Process exams
                const processedExams = coursesData.flatMap(course => {
                    if (!course.exams || !Array.isArray(course.exams)) {
                        return [];
                    }
                    return course.exams.map(exam => ({
                        id: exam._id,
                        title: exam.title,
                        duration: exam.duration,
                        courseId: course._id,
                        courseName: course.name,
                        questions: exam.questions
                    }));
                });

                setAllCourses(processedCourses);
                setAllChapters(processedChapters);
                setAllExams(processedExams);
            }
        } catch (error) {
            console.error('Error fetching course data:', error);
        }
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
    }; const prepareStudentChartData = () => {
        if (!watchHistory || watchHistory.length === 0) {
            return {
                labels: [],
                datasets: []
            };
        }

        // Group by course and calculate total views
        const courseStats = watchHistory.reduce((acc, entry) => {
            const courseName = entry.courseId.name;
            if (!acc[courseName]) {
                acc[courseName] = {
                    totalViews: 0,
                    uniqueLessons: new Set()
                };
            }
            acc[courseName].totalViews += entry.watchedCount;
            acc[courseName].uniqueLessons.add(entry.lessonId);
            return acc;
        }, {});

        // Prepare chart data
        return {
            labels: Object.keys(courseStats),
            datasets: [{
                label: 'عدد المشاهدات',
                data: Object.values(courseStats).map(stats => stats.totalViews),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }, {
                label: 'عدد الدروس المشاهدة',
                data: Object.values(courseStats).map(stats => stats.uniqueLessons.size),
                backgroundColor: 'rgba(147, 51, 234, 0.5)',
                borderColor: 'rgb(147, 51, 234)',
                borderWidth: 1
            }]
        };
    };

    const fetchQuizResults = async (studentId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/examResult/result/${studentId}`, {
                headers: getAuthHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // If no results found, set empty array instead of throwing error
                    setQuizResults([]);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            } const data = await response.json();
            // Remove console.log in production
            // 
            // (data);

            // The results array is directly in the data object, not in a nested 'results' property
            if (data && Array.isArray(data.results)) {
                const processedResults = data.results.map(result => ({
                    nameofquiz: result.examTitle,
                    numofqus: result.totalQuestions,
                    quizGrade: result.correctAnswers,
                    submittedAt: result.examDate,
                    attemptNumber: result.attemptNumber
                }));
                setQuizResults(processedResults);
            } else {
                // If data format is unexpected, set empty array
                setQuizResults([]);
            }
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            // In case of any error, set empty array
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

            // Filter watch history for this course
            const courseWatchHistory = watchHistory.filter(entry =>
                entry.courseId._id === course.id
            );

            // Get unique watched lessons
            const watchedLessonsSet = new Set(courseWatchHistory.map(entry => entry.lessonId));
            const watchedLessonsCount = watchedLessonsSet.size;

            // Calculate total views for this course
            const totalViews = courseWatchHistory.reduce((sum, entry) => sum + entry.watchedCount, 0);

            // Find unwatched lessons
            const unwatchedLessons = courseChapters.flatMap(chapter => {
                const chapterHistory = courseWatchHistory.filter(entry =>
                    entry.chapterId._id === chapter.id
                );

                const watchedIds = new Set(chapterHistory.map(entry => entry.lessonId));

                return (chapter.lessons || [])
                    .filter(lesson => !watchedIds.has(lesson.id))
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
                watchedLessons: courseWatchHistory,
                watchedLessonsCount,
                totalViews, completion: totalLessons > 0 ? (watchedLessonsCount / totalLessons) * 100 : 0,
                examsTotal: course.exams?.length || 0,
                // Count only exams completed for this course
                examsCompleted: quizResults.filter(result =>
                    allExams.some(exam => exam.title === result.nameofquiz && exam.courseId === course.id)
                ).length,
                unwatchedLessons,
                courseChapters
            };
        }).filter(course => course.totalLessons > 0);

        setStudentProgress(progress);
    }; const filterExams = (allExams, quizResults) => {
        // Group quiz results by exam title to get the latest attempt
        const latestAttempts = (quizResults || []).reduce((acc, result) => {
            if (!acc[result.nameofquiz] ||
                acc[result.nameofquiz].attemptNumber < result.attemptNumber) {
                acc[result.nameofquiz] = result;
            }
            return acc;
        }, {});

        const completedExamIds = new Set(Object.keys(latestAttempts));

        // If we have no exams data but have quiz results, create synthetic exam objects from quiz results
        if (allExams.length === 0 && quizResults.length > 0) {
            console.log("Creating synthetic exam objects from quiz results");
            const syntheticExams = [...new Set(quizResults.map(q => q.nameofquiz))].map(title => ({
                id: title, // Using title as ID since we don't have actual IDs
                title: title,
                courseId: "unknown", // We don't know the course ID
                courseName: "Unknown Course",
                isSynthetic: true // Mark as synthetic so we know it wasn't from API
            }));

            // For filter functionality
            switch (examFilter) {
                case 'completed':
                    return syntheticExams; // All are completed since they're from quiz results
                case 'pending':
                    return []; // None are pending since all are from quiz results
                default:
                    return syntheticExams;
            }
        }

        // Normal filtering if we have exam data
        switch (examFilter) {
            case 'completed':
                return allExams.filter(exam => completedExamIds.has(exam.title));
            case 'pending':
                return allExams.filter(exam => !completedExamIds.has(exam.title));
            default:
                return allExams;
        }
    }; useEffect(() => {
        // Always update filteredExams, even if quizResults is empty
        // This ensures pending exams will show when no quiz results exist
        if (allExams.length > 0) {
            setFilteredExams(filterExams(allExams, quizResults));
        } else {
            setFilteredExams(filterExams([], quizResults)); // Pass empty array but still call filterExams for synthetic creation
        }
    }, [examFilter, allExams, quizResults]);

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setActiveTab('details');
        const studentData = whatsappNumbers[student.email];
        if (studentData && studentData.studentId) {
            fetchQuizResults(studentData.studentId);
            fetchWatchHistory(studentData.studentId);
        }
        calculateStudentProgress(student);
    };

    const fetchWatchHistory = async (studentId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchHistory/student/${studentId}`, {
                headers: getAuthHeaders()
            });

            const data = await response.json();
            if (data.success) {
                const sortedHistory = data.data.sort((a, b) =>
                    new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt)
                );
                setWatchHistory(sortedHistory);

                // Update student's total views and unique lessons in the student list
                if (selectedStudent) {
                    const totalViews = sortedHistory.reduce((sum, entry) => sum + entry.watchedCount, 0);
                    const uniqueLessons = new Set(sortedHistory.map(entry => entry.lessonId)).size;

                    setStudentList(prevList =>
                        prevList.map(student =>
                            student.email === selectedStudent.email
                                ? {
                                    ...student,
                                    totalViews,
                                    uniqueLessons,
                                    hasWatchHistory: true,
                                    lastViewed: sortedHistory[0]?.lastWatchedAt
                                }
                                : student
                        )
                    );
                }
            }
        } catch (error) {
            console.error('Error fetching watch history:', error);
            setWatchHistory([]);
        }
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
    }; const ExamSection = () => {
        console.log("ExamSection rendering with:", {
            filteredExamsCount: filteredExams.length,
            quizResultsCount: quizResults.length,
            currentFilter: examFilter,
            allExamsCount: allExams.length
        });

        return (
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

                {filteredExams.length === 0 && (
                    <div className="text-center py-8 text-white/60">
                        لا توجد اختبارات متاحة {examFilter === 'completed' ? 'تم إجتيازها' : examFilter === 'pending' ? 'قيد الانتظار' : ''}
                    </div>
                )}                {filteredExams.length === 0 && (
                    <div className="text-center py-8 text-white/60">
                        لا توجد اختبارات متاحة {examFilter === 'completed' ? 'تم إجتيازها' : examFilter === 'pending' ? 'قيد الانتظار' : ''}
                    </div>
                )}

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
    };

    const WatchHistorySection = () => (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">سجل المشاهدة</h3>            {watchHistory.length > 0 ? (
                <div className="space-y-6">
                    {/* Summary statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-400">
                                {watchHistory.reduce((sum, entry) => sum + entry.watchedCount, 0)}
                            </div>
                            <div className="text-sm text-white/60">إجمالي المشاهدات</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-2xl font-bold text-purple-400">
                                {new Set(watchHistory.map(entry => entry.lessonId)).size}
                            </div>
                            <div className="text-sm text-white/60">الدروس المشاهدة</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-400">
                                {new Set(watchHistory.map(entry => entry.courseId._id)).size}
                            </div>
                            <div className="text-sm text-white/60">الكورسات النشطة</div>
                        </div>
                    </div>

                    {/* Watch history list */}
                    <div className="space-y-4">
                        {watchHistory.map((entry, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h4 className="text-white font-medium">{entry.lessonTitle}</h4>
                                        <p className="text-sm text-white/60">
                                            {entry.courseId?.name} - {entry.chapterId?.title}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-2">
                                                <FaEye className="text-blue-400" />
                                                <span className="text-sm text-white/60">
                                                    {entry.watchedCount} مشاهدة
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FaClock className="text-purple-400" />
                                                <span className="text-sm text-white/60">
                                                    آخر مشاهدة: {new Date(entry.lastWatchedAt).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-white/60">
                    لا يوجد سجل مشاهدة
                </div>
            )}
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
                                    onClick={() => {
                                        setSortBy('views');
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-arabicUI3 transition-colors
                                        ${sortBy === 'views'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                                >
                                    ترتيب حسب المشاهدات
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('recent');
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg font-arabicUI3 transition-colors
                                        ${sortBy === 'recent'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                                >
                                    ترتيب حسب آخر نشاط
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('inactive');
                                        setCurrentPage(1);
                                    }}
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

                        {/* Search and Pagination Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="البحث عن طالب..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {loading && (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                )}
                            </div>

                            <div className="text-white/70 text-sm">
                                عرض {((currentPage - 1) * studentsPerPage) + 1} - {Math.min(currentPage * studentsPerPage, totalStudents)} من {totalStudents} طالب
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                                    <span className="ml-4 text-white/70">جاري تحميل البيانات...</span>
                                </div>
                            ) : studentList.length === 0 ? (
                                <div className="text-center py-12 text-white/60">
                                    {searchTerm ? 'لم يتم العثور على طلاب مطابقين للبحث' : 'لا توجد بيانات طلاب'}
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="border-b border-white/10">
                                        <tr className="text-white/70">
                                            <th className="py-3 px-4 text-right">الطالب</th>
                                            <th className="py-3 px-4 text-center">رقم الطالب</th>
                                            <th className="py-3 px-4 text-center">رقم ولي الأمر</th>
                                            <th className="py-3 px-4 text-center">الدروس المشاهدة</th>
                                            <th className="py-3 px-4 text-center">آخر نشاط</th>
                                            <th className="py-3 px-4 text-center">تفاصيل</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {studentList.map((student, index) => (
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

                                                <td dir='rtl' className="py-4 px-4 text-center">
                                                    {student.uniqueLessons}       درس
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
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-6">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-white/5 disabled:opacity-50 rounded-lg transition-colors text-white"
                                >
                                    السابق
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => setCurrentPage(pageNumber)}
                                                className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNumber
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-white/5 disabled:opacity-50 rounded-lg transition-colors text-white"
                                >
                                    التالي
                                </button>
                            </div>
                        )}
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
                                            <h2 className="text-2xl font-bold text-white mb-2">{selectedStudent.userName}</h2>                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1">
                                                    <FaEye className="text-blue-400" />
                                                    <span className="text-white">
                                                        {watchHistory.reduce((total, entry) => total + entry.watchedCount, 0)} مشاهدة
                                                    </span>
                                                </div>
                                                {watchHistory.length > 0 && (
                                                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1">
                                                        <FaClock className="text-green-400" />
                                                        <span className="text-white">
                                                            آخر نشاط: {new Date(watchHistory[0].lastWatchedAt).toLocaleDateString('ar-EG')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contact Information */}
                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {whatsappNumbers[selectedStudent.email]?.studentWhatsApp && (
                                                    <a href={`https://wa.me/2${whatsappNumbers[selectedStudent.email].studentWhatsApp}`}
                                                        target="_blank"
                                                        className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 px-4 py-2 rounded-lg transition-colors">
                                                        <FaWhatsapp className="text-green-400" />
                                                        <span className="text-white">رقم الطالب: {whatsappNumbers[selectedStudent.email].studentWhatsApp}</span>
                                                    </a>
                                                )}
                                                {whatsappNumbers[selectedStudent.email]?.parentWhatsApp && (
                                                    <a href={`https://wa.me/2${whatsappNumbers[selectedStudent.email].parentWhatsApp}`}
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                                <div className="bg-white/5 rounded-lg p-4">
                                        <div className="text-sm text-white/70 mb-1">إجمالي المشاهدات</div>
                                        <div className="text-2xl text-white font-bold">
                                            {watchHistory.reduce((total, entry) => total + entry.watchedCount, 0)}
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
                                                {watchHistory.length > 0
                                                    ? new Date(watchHistory[0].lastWatchedAt).toLocaleDateString('ar-EG')
                                                    : 'لم يبدأ بعد'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Watch History Section */}
                                <WatchHistorySection />
                            </div>
                        )}                        {/* Course Progress Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Group watchHistory by courseId */}
                            {Object.values(watchHistory.reduce((acc, entry) => {
                                const courseId = entry.courseId._id;
                                if (!acc[courseId]) {
                                    acc[courseId] = {
                                        courseId: courseId,
                                        courseName: entry.courseId.name,
                                        chapters: {},
                                        totalViews: 0,
                                        uniqueLessons: new Set(),
                                        watchedLessons: []
                                    };
                                }

                                // Add lesson to unique lessons set
                                acc[courseId].uniqueLessons.add(entry.lessonId);

                                // Add to total views
                                acc[courseId].totalViews += entry.watchedCount;

                                // Add to watched lessons array
                                acc[courseId].watchedLessons.push({
                                    lessonId: entry.lessonId,
                                    lessonTitle: entry.lessonTitle,
                                    chapterTitle: entry.chapterId.title,
                                    watchedCount: entry.watchedCount,
                                    lastWatchedAt: entry.lastWatchedAt
                                });

                                // Group by chapters
                                if (!acc[courseId].chapters[entry.chapterId._id]) {
                                    acc[courseId].chapters[entry.chapterId._id] = {
                                        title: entry.chapterId.title,
                                        lessons: []
                                    };
                                }
                                acc[courseId].chapters[entry.chapterId._id].lessons.push({
                                    lessonId: entry.lessonId,
                                    lessonTitle: entry.lessonTitle,
                                    watchedCount: entry.watchedCount,
                                    lastWatchedAt: entry.lastWatchedAt
                                });

                                return acc;
                            }, {})).map((course, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white">{course.courseName}</h3>
                                        <div className="text-2xl font-bold text-blue-400">
                                            {course.totalViews} مشاهدة
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 rounded-lg p-4">
                                                <div className="text-sm text-white/70 mb-1">الدروس المشاهدة</div>
                                                <div className="text-xl text-white font-bold">
                                                    {course.uniqueLessons.size} درس
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-4">
                                                <div className="text-sm text-white/70 mb-1">الفصول</div>
                                                <div className="text-xl text-white font-bold">
                                                    {Object.keys(course.chapters).length} فصل
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
                                        </div>                                        {/* Chapters and Lessons List */}
                                        {expandedCourses[course.courseId] && (
                                            <div className="mt-4 space-y-4">
                                                {Object.values(course.chapters).map((chapter, chapterIdx) => (
                                                    <div key={chapterIdx} className="space-y-2">
                                                        <h4 className="text-white font-medium mb-2">{chapter.title}</h4>
                                                        {chapter.lessons.map((lesson, lessonIdx) => (
                                                            <div key={lessonIdx}
                                                                className="flex items-center justify-between bg-green-500/10 text-white/70 p-3 rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <FaEye className="text-green-400" />
                                                                    <div className="flex flex-col">
                                                                        <span>{lesson.lessonTitle}</span>
                                                                        <span className="text-xs text-white/50">
                                                                            آخر مشاهدة: {new Date(lesson.lastWatchedAt).toLocaleDateString('ar-EG')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <span className="text-sm text-green-400">
                                                                    {lesson.watchedCount} مشاهدة
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
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
