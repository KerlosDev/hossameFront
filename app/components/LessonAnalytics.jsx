'use client';
import { useEffect, useRef, useState } from 'react';
import GlobalApi from '../api/GlobalApi';
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
import { FaUser, FaEye, FaClock, FaList, FaTimes, FaWhatsapp, FaDownload, FaFilePdf, FaImage, FaGraduationCap, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
const { decrypt } = require('../utils/encryption');
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const LessonAnalytics = () => {
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
    const [sortBy, setSortBy] = useState('views'); // 'views' or 'recent'
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

    useEffect(() => {
        fetchLessonData();
        fetchWhatsappNumbers();
        fetchAllCoursesAndChapters();
    }, []);

    const fetchLessonData = async () => {
        try {
            const result = await GlobalApi.getStudentHistory();
            const history = JSON.parse(result.historyOfStudent?.historyy || '[]');
            processData(history);
        } catch (error) {
            console.error('Error fetching lesson data:', error);
        }
    };

    const fetchWhatsappNumbers = async () => {
        try {
            const result = await GlobalApi.getWhatsAppData();
            if (result?.whatsappdata?.whatsappnumber) {
                try {
                    // Handle encrypted data
                    if (typeof result.whatsappdata.whatsappnumber === 'string') {
                        const decryptedData = decrypt(result.whatsappdata.whatsappnumber);
                        const parsedData = JSON.parse(decryptedData);

                        // Convert array to object with userEmail as key
                        const whatsappObject = (Array.isArray(parsedData) ? parsedData : []).reduce((acc, item) => {
                            acc[item.userEmail] = {
                                studentWhatsApp: item.studentWhatsApp,
                                parentWhatsApp: item.parentWhatsApp
                            };
                            return acc;
                        }, {});

                        setWhatsappNumbers(whatsappObject);
                    } else {
                        // Handle already parsed data
                        const whatsappObject = result.whatsappdata.whatsappnumber.reduce((acc, item) => {
                            acc[item.userEmail] = {
                                studentWhatsApp: item.studentWhatsApp,
                                parentWhatsApp: item.parentWhatsApp
                            };
                            return acc;
                        }, {});
                        setWhatsappNumbers(whatsappObject);
                    }
                } catch (decryptError) {
                    console.error('Error decrypting WhatsApp data:', decryptError);
                    setWhatsappNumbers({});
                }
            }
        } catch (error) {
            console.error('Error fetching WhatsApp numbers:', error);
            setWhatsappNumbers({});
        }
    };

    const fetchAllCoursesAndChapters = async () => {
        try {
            const [coursesResult, chaptersResult, examsResult] = await Promise.all([
                GlobalApi.getAllCourseList(),
                GlobalApi.getChaptersData(),
                GlobalApi.getAllExams()
            ]);
            setAllCourses(coursesResult.courses || []);
            setAllChapters(chaptersResult.chapters || []);
            setAllExams(examsResult.exams || []);
        } catch (error) {
            console.error('Error fetching course data:', error);
        }
    };

    const processData = (data) => {
        // Count views per lesson
        const lessonViews = data.reduce((acc, item) => {
            const key = `${item.chapterTitle} - ${item.lessonTitle}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        // Count total views per student
        const studentViews = data.reduce((acc, item) => {
            acc[item.userEmail] = (acc[item.userEmail] || 0) + 1;
            return acc;
        }, {});

        // Process student data with per-lesson view counts
        const studentData = data.reduce((acc, item) => {
            const lessonKey = `${item.chapterTitle} - ${item.lessonTitle}`;

            if (!acc[item.userEmail]) {
                acc[item.userEmail] = {
                    email: item.userEmail,
                    totalViews: 0,
                    lastViewed: '',
                    lessonViews: {}, // Track views per lesson
                    lessons: new Set()
                };
            }

            // Increment total views
            acc[item.userEmail].totalViews++;

            // Increment lesson-specific views
            acc[item.userEmail].lessonViews[lessonKey] =
                (acc[item.userEmail].lessonViews[lessonKey] || 0) + 1;

            acc[item.userEmail].lessons.add(lessonKey);
            acc[item.userEmail].lastViewed = item.timestamp;
            return acc;
        }, {});

        const studentList = Object.values(studentData).map(student => ({
            ...student,
            views: student.totalViews,
            uniqueLessons: student.lessons.size,
            lessons: Array.from(student.lessons),
            lessonViews: student.lessonViews
        }));

        // Prepare chart data
        const labels = Object.keys(lessonViews);
        const viewCounts = Object.values(lessonViews);

        setChartData({
            labels,
            datasets: [
                {
                    label: 'عدد المشاهدات',
                    data: viewCounts,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    borderRadius: 4,
                }
            ]
        });

        setStudentList(studentList);

        // Calculate stats
        setStats({
            totalViews: data.length,
            uniqueStudents: new Set(data.map(item => item.userEmail)).size,
            mostViewedLesson: Object.entries(lessonViews).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
            mostActiveStudent: Object.entries(studentViews).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        });
    };

    const sortStudents = (students) => {
        return [...students].sort((a, b) => {
            if (sortBy === 'views') {
                return b.views - a.views;
            }
            return new Date(b.lastViewed) - new Date(a.lastViewed);
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

    const getWhatsAppLink = (number) => {
        if (!number) return '#';
        return `https://wa.me/${number.startsWith('0') ? '2' + number : number}`;
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

    const fetchQuizResults = async (email) => {
        try {
            const results = await GlobalApi.getQuizJsonResult(email);
            setQuizResults(results.quizresults || []);
        } catch (error) {
            console.error('Error fetching quiz results:', error);
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
        const completedExamIds = new Set(quizResults.map(r => r.nameofquiz));

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
        fetchQuizResults(student.email);
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
                    const result = quizResults.find(r => r.nameofquiz === exam.title);
                    const isCompleted = !!result;
                    const linkedCourse = allCourses.find(c =>
                        c.id === exam.courseId || c.nameofcourse === exam.courseName
                    );

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
                                            <div className="flex items-center gap-2">
                                                <FaClock className="text-purple-400" />
                                                <p className="text-sm text-white/60">
                                                    {new Date(result.submittedAt).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isCompleted && (
                                    <div className="px-3 py-1 bg-green-500/20 rounded-lg text-green-400 text-sm">
                                        {result.quizGrade} / {result.numofqus}
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
                                        <tr key={student.email} className="text-white/90 hover:bg-white/5">
                                            {/* Email cell */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                        <FaUser className="text-blue-400" />
                                                    </div>
                                                    <div className="font-medium">{student.email}</div>
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
                                                {selectedStudent.email[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-white mb-2">{selectedStudent.email}</h2>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1">
                                                    <FaEye className="text-blue-400" />
                                                    <span className="text-white">{selectedStudent.totalViews} مشاهدة</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1">
                                                    <FaList className="text-purple-400" />
                                                    <span className="text-white">{selectedStudent.uniqueLessons} درس</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1">
                                                    <FaClock className="text-green-400" />
                                                    <span className="text-white">آخر نشاط: {formatDate(selectedStudent.lastViewed)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {whatsappNumbers[selectedStudent.email]?.studentWhatsApp && (
                                                <a href={getWhatsAppLink(whatsappNumbers[selectedStudent.email].studentWhatsApp)}
                                                    className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 px-4 py-2 rounded-lg transition-colors"
                                                    target="_blank" rel="noopener noreferrer">
                                                    <FaWhatsapp className="text-green-400" />
                                                    <span className="text-white">رقم الطالب :{whatsappNumbers[selectedStudent.email].studentWhatsApp}</span>
                                                </a>
                                            )}
                                            {whatsappNumbers[selectedStudent.email]?.parentWhatsApp && (
                                                <a href={getWhatsAppLink(whatsappNumbers[selectedStudent.email].parentWhatsApp)}
                                                    className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 px-4 py-2 rounded-lg transition-colors"
                                                    target="_blank" rel="noopener noreferrer">
                                                    <FaWhatsapp className="text-green-400" />
                                                    <span className="text-white/70">ولي الأمر: {whatsappNumbers[selectedStudent.email].parentWhatsApp}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

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

                                v
                                {/* Add this before Recent Activity Chart */}
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
                                                maintainAspectRatio: false,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div >
                        )}
                    </div >
                )
            )}
        </div >
    );
};

export default LessonAnalytics;
