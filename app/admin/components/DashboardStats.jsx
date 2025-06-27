'use client'
import { Users, CheckCircle, CreditCard, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

export default function DashboardStats() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        newStudents: 0,
        totalRevenue: 0,
        pendingEnrollments: 0,
        completionRate: 0
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch all required data in parallel
            const [studentsResponse, revenueResponse, pendingResponse, progressResponse] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/new-students`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/revenue`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/pending-enrollments`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/all`, { headers })
            ]);

            // Parse all responses in parallel
            const [studentsData, revenueData, pendingData, progressData] = await Promise.all([
                studentsResponse.json(),
                revenueResponse.json(),
                pendingResponse.json(),
                progressResponse.json()
            ]);

            // Calculate completion rate from progress data
            const completionRate = progressData.data ?
                Math.round(progressData.data.reduce((acc, curr) => acc + (curr.progress || 0), 0) / progressData.data.length) :
                0;

            setStats({
                ...stats,
                newStudents: studentsData.data || 0,
                totalRevenue: revenueData.data || 0,
                pendingEnrollments: pendingData.data || 0,
                completionRate: completionRate || 0
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('حدث خطأ في تحميل الإحصائيات');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600 dark:text-white/80">جاري التحميل...</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 font-arabicUI3 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Students */}
            <div className="group bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105 shadow-lg">
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                        <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform duration-500">
                            <Users className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <span className="text-3xl font-arabicUI3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                            {stats.newStudents}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-white/60 mt-1">طالب جديد</span>
                    </div>
                </div>
                <p className="mt-4 text-center text-gray-600 dark:text-white/80 font-arabicUI3 group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-500">الطلاب الجدد في آخر 7 أيام</p>
            </div>

            {/* Completion Rate */}
            <div className="group bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105 shadow-lg">
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                        <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform duration-500">
                            <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        <span className="text-3xl font-arabicUI3 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                            {stats.completionRate}%
                        </span>
                        <span className="text-sm text-gray-500 dark:text-white/60 mt-1">معدل الإكمال</span>
                    </div>
                </div>
                <p className="mt-4 text-center text-gray-600 dark:text-white/80 font-arabicUI3 group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-500">معدل إكمال الكورسات</p>
            </div>

            {/* Total Revenue */}
            <div className="group bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105 shadow-lg">
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                        <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform duration-500">
                            <CreditCard className="text-purple-600 dark:text-purple-400" size={24} />
                        </div>
                        <span className="text-3xl font-arabicUI3 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                            {stats.totalRevenue} ج.م
                        </span>
                        <span className="text-sm text-gray-500 dark:text-white/60 mt-1">الإيرادات</span>
                    </div>
                </div>
                <p className="mt-4 text-center text-gray-600 dark:text-white/80 font-arabicUI3 group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-500">إجمالي الإيرادات</p>
            </div>

            {/* Pending Requests */}
            <div className="group bg-white/80 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105 shadow-lg">
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                        <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform duration-500">
                            <AlertTriangle className="text-amber-600 dark:text-amber-400" size={24} />
                        </div>
                        <span className="text-3xl font-arabicUI3 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                            {stats.pendingEnrollments}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-white/60 mt-1">طلب معلق</span>
                    </div>
                </div>
                <p className="mt-4 text-center text-gray-600 dark:text-white/80 font-arabicUI3 group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-500">الطلبات المعلقة</p>
            </div>
        </div>
    );
}