'use client';
import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    Area,
    AreaChart
} from 'recharts';
import {
    BookOpen,
    Users,
    DollarSign,
    TrendingUp,
    Award,
    Calendar,
    Filter,
    Download,
    Eye,
    Clock,
    Star,
    Target,
    ChevronDown,
    RefreshCw
} from 'lucide-react';
import Cookies from 'js-cookie';

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#ec4899', '#f43f5e', '#f97316', '#10b981', '#f59e0b'];

const CoursesAnalyses = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedTimeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course-analytics/analytics`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('فشل في جلب البيانات');
            }

            const result = await response.json();
            setAnalyticsData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseDetails = async (courseId) => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course-analytics/analytics/${courseId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setSelectedCourse(result.data);
            }
        } catch (err) {
            console.error('Error fetching course details:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white" dir="rtl">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                    <p>جاري تحميل تحليل الكورسات...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white" dir="rtl">
                <div className="bg-red-900/20 backdrop-blur-sm rounded-xl p-6 border border-red-500/30 max-w-md text-center">
                    <h3 className="text-xl font-bold mb-2">خطأ في تحميل البيانات</h3>
                    <p className="text-white/70 mb-4">{error}</p>
                    <button
                        onClick={fetchAnalyticsData}
                        className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={16} />
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    const { overview, courses, enrollmentTrends, courseCompletion, studentPerformance } = analyticsData;

    // Stats cards data
    const statsCards = [
        {
            title: 'إجمالي الكورسات',
            value: overview.totalCourses,
            icon: BookOpen,
            color: 'purple',
            trend: '+12%'
        },
        {
            title: 'إجمالي الطلاب',
            value: overview.totalStudents,
            icon: Users,
            color: 'blue',
            trend: '+8%'
        },
        {
            title: 'إجمالي التسجيلات',
            value: overview.totalEnrollments,
            icon: Award,
            color: 'green',
            trend: '+15%'
        },
        {
            title: 'إجمالي الإيرادات',
            value: `${overview.totalRevenue.toLocaleString()} جنيه`,
            icon: DollarSign,
            color: 'orange',
            trend: '+25%'
        }
    ];

    // Prepare enrollment trends data
    const enrollmentData = enrollmentTrends.map(item => ({
        date: `${item._id.day}/${item._id.month}`,
        التسجيلات: item.count,
        الإيرادات: item.revenue
    }));

    // Prepare course performance data
    const coursePerformanceData = courses.slice(0, 10).map(course => ({
        name: course.name,
        التسجيلات: course.totalEnrollments,
        المدفوعة: course.paidEnrollments,
        الإيرادات: course.revenue
    }));

    // Prepare student performance data for radar chart
    const performanceRadarData = studentPerformance.slice(0, 6).map(exam => ({
        subject: exam.examTitle,
        score: exam.averageScore,
        attempts: exam.totalAttempts
    }));

    return (
        <div className="min-h-screen  font-arabicUI3  p-6 text-white" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">تحليل الكورسات</h1>
                        <p className="text-white/60">لوحة تحكم شاملة لمتابعة أداء الكورسات والطلاب</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value)}
                            className="bg-purple-900/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10 text-white"
                        >
                            <option value="all">كل الأوقات</option>
                            <option value="week">آخر أسبوع</option>
                            <option value="month">آخر شهر</option>
                            <option value="year">آخر سنة</option>
                        </select>
                        <button className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                            <Download size={16} />
                            تصدير التقرير
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-white/10 pb-2">
                    <button
                        className={`px-4 py-2 ${activeTab === 'overview' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/70'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        نظرة عامة
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'courses' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/70'}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        أداء الكورسات
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'students' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/70'}`}
                        onClick={() => setActiveTab('students')}
                    >
                        أداء الطلاب
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statsCards.map((stat, index) => (
                                <div key={index} className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                                            <stat.icon className={`text-${stat.color}-300`} size={24} />
                                        </div>
                                        <span className="text-green-400 text-sm font-medium">{stat.trend}</span>
                                    </div>
                                    <h3 className="text-white/70 text-sm mb-2">{stat.title}</h3>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Enrollment Trends Chart */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp className="text-purple-400" />
                                اتجاهات التسجيل والإيرادات
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={enrollmentData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                                        <XAxis dataKey="date" tick={{ fill: '#a1a1aa' }} />
                                        <YAxis yAxisId="left" tick={{ fill: '#a1a1aa' }} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#a1a1aa' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1f2937',
                                                borderColor: '#4c1d95',
                                                borderRadius: '8px',
                                                color: '#e2e8f0'
                                            }}
                                        />
                                        <Legend />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="التسجيلات"
                                            stackId="1"
                                            stroke="#8b5cf6"
                                            fill="#8b5cf6"
                                            fillOpacity={0.6}
                                        />
                                        <Area
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="الإيرادات"
                                            stackId="2"
                                            stroke="#06b6d4"
                                            fill="#06b6d4"
                                            fillOpacity={0.6}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Course Performance Chart */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <BarChart className="text-purple-400" />
                                أداء الكورسات - أفضل 10 كورسات
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={coursePerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis tick={{ fill: '#a1a1aa' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1f2937',
                                                borderColor: '#4c1d95',
                                                borderRadius: '8px',
                                                color: '#e2e8f0'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="التسجيلات" fill="#8b5cf6" />
                                        <Bar dataKey="المدفوعة" fill="#06b6d4" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="space-y-8">
                        {/* Courses Table */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <BookOpen className="text-purple-400" />
                                جدول الكورسات التفصيلي
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-white">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-right py-3 px-4">اسم الكورس</th>
                                            <th className="text-right py-3 px-4">إجمالي التسجيلات</th>
                                            <th className="text-right py-3 px-4">التسجيلات المدفوعة</th>
                                            <th className="text-right py-3 px-4">التسجيلات المعلقة</th>
                                            <th className="text-right py-3 px-4">الإيرادات</th>
                                            <th className="text-right py-3 px-4">السعر</th>
                                            <th className="text-right py-3 px-4">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.map((course, index) => (
                                            <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {course.imageUrl && (
                                                            <img
                                                                src={course.imageUrl}
                                                                alt={course.name}
                                                                className="w-10 h-10 rounded-lg object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{course.name}</p>
                                                            <p className="text-white/60 text-sm">{course.level}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">{course.totalEnrollments}</td>
                                                <td className="py-3 px-4">
                                                    <span className="text-green-400">{course.paidEnrollments}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-yellow-400">{course.pendingEnrollments}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-purple-400">{course.revenue.toLocaleString()} جنيه</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {course.isFree ? (
                                                        <span className="text-green-400">مجاني</span>
                                                    ) : (
                                                        <span>{course.price} جنيه</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => fetchCourseDetails(course._id)}
                                                        className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-sm transition-colors flex items-center gap-2"
                                                    >
                                                        <Eye size={14} />
                                                        عرض التفاصيل
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Course Completion Rates */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Target className="text-purple-400" />
                                معدلات الإكمال
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={courseCompletion.slice(0, 8)}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="completionRate"
                                            label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                                        >
                                            {courseCompletion.slice(0, 8).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="space-y-8">
                        {/* Student Performance Radar */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Star className="text-purple-400" />
                                أداء الطلاب في الامتحانات
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceRadarData}>
                                        <PolarGrid stroke="#3f3f46" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                        <Radar
                                            name="متوسط الدرجات"
                                            dataKey="score"
                                            stroke="#8b5cf6"
                                            fill="#8b5cf6"
                                            fillOpacity={0.6}
                                        />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Student Performance Table */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-6">تفاصيل أداء الامتحانات</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-white">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-right py-3 px-4">اسم الامتحان</th>
                                            <th className="text-right py-3 px-4">متوسط الدرجات</th>
                                            <th className="text-right py-3 px-4">إجمالي المحاولات</th>
                                            <th className="text-right py-3 px-4">عدد الطلاب</th>
                                            <th className="text-right py-3 px-4">التقييم</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentPerformance.map((exam, index) => (
                                            <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-3 px-4 font-medium">{exam.examTitle}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`font-bold ${exam.averageScore >= 80 ? 'text-green-400' : exam.averageScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                        {exam.averageScore}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{exam.totalAttempts}</td>
                                                <td className="py-3 px-4">{exam.uniqueStudentCount}</td>
                                                <td className="py-3 px-4">
                                                    {exam.averageScore >= 80 ? (
                                                        <span className="text-green-400">ممتاز</span>
                                                    ) : exam.averageScore >= 60 ? (
                                                        <span className="text-yellow-400">جيد</span>
                                                    ) : (
                                                        <span className="text-red-400">يحتاج تحسين</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Course Details Modal */}
                {selectedCourse && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">تفاصيل الكورس</h2>
                                    <button
                                        onClick={() => setSelectedCourse(null)}
                                        className="text-white/60 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-purple-900/20 rounded-lg p-4">
                                        <h3 className="text-white font-bold mb-2">إحصائيات عامة</h3>
                                        <p className="text-white/70">إجمالي التسجيلات: {selectedCourse.statistics.totalEnrollments}</p>
                                        <p className="text-white/70">التسجيلات المدفوعة: {selectedCourse.statistics.paidEnrollments}</p>
                                        <p className="text-white/70">إجمالي الإيرادات: {selectedCourse.statistics.totalRevenue.toLocaleString()} جنيه</p>
                                    </div>

                                    <div className="bg-blue-900/20 rounded-lg p-4">
                                        <h3 className="text-white font-bold mb-2">معلومات الكورس</h3>
                                        <p className="text-white/70">الاسم: {selectedCourse.course.name}</p>
                                        <p className="text-white/70">المستوى: {selectedCourse.course.level}</p>
                                        <p className="text-white/70">السعر: {selectedCourse.course.price} جنيه</p>
                                    </div>
                                </div>

                                {/* Enrollments List */}
                                <div className="mb-6">
                                    <h3 className="text-white font-bold mb-4">آخر التسجيلات</h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {selectedCourse.enrollments.slice(0, 10).map((enrollment, index) => (
                                            <div key={index} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                                                <div>
                                                    <p className="text-white font-medium">{enrollment.studentId.name}</p>
                                                    <p className="text-white/60 text-sm">{enrollment.studentId.email}</p>
                                                </div>
                                                <div className="text-left">
                                                    <p className={`text-sm font-medium ${enrollment.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {enrollment.paymentStatus === 'paid' ? 'مدفوع' : 'معلق'}
                                                    </p>
                                                    <p className="text-white/60 text-xs">{new Date(enrollment.enrolledAt).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursesAnalyses;