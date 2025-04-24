'use client';
import React, { useEffect, useState, Suspense } from 'react';
import GlobalApi from '../api/GlobalApi';
import AdminContent from './AdminContent';
import { BsPatchCheckFill } from "react-icons/bs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUsers, FaBook, FaQuestionCircle, FaList, FaChartPie, FaTag, FaBell } from "react-icons/fa";
import { RiMenu4Fill, RiMoneyDollarCircleLine } from "react-icons/ri";
import { MdFeedback, MdReportProblem, MdAnalytics } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
import AnalyticsGraph from './AnalyticsGraph';
import QuizManager from './QuizManager';
import ExamList from './ExamList';
import ExamResults from './ExamResults';
import StudentActivation from './StudentActivation';
import CourseManager from './CourseManager';
import { IoClose } from "react-icons/io5";
import NotificationManager from './NotificationManager';
import EditOfferComponent from './EditOfferComponent';
import BookOrders from './BookOrders';
import { IoBookSharp } from "react-icons/io5";
import BooksManager from './BooksManager';
import AdminBooks from './AdminBooks';
import LessonAnalytics from './LessonAnalytics';
import RevenueAnalytics from './RevenueAnalytics';
const { decrypt } = require('../utils/encryption');
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';

const Admin = () => {
    const [numOfStu, setnumOFStu] = useState([]);
    const [email, setEmail] = useState('');
    const [activeEmail, SetActiveEmail] = useState(-1);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchEmail, setSearchEmail] = useState('');
    const [password, setPassword] = useState(false);
    const [adminPass, setAdminPass] = useState('');
    const [activeBar, setActiveBar] = useState(0)
    const [idOfEnroll, setOfEnroll] = useState('')
    const [loadingAction, setLoadingAction] = useState(false);
    const [activeornot, setActiveOrNot] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [showCourseDialog, setShowCourseDialog] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [courses, setCourses] = useState([]);
    const [manualEmail, setManualEmail] = useState('');
    const [activeSection, setActiveSection] = useState('students');
    const [analyticsData, setAnalyticsData] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState({
        total: 0,
        active: 0,
        pending: 0
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Replace localStorage initialization with useEffect
    useEffect(() => {
        const savedSection = localStorage.getItem('adminActiveSection');
        if (savedSection) {
            setActiveSection(savedSection);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('adminActiveSection', activeSection);
        } catch (error) {
            console.error('Failed to save section to localStorage:', error);
        }
    }, [activeSection]);

    // Similarly, wrap the admin password check in useEffect
    useEffect(() => {
        try {
            const storedPassword = localStorage.getItem('adminPassword');
            if (storedPassword === '135792468') {
                setPassword(true);
            }
        } catch (error) {
            console.error('Failed to check admin password:', error);
        }
    }, []);

    const handleInputPass = (e) => {
        const enteredPassword = e.target.value;
        setAdminPass(enteredPassword);
        if (enteredPassword === '135792468') {
            setPassword(true);
            try {
                localStorage.setItem('adminPassword', enteredPassword);
            } catch (error) {
                console.error('Failed to store admin password:', error);
            }
        }
    };

    const emailsPerPage = 5; // Emails to show per page



    const publishEnrolls = () => {
        GlobalApi.publishEnrolls().then(req => {
            console.log(req)
        })
    }

    const handleSelectEmail = (item, index) => {
        setEmail(item);
        SetActiveEmail(index);
        setShowConfirmation(false)
    };

    useEffect(() => {
        dataAdmin();
    }, []);

    const processActivationData = (activations) => {
        if (!Array.isArray(activations)) return {
            graphData: [],
            stats: { total: 0, approved: 0, pending: 0, revenue: 0 }
        };

        // Group activations by course
        const courseStats = activations.reduce((acc, activation) => {
            const courseId = activation.courseId;
            if (!acc[courseId]) {
                acc[courseId] = {
                    total: 0,
                    approved: 0,
                    revenue: 0,
                    name: activation.courseName
                };
            }

            acc[courseId].total++;
            if (activation.status === 'approved') {
                acc[courseId].approved++;
                acc[courseId].revenue += activation.price || 0;
            }

            return acc;
        }, {});

        return {
            graphData: Object.values(courseStats).map(stats => ({
                name: stats.name || 'Unknown Course',
                total: stats.total,
                active: stats.approved,
                revenue: stats.revenue
            })),
            stats: {
                total: activations.length,
                approved: activations.filter(a => a.status === 'approved').length,
                pending: activations.filter(a => a.status === 'pending').length,
                revenue: activations.reduce((sum, a) => a.status === 'approved' ? sum + (a.price || 0) : sum, 0)
            }
        };
    };

    const dataAdmin = async () => {
        try {
            const activationResult = await GlobalApi.getActivationData();
            let activations = [];

            if (activationResult?.actvition?.activit) {
                try {
                    // Handle encrypted data
                    if (typeof activationResult.actvition.activit === 'string') {
                        const decryptedData = decrypt(activationResult.actvition.activit);
                        activations = JSON.parse(decryptedData);
                    } else {
                        // If already parsed
                        activations = activationResult.actvition.activit;
                    }
                } catch (decryptError) {
                    console.error('Error decrypting activation data:', decryptError);
                    activations = [];
                }
            }

            // Extract unique student emails
            const uniqueStudents = [...new Set(activations
                .filter(a => a.userEmail)
                .map(a => a.userEmail))];
            setnumOFStu(uniqueStudents);

            const analytics = processActivationData(activations);
            setAnalyticsData(analytics.graphData);
            setMonthlyStats({
                total: analytics.stats.total,
                active: analytics.stats.approved,
                pending: analytics.stats.pending
            });

        } catch (error) {
            console.error('Error in dataAdmin:', error);
            setnumOFStu([]);
            setAnalyticsData([]);
            setMonthlyStats({
                total: 0,
                active: 0,
                pending: 0
            });
        }
    };

    const uniqueEmails = [...new Set(numOfStu?.map((item) => item.userEmail))].reverse();

    // Update the email filtering logic with proper checks
    const filteredEmails = uniqueEmails?.filter((email) => {
        if (!email || !searchEmail) return true;
        return email.toLowerCase().includes((searchEmail || '').toLowerCase());
    }) || [];

    // Add null check for pagination calculations
    const totalPages = Math.ceil((filteredEmails?.length || 0) / emailsPerPage);
    const paginatedEmails = filteredEmails?.slice(
        (currentPage - 1) * emailsPerPage,
        currentPage * emailsPerPage
    ) || [];

    useEffect(() => {
        if (numOfStu.length > 0 && email) {
            const result = getDataForEmail(email); // Pass the selected email
            setFilteredData(result); // Update filtered data
        }
    }, [numOfStu, email]);

    const convertDate = (dateStr) => {
        const date = new Date(dateStr);
        // Format the date as y/m/d
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    }

    const getDataForEmail = (email) => {
        const userData = numOfStu.filter((item) => item.userEmail === email);

        const aggregatedData = userData.reduce((acc, item) => {
            const existingCourse = acc.find((course) => course.courseid === item.courseid);
            if (existingCourse) {
                existingCourse.totalPrice += item.course.price;
            } else {
                acc.push({
                    courseid: item.courseid,
                    totalPrice: item.course.price,
                    dataofSub: convertDate(item.course.updatedAt),
                    isHePaid: item.isHePaid,
                    idOfEnroll: item.id
                });
            }
            return acc;
        }, []);

        return aggregatedData;
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
            SetActiveEmail(-1)
            setEmail(''); // Reset selected email
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
            SetActiveEmail(-1); // Reset active email
            setEmail(''); // Reset selected email
        }
    };



    const handleIdOfEnroll = async (idOfEnroll, state) => {
        if (loadingAction) return; // Prevent multiple simultaneous actions
        setLoadingAction(true);
        setOfEnroll(idOfEnroll);
        setActiveOrNot(state);
        try {
            await dataAdmin(); // Refresh data after successful action

            // Update isHePaid for the user's email
            setFilteredData(prevData =>
                prevData.map(item =>
                    item.idOfEnroll === idOfEnroll ? { ...item, isHePaid: state } : item
                )
            );
        } catch (err) {
            console.error("Error updating enrollment state:", err);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleCourseClick = (item) => {
        setShowConfirmation(true);
        setOfEnroll(item.idOfEnroll);
        setActiveOrNot(!item.isHePaid);
    };

    const confirmChange = async () => {
        await handleIdOfEnroll(idOfEnroll, activeornot);
        setShowConfirmation(false);
    };

    const handleAddStudent = () => {
        setShowCourseDialog(true);
    };

    const handleCourseSelect = (courseId) => {
        setSelectedCourse(courseId);
    };

    const handleConfirmAddStudent = async () => {
        if (selectedCourse && manualEmail) {
            const selectedCourseData = courses.find(c => c.nicknameforcourse === selectedCourse);
            const enrollmentData = [{
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 10)}`,
                timestamp: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString(),
                enrollmentId: Math.random().toString(36).substr(2, 24),
                userEmail: manualEmail,
                userName: "Nothing",
                phoneNumber: "4684677978",
                courseName: selectedCourseData?.nameofcourse || '',
                courseId: selectedCourseData?.nicknameforcourse || 'elements',
                price: 50,
                status: "approved" // Changed to approved instead of pending
            }];

            const formattedData = JSON.stringify(enrollmentData);

            try {

                // Automatically set the enrollment as active

                await dataAdmin();
                setShowCourseDialog(false);
                setSelectedCourse('');
                setManualEmail('');

                toast.success('تم اضافة وتفعيل الطالب بنجاح ✅', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    className: 'font-arabicUI2 م-4 p-4',
                });
            } catch (error) {
                console.error('Error:', error);
                toast.error('حدث خطأ أثناء إضافة الطالب');
            }
        }
    };

    // Fetch all courses
    useEffect(() => {
        const fetchCourses = async () => {
            const res = await GlobalApi.getAllCourseList();
            setCourses(res.courses);
        };
        fetchCourses();
    }, []);

    return (
        <ErrorBoundary fallback={<div className="text-white">Something went wrong. Please try again.</div>}>
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950">
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center justify-between p-4 bg-white/10 backdrop-blur-lg">
                        <h2 className="font-arabicUI3 text-xl text-white flex items-center gap-2">
                            <BsPatchCheckFill className="text-blue-400" />
                            لوحة الادمن
                        </h2>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-white rounded-lg hover:bg-white/10"
                        >
                            <RiMenu4Fill className="text-2xl" />
                        </button>
                    </div>

                    <div className="flex">
                        {/* Sidebar */}
                        <div className={`fixed inset-y-0 right-0 z-50 w-64 
                                       md:relative md:translate-x-0
                                       transform transition-transform duration-300 ease-in-out
                                       ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                                       bg-white/10 backdrop-blur-lg border-r border-white/20 p-6`}>
                            {/* Mobile close button */}
                            <div className="md:hidden flex justify-end mb-4">
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 text-white rounded-lg hover:bg-white/10"
                                >
                                    <IoClose className="text-2xl" />
                                </button>
                            </div>

                            <div className="mb-8">
                                <h2 className="font-arabicUI3 text-2xl text-white flex items-center gap-2">
                                    <BsPatchCheckFill className="text-blue-400" />
                                    لوحة الادمن
                                </h2>
                            </div>

                            <nav className="space-y-4">
                                <button
                                    onClick={() => setActiveSection('students')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                ${activeSection === 'students'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaUsers className="ml-2" />
                                    <span className="font-arabicUI3">جميع الطلاب</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('courses')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                ${activeSection === 'courses'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaBook className="ml-2" />
                                    <span className="font-arabicUI3">جميع الكورسات</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('quizzes')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                ${activeSection === 'quizzes'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaQuestionCircle className="ml-2" />
                                    <span className="font-arabicUI3">اضافة  اختبار</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('examList')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                ${activeSection === 'examList'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaList className="ml-2" />
                                    <span className="font-arabicUI3">قائمة الاختبارات</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('examResults')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                ${activeSection === 'examResults'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaChartPie className="ml-2" />
                                    <span className="font-arabicUI3">نتائج الاختبارات</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('activation')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                ${activeSection === 'activation'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaUsers className="ml-2" />
                                    <span className="font-arabicUI3">تفعيل الطلبة</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('offers')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                ${activeSection === 'offers'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaTag className="ml-2" />
                                    <span className="font-arabicUI3">إدارة العروض</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('notifications')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                ${activeSection === 'notifications'
                                            ? 'bg-blue-500 text-white'
                                            : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaBell className="ml-2" />
                                    <span className="font-arabicUI3">الإشعارات</span>
                                </button>


                                <button
                                    onClick={() => setActiveSection('booksManage')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                    ${activeSection === 'booksManage' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <IoBookSharp className="ml-2" />
                                    <span className="font-arabicUI3">إدارة الكتب</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('lessonAnalytics')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                    ${activeSection === 'lessonAnalytics' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <FaChartPie className="ml-2" />
                                    <span className="font-arabicUI3">تحليلات الدروس</span>
                                </button>

                                <button
                                    onClick={() => setActiveSection('revenue')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-right
                                    ${activeSection === 'revenue' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
                                >
                                    <RiMoneyDollarCircleLine className="ml-2" />
                                    <span className="font-arabicUI3">تقارير المبيعات</span>
                                </button>








                            </nav>
                        </div>

                        {/* Backdrop for mobile */}
                        {isSidebarOpen && (
                            <div
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        )}

                        {/* Main Content */}
                        <div className="flex-1 p-4 md:p-6 w-full overflow-x-hidden">
                            {activeSection === 'students' ? (
                                <div className="max-w-7xl mx-auto space-y-6">
                                    {/* Stats Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                            <h3 className="text-white/80 font-arabicUI3 text-lg mb-2">إجمالي الطلاب</h3>
                                            <p className="text-4xl font-bold text-white">{numOfStu.length}</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                            <h3 className="text-white/80 font-arabicUI3 text-lg mb-2">إجمالي الطلبات</h3>
                                            <p className="text-4xl font-bold text-white">{monthlyStats.total}</p>
                                        </div>
                                        <div className="bg-green-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20">
                                            <h3 className="text-green-500 font-arabicUI3 text-lg mb-2">المفعلة</h3>
                                            <p className="text-4xl font-bold text-green-500">{monthlyStats.active}</p>
                                        </div>
                                        <div className="bg-yellow-500/10 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/20">
                                            <h3 className="text-yellow-500 font-arabicUI3 text-lg mb-2">في انتظار التفعيل</h3>
                                            <p className="text-4xl font-bold text-yellow-500">{monthlyStats.pending}</p>
                                        </div>
                                    </div>

                                    {/* Analytics Graph - Updated to full width */}
                                    <div className="w-full">
                                        <AnalyticsGraph data={analyticsData} />
                                    </div>


                                </div>
                            ) : activeSection === 'courses' ? (
                                <CourseManager />
                            ) : activeSection === 'quizzes' ? (
                                <QuizManager />
                            ) : activeSection === 'examList' ? (
                                <ExamList />
                            ) : activeSection === 'examResults' ? (
                                <ExamResults />
                            ) : activeSection === 'activation' ? (
                                <StudentActivation />
                            ) : activeSection === 'offers' ? (
                                <EditOfferComponent />
                            ) : activeSection === 'notifications' ? (
                                <NotificationManager />
                            ) : activeSection === 'books' ? (
                                <BookOrders />
                            ) : activeSection === 'booksManage' ? (
                                <AdminBooks />
                            ) : activeSection === 'bookOrders' ? (
                                <BookOrders />
                            ) : activeSection === 'lessonAnalytics' ? (
                                <LessonAnalytics />
                            ) : activeSection === 'revenue' ? (
                                <RevenueAnalytics />
                            ) : null}
                        </div>
                    </div>

                    {/* Modals - keep existing modal code but update styles */}
                    {showConfirmation && (
                        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50">
                            <div className=" backdrop-blur-2xl م-6 border p-5 rounded-xl text-center">
                                <h4 className="text-2xl text-white font-arabicUI2 mb-4">هل تريد تغيير حالة الدفع لهذا الكورس؟</h4>
                                <button onClick={confirmChange} className="px-4 py-2 bg-green-500 text-white font-arabicUI2 text-4xl rounded-xl mx-2">نعم</button>
                                <button onClick={() => setShowConfirmation(false)} className="px-4 py-2 bg-red-500 font-arabicUI2 text-4xl text-white rounded-xl mx-2">لا</button>
                            </div>
                        </div>
                    )}

                    {showCourseDialog && (
                        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                            <div className="backdrop-blur-2xl م-6 border p-5 rounded-xl text-center">
                                <h4 className="text-2xl text-white font-arabicUI2 mb-4">اختر الكورس لتفعيله للبريد الإلكتروني:</h4>
                                <input
                                    value={manualEmail}

                                    onChange={(e) => setManualEmail(e.target.value.replace(/\s/g, ''))}
                                    type="text"
                                    placeholder="ادخل البريد الإلكتروني.."
                                    className="text-left p-2 text-4xl w-full flex justify-center mx-auto font-arabicUI3 rounded-xl م-5"
                                />
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => handleCourseSelect(e.target.value)}
                                    className="text-left p-2 text-2xl w-full flex justify-center mx-auto font-arabicUI3 rounded-xl م-5"
                                >
                                    <option value="">اختر الكورس</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.nicknameforcourse}>
                                            {course.nameofcourse}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={handleConfirmAddStudent} className="px-4 py-2 bg-green-500 text-white font-arabicUI2 text-4xl rounded-xl mx-2">
                                    تأكيد
                                </button>
                                <button onClick={() => setShowCourseDialog(false)} className="px-4 py-2 bg-red-500 font-arabicUI2 text-4xl text-white rounded-xl mx-2">
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    )}

                    <ToastContainer />

                </div >
            </Suspense>
        </ErrorBoundary>
    );
};

// Create a custom error boundary component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

export default Admin;

