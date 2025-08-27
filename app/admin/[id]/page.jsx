"use client";
import { useParams } from "next/navigation";
import {
    useState, useEffect

} from "react";
import Cookies from 'js-cookie';
import { FaUser, FaEye, FaClock, FaList, FaTimes, FaWhatsapp, FaDownload, FaFilePdf, FaImage, FaGraduationCap, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRegCircle, FaChartBar, FaUsers, FaPlayCircle, FaTrophy, FaSearch, FaChartLine, FaUserCheck, FaClipboardCheck, FaStar, FaChevronDown, FaChevronUp, FaBookmark, FaPlay, FaHistory, FaBookOpen, FaBookReader, FaCircle, FaFileAlt, FaCalendar, FaCalendarAlt, FaCalendarWeek, FaQuestionCircle, FaChevronRight, FaChevronLeft, FaUserGraduate } from "react-icons/fa";
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { FaHeartCircleExclamation } from "react-icons/fa6";
import Link from "next/link";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Cookies.get('token')}`
});
export default function StudentProfilePage() {
    const params = useParams();
    const { id } = params;
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [watchHistory, setWatchHistory] = useState([]);
    const [quizResults, setQuizResults] = useState([]);
    const [studentRatings, setStudentRatings] = useState([]);
    const [whatsappNumbers, setWhatsappNumbers] = useState({});
    const [ratingStars, setRatingStars] = useState(3);
    const [ratingStatus, setRatingStatus] = useState('good');
    const [ratingComment, setRatingComment] = useState('');
    const [ratingLoading, setRatingLoading] = useState(false);
    const [editingRatingId, setEditingRatingId] = useState(null);
    const [allCourses, setAllCourses] = useState([]);
    const [allChapters, setAllChapters] = useState([]);
    const [allExams, setAllExams] = useState([]);
    const [studentProgress, setStudentProgress] = useState(null);
    const [expandedCourses, setExpandedCourses] = useState({});
    const [lessonFilter, setLessonFilter] = useState({}); // 'watched', 'unwatched' or null
    const [examFilter, setExamFilter] = useState('all'); // 'all', 'completed', 'pending'
    const [filteredExams, setFilteredExams] = useState([]);
    const [inactivityThreshold] = useState(7); // Days to consider a student inactive
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);


    // ✅ Define first
    const getCurrentWeek = () => {
        const now = new Date();
        const year = now.getFullYear();
        const week = Math.ceil((((now - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    };

    // ✅ Then use it here
    const [ratingWeek, setRatingWeek] = useState(getCurrentWeek());


    useEffect(() => {
        const fetchEnrolledUserData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/enrolled-user/${id}`, {
                    headers: getAuthHeaders()
                });
                const data = await response.json();
                if (data.success && data.data) {
                    setUserInfo(data.data.studentInfo || null);
                    setEnrolledCourses(data.data.enrollmentStatus?.enrolledCourses || []);
                } else {
                    setUserInfo(null);
                    setEnrolledCourses([]);
                }
            } catch (error) {
                setUserInfo(null);
                setEnrolledCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrolledUserData();
    }, [id]);

    // ✅ Define first

    const submitRating = async () => {
        setRatingLoading(true);
        try {
            console.log(userInfo.id)
            const method = editingRatingId ? 'PUT' : 'POST';
            const url = editingRatingId
                ? `${process.env.NEXT_PUBLIC_API_URL}/student-ratings/rate/${editingRatingId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/student-ratings/rate`;

            const response = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    studentId: userInfo.id,
                    week: ratingWeek,
                    stars: ratingStars,
                    status: ratingStatus,
                    comment: ratingComment
                })
            });

            const data = await response.json();

            if (data.success) {
                await fetchStudentRatings(userInfo.id);
                alert("تم حفظ التقييم بنجاح ✅");
                resetRatingForm(); // Clear edit mode after saving
            } else {
                alert("حدث خطأ أثناء الحفظ ❌");
            }
        } catch (error) {
            console.error("Error submitting rating", error);
            alert("فشل في إرسال التقييم");
        } finally {
            setRatingLoading(false);
        }
    };

    const resetRatingForm = () => {
        setRatingStars(3);
        setRatingStatus('good');
        setRatingComment('');
        setEditingRatingId(null);
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

    const prepareStudentChartData = () => {
        // Initialize with all enrolled courses
        const courseStats = {};

        // First, add all enrolled courses with zero stats
        if (selectedStudent && selectedStudent.enrollmentStatus?.enrolledCourses) {
            selectedStudent.enrollmentStatus.enrolledCourses.forEach(course => {
                const chapters = Array.isArray(course.chapters) ? course.chapters : [];
                courseStats[course.courseName] = {
                    totalViews: 0,
                    uniqueLessons: new Set(),
                    enrollmentDate: course.enrollmentDate,
                    totalLessons: chapters.reduce((total, chapter) =>
                        total + (Array.isArray(chapter.lessons) ? chapter.lessons.length : 0), 0)
                };
            });
        }

        // Then add watch history data if available
        if (watchHistory && watchHistory.length > 0) {
            watchHistory.forEach(entry => {
                const courseName = entry.courseId.name;
                if (!courseStats[courseName]) {
                    courseStats[courseName] = {
                        totalViews: 0,
                        uniqueLessons: new Set(),
                        enrollmentDate: null,
                        totalLessons: 0
                    };
                }
                courseStats[courseName].totalViews += entry.watchedCount;
                courseStats[courseName].uniqueLessons.add(entry.lessonId);
            });
        }

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
            }, {
                label: 'إجمالي الدروس المتاحة',
                data: Object.values(courseStats).map(stats => stats.totalLessons),
                backgroundColor: 'rgba(234, 179, 8, 0.5)',
                borderColor: 'rgb(234, 179, 8)',
                borderWidth: 1,
                borderDash: [5, 5]
            }]
        };
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
    const loadRatingForEdit = (rating) => {
        setRatingStars(rating.stars);
        setRatingStatus(rating.status);
        setRatingComment(rating.comment || '');
        setRatingWeek(rating.week);
        setEditingRatingId(rating._id); // We'll use this to know it's an edit
    };

    const filterExams = (allExams, quizResults) => {
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
    };

    useEffect(() => {
        // Always update filteredExams, even if quizResults is empty
        // This ensures pending exams will show when no quiz results exist
        if (allExams.length > 0) {
            setFilteredExams(filterExams(allExams, quizResults));
        } else {
            setFilteredExams(filterExams([], quizResults)); // Pass empty array but still call filterExams for synthetic creation
        }
    }, [examFilter, allExams, quizResults]);

    const fetchQuizResults = async (studentId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/examResult/result/${studentId}`, {
                headers: getAuthHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                setQuizResults([]);
                return;
            }
            const data = await response.json();
            // Use the results array directly from the API
            if (data && Array.isArray(data.results)) {
                setQuizResults(data.results);
            } else {
                setQuizResults([]);
            }
        } catch (error) {
            setQuizResults([]);
        }
    };

    const fetchStudentRatings = async (studentId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-ratings/student/${studentId}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();

            if (Array.isArray(data)) {
                setStudentRatings(data); // ✅ Correct handling for raw array
            } else {
                console.warn("Unexpected response format", data);
            }
        } catch (error) {
            console.error("Error fetching student ratings", error);
        }
    };

    const fetchWatchHistory = async (studentId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchHistory/student/${studentId}`, {
                headers: getAuthHeaders()
            });

            const data = await response.json();
            // Always expect { success, data: [...] }
            if (data.success && Array.isArray(data.data)) {
                // Sort by lastWatchedAt descending
                const sortedHistory = data.data.sort((a, b) =>
                    new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt)
                );
                setWatchHistory(sortedHistory);

                // Optionally update studentList if needed
                // ...your logic here...
            } else {
                setWatchHistory([]);
            }
        } catch (error) {
            console.error('Error fetching watch history:', error);
            setWatchHistory([]);
        }
    };




    const WatchHistorySection = () => {



        // Create a map of watched lessons by courseId for quick lookup
        const watchedLessonsMap = new Map();
        watchHistory.forEach(entry => {
            if (!watchedLessonsMap.has(entry.courseId.name)) {
                watchedLessonsMap.set(entry.courseId.name, new Set());
            }
            watchedLessonsMap.get(entry.courseId.name).add(entry.lessonId);
        });

        return (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">سجل المشاهدة</h3>
                        <p className="text-white/60 text-sm">تفاصيل مشاهدات الطالب للدروس المختلفة</p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                        <FaHistory className="text-blue-400 text-xl" />
                    </div>
                </div>
                <div className="space-y-6">
                    {/* Summary statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/20 group hover:border-blue-400/40 transition-all duration-300">
                            <div className="flex items-start justify-between mb-2">
                                <div className="text-sm text-white/70">إجمالي المشاهدات</div>
                                <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaEye className="text-blue-400 text-xl" />
                                </div>
                            </div>
                            <div className="text-3xl text-white font-bold">
                                {watchHistory.reduce((sum, entry) => sum + entry.watchedCount, 0)}
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/20 group hover:border-purple-400/40 transition-all duration-300">
                            <div className="flex items-start justify-between mb-2">
                                <div className="text-sm text-white/70">الدروس المشاهدة</div>
                                <div className="p-2 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaBookOpen className="text-purple-400" />
                                </div>
                            </div>
                            <div className="text-3xl text-white font-bold">
                                {new Set(watchHistory.map(entry => entry.lessonId)).size}
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/20 group hover:border-green-400/40 transition-all duration-300">
                            <div className="text-2xl font-bold text-green-400">
                                {enrolledCourses.length}
                            </div>
                            <div className="text-sm text-white/60">الكورسات المسجل فيها</div>
                        </div>
                    </div>

                    {/* Course List with Watch Status */}
                    <div className="space-y-4">
                        {enrolledCourses.map((course, courseIndex) => {
                            const totalLessons = course.chapters.reduce((total, chapter) =>
                                total + chapter.lessons.length, 0);
                            const watchedLessons = watchedLessonsMap.get(course.courseName)?.size || 0;
                            const progress = totalLessons > 0 ? (watchedLessons / totalLessons) * 100 : 0;

                            return (
                                <div key={courseIndex} className="bg-gradient-to-r from-slate-900/30 to-slate-800/30 rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300">
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/20 rounded-xl">
                                                    <FaGraduationCap className="text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg text-white font-medium mb-1">{course.courseName}</h4>
                                                    <span className="text-sm text-white/60">
                                                        تاريخ التسجيل: {new Date(course.enrollmentDate).toLocaleDateString('ar-EG')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2
                                                ${progress >= 80
                                                    ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/20'
                                                    : progress >= 50
                                                        ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/20'
                                                        : 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                <FaBookReader />
                                                <span>{watchedLessons} / {totalLessons} درس</span>
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${progress >= 80
                                                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                                                    : progress >= 50
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                                                        : 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                                                    }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Chapter List */}
                                    <div className="space-y-4 mt-6">
                                        {course.chapters.map((chapter, chapterIndex) => (
                                            <div key={chapterIndex} className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-purple-500/20 rounded-xl">
                                                        <FaBookmark className="text-purple-400" />
                                                    </div>
                                                    <h5 className="text-lg text-white font-medium">{chapter.chapterTitle}</h5>
                                                </div>
                                                <div className="space-y-3">
                                                    {chapter.lessons.map((lesson, lessonIndex) => {
                                                        const watchEntry = watchHistory.find(entry =>
                                                            entry.lessonTitle === lesson.lessonTitle && entry.courseId.name === course.courseName
                                                        );

                                                        return (
                                                            <div
                                                                key={lessonIndex}
                                                                className="flex items-center justify-between bg-gradient-to-r from-slate-900/30 to-slate-800/30 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-xl ${watchEntry ? 'bg-green-500/20' : 'bg-white/10'}`}>
                                                                        {lesson.isWatched || watchEntry ? (
                                                                            <FaPlay className="text-green-400" />
                                                                        ) : (
                                                                            <FaCircle className="text-white/40" />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-white font-medium">{lesson.lessonTitle}</span>
                                                                </div>
                                                                {watchEntry && (
                                                                    <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-xl">
                                                                        <FaEye className="text-green-400" />
                                                                        <span className="text-green-400 font-medium">
                                                                            {watchEntry.watchedCount} مشاهدة
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {enrolledCourses.length === 0 && (
                    <div className="text-center py-8 text-white/60">
                        الطالب غير مسجل في أي كورس
                    </div>
                )}
            </div>
        );
    };


    useEffect(() => {
        if (!id) return;
        fetchAllCoursesAndChapters();
        fetchQuizResults(id);
        fetchWatchHistory(id);
        fetchStudentRatings(id); // 👈 Add this line

        const token = Cookies.get('token');

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${id}/all-data`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {

                if (data.status === 'success') {
                    // Merge enrollments into userInfo for UI compatibility
                    setSelectedStudent({
                        ...data.data.userInfo,
                        enrollmentStatus: {
                            enrolledCourses: data.data.enrollments || []
                        }
                    });
                    setWhatsappNumbers({
                        [data.data.userInfo.email]: {
                            studentWhatsApp: data.data.userInfo.phoneNumber,
                            parentWhatsApp: data.data.userInfo.parentPhoneNumber,
                        }
                    });
                    setWatchHistory(data.data.activity.watchHistory || []);
                    // You can also set enrollments, etc. from data.data.enrollments
                }
            });

        // ...existing code...
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/watchHistory/student/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setWatchHistory(Array.isArray(data.data) ? data.data : []));

        // Quiz results
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/examResult/result/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setQuizResults(data.results || []));

        // Ratings
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-ratings/student/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setStudentRatings(Array.isArray(data) ? data : []));
    }, [id]);

    // Fetch all courses/chapters/lessons for unwatched logic
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/course/allCourses`, {
            headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        })
            .then(res => res.json())
            .then(data => setAllCourses(Array.isArray(data.data) ? data.data : []));
    }, [id]);

    if (!selectedStudent) {
        // Skeleton loading UI
        return (
            <div className="p-8">
                <style>{`
                .skeleton {
                    background: linear-gradient(90deg, #222 25%, #333 50%, #222 75%);
                    background-size: 200% 100%;
                    animation: skeleton-loading 1.2s infinite linear;
                }
                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
                <div className="space-y-6">
                    {/* Profile Header Skeleton */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-white/10 shadow-xl flex gap-8">
                        <div className="w-24 h-24 rounded-2xl skeleton" />
                        <div className="flex-1 space-y-4">
                            <div className="h-8 w-1/3 rounded skeleton" />
                            <div className="flex gap-4">
                                <div className="h-6 w-32 rounded skeleton" />
                                <div className="h-6 w-40 rounded skeleton" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="h-10 rounded skeleton" />
                                <div className="h-10 rounded skeleton" />
                            </div>
                        </div>
                    </div>
                    {/* Enrollment Status Skeleton */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-white/10 shadow-xl">
                        <div className="h-6 w-1/4 rounded skeleton mb-4" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-20 rounded skeleton" />
                            <div className="h-20 rounded skeleton" />
                        </div>
                    </div>
                    {/* Activity Status Skeleton */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-white/10 shadow-xl">
                        <div className="h-6 w-1/4 rounded skeleton mb-4" />
                        <div className="grid grid-cols-3 gap-6">
                            <div className="h-16 rounded skeleton" />
                            <div className="h-16 rounded skeleton" />
                            <div className="h-16 rounded skeleton" />
                        </div>
                    </div>
                    {/* Watch History Skeleton */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-white/10 shadow-xl">
                        <div className="h-6 w-1/4 rounded skeleton mb-4" />
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="h-12 rounded skeleton" />
                            <div className="h-12 rounded skeleton" />
                            <div className="h-12 rounded skeleton" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-10 rounded skeleton" />
                            <div className="h-10 rounded skeleton" />
                        </div>
                    </div>
                    {/* Exam Section Skeleton */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-white/10 shadow-xl">
                        <div className="h-6 w-1/4 rounded skeleton mb-4" />
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="h-16 rounded skeleton" />
                            <div className="h-16 rounded skeleton" />
                            <div className="h-16 rounded skeleton" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-10 rounded skeleton" />
                            <div className="h-10 rounded skeleton" />
                        </div>
                    </div>
                    {/* Chart Skeleton */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-white/10 shadow-xl">
                        <div className="h-6 w-1/4 rounded skeleton mb-4" />
                        <div className="h-64 rounded skeleton" />
                    </div>
                </div>
            </div>
        );
    }

    // TODO: Fetch student data by id and render profile
    return (

        <div className="p-4 md:p-8 w-full max-w-screen-xl mx-auto">
            <div className="flex flex-col gap-y-8 lg:gap-y-12">

                {/* Redesigned Student Profile Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
                    {/* Student Profile Header */}
                    {userInfo && (
                        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 lg:p-10 border border-white/10 shadow-xl flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transform hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/25">
                                    <span className="text-4xl text-white font-bold">
                                        {userInfo.name ? userInfo.name[0].toUpperCase() : ""}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-white mb-3">{userInfo.name}</h2>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl px-4 py-2 border border-blue-500/20">
                                            <FaEye className="text-blue-400" />
                                            <span className="text-white font-medium">
                                                {watchHistory.reduce((total, entry) => total + entry.watchedCount, 0)} مشاهدة
                                            </span>
                                        </div>
                                        {watchHistory.length > 0 && (
                                            <div className="flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl px-4 py-2 border border-green-500/20">
                                                <FaClock className="text-green-400" />
                                                <span className="text-white font-medium">
                                                    آخر نشاط: {new Date(watchHistory[0].lastWatchedAt).toLocaleDateString('ar-EG')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact Information */}
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Link href={`https://wa.me/20${userInfo.phoneNumber}`} target="_blank">
                                            <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-green-600/20 px-5 py-3 rounded-xl border border-green-500/20">
                                                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                                    <FaWhatsapp className="text-green-400 text-xl" />
                                                </div>
                                                <span className="text-white font-medium">رقم الطالب: {userInfo.phoneNumber}</span>
                                            </div>
                                        </Link>
                                        <Link href={`https://wa.me/20${userInfo.parentPhoneNumber}`} target="_blank">
                                            <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-green-600/20 px-5 py-3 rounded-xl border border-green-500/20">
                                                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                                    <FaWhatsapp className="text-green-400 text-xl" />
                                                </div>
                                                <span className="text-white font-medium">رقم ولي الأمر: {userInfo.parentPhoneNumber}</span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enrollment Status */}
                    {selectedStudent.enrollmentStatus?.enrolledCourses?.length > 0 && (
                        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 lg:p-10 border border-white/10 shadow-xl">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">الكورسات المشترك بها</h3>
                                    <p className="text-white/60 text-sm">قائمة الكورسات المسجل بها الطالب وحالة كل كورس</p>
                                </div>
                                <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaGraduationCap className="text-blue-400 text-xl" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                                {selectedStudent.enrollmentStatus.enrolledCourses.map((course, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 group">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <h4 className="text-lg font-medium text-white">{course.courseName}</h4>
                                                {course.fromPackage && course.packageName && (
                                                    <div className="text-xs text-blue-400 mt-1">من باقة: {course.packageName}</div>
                                                )}
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-xl text-sm font-medium ${course.paymentStatus === 'paid'
                                                ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/20'
                                                : 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                {course.paymentStatus === 'paid' ? 'مفعل' : 'قيد الانتظار'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/60 text-sm">
                                            <FaCalendar className="text-blue-400" />
                                            تاريخ التسجيل: {new Date(course.enrollmentDate).toLocaleDateString('ar-EG')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Activity Status */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 lg:p-10 border border-white/10 shadow-xl">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">حالة النشاط</h3>
                                <p className="text-white/60 text-sm">إحصائيات وتفاصيل نشاط الطالب</p>
                            </div>
                            <div className="p-2 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                <FaChartLine className="text-purple-400 text-xl" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/20 group hover:border-blue-400/40 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-sm text-white/70">إجمالي المشاهدات</div>
                                    <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                        <FaEye className="text-blue-400" />
                                    </div>
                                </div>
                                <div className="text-3xl text-white font-bold">
                                    {watchHistory.reduce((total, entry) => total + entry.watchedCount, 0)}
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/20 group hover:border-purple-400/40 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-sm text-white/70">الحالة</div>
                                    <div className="p-2 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                        <FaUserCheck className="text-purple-400" />
                                    </div>
                                </div>
                                <div className={`text-3xl font-bold ${selectedStudent.status?.color}`}>
                                    {selectedStudent.status?.label}
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/20 group hover:border-green-400/40 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-sm text-white/70">آخر نشاط</div>
                                    <div className="p-2 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                        <FaClock className="text-green-400" />
                                    </div>
                                </div>
                                <div className="text-2xl text-white font-bold">
                                    {watchHistory.length > 0
                                        ? new Date(watchHistory[0].lastWatchedAt).toLocaleDateString('ar-EG')
                                        : 'لم يبدأ بعد'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Watch History Section */}

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-4 md:p-8 lg:p-10 border border-white/10 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">تقييم الطالب الأسبوعي</h3>
                                <p className="text-white/60 text-sm">قم بتقييم أداء الطالب هذا الأسبوع</p>
                            </div>
                            <div className="p-2 bg-yellow-500/20 rounded-xl">
                                <FaStar className="text-yellow-400 text-xl" />
                            </div>
                        </div>

                        {/* Rating Form */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-6">
                            <div>
                                <label className="text-white/70 block mb-1">التقييم (نجوم)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={ratingStars}
                                    onChange={(e) => setRatingStars(Number(e.target.value))}
                                    className="w-full p-3 rounded-xl bg-white/5 text-white focus:outline-none border border-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-white/70 block mb-1">الحالة</label>
                                <select
                                    value={ratingStatus}
                                    onChange={(e) => setRatingStatus(e.target.value)}
                                    className="w-full font-arabicUI3 p-3 rounded-xl bg-white/5 text-white focus:outline-none border border-white/10"
                                >
                                    <option className='text-black' value="good">جيد</option>
                                    <option className='text-black' value="bad">ضعيف</option>
                                    <option className='text-black' value="average">متوسط</option>
                                    <option className='text-black' value="excellent">ممتاز</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-white/70 block mb-1">ملاحظة</label>
                                <input
                                    type="text"
                                    value={ratingComment}
                                    onChange={(e) => setRatingComment(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white/5 text-white focus:outline-none border border-white/10"
                                />
                            </div>

                        </div>
                        <button
                            onClick={submitRating}
                            disabled={ratingLoading}
                            className="px-6 py-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold transition"
                        >
                            {ratingLoading ? 'جارٍ الإرسال...' : 'حفظ التقييم'}
                        </button>

                        {editingRatingId && (
                            <button
                                onClick={resetRatingForm}
                                className="ml-4 px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold transition"
                            >
                                إلغاء التعديل
                            </button>
                        )}


                        {/* Past Ratings */}
                        <div className="mt-8">
                            <h4 className="text-white text-lg font-semibold mb-4">التقييمات السابقة</h4>
                            {studentRatings.map((rating, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/5 text-white">
                                    <div className="flex justify-between items-center">
                                        <div className="font-bold text-yellow-400">
                                            {rating.stars} ⭐ - {
                                                rating.status === 'good' ? 'جيد' :
                                                    rating.status === 'bad' ? 'ضعيف' :
                                                        rating.status === 'average' ? 'متوسط' :
                                                            rating.status === 'excellent' ? 'ممتاز' : rating.status
                                            }
                                        </div>
                                        <span className="text-sm text-white/60">{rating.week}</span>
                                    </div>
                                    {rating.comment && (
                                        <div className="mt-1 text-sm text-white/80">{rating.comment}</div>
                                    )}
                                    <button
                                        onClick={() => loadRatingForEdit(rating)}
                                        className="mt-2 text-sm text-blue-400 underline hover:text-blue-300"
                                    >
                                        تعديل
                                    </button>
                                </div>
                            ))}

                        </div>
                    </div>


                    <WatchHistorySection />

                    <div className="gap-4 md:gap-8 lg:gap-12">
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
                            <div key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 lg:p-10 border border-white/10 shadow-xl group">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{course.courseName}</h3>
                                        <p className="text-white/60 text-sm">سجل مشاهدة الطالب في هذا الكورس</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                            <FaPlayCircle className="text-blue-400 text-xl" />
                                        </div>
                                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                                            {course.totalViews} مشاهدة
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className=" gap-4 md:gap-6 lg:gap-8">
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
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-all duration-200 group"
                                        >
                                            {expandedCourses[course.courseId] ? (
                                                <FaChevronUp className="text-blue-400 group-hover:scale-110 transition-transform" />
                                            ) : (
                                                <FaChevronDown className="text-blue-400 group-hover:scale-110 transition-transform" />
                                            )}
                                            <span className="text-white font-medium">
                                                {expandedCourses[course.courseId] ? 'إخفاء الدروس' : 'عرض الدروس'}
                                            </span>
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
                                                <div key={chapterIdx} className="space-y-3 bg-gradient-to-r from-slate-900/30 to-slate-800/30 rounded-xl p-6 border border-white/5">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="p-2 bg-purple-500/20 rounded-xl">
                                                            <FaBookmark className="text-purple-400" />
                                                        </div>
                                                        <h4 className="text-lg text-white font-medium">{chapter.title}</h4>
                                                    </div>
                                                    {chapter.lessons.map((lesson, lessonIdx) => (
                                                        <div key={lessonIdx}
                                                            className="flex items-center justify-between bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 rounded-xl border border-green-500/10 hover:border-green-500/20 transition-all duration-300"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-green-500/20 rounded-xl">
                                                                    <FaPlay className="text-green-400" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-white font-medium">{lesson.lessonTitle}</span>
                                                                    <span className="text-sm text-white/50 flex items-center gap-2">
                                                                        <FaClock className="text-blue-400" />
                                                                        آخر مشاهدة: {new Date(lesson.lastWatchedAt).toLocaleDateString('ar-EG')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-xl">
                                                                <FaEye className="text-green-400" />
                                                                <span className="text-green-400 font-medium">
                                                                    {lesson.watchedCount} مشاهدة
                                                                </span>
                                                            </div>
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
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 lg:p-10 border border-white/10 shadow-xl">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">الاختبارات والتقييمات</h3>
                                <p className="text-white/60 text-sm">نتائج الطالب في الاختبارات والتقييمات المختلفة</p>
                            </div>
                            <div className="p-2 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                <FaClipboardCheck className="text-amber-400 text-xl" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8">
                            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl p-6 border border-amber-500/20 group hover:border-amber-400/40 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-sm text-white/70">معدل النجاح</div>
                                    <div className="p-2 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                        <FaTrophy className="text-amber-400" />
                                    </div>
                                </div>
                                <div className="text-3xl text-white font-bold">
                                    {quizResults.length > 0
                                        ? Math.round((quizResults.reduce((acc, quiz) => acc + ((quiz.correctAnswers / quiz.totalQuestions) * 100), 0) / quizResults.length)) + '%'
                                        : '0%'}
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/20 group hover:border-green-400/40 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-sm text-white/70">الاختبارات المكتملة</div>
                                    <div className="p-2 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                        <FaCheckCircle className="text-green-400" />
                                    </div>
                                </div>
                                <div className="text-3xl text-white font-bold">{quizResults.length}</div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/20 group hover:border-blue-400/40 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="text-sm text-white/70">أعلى درجة</div>
                                    <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                        <FaStar className="text-blue-400" />
                                    </div>
                                </div>
                                <div className="text-3xl text-white font-bold">
                                    {quizResults.length > 0
                                        ? Math.round(Math.max(...quizResults.map(quiz => (quiz.correctAnswers / quiz.totalQuestions * 100)))) + '%'
                                        : '0%'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {quizResults.length === 0 ? (
                                <div className="text-center py-8 text-white/60">
                                    لم يقم الطالب بإجراء أي اختبارات بعد
                                </div>
                            ) : (
                                quizResults.map((quiz, index) => {
                                    const score = quiz.totalQuestions > 0
                                        ? Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100)
                                        : 0;
                                    return (
                                        <div key={quiz._id || index} className="bg-gradient-to-r from-slate-900/30 to-slate-800/30 rounded-xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-500/20 rounded-xl">
                                                        <FaFileAlt className="text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-medium text-white mb-1">{quiz.examTitle}</h4>
                                                        <p className="text-sm text-white/60">محاولة {quiz.attemptNumber}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2
                            ${score >= 80
                                                        ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/20'
                                                        : score >= 60
                                                            ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/20'
                                                            : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/20'
                                                    }`}>
                                                    {score >= 80 ? <FaCheckCircle /> : score >= 60 ? <FaHeartCircleExclamation /> : <FaTimesCircle />}
                                                    <span>{quiz.correctAnswers}/{quiz.totalQuestions} ({score}%)</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-white/60">
                                                <div className="flex items-center gap-2">
                                                    <FaCalendar className="text-blue-400" />
                                                    <span>{quiz.examDate ? new Date(quiz.examDate).toLocaleDateString('ar-EG') : '—'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaQuestionCircle className="text-purple-400" />
                                                    <span>{quiz.totalQuestions} سؤال</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FaClock className="text-green-400" />
                                                    <span>
                                                        {typeof quiz.timeSpent === 'number'
                                                            ? `${Math.floor(quiz.timeSpent / 60)} دقيقة ${quiz.timeSpent % 60} ثانية`
                                                            : '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Chart */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 lg:p-10 border border-white/10 shadow-xl">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">نشاط المشاهدة</h3>
                                <p className="text-white/60 text-sm">رسم بياني يوضح نشاط مشاهدة الطالب للدروس</p>
                            </div>
                            <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                <FaChartBar className="text-blue-400 text-xl" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-slate-900/30 to-slate-800/30 rounded-xl p-4 md:p-6 lg:p-8 border border-white/5 overflow-x-auto max-w-full">
                            <div className="h-[400px]">
                                <Bar
                                    data={prepareStudentChartData(selectedStudent)}
                                    options={{
                                        ...chartOptions,
                                        indexAxis: 'y',
                                        maintainAspectRatio: false,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: {
                                                display: false
                                            }
                                        },
                                        scales: {
                                            ...chartOptions.scales,
                                            x: {
                                                ...chartOptions.scales?.x,
                                                grid: {
                                                    color: 'rgba(255, 255, 255, 0.05)'
                                                }
                                            },
                                            y: {
                                                ...chartOptions.scales?.y,
                                                grid: {
                                                    color: 'rgba(255, 255, 255, 0.05)'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                </div>
                {/* Course Progress Grid */}

            </div>
        </div>
    );
}
