'use client'
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Users, Book, BarChart2, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { FaAtom } from "react-icons/fa";
import { GiMolecule } from "react-icons/gi";
import { IoMdFlask } from "react-icons/io";

// Import components
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import DashboardStats from './components/DashboardStats';
import StudentsList from './components/StudentsList';
import PaymentsList from './components/PaymentsList';
import SettingsPanel from './components/SettingsPanel';
import ExamAnalysis from './components/ExamAnalysis';
import Analytics from './components/Analytics';
import CourseManager from './components/CourseManager';
import ExamManage from './components/ExamManage';
import StudentFollowup from '../components/StudentFollowup';
import OffersManagement from './components/OffersManagement';


export default function ChemistryLMSAdmin() {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Move localStorage logic to useEffect to run only on client-side
    useEffect(() => {
        const savedTab = localStorage.getItem('adminActiveTab');
        if (savedTab) {
            setActiveTab(savedTab);
        }
    }, []);

    // Save tab changes to localStorage
    useEffect(() => {
        if (activeTab) {
            localStorage.setItem('adminActiveTab', activeTab);
        }
    }, [activeTab]);

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSection, setCurrentSection] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Admin profile data
    const [adminData, setAdminData] = useState({
        name: "احمد السيد",
        email: "admin@chemistry-lms.com",
        phoneNumber: "0123456789",
        role: "مسؤول النظام",
        joinedDate: "2023-05-15T00:00:00.000Z",
        lastLogin: "2025-05-07T14:30:00.000Z"
    });

    // Dashboard stats
    const [dashboardStats, setDashboardStats] = useState({
        totalStudents: 1253,
        activeStudents: 876,
        totalCourses: 18,
        completionRate: 72,
        totalRevenue: 52850,
        newRegistrations: 34,
        pendingRequests: 12,
        systemHealth: 98
    });

    // Sample dummy data for students
    const [students, setStudents] = useState([
        {
            id: 1,
            name: "سارة أحمد",
            email: "sara@example.com",
            phoneNumber: "01234567890",
            level: "الصف الثالث الثانوي",
            enrolledCourses: 3,
            progress: 78,
            lastActive: "2025-05-06T18:30:00.000Z",
            status: "active",
            paymentStatus: "paid"
        },
        {
            id: 2,
            name: "محمد علي",
            email: "mohamed@example.com",
            phoneNumber: "01112223334",
            level: "الصف الثالث الثانوي",
            enrolledCourses: 4,
            progress: 65,
            lastActive: "2025-05-07T10:15:00.000Z",
            status: "active",
            paymentStatus: "paid"
        },
        {
            id: 3,
            name: "فاطمة محمود",
            email: "fatma@example.com",
            phoneNumber: "01556778899",
            level: "الصف الثاني الثانوي",
            enrolledCourses: 2,
            progress: 92,
            lastActive: "2025-05-07T09:45:00.000Z",
            status: "active",
            paymentStatus: "paid"
        },
        {
            id: 4,
            name: "عمر خالد",
            email: "omar@example.com",
            phoneNumber: "01009876543",
            level: "الصف الثالث الثانوي",
            enrolledCourses: 3,
            progress: 45,
            lastActive: "2025-05-05T14:20:00.000Z",
            status: "inactive",
            paymentStatus: "overdue"
        },
        {
            id: 5,
            name: "نور إبراهيم",
            email: "nour@example.com",
            phoneNumber: "01223344556",
            level: "الصف الأول الثانوي",
            enrolledCourses: 2,
            progress: 85,
            lastActive: "2025-05-07T16:10:00.000Z",
            status: "active",
            paymentStatus: "paid"
        }
    ]);

    // Sample dummy data for courses
    const [courses, setCourses] = useState([
        {
            id: 1,
            title: "أساسيات الكيمياء العضوية",
            level: "الصف الثالث الثانوي",
            instructor: "د. محمد حسن",
            studentsCount: 345,
            lessonsCount: 24,
            createdAt: "2024-09-01T00:00:00.000Z",
            status: "active",
            completionRate: 76
        },
        {
            id: 2,
            title: "الكيمياء غير العضوية",
            level: "الصف الثالث الثانوي",
            instructor: "د. أحمد فؤاد",
            studentsCount: 280,
            lessonsCount: 18,
            createdAt: "2024-09-15T00:00:00.000Z",
            status: "active",
            completionRate: 68
        },
        {
            id: 3,
            title: "الكيمياء التحليلية",
            level: "الصف الثاني الثانوي",
            instructor: "د. فاطمة السيد",
            studentsCount: 210,
            lessonsCount: 16,
            createdAt: "2024-10-05T00:00:00.000Z",
            status: "active",
            completionRate: 82
        },
        {
            id: 4,
            title: "الكيمياء الكهربية",
            level: "الصف الثالث الثانوي",
            instructor: "د. سارة عبدالله",
            studentsCount: 198,
            lessonsCount: 14,
            createdAt: "2024-10-20T00:00:00.000Z",
            status: "active",
            completionRate: 59
        },
        {
            id: 5,
            title: "كيمياء البوليمرات",
            level: "الصف الثالث الثانوي",
            instructor: "د. خالد محمود",
            studentsCount: 145,
            lessonsCount: 12,
            createdAt: "2024-11-10T00:00:00.000Z",
            status: "draft",
            completionRate: 32
        }
    ]);

    // Sample dummy data for payments
    const [payments, setPayments] = useState([
        {
            id: 1,
            studentName: "سارة أحمد",
            courseTitle: "أساسيات الكيمياء العضوية",
            amount: 1200,
            date: "2025-05-07T10:30:00.000Z",
            status: "completed",
            paymentMethod: "بطاقة ائتمان"
        },
        {
            id: 2,
            studentName: "محمد علي",
            courseTitle: "الكيمياء غير العضوية",
            amount: 950,
            date: "2025-05-07T09:15:00.000Z",
            status: "pending",
            paymentMethod: "فودافون كاش"
        },
        {
            id: 3,
            studentName: "فاطمة محمود",
            courseTitle: "الكيمياء التحليلية",
            amount: 850,
            date: "2025-05-06T14:20:00.000Z",
            status: "completed",
            paymentMethod: "تحويل بنكي"
        },
        {
            id: 4,
            studentName: "عمر خالد",
            courseTitle: "الكيمياء الكهربية",
            amount: 1100,
            date: "2025-05-06T11:45:00.000Z",
            status: "failed",
            paymentMethod: "بطاقة ائتمان"
        },
        {
            id: 5,
            studentName: "نور إبراهيم",
            courseTitle: "كيمياء البوليمرات",
            amount: 1300,
            date: "2025-05-05T16:30:00.000Z",
            status: "completed",
            paymentMethod: "فودافون كاش"
        }
    ]);

    // System notifications
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: "info",
            message: "تم تسجيل 8 طلاب جدد اليوم",
            time: "قبل ساعتين",
            read: false
        },
        {
            id: 2,
            type: "warning",
            message: "يوجد 3 مدفوعات معلقة تحتاج مراجعة",
            time: "قبل 5 ساعات",
            read: true
        },
        {
            id: 3,
            type: "alert",
            message: "انخفاض أداء الخادم بنسبة 15%",
            time: "قبل 8 ساعات",
            read: false
        }
    ]);

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Logout handler
    const handleLogout = () => {
        // Clear cookies
        Cookies.remove('admin_token');
        Cookies.remove('admin_name');
        Cookies.remove('admin_email');

        // Redirect to login page
        window.location.href = '/admin/login';

        setShowLogoutConfirm(false);
    };

    // Chemistry background component

    const ChemBackground = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[url('/chemistry-pattern.png')] opacity-5 mix-blend-overlay"></div>
            <div className="absolute top-20 left-20 text-white/10 text-7xl">
                <FaAtom className="animate-float" />
            </div>
            <div className="absolute bottom-40 right-20 text-white/10 text-8xl">
                <GiMolecule className="animate-spin-slow" />
            </div>
            <div className="absolute top-1/2 left-1/3 text-white/10 text-6xl">
                <IoMdFlask className="animate-bounce-slow" />
            </div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse-delayed"></div>
        </div>
    );

    return (
        <div className="min-h-screen  p-8 relative">
            {/* Chemistry-themed animated background */}
            <ChemBackground />

            <div className="relative z-10">
                {/* Header */}
                <AdminHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    notifications={notifications}
                />

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar */}
                    <AdminSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        adminData={adminData}
                        showLogoutConfirm={showLogoutConfirm}
                        setShowLogoutConfirm={setShowLogoutConfirm}
                    />

                    {/* Main Content Area */}
                    <main className="lg:col-span-9 space-y-6">
                        {activeTab === 'dashboard' && (
                            <>
                                <DashboardStats stats={dashboardStats} />
                                <StudentsList
                                    students={students}
                                    searchQuery={searchQuery}
                                    filterStatus={filterStatus}
                                />
                            </>
                        )}

                        {activeTab === 'students' && (
                            <StudentsList
                                students={students}
                                searchQuery={searchQuery}
                                filterStatus={filterStatus}
                            />
                        )}

                        {activeTab === 'courses' && (

                            <CourseManager></CourseManager>
                        )}
                        {activeTab === 'followup' && (

                            <StudentFollowup></StudentFollowup>
                        )}

                        {activeTab === 'analytics' && (
                            <Analytics
                                students={students}
                                courses={courses}
                                payments={payments}
                                dashboardStats={dashboardStats}
                            />
                        )}
                        {activeTab === 'payments' && (
                            <PaymentsList
                                payments={payments}
                                searchQuery={searchQuery}
                                filterStatus={filterStatus}
                            />
                        )}

                        {activeTab === 'settings' && (
                            <SettingsPanel />
                        )}

                        {activeTab === 'exam' && (
                            <ExamAnalysis />
                        )}
                        {activeTab === 'examMangae' && (
                            <ExamManage />
                        )}
                        {activeTab === 'offers' && (
                            <OffersManagement />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}