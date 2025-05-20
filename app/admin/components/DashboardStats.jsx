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

            // Fetch new students count
            const studentsResponse = await fetch('http://localhost:9000/analytics/new-students', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Fetch revenue
            const revenueResponse = await fetch('http://localhost:9000/analytics/revenue', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Wait for both requests to complete
            const [studentsData, revenueData] = await Promise.all([
                studentsResponse.json(),
                revenueResponse.json()
            ]);

            setStats({
                ...stats,
                newStudents: studentsData.data || 0,
                totalRevenue: revenueData.data || 0
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('حدث خطأ في تحميل الإحصائيات');
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Students */}
            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105">
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                        <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform duration-500">
                            <Users className="text-blue-400" size={24} />
                        </div>
                        <span className="text-3xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                            {stats.newStudents}
                        </span>
                        <span className="text-sm text-white/60 mt-1">طالب جديد</span>
                    </div>
                </div>
                <p className="mt-4 text-center text-white/80 font-arabicUI3 group-hover:text-white transition-colors duration-500">الطلاب الجدد في آخر 7 أيام</p>
            </div>

            {/* Completion Rate */}
            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105">
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                        <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform duration-500">
                            <CheckCircle className="text-green-400" size={24} />
                        </div>
                        <span className="text-3xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                            {stats.completionRate}%
                        </span>
                        <span className="text-sm text-white/60 mt-1">معدل الإكمال</span>
                    </div>
                </div>
                <p className="mt-4 text-center text-white/80 font-arabicUI3 group-hover:text-white transition-colors duration-500">معدل إكمال الكورسات</p>
            </div>

            {/* Total Revenue */}
            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105">
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                        <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform duration-500">
                            <CreditCard className="text-purple-400" size={24} />
                        </div>
                        <span className="text-3xl font-bold text-purple-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                            {stats.totalRevenue} ج.م
                        </span>
                        <span className="text-sm text-white/60 mt-1">الإيرادات</span>
                    </div>
                </div>
                <p className="mt-4 text-center text-white/80 font-arabicUI3 group-hover:text-white transition-colors duration-500">إجمالي الإيرادات</p>
            </div>

            {/* Pending Requests */}
            <div className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-500 hover:transform hover:scale-105">
                <div className="relative w-full aspect-square flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                        <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 transform group-hover:scale-110 transition-transform duration-500">
                            <AlertTriangle className="text-amber-400" size={24} />
                        </div>
                        <span className="text-3xl font-bold text-amber-400 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                            {stats.pendingEnrollments}
                        </span>
                        <span className="text-sm text-white/60 mt-1">طلب معلق</span>
                    </div>
                </div>
                <p className="mt-4 text-center text-white/80 font-arabicUI3 group-hover:text-white transition-colors duration-500">الطلبات المعلقة</p>
            </div>
        </div>
    );
}