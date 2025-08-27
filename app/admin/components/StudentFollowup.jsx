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
import { jsPDF } from 'jspdf';
import { Bar, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { FaUser, FaEye, FaClock, FaList, FaTimes, FaWhatsapp, FaDownload, FaFilePdf, FaImage, FaGraduationCap, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaRegCircle, FaChartBar, FaUsers, FaPlayCircle, FaTrophy, FaSearch, FaChartLine, FaUserCheck, FaClipboardCheck, FaStar, FaChevronDown, FaChevronUp, FaBookmark, FaPlay, FaHistory, FaBookOpen, FaBookReader, FaCircle, FaFileAlt, FaCalendar, FaCalendarAlt, FaCalendarWeek, FaQuestionCircle, FaChevronRight, FaChevronLeft, FaUserGraduate } from "react-icons/fa";
import Cookies from 'js-cookie';
import { FaHeartCircleExclamation } from 'react-icons/fa6';

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
        mostActiveStudent: '',
        viewsLast24Hours: 0,
        viewsLastWeek: 0,
        viewsLastMonth: 0,
        mostViewedLessonData: null,
        mostActiveStudentData: null
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
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'details', or 'enrolled'
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
    const [isMostViewedLessonExpanded, setIsMostViewedLessonExpanded] = useState(false);

    // Enrolled students state
    const [enrolledStudentList, setEnrolledStudentList] = useState([]);
    const [enrolledCurrentPage, setEnrolledCurrentPage] = useState(1);
    const [enrolledTotalPages, setEnrolledTotalPages] = useState(0);
    const [enrolledTotalStudents, setEnrolledTotalStudents] = useState(0);
    const [enrolledLoading, setEnrolledLoading] = useState(false);
    const [enrolledSearchTerm, setEnrolledSearchTerm] = useState('');
    const [enrolledSortBy, setEnrolledSortBy] = useState('views'); // 'views', 'recent' or 'inactive'
    const [enrolledCourseFilter, setEnrolledCourseFilter] = useState('all'); // Add this state near other enrolled tab states

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage, setStudentsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [studentRatings, setStudentRatings] = useState([]);
    const [ratingStars, setRatingStars] = useState(3);
    const [ratingStatus, setRatingStatus] = useState('good');
    const [ratingComment, setRatingComment] = useState('');
    const [ratingLoading, setRatingLoading] = useState(false);
    const [editingRatingId, setEditingRatingId] = useState(null); // null = not editing

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
        fetchLessonData();
        fetchAllCoursesAndChapters();
        fetchViewsStatistics(); // Add this new function call
    }, [currentPage, sortBy, searchTerm, studentsPerPage]);

    // Effect to fetch enrolled students when tab changes or pagination/filter changes
    useEffect(() => {
        if (activeTab === 'enrolled') {
            fetchEnrolledStudents();
        }
    }, [activeTab, enrolledCurrentPage, enrolledSortBy, enrolledSearchTerm, studentsPerPage]);

    // Function to fetch views statistics
    const fetchViewsStatistics = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/views-statistics`, {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                setStats(prevStats => {
                    // Format most viewed lesson text
                    let mostViewedLessonText = 'لم يتم تحديده';
                    if (data.data.mostViewedLesson) {
                        const mvl = data.data.mostViewedLesson;
                        mostViewedLessonText = `${mvl.lessonTitle} (${mvl.courseName})`;
                    }

                    // Format most active student text
                    let mostActiveStudentText = 'لا يوجد';
                    if (data.data.mostActiveStudent) {
                        const mas = data.data.mostActiveStudent;
                        mostActiveStudentText = mas.email;
                    }

                    return {
                        ...prevStats,
                        totalViews: data.data.totalViews,
                        viewsLast24Hours: data.data.last24Hours,
                        viewsLastWeek: data.data.lastWeek,
                        viewsLastMonth: data.data.lastMonth,
                        mostViewedLesson: mostViewedLessonText,
                        mostActiveStudent: mostActiveStudentText,
                        // Store the full objects as well for potential future use
                        mostViewedLessonData: data.data.mostViewedLesson,
                        mostActiveStudentData: data.data.mostActiveStudent
                    };
                });
            }
        } catch (error) {
            console.error('Error fetching views statistics:', error);
        }
    };

    const fetchEnrolledStudents = async () => {
        try {
            setEnrolledLoading(true);
            const queryParams = new URLSearchParams({
                page: enrolledCurrentPage.toString(),
                limit: studentsPerPage.toString(),
                sortBy: enrolledSortBy,
                ...(enrolledSearchTerm && { search: enrolledSearchTerm })
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/enrolled-students?${queryParams}`, {
                headers: getAuthHeaders()
            });

            const studentsData = await response.json();

            if (studentsData.success) {
                // Update pagination info
                setEnrolledTotalPages(studentsData.totalPages);
                setEnrolledTotalStudents(studentsData.totalStudents);

                // Update whatsappNumbers object for enrolled students
                const enrolledWhatsappObject = studentsData.data.reduce((acc, student) => {
                    acc[student.studentInfo.email] = {
                        studentId: student.studentInfo.id,
                        studentWhatsApp: student.studentInfo.phoneNumber,
                        parentWhatsApp: student.studentInfo.parentPhoneNumber,
                        name: student.studentInfo.name,
                        lastActive: student.studentInfo.lastActivity,
                        status: student.activityStatus.status,
                        totalWatchedLessons: student.activityStatus.totalWatchedLessons,
                        isEnrolled: student.enrollmentStatus.isEnrolled,
                        enrolledCourses: student.enrollmentStatus.enrolledCourses.map(course => ({
                            courseName: course.courseName,
                            enrollmentDate: course.enrollmentDate,
                            paymentStatus: course.paymentStatus,
                            chapters: course.chapters.map(chapter => ({
                                chapterTitle: chapter.chapterTitle,
                                lessons: chapter.lessons.map(lesson => ({
                                    lessonTitle: lesson.lessonTitle,
                                    isWatched: lesson.isWatched,
                                    watchCount: lesson.watchCount
                                }))
                            }))
                        })),
                        totalEnrollments: student.enrollmentStatus.totalEnrollments
                    };
                    return acc;
                }, {});

                // Merge with existing whatsappNumbers to avoid overwriting
                setWhatsappNumbers(prevNumbers => ({
                    ...prevNumbers,
                    ...enrolledWhatsappObject
                }));

                // Process student data with detailed enrollment information
                const processedStudents = studentsData.data.map(student => {
                    const totalWatchedLessons = student.activityStatus.totalWatchedLessons || 0;
                    const enrolledCoursesCount = student.enrollmentStatus.enrolledCourses.length;
                    const totalLessonsAvailable = student.enrollmentStatus.enrolledCourses.reduce((total, course) => {
                        return total + course.chapters.reduce((chapterTotal, chapter) => {
                            return chapterTotal + chapter.lessons.length;
                        }, 0);
                    }, 0);

                    return {
                        email: student.studentInfo.email,
                        userName: student.studentInfo.name,
                        totalViews: totalWatchedLessons,
                        lastViewed: student.studentInfo.lastActivity,
                        status: getStudentStatus(student.activityStatus),
                        uniqueLessons: totalWatchedLessons,
                        enrolledCourses: enrolledCoursesCount,
                        totalLessonsAvailable,
                        isEnrolled: student.enrollmentStatus.isEnrolled,
                        enrollmentDetails: student.enrollmentStatus.enrolledCourses,
                        lessons: [], // Will be populated by watch history if available
                        lessonViews: {},
                        hasWatchHistory: totalWatchedLessons > 0,
                        studentId: student.studentInfo.id,
                        // Add phone numbers from the API response
                        phoneNumber: student.studentInfo.phoneNumber,
                        parentPhoneNumber: student.studentInfo.parentPhoneNumber,
                        studentId: student.studentInfo.id
                    };
                });

                setEnrolledStudentList(processedStudents);
            }
        } catch (error) {
            console.error('Error fetching enrolled students:', error);
        } finally {
            setEnrolledLoading(false);
        }
    };

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

                // Process student data with detailed enrollment information
                const whatsappObject = studentsData.data.reduce((acc, student) => {
                    acc[student.studentInfo.email] = {
                        studentId: student.studentInfo.id,
                        studentWhatsApp: student.studentInfo.phoneNumber,
                        parentWhatsApp: student.studentInfo.parentPhoneNumber,
                        name: student.studentInfo.name,
                        lastActive: student.studentInfo.lastActivity,
                        status: student.activityStatus.status,
                        totalWatchedLessons: student.activityStatus.totalWatchedLessons,
                        isEnrolled: student.enrollmentStatus.isEnrolled,
                        enrolledCourses: student.enrollmentStatus.enrolledCourses.map(course => ({
                            courseName: course.courseName,
                            enrollmentDate: course.enrollmentDate,
                            paymentStatus: course.paymentStatus,
                            chapters: course.chapters.map(chapter => ({
                                chapterTitle: chapter.chapterTitle,
                                lessons: chapter.lessons.map(lesson => ({
                                    lessonTitle: lesson.lessonTitle,
                                    isWatched: lesson.isWatched,
                                    watchCount: lesson.watchCount
                                }))
                            }))
                        })),
                        totalEnrollments: student.enrollmentStatus.totalEnrollments
                    };
                    return acc;
                }, {});
                setWhatsappNumbers(whatsappObject);

                // Process activity data for the student list with enrollment details
                const processedStudents = studentsData.data.map(student => {
                    const totalWatchedLessons = student.activityStatus.totalWatchedLessons || 0;
                    const enrolledCoursesCount = student.enrollmentStatus.enrolledCourses.length;
                    const totalLessonsAvailable = student.enrollmentStatus.enrolledCourses.reduce((total, course) => {
                        return total + course.chapters.reduce((chapterTotal, chapter) => {
                            return chapterTotal + chapter.lessons.length;
                        }, 0);
                    }, 0);

                    return {
                        email: student.studentInfo.email,
                        userName: student.studentInfo.name,
                        totalViews: totalWatchedLessons,
                        lastViewed: student.studentInfo.lastActivity,
                        status: getStudentStatus(student.activityStatus),
                        uniqueLessons: totalWatchedLessons,
                        enrolledCourses: enrolledCoursesCount,
                        totalLessonsAvailable,
                        isEnrolled: student.enrollmentStatus.isEnrolled,
                        enrollmentDetails: student.enrollmentStatus.enrolledCourses,
                        lessons: [], // Will be populated by watch history if available
                        lessonViews: {},
                        hasWatchHistory: totalWatchedLessons > 0,
                        studentId: student.studentInfo.id // <-- Add this line

                    };
                });

                setStudentList(processedStudents);

                // Update stats
                const totalViews = processedStudents.reduce((sum, student) => sum + student.totalViews, 0);
                const mostActiveStudent = processedStudents.reduce((prev, current) =>
                    (current.totalViews > (prev?.totalViews || 0)) ? current : prev, null);

                setStats(prevStats => ({
                    ...prevStats, // Keep any existing stats like views periods
                    uniqueStudents: studentsData.totalStudents // Use total from server
                    // We get mostViewedLesson and mostActiveStudent from the API now
                }));

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

    const exportAsPDF = async () => {
        try {
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                backgroundColor: '#0A1121',
                scale: 2
            });

            // Convert canvas to PDF using jspdf
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Get canvas dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Convert canvas to base64 image
            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            // Add image to PDF, creating new pages if necessary
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Save the PDF
            pdf.save(`تقرير-${selectedStudent ? selectedStudent.email : 'الطلاب'}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
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
        // Get the enrolled courses from the student's data
        const enrolledCourses = student.enrollmentDetails || [];

        // Create a map of enrolled course names for quick lookup
        const enrolledCoursesMap = new Map(
            enrolledCourses.map(course => [course.courseName, course])
        );

        const progress = allCourses
            // First filter to only include enrolled courses
            .filter(course => enrolledCoursesMap.has(course.nameofcourse))
            .map(course => {
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
            });

        // Get enrollment dates and other details from enrolledCoursesMap
        const progressWithEnrollmentDetails = progress.map(course => {
            const enrollmentDetails = enrolledCoursesMap.get(course.courseName);
            return {
                ...course,
                enrollmentDate: enrollmentDetails?.enrollmentDate,
                paymentStatus: enrollmentDetails?.paymentStatus,
                // Include chapters from enrollment details to show what's available to the student
                enrolledChapters: enrollmentDetails?.chapters || []
            };
        });

        setStudentProgress(progressWithEnrollmentDetails);
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
            fetchStudentRatings(studentData.studentId); // 👈 Add this line

        }
        calculateStudentProgress(student);
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


    const submitRating = async () => {
        setRatingLoading(true);
        try {
            const method = editingRatingId ? 'PUT' : 'POST';
            const url = editingRatingId
                ? `${process.env.NEXT_PUBLIC_API_URL}/student-ratings/rate/${editingRatingId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/student-ratings/rate`;

            const response = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    studentId: whatsappNumbers[selectedStudent.email]?.studentId,
                    week: ratingWeek,
                    stars: ratingStars,
                    status: ratingStatus,
                    comment: ratingComment
                })
            });

            const data = await response.json();

            if (data.success) {
                await fetchStudentRatings(whatsappNumbers[selectedStudent.email]?.studentId);
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
        setRatingStars(1);
        setRatingStatus("good");
        setRatingComment('');
        setRatingWeek(getCurrentWeek());
        setEditingRatingId(null);
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
    };
    const ExamSection = () => {
        console.log("ExamSection rendering with:", {
            filteredExamsCount: filteredExams.length,
            quizResultsCount: quizResults.length,
            currentFilter: examFilter,
            allExamsCount: allExams.length
        });

        return (
            <div className="bg-white/10   backdrop-blur-lg rounded-2xl p-6 border border-white/20">
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


    const filteredEnrolledStudents = enrolledCourseFilter === 'all'
        ? enrolledStudentList
        : enrolledStudentList.filter(student =>
            student.enrollmentDetails.some(course => course.courseName === enrolledCourseFilter)
        );

    return (
        <div ref={reportRef} className="p-6 space-y-6">
            {/* Tabs Navigation */}
            <div className="flex justify-between items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl backdrop-blur-md">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 rounded-xl font-arabicUI3 transition-all duration-200 transform hover:scale-105 ${activeTab === 'overview'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FaChartBar className={activeTab === 'overview' ? 'text-white' : 'text-white/70'} />
                            <span>نظرة عامة</span>
                        </div>
                    </button>

                    {selectedStudent && (
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-6 py-3 rounded-xl font-arabicUI3 transition-all duration-200 transform hover:scale-105 ${activeTab === 'details'
                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaUser className={activeTab === 'details' ? 'text-white' : 'text-white/70'} />
                                <span>تفاصيل الطالب</span>
                            </div>
                        </button>
                    )}

                    <button
                        onClick={() => setActiveTab('enrolled')}
                        className={`px-6 py-3 rounded-xl font-arabicUI3 transition-all duration-200 transform hover:scale-105 ${activeTab === 'enrolled'
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FaUserGraduate className={activeTab === 'enrolled' ? 'text-white' : 'text-white/70'} />
                            <span>الطلاب المشتركين</span>
                        </div>
                    </button>
                    
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={exportAsPDF}
                        className="flex font-arabicUI3 items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                    >
                        <FaFilePdf />
                        تصدير PDF
                    </button>
                    <button
                        onClick={exportAsImage}
                        className="flex font-arabicUI3 items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors"
                    >
                        <FaImage />
                        تصدير كصورة
                    </button>

                </div>
            </div>

            {activeTab === 'enrolled' ? (
                <div className="space-y-6">
                    {/* Header with search, filters, and course filter */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-2xl font-bold text-white font-arabicUI3">قائمة الطلاب المشتركين</h2>
                            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                {/* Course Filter */}
                                
                                {/* Search bar */}
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="search"
                                        className="w-full p-3 pr-10 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                        placeholder="بحث عن طالب..."
                                        value={enrolledSearchTerm}
                                        onChange={(e) => {
                                            setEnrolledSearchTerm(e.target.value);
                                            setEnrolledCurrentPage(1);
                                        }}
                                    />
                                </div>

                                {/* Sort selector */}
                                <select
                                    className="p-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    value={enrolledSortBy}
                                    onChange={(e) => {
                                        setEnrolledSortBy(e.target.value);
                                        setEnrolledCurrentPage(1);
                                    }}
                                >
                                    <option value="views">الأكثر مشاهدة</option>
                                    <option value="recent">النشاط الأخير</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Enrolled Students Table */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-800/70">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الطالب</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الكورسات</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">المشاهدات</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">النشاط</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الحالة</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">تواصل</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الملف</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                                    {enrolledLoading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-white">
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                                    <span className="ms-3">جاري التحميل...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredEnrolledStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-white">
                                                لا يوجد طلاب مشتركين في هذا الكورس
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEnrolledStudents.map((student, index) => (
                                            <tr key={index}
                                                className={`transition-all duration-150 hover:bg-slate-700/40 cursor-pointer ${selectedStudent?.email === student.email ? 'bg-green-900/30 border-l-4 border-green-500' : ''}`}
                                             >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                                                            {student.userName[0].toUpperCase()}
                                                        </div>
                                                        <div className="ms-4">
                                                            <div className="text-sm font-medium text-white">{student.userName}</div>
                                                            <div className="text-xs text-gray-400">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                    <div className="flex flex-wrap gap-1">
                                                        {student.enrollmentDetails.map((course, idx) => (
                                                            <span key={idx} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-xs mr-1">
                                                                {course.courseName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                    <div className="flex items-center">
                                                        <FaEye className="mr-2 text-blue-500" />
                                                        <span>{student.totalViews}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                                    <div className="flex items-center">
                                                        <FaClock className="mr-2 text-purple-500" />
                                                        <span>{student.lastViewed ? formatDate(student.lastViewed) : 'لم يبدأ بعد'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status.color} bg-opacity-10`}>
                                                        {student.status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex flex-col gap-2">
                                                        {student.phoneNumber && (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-xs text-gray-400">الطالب:</span>
                                                                <a
                                                                    href={getWhatsAppLink(student.phoneNumber)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-green-400 hover:text-green-300 flex items-center gap-1"
                                                                    title="تواصل مع الطالب"
                                                                >
                                                                    <FaWhatsapp size={16} />
                                                                    <span className="text-xs">{student.phoneNumber}</span>
                                                                </a>
                                                            </div>
                                                        )}
                                                        {student.parentPhoneNumber && (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-xs text-gray-400">ولي الأمر:</span>
                                                                <a
                                                                    href={getWhatsAppLink(student.parentPhoneNumber)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                                                    title="تواصل مع ولي الأمر"
                                                                >
                                                                    <FaWhatsapp size={16} />
                                                                    <span className="text-xs">{student.parentPhoneNumber}</span>
                                                                </a>
                                                            </div>
                                                        )}
                                                        {!student.phoneNumber && !student.parentPhoneNumber && (
                                                            <span className="text-xs text-gray-500">لا يوجد أرقام</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <a
                                                        href={`/admin/${student.studentId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors inline-flex items-center gap-2"
                                                    >
                                                        <FaList className="text-blue-400" />
                                                        <span className="text-white text-sm font-medium">عرض الملف</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {enrolledTotalPages > 0 && (
                            <div className="mt-6 flex justify-between items-center">
                                <div className="text-sm text-gray-300">
                                    إجمالي الطلاب: {enrolledTotalStudents} | الصفحة {enrolledCurrentPage} من {enrolledTotalPages}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEnrolledCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={enrolledCurrentPage <= 1}
                                        className={`px-4 py-2 rounded-lg ${enrolledCurrentPage <= 1
                                            ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
                                            : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                                    >
                                        <FaChevronRight />
                                    </button>
                                    <button
                                        onClick={() => setEnrolledCurrentPage(prev => Math.min(prev + 1, enrolledTotalPages))}
                                        disabled={enrolledCurrentPage >= enrolledTotalPages}
                                        className={`px-4 py-2 rounded-lg ${enrolledCurrentPage >= enrolledTotalPages
                                            ? 'bg-slate-700/50 text-gray-500 cursor-not-allowed'
                                            : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                                    >
                                        <FaChevronLeft />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-300">عرض:</span>
                                    <select
                                        className="bg-slate-700 text-white rounded-lg px-2 py-1"
                                        value={studentsPerPage}
                                        onChange={(e) => {
                                            setStudentsPerPage(Number(e.target.value));
                                            setEnrolledCurrentPage(1); // Reset to first page
                                        }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'overview' ? (
                <>
                    {/* Stats Cards */}
                    {/* Main stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-white/80 font-arabicUI3 text-lg">إجمالي المشاهدات</h3>
                                <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaEye className="text-blue-400 text-xl" />
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-white">{stats.totalViews}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/30 transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-white/80 font-arabicUI3 text-lg">عدد الطلاب</h3>
                                <div className="p-2 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaUsers className="text-purple-400 text-xl" />
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-white">{stats.uniqueStudents}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20 hover:border-green-400/30 transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-white/80 font-arabicUI3 text-lg">الدرس الأكثر مشاهدة</h3>
                                <div className="p-2 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaPlayCircle className="text-green-400 text-xl" />
                                </div>
                            </div>
                            <div className="w-full">
                                <div className="flex items-start justify-between">
                                    <div className={`${isMostViewedLessonExpanded ? 'w-full' : 'w-4/5'} transition-all duration-300`}>
                                        <p className={`text-xl font-bold text-white ${!isMostViewedLessonExpanded && "line-clamp-1"}`}>
                                            {stats.mostViewedLesson}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsMostViewedLessonExpanded(!isMostViewedLessonExpanded)}
                                        className="flex-shrink-0 ml-2 text-green-400 hover:text-green-300 transition-colors"
                                        aria-label={isMostViewedLessonExpanded ? "عرض أقل" : "عرض المزيد"}
                                    >
                                        {isMostViewedLessonExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                </div>
                                {stats.mostViewedLessonData && (
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm text-white/60">
                                            {stats.mostViewedLessonData.totalViews} مشاهدة
                                        </p>
                                        {isMostViewedLessonExpanded && stats.mostViewedLessonData.chapterTitle && (
                                            <p className="text-xs text-white/40">
                                                {stats.mostViewedLessonData.chapterTitle}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/20 hover:border-amber-400/30 transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-white/80 font-arabicUI3 text-lg">الطالب الأكثر نشاطاً</h3>
                                <div className="p-2 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaTrophy className="text-amber-400 text-xl" />
                                </div>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-white">{stats.mostActiveStudent}</p>
                                {stats.mostActiveStudentData && (
                                    <p className="text-xs text-white/60 mt-1">
                                        {stats.mostActiveStudentData.totalViews} مشاهدة
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Time-based view statistics */}
                    <h3 className="text-xl font-bold text-white mt-10 mb-4">إحصائيات المشاهدات حسب الفترة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Last 24 hours */}
                        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/20 hover:border-amber-400/30 transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-white/80 font-arabicUI3 text-lg">آخر 24 ساعة</h3>
                                <div className="p-2 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaClock className="text-amber-400 text-xl" />
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-white">{stats.viewsLast24Hours}</p>
                        </div>

                        {/* Last week */}
                        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-lg rounded-2xl p-6 border border-indigo-500/20 hover:border-indigo-400/30 transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-white/80 font-arabicUI3 text-lg">آخر 7 أيام</h3>
                                <div className="p-2 bg-indigo-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaCalendarWeek className="text-indigo-400 text-xl" />
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-white">{stats.viewsLastWeek}</p>
                        </div>

                        {/* Last month */}
                        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-400/30 transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-white/80 font-arabicUI3 text-lg">آخر 30 يوم</h3>
                                <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                    <FaCalendarAlt className="text-emerald-400 text-xl" />
                                </div>
                            </div>
                            <p className="text-4xl font-bold text-white">{stats.viewsLastMonth}</p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">مشاهدات الدروس</h3>
                                <p className="text-white/60 text-sm">إحصائيات تفصيلية لمشاهدات الطلاب للدروس</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-white/5 rounded-xl px-4 py-2 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-white/70 text-sm">المشاهدات</span>
                                </div>
                                <div className="bg-white/5 rounded-xl px-4 py-2 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    <span className="text-white/70 text-sm">التفاعل</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[400px]">
                            <Bar
                                data={chartData}
                                options={{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        legend: {
                                            display: false
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Student List Section */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">قائمة الطلاب</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-white/60 text-sm">قائمة شاملة لجميع الطلاب مع تفاصيل نشاطهم</p>
                                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 px-3 py-1 rounded-lg border border-blue-500/20 text-xs text-white/80">
                                        <span>ترتيب حسب: </span>
                                        <span className="font-medium">
                                            {sortBy === 'views' && 'المشاهدات'}
                                            {sortBy === 'recent' && 'آخر نشاط'}
                                            {sortBy === 'inactive' && 'غير نشط'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        setSortBy('views');
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2.5 rounded-xl font-arabicUI3 transition-all duration-200 transform hover:scale-105 flex items-center gap-2
                                        ${sortBy === 'views'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaEye className={sortBy === 'views' ? 'text-white' : 'text-white/70'} />
                                    <span>المشاهدات</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('recent');
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2.5 rounded-xl font-arabicUI3 transition-all duration-200 transform hover:scale-105 flex items-center gap-2
                                        ${sortBy === 'recent'
                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaClock className={sortBy === 'recent' ? 'text-white' : 'text-white/70'} />
                                    <span>آخر نشاط</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('inactive');
                                        setCurrentPage(1);
                                    }}
                                    className={`px-4 py-2.5 rounded-xl font-arabicUI3 transition-all duration-200 transform hover:scale-105 flex items-center gap-2
                                        ${sortBy === 'inactive'
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                                            : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaExclamationTriangle className={sortBy === 'inactive' ? 'text-white' : 'text-white/70'} />
                                    <span>غير نشط</span>
                                </button>
                            </div>
                        </div>                        {/* Search and Pagination Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:flex-none">
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <FaSearch className="text-white/40" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="البحث عن طالب..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full md:w-80 px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    />
                                </div>
                                {loading && (
                                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                        <span className="text-white/60 text-sm">جاري البحث...</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Students per page selector */}
                                <div className="flex items-center gap-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 px-4 py-2 rounded-xl border border-blue-500/20">
                                    <span className="text-white/70 text-sm">عدد الطلاب:</span>
                                    <select
                                        value={studentsPerPage}
                                        onChange={(e) => {
                                            setStudentsPerPage(parseInt(e.target.value));
                                            setCurrentPage(1); // Reset to first page when changing items per page
                                        }}
                                        className="bg-white/10 text-white border border-white/20 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option className="bg-slate-800 text-white" value={10}>10</option>
                                        <option className="bg-slate-800 text-white" value={50}>50</option>
                                        <option className="bg-slate-800 text-white" value={100}>100</option>
                                    </select>
                                </div>

                                <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2">
                                    <FaUsers className="text-white/40" />
                                    <span className="text-white/70 text-sm">
                                        عرض {((currentPage - 1) * studentsPerPage) + 1} - {Math.min(currentPage * studentsPerPage, totalStudents)} من {totalStudents} طالب
                                    </span>
                                </div>
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
                                                    <a
                                                        href={`/admin/${student.studentId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors inline-flex items-center gap-2"
                                                    >
                                                        <FaList className="text-blue-400" />
                                                        <span className="text-white text-sm font-medium">عرض الملف</span>
                                                    </a>
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
                                    className="px-4 py-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 disabled:opacity-50 rounded-lg transition-all duration-300 text-white border border-blue-500/20 hover:border-blue-400/40"
                                >
                                    <span className="flex items-center">
                                        <FaChevronRight className="ml-1" />
                                        <span>السابق</span>
                                    </span>
                                </button>

                                <div className="flex items-center gap-2">
                                    {/* Render page buttons based on current position */}
                                    {(() => {
                                        // Helper function for creating page buttons
                                        const renderPageButton = (pageNum) => (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${currentPage === pageNum
                                                    ? 'bg-gradient-to-br from-blue-500/80 to-blue-600/80 text-white border border-blue-400/50'
                                                    : 'bg-gradient-to-br from-white/5 to-white/10 text-white/70 hover:from-white/10 hover:to-white/20 border border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );

                                        const result = [];

                                        // Case 1: Few pages (show all up to 6)
                                        if (totalPages <= 6) {
                                            for (let i = 1; i <= totalPages; i++) {
                                                result.push(renderPageButton(i));
                                            }
                                            return result;
                                        }

                                        // Case 2: Near beginning (1, 2, 3, 4, 5, ..., totalPages)
                                        if (currentPage < 4) {
                                            for (let i = 1; i <= 5; i++) {
                                                result.push(renderPageButton(i));
                                            }

                                            result.push(
                                                <div key="ellipsis1" className="flex items-center justify-center w-10 h-10 text-white/50">...</div>
                                            );

                                            result.push(renderPageButton(totalPages));
                                            return result;
                                        }

                                        // Case 3: Near end (1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages)
                                        if (currentPage > totalPages - 3) {
                                            result.push(renderPageButton(1));

                                            result.push(
                                                <div key="ellipsis2" className="flex items-center justify-center w-10 h-10 text-white/50">...</div>
                                            );

                                            for (let i = totalPages - 4; i <= totalPages; i++) {
                                                result.push(renderPageButton(i));
                                            }
                                            return result;
                                        }

                                        // Case 4: Middle (1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages)
                                        result.push(renderPageButton(1));
                                        result.push(
                                            <div key="ellipsis3" className="flex items-center justify-center w-10 h-10 text-white/50">...</div>
                                        );

                                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                            result.push(renderPageButton(i));
                                        }

                                        result.push(
                                            <div key="ellipsis4" className="flex items-center justify-center w-10 h-10 text-white/50">...</div>
                                        );
                                        result.push(renderPageButton(totalPages));

                                        return result;
                                    })()}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 disabled:opacity-50 rounded-lg transition-all duration-300 text-white border border-blue-500/20 hover:border-blue-400/40"
                                >
                                    <span className="flex items-center">
                                        <span>التالي</span>
                                        <FaChevronLeft className="mr-1" />
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            ) : (<div className="flex items-center justify-center w-full h-full text-white">لا توجد بيانات لعرضها</div>)
            }
        </div>
    );
};

export default StudentFollowup;
