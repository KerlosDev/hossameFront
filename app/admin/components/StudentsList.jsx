'use client'
import { useState, useEffect, useMemo } from 'react';
import { User, Mail, Phone, Clock, Filter, Ban, Search, MapPin, Book, AlertCircle, Download, Eye } from 'lucide-react';
import { FaWhatsapp, FaGraduationCap } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';

export default function StudentsList() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showBanConfirm, setShowBanConfirm] = useState(false);
    const [banReason, setBanReason] = useState('');

    // New state for analytics
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [analytics, setAnalytics] = useState({
        totalStudents: 0,
        activeStudents: 0,
        bannedStudents: 0,
        governmentDistribution: [],
        levelDistribution: [],
        lastWeekActive: 0
    });

    // Add new state for sorting
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'ascending'
    });

    // Add dummy data structure at the beginning of the component
    const getStudentMetrics = (student) => {
        // Dummy data generator for academic metrics
        return {
            attendance: Math.floor(Math.random() * (100 - 70) + 70),
            academicProgress: Math.floor(Math.random() * (100 - 50) + 50),
            assignmentsCompleted: Math.floor(Math.random() * (20 - 5) + 5),
            totalAssignments: 20,
            quizAverage: Math.floor(Math.random() * (100 - 60) + 60),
            lastAttendance: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
            payments: {
                total: Math.floor(Math.random() * (5000 - 1000) + 1000),
                status: Math.random() > 0.3 ? 'مدفوع' : 'متأخر',
                lastPayment: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
            },
            courseProgress: {
                completed: Math.floor(Math.random() * (15 - 5) + 5),
                total: 15,
                lastAccessed: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000)
            }
        };
    };

    // Fetch students
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:9000/user/students', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === 'success') {
                setStudents(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch students');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('حدث خطأ في تحميل بيانات الطلاب');
            setLoading(false);
        }
    };

    // Toggle ban status
    const toggleBanStatus = async (studentId, reason = '') => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`http://localhost:9000/user/students/${studentId}/ban`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ banReason: reason }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === 'success') {
                await fetchStudents();
                toast.success('تم تحديث حالة الحظر بنجاح');
                setShowBanConfirm(false);
                setBanReason('');
            } else {
                throw new Error(data.message || 'Failed to update ban status');
            }
        } catch (error) {
            console.error('Error updating ban status:', error);
            toast.error('حدث خطأ في تحديث حالة الحظر');
        }
    };

    // Filter students
    const filteredStudents = students.filter(student => {
        const matchesSearch = 
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.phoneNumber.includes(searchQuery) ||
            student.government.includes(searchQuery);

        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'banned' && student.isBanned) ||
            (filterStatus === 'active' && !student.isBanned);

        return matchesSearch && matchesStatus;
    });

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ar-EG', options);
    };

    // WhatsApp link generator
    const getWhatsAppLink = (number) => {
        const cleanNumber = number.replace(/\D/g, '');
        return `https://wa.me/${cleanNumber}`;
    };

    // Calculate analytics
    useEffect(() => {
        if (students.length > 0) {
            const governmentCounts = {};
            const levelCounts = {};
            let activeCount = 0;
            let bannedCount = 0;
            let lastWeekActiveCount = 0;
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            students.forEach(student => {
                // Government distribution
                governmentCounts[student.government] = (governmentCounts[student.government] || 0) + 1;
                
                // Level distribution
                levelCounts[student.level] = (levelCounts[student.level] || 0) + 1;
                
                // Active/Banned counts
                if (student.isBanned) bannedCount++;
                else activeCount++;

                // Last week active
                if (new Date(student.lastActive) > oneWeekAgo) {
                    lastWeekActiveCount++;
                }
            });

            setAnalytics({
                totalStudents: students.length,
                activeStudents: activeCount,
                bannedStudents: bannedCount,
                governmentDistribution: Object.entries(governmentCounts)
                    .map(([id, value]) => ({ id, value }))
                    .sort((a, b) => b.value - a.value),
                levelDistribution: Object.entries(levelCounts)
                    .map(([id, value]) => ({ id, value })),
                lastWeekActive: lastWeekActiveCount
            });
        }
    }, [students]);

    // Export to Excel
    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(students.map(student => ({
            'الاسم': student.name,
            'البريد الإلكتروني': student.email,
            'رقم الهاتف': student.phoneNumber,
            'رقم ولي الأمر': student.parentPhoneNumber,
            'المحافظة': student.government,
            'المستوى': student.level,
            'الحالة': student.isBanned ? 'محظور' : 'نشط',
            'آخر نشاط': formatDate(student.lastActive),
            'تاريخ التسجيل': formatDate(student.createdAt)
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        
        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        
        // Create Blob and download
        const blob = new Blob([excelBuffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `students-${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    // Analytics Section Component
    const AnalyticsSection = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg text-white/70 mb-2">إجمالي الطلاب</h3>
                <p className="text-3xl font-bold text-white">{analytics.totalStudents}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg text-white/70 mb-2">الطلاب النشطين</h3>
                <p className="text-3xl font-bold text-green-400">{analytics.activeStudents}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg text-white/70 mb-2">الطلاب المحظورين</h3>
                <p className="text-3xl font-bold text-red-400">{analytics.bannedStudents}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg text-white/70 mb-2">نشطين آخر أسبوع</h3>
                <p className="text-3xl font-bold text-blue-400">{analytics.lastWeekActive}</p>
            </div>
        </div>
    );

    // Charts Section
    const ChartsSection = () => {
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm h-[400px]">
                    <h3 className="text-lg text-white/70 mb-4">توزيع المحافظات</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={analytics.governmentDistribution}
                                dataKey="value"
                                nameKey="id"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                            >
                                {analytics.governmentDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                                labelStyle={{ color: 'white' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm h-[400px]">
                    <h3 className="text-lg text-white/70 mb-4">توزيع المستويات</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.levelDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis 
                                dataKey="id" 
                                stroke="#ffffff70"
                            />
                            <YAxis 
                                stroke="#ffffff70"
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                                labelStyle={{ color: 'white' }}
                            />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    // Add sorting function
    const sortData = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Sort students based on configuration
    const getSortedData = (data) => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    };

    // Table View Component
    const TableView = () => (
        <div className="overflow-x-auto rounded-2xl bg-white/5 border border-white/10">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10">
                        <th 
                            className="p-4 text-right text-white/70 hover:text-white cursor-pointer transition-colors"
                            onClick={() => sortData('name')}
                        >
                            <div className="flex items-center gap-2">
                                الاسم
                                {sortConfig.key === 'name' && (
                                    <span className="text-blue-400">
                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                    </span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="p-4 text-right text-white/70 hover:text-white cursor-pointer transition-colors"
                            onClick={() => sortData('email')}
                        >
                            <div className="flex items-center gap-2">
                                البريد الإلكتروني
                                {sortConfig.key === 'email' && (
                                    <span className="text-blue-400">
                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                    </span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="p-4 text-right text-white/70 hover:text-white cursor-pointer transition-colors"
                            onClick={() => sortData('phoneNumber')}
                        >
                            <div className="flex items-center gap-2">
                                رقم الهاتف
                                {sortConfig.key === 'phoneNumber' && (
                                    <span className="text-blue-400">
                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                    </span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="p-4 text-right text-white/70 hover:text-white cursor-pointer transition-colors"
                            onClick={() => sortData('government')}
                        >
                            <div className="flex items-center gap-2">
                                المحافظة
                                {sortConfig.key === 'government' && (
                                    <span className="text-blue-400">
                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'
                                    }</span>
                                )}
                            </div>
                        </th>
                        <th 
                            className="p-4 text-right text-white/70 hover:text-white cursor-pointer transition-colors"
                            onClick={() => sortData('lastActive')}
                        >
                            <div className="flex items-center gap-2">
                                آخر نشاط
                                {sortConfig.key === 'lastActive' && (
                                    <span className="text-blue-400">
                                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                    </span>
                                )}
                            </div>
                        </th>
                        <th className="p-4 text-right text-white/70">الحالة</th>
                        <th className="p-4 text-right text-white/70">إجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {getSortedData(filteredStudents).map((student, index) => (
                        <tr 
                            key={student._id} 
                            className={`
                                border-b border-white/5 hover:bg-white/5 transition-colors
                                ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}
                            `}
                        >
                            <td className="p-4 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                        <User className="text-white" size={14} />
                                    </div>
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-sm text-white/50">{student.level}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-white">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-white/50" />
                                    {student.email}
                                </div>
                            </td>
                            <td className="p-4 text-white">
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-white/50" />
                                    {student.phoneNumber}
                                    <a
                                        href={getWhatsAppLink(student.phoneNumber)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                                    >
                                        <FaWhatsapp className="text-green-400" size={12} />
                                    </a>
                                </div>
                            </td>
                            <td className="p-4 text-white">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-white/50" />
                                    {student.government}
                                </div>
                            </td>
                            <td className="p-4 text-white">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-white/50" />
                                    {formatDate(student.lastActive)}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                    student.isBanned 
                                        ? 'bg-red-500/20 text-red-400' 
                                        : 'bg-green-500/20 text-green-400'
                                }`}>
                                    {student.isBanned ? 'محظور' : 'نشط'}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedStudent(student)}
                                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedStudent(student);
                                            setShowBanConfirm(true);
                                        }}
                                        className={`p-2 rounded-lg transition-colors ${
                                            student.isBanned
                                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                                        }`}
                                    >
                                        <Ban size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Loading skeleton
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="animate-pulse bg-white/5 rounded-2xl p-6">
                        <div className="flex space-x-4">
                            <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                            <div className="flex-1 space-y-4">
                                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-white/10 rounded"></div>
                                    <div className="h-3 bg-white/10 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-arabicUI2 text-white">إدارة الطلاب</h1>
                <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors"
                >
                    <Download size={18} />
                    تصدير إلى Excel
                </button>
            </div>

            {/* Analytics Section */}
            <AnalyticsSection />

            {/* Charts Section */}
            <ChartsSection />

            {/* View Toggle */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                        viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/70'
                    }`}
                >
                    عرض البطاقات
                </button>
                <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-xl transition-colors ${
                        viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/70'
                    }`}
                >
                    عرض الجدول
                </button>
            </div>

            {/* Existing Search and Filter Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-arabicUI2 text-white mb-6">إدارة الطلاب</h1>
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                        <input
                            type="text"
                            placeholder="البحث عن طالب..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2 text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative">
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-10 py-2 text-white focus:outline-none focus:border-white/30 appearance-none"
                        >
                            <option value="all">جميع الطلاب</option>
                            <option value="active">نشط</option>
                            <option value="banned">محظور</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Display */}
            {viewMode === 'grid' ? (
                // Existing Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => (
                        <div
                            key={student._id}
                            onClick={() => setSelectedStudent(student)}
                            className={`group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border transition-all cursor-pointer
                                ${student.isBanned 
                                    ? 'border-red-500/50 bg-red-500/5' 
                                    : 'border-white/10 hover:border-white/20 hover:bg-white/10'}`}
                        >
                            {/* Student Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                        <User className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-arabicUI2 text-white group-hover:text-blue-300 transition-colors">{student.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <FaGraduationCap className="text-white/60" size={14} />
                                            <span className="text-sm text-white/60">{student.level}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <span className={`px-3 py-1 rounded-full text-xs 
                                    ${student.isBanned 
                                        ? 'bg-red-500/20 text-red-400' 
                                        : 'bg-green-500/20 text-green-400'}`}>
                                    {student.isBanned ? 'محظور' : 'نشط'}
                                </span>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-white/70">
                                    <Mail size={14} className="text-white/50" />
                                    <span>{student.email}</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <Phone size={14} className="text-white/50" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-white/70">{student.phoneNumber}</span>
                                        {student.phoneNumber && (
                                            <a
                                                href={getWhatsAppLink(student.phoneNumber)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                                            >
                                                <FaWhatsapp className="text-green-400" size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {student.parentPhoneNumber && (
                                    <div className="flex items-center gap-3">
                                        <Phone size={14} className="text-white/50" />
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-white/70">ولي الأمر: {student.parentPhoneNumber}</span>
                                            <a
                                                href={getWhatsAppLink(student.parentPhoneNumber)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                                            >
                                                <FaWhatsapp className="text-green-400" size={14} />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 text-sm text-white/70">
                                    <MapPin size={14} className="text-white/50" />
                                    <span>{student.government}</span>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-white/70">
                                    <Clock size={14} className="text-white/50" />
                                    <span>آخر نشاط: {formatDate(student.lastActive)}</span>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedStudent(student);
                                        setShowBanConfirm(true);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${
                                        student.isBanned
                                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                            : 'bg-white/5 hover:bg-white/10 text-white/70'
                                    }`}
                                    title={student.isBanned ? 'إلغاء الحظر' : 'حظر الطالب'}
                                >
                                    <Ban size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <TableView />
            )}

            {/* Ban Confirmation Modal */}
            {showBanConfirm && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4">
                        <h3 className="text-xl font-arabicUI2 text-white mb-4">
                            {selectedStudent.isBanned ? 'إلغاء حظر الطالب' : 'حظر الطالب'}
                        </h3>
                        
                        {!selectedStudent.isBanned && (
                            <textarea
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                placeholder="سبب الحظر..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/50 focus:outline-none focus:border-white/30 mb-4"
                                rows={3}
                            />
                        )}

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowBanConfirm(false);
                                    setBanReason('');
                                }}
                                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => toggleBanStatus(selectedStudent._id, banReason)}
                                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all"
                            >
                                {selectedStudent.isBanned ? 'إلغاء الحظر' : 'تأكيد الحظر'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Student Details Modal */}
            {selectedStudent && !showBanConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-4xl w-full mx-4">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                    <User className="text-white" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-arabicUI2 text-white">{selectedStudent.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <FaGraduationCap className="text-white/60" />
                                        <span className="text-white/60">{selectedStudent.level}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    selectedStudent.isBanned
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-green-500/20 text-green-400'
                                }`}>
                                    {selectedStudent.isBanned ? 'محظور' : 'نشط'}
                                </span>
                            </div>
                        </div>

                        {/* Student Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-white/60 mb-1 text-sm">البريد الإلكتروني</h4>
                                    <p className="text-white flex items-center gap-2">
                                        <Mail size={16} className="text-white/50" />
                                        {selectedStudent.email}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-white/60 mb-1 text-sm">رقم الهاتف</h4>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-white/50" />
                                        <p className="text-white">{selectedStudent.phoneNumber}</p>
                                        {selectedStudent.phoneNumber && (
                                            <a
                                                href={getWhatsAppLink(selectedStudent.phoneNumber)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                                            >
                                                <FaWhatsapp className="text-green-400" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-white/60 mb-1 text-sm">رقم هاتف ولي الأمر</h4>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-white/50" />
                                        <p className="text-white">{selectedStudent.parentPhoneNumber || 'غير متوفر'}</p>
                                        {selectedStudent.parentPhoneNumber && (
                                            <a
                                                href={getWhatsAppLink(selectedStudent.parentPhoneNumber)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                                            >
                                                <FaWhatsapp className="text-green-400" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-white/60 mb-1 text-sm">المحافظة</h4>
                                    <p className="text-white flex items-center gap-2">
                                        <MapPin size={16} className="text-white/50" />
                                        {selectedStudent.government}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-white/60 mb-1 text-sm">تاريخ التسجيل</h4>
                                    <p className="text-white flex items-center gap-2">
                                        <Clock size={16} className="text-white/50" />
                                        {formatDate(selectedStudent.createdAt)}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-white/60 mb-1 text-sm">آخر نشاط</h4>
                                    <p className="text-white flex items-center gap-2">
                                        <Clock size={16} className="text-white/50" />
                                        {formatDate(selectedStudent.lastActive)}
                                    </p>
                                </div>

                                {selectedStudent.isBanned && selectedStudent.banReason && (
                                    <div>
                                        <h4 className="text-white/60 mb-1 text-sm">سبب الحظر</h4>
                                        <p className="text-red-400 flex items-center gap-2">
                                            <AlertCircle size={16} className="text-red-400" />
                                            {selectedStudent.banReason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                إغلاق
                            </button>
                            <button
                                onClick={() => {
                                    setShowBanConfirm(true);
                                }}
                                className={`px-4 py-2 rounded-xl transition-all ${
                                    selectedStudent.isBanned
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                            >
                                {selectedStudent.isBanned ? 'إلغاء الحظر' : 'حظر الطالب'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}