'use client';
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Book, Users, CreditCard, Target } from 'lucide-react';

export default function Analytics({ students, courses, payments, dashboardStats }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [selectedView, setSelectedView] = useState('overview');

  const studentPerformanceData = courses.map(course => ({
    name: course.title,
    completionRate: course.completionRate,
    studentsCount: course.studentsCount,
    activeStudents: Math.floor(course.studentsCount * (course.completionRate / 100))
  }));

  const revenueData = payments.map(payment => ({
    date: new Date(payment.date).toLocaleDateString('ar-EG'),
    amount: payment.amount
  }));

  const enrollmentData = courses.map(course => ({
    course: course.title,
    students: course.studentsCount,
    completion: course.completionRate
  }));

  const paymentDistribution = [
    { name: 'مكتمل', value: payments.filter(p => p.status === 'completed').length, color: '#4CAF50' },
    { name: 'معلق', value: payments.filter(p => p.status === 'pending').length, color: '#FFC107' },
    { name: 'فشل', value: payments.filter(p => p.status === 'failed').length, color: '#F44336' }
  ];

  return (
    <div className="min-h-screen p-6 text-white space-y-6" dir="rtl">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-2">تحليلات المنصة</h2>
        <p className="text-white/60">نظرة شاملة على أداء المنصة والطلاب</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2"
          >
            <option value="week">آخر أسبوع</option>
            <option value="month">آخر شهر</option>
            <option value="year">آخر سنة</option>
          </select>

          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2"
          >
            <option value="overview">نظرة عامة</option>
            <option value="students">الطلاب</option>
            <option value="courses">الكورسات</option>
            <option value="revenue">الإيرادات</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: <Users className="text-blue-400" />, label: "إجمالي الطلاب", value: dashboardStats.totalStudents },
          { icon: <Book className="text-green-400" />, label: "الكورسات النشطة", value: dashboardStats.totalCourses },
          { icon: <CreditCard className="text-purple-400" />, label: "إجمالي الإيرادات", value: `${dashboardStats.totalRevenue} ج.م` },
          { icon: <Target className="text-yellow-400" />, label: "معدل الإكمال", value: `${dashboardStats.completionRate}%` }
        ].map((stat, i) => (
          <div key={i} className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">{stat.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-white">{stat.value}</h3>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">أداء الكورسات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentPerformanceData}>
              <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#a1a1aa' }} />
              <YAxis tick={{ fill: '#a1a1aa' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4c1d95' }} />
              <Legend />
              <Bar dataKey="studentsCount" name="إجمالي الطلاب" fill="#6366f1" />
              <Bar dataKey="activeStudents" name="الطلاب النشطون" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">اتجاه الإيرادات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#a1a1aa' }} />
              <YAxis tick={{ fill: '#a1a1aa' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4c1d95' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 6 }}
                activeDot={{ r: 8, fill: '#c4b5fd' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollment Trends */}
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">اتجاهات التسجيل</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enrollmentData}>
              <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" />
              <XAxis dataKey="course" tick={{ fill: '#a1a1aa' }} />
              <YAxis tick={{ fill: '#a1a1aa' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4c1d95' }} />
              <Legend />
              <Bar dataKey="students" name="الطلاب المسجلون" fill="#f43f5e" />
              <Line type="monotone" dataKey="completion" name="معدل الإكمال" stroke="#facc15" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Distribution */}
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">توزيع المدفوعات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                {paymentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4c1d95' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
