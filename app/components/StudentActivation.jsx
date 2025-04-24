'use client';
import React, { useEffect, useState, useMemo } from 'react';
import GlobalApi from '../api/GlobalApi';
import { ToastContainer, toast } from 'react-toastify';
import { FaUsers, FaCheckCircle, FaClock, FaTimesCircle, FaPlus, FaFilter, FaSearch, FaFileExport, FaSortAmountDown, FaChartBar, FaFileAlt, FaMoneyBillWave, FaChartLine, FaFilePdf, FaFileExcel, FaFileCsv, FaPrint, FaDownload, FaUpload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
const { encrypt, decrypt } = require('../utils/encryption');

// Add encryption key
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key';

const useActivationData = () => {
    const [activations, setActivations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchActivations = async () => {
        setLoading(true);
        try {
            const result = await GlobalApi.getActivationData();
            if (result?.actvition?.activit) {
                // Handle potentially encrypted data
                if (typeof result.actvition.activit === 'string') {
                    try {
                        // Try to decrypt if it's encrypted
                        const decryptedData = decrypt(result.actvition.activit);
                        const parsedData = JSON.parse(decryptedData);
                        setActivations(Array.isArray(parsedData) ? parsedData : []);
                    } catch (decryptError) {
                        // If decryption fails, try parsing as unencrypted JSON
                        try {
                            const parsedData = JSON.parse(result.actvition.activit);
                            setActivations(Array.isArray(parsedData) ? parsedData : []);
                        } catch (parseError) {
                            console.error('Data parsing error:', parseError);
                            setActivations([]);
                        }
                    }
                } else {
                    // Handle case where data is already an object/array
                    setActivations(Array.isArray(result.actvition.activit) ? result.actvition.activit : []);
                }
                setError(null);
            } else {
                setActivations([]);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Failed to fetch activations');
            toast.error('حدث خطأ في تحميل البيانات');
        }
        setLoading(false);
    };

    return { activations, loading, error, fetchActivations, setActivations };
};

const StudentActivation = () => {
    const { activations, loading, fetchActivations } = useActivationData();
    const [filter, setFilter] = useState('all'); // Changed default to 'all'
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
    const [selectedItems, setSelectedItems] = useState([]);
    // New state for advanced filters
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [newActivation, setNewActivation] = useState({
        userEmail: '',         // Changed from email to userEmail
        phoneNumber: '',
        courseId: '',
        courseName: ''
    });
    // Add new state variables
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [activeTab, setActiveTab] = useState('activations');
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [uploadError, setUploadError] = useState(null);

    // New calculations
    const calculateMetrics = useMemo(() => {
        const approvedActivations = activations.filter(a => a.status === 'approved');

        // Calculate total revenue
        const totalRevenue = approvedActivations.reduce((sum, activation) =>
            sum + (Number(activation.price) || 0), 0
        );

        // Calculate course popularity
        const coursePopularity = activations.reduce((acc, activation) => {
            const courseName = activation.courseName;
            if (!acc[courseName]) {
                acc[courseName] = { count: 0, price: activation.price };
            }
            acc[courseName].count++;
            return acc;
        }, {});

        // Sort courses by popularity
        const popularCourses = Object.entries(coursePopularity)
            .map(([name, data]) => ({
                name,
                count: data.count,
                price: data.price
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        // Calculate growth rate
        const now = new Date();
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

        const currentMonthActivations = activations.filter(a =>
            new Date(a.timestamp) >= lastMonth
        ).length;

        const previousMonthActivations = activations.filter(a => {
            const date = new Date(a.timestamp);
            return date >= new Date(lastMonth.setMonth(lastMonth.getMonth() - 1)) &&
                date < lastMonth;
        }).length;

        const growthRate = previousMonthActivations === 0
            ? 100
            : ((currentMonthActivations - previousMonthActivations) / previousMonthActivations * 100).toFixed(1);

        return {
            totalRevenue,
            popularCourses,
            growthRate
        };
    }, [activations]);

    useEffect(() => {
        fetchActivations();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const result = await GlobalApi.getAllCourseList();
            console.log(result)
            setCourses(result.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('حدث خطأ في تحميل الكورسات');
        }
    };

    const handleExport = () => {
        const dataToExport = filteredActivations.map(({ userEmail, userName, phoneNumber, courseName, price, status, timestamp }) => ({
            'البريد الإلكتروني': userEmail,
            'اسم المستخدم': userName,
            'رقم الهاتف': phoneNumber,
            'الكورس': courseName,
            'السعر': price,
            'الحالة': status,
            'التاريخ': new Date(timestamp).toLocaleDateString('ar-EG')
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Activations');
        XLSX.writeFile(wb, 'activations.xlsx');
    };

    const handleDownloadJson = () => {
        try {
            const jsonData = JSON.stringify(activations, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `activations-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('تم تحميل ملف JSON بنجاح');
        } catch (error) {
            toast.error('حدث خطأ أثناء تحميل الملف');
        }
    };

    const handleBackupJson = async () => {
        try {
            const result = await GlobalApi.getActivationData();
            const jsonData = JSON.stringify(JSON.parse(result.actvition?.activit || '[]'), null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `activations-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('تم عمل نسخة احتياطية بنجاح');
        } catch (error) {
            toast.error('حدث خطأ أثناء عمل النسخة الاحتياطية');
        }
    };

    const handleBulkAction = async (action) => {
        try {
            await Promise.all(
                selectedItems.map(id =>
                    GlobalApi.updateActivationStatus(id, action)
                )
            );
            toast.success(`تم تحديث ${selectedItems.length} طلبات بنجاح`);
            fetchActivations();
            setSelectedItems([]);
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث الطلبات');
        }
    };

    const handleUploadJson = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    // Validate the JSON structure
                    if (!Array.isArray(jsonData)) {
                        throw new Error('Invalid JSON format - must be an array');
                    }

                    // Update the activation data
                    await GlobalApi.updateActivationData(jsonData);
                    await fetchActivations();
                    toast.success('تم تحديث البيانات بنجاح');
                } catch (error) {
                    setUploadError('Invalid JSON format');
                    toast.error('صيغة الملف غير صحيحة');
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('حدث خطأ أثناء تحميل الملف');
        }
    };

    const filteredActivations = useMemo(() => {
        return activations.filter(activation => {
            let match = true;

            // Status filter
            if (filter !== 'all') {
                match = match && activation.status === filter;
            }

            // Course filter - Fixed to use courseName
            if (selectedCourse) {
                match = match && activation.courseName === selectedCourse;
            }

            // Search query
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                match = match && (
                    activation.userEmail.toLowerCase().includes(searchLower) ||
                    activation.userName.toLowerCase().includes(searchLower) ||
                    activation.phoneNumber.includes(searchQuery) ||
                    activation.courseName.toLowerCase().includes(searchLower)
                );
            }

            // Date range filter
            if (dateRange.start && dateRange.end) {
                const activationDate = new Date(activation.timestamp);
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                match = match && activationDate >= startDate && activationDate <= endDate;
            }

            // Price range filter
            if (priceRange.min || priceRange.max) {
                const price = Number(activation.price);
                if (priceRange.min) match = match && price >= Number(priceRange.min);
                if (priceRange.max) match = match && price <= Number(priceRange.max);
            }

            // Single day filter
            if (selectedDate) {
                const filterDate = new Date(selectedDate).setHours(0, 0, 0, 0);
                const activationDate = new Date(activation.timestamp).setHours(0, 0, 0, 0);
                match = match && filterDate === activationDate;
            }

            return match;
        }).sort((a, b) => {
            const getValue = (obj) => obj[sortConfig.key];
            const aValue = getValue(a);
            const bValue = getValue(b);

            if (sortConfig.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [activations, filter, searchQuery, selectedDate, selectedCourse, dateRange, priceRange, sortConfig]);

    const handleStatusChange = async (activationId, newStatus) => {
        try {
            // First find the activation record
            const activation = activations.find(a => a.id === activationId);
            if (!activation) {
                throw new Error('Activation not found');
            }

            // Update activation status
            await GlobalApi.updateActivationStatus(activationId, newStatus);

            toast.success('تم تحديث الحالة بنجاح');
            await fetchActivations(); // Refresh the list after update
        } catch (error) {
            console.error('Error in handleStatusChange:', error);
            toast.error('فشل تحديث الحالة');
            // Refresh the list to ensure we have the latest state
            await fetchActivations();
        }
    };

    const handleManualActivation = async (e) => {
        e.preventDefault();
        try {
            // Validate email format and no spaces
            if (newActivation.userEmail.includes(' ')) {
                toast.error('البريد الإلكتروني لا يجب أن يحتوي على مسافات');
                return;
            }

            const selectedCourse = courses.find(c => c.nicknameforcourse === newActivation.courseId);
            if (!selectedCourse || !newActivation.userEmail || !newActivation.phoneNumber) {
                toast.error('يرجى ملء جميع البيانات المطلوبة');
                return;
            }

            // Check for existing activation with same email and course
            const existingActivation = activations.find(
                activation =>
                    activation.userEmail.toLowerCase() === newActivation.userEmail.toLowerCase() &&
                    activation.courseId === selectedCourse.nicknameforcourse
            );

            if (existingActivation) {
                toast.error('هذا الطالب مسجل بالفعل في هذا الكورس');
                return;
            }



            // Then create and save the activation with approved status
            await GlobalApi.saveNewActivation({
                userEmail: newActivation.userEmail,
                userName: newActivation.userEmail.split('@')[0],
                phoneNumber: newActivation.phoneNumber,
                courseName: selectedCourse.nameofcourse,
                courseId: selectedCourse.nicknameforcourse,
                price: selectedCourse.price,
                status: 'approved'
            });

            // Activate the enrollment

            toast.success('تم إضافة وتفعيل الطالب بنجاح');
            setIsModalOpen(false);
            setNewActivation({
                userEmail: '',
                phoneNumber: '',
                courseId: '',
                courseName: ''
            });

            await fetchActivations();
        } catch (error) {
            console.error('Error in manual activation:', error);
            toast.error('حدث خطأ أثناء إضافة التفعيل');
        }
    };

    const handleConfirmAddStudent = async () => {
        if (selectedCourse && manualEmail) {
            const selectedCourseData = courses.find(c => c.id === newActivation.courseId);
            const enrollmentData = [{
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 10)}`,
                timestamp: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString(),
                enrollmentId: Math.random().toString(36).substr(2, 24),
                userEmail: manualEmail,
                userName: "Nothing",
                phoneNumber: "4684677978",
                courseName: selectedCourseData?.nameofcourse || '',
                courseId: selectedCourseData?.nicknameforcourse || 'elements', // Use nicknameforcourse
                price: selectedCourseData?.price || 50,
                status: "pending"
            }];

            const formattedData = JSON.stringify(enrollmentData);

            await GlobalApi.sendEnroll4Admin(selectedCourseData?.nicknameforcourse || 'elements', manualEmail, formattedData);
            // ...rest of the code...
        }
    };

    const ExportButtons = () => (
        <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-4">
            <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base bg-emerald-500/20 text-emerald-400 rounded-xl"
            >
                <FaFileExport /> <span className="hidden sm:inline">تصدير Excel</span>
            </button>

            <button
                onClick={handleDownloadJson}
                className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base bg-blue-500/20 text-blue-400 rounded-xl"
            >
                <FaDownload /> <span className="hidden sm:inline">تحميل التفعيلات</span>
            </button>

            <div className="relative  h-full">
                <input
                    type="file"
                    accept=".json"
                    onChange={handleUploadJson}
                    className="hidden"
                    id="jsonUpload"
                />
                <label
                    htmlFor="jsonUpload"
                    className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base bg-orange-500/20 text-orange-400 rounded-xl cursor-pointer hover:bg-orange-500/30 transition-all"
                >
                    <FaUpload /> <span className="hidden sm:inline">رفع التفعيلات </span>
                </label>
            </div>



            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl"
            >
                <FaPlus /> <span className="hidden sm:inline">إضافة تفعيل يدوي</span>
            </button>
        </div>
    );

    return (
        <div className="space-y-4  font-arabicUI3 lg:space-y-6 p-2 lg:p-0" dir="rtl">
            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'activations', label: 'التفعيلات', icon: <FaUsers /> },
                    { id: 'analytics', label: 'التحليلات', icon: <FaChartBar /> },
                    { id: 'reports', label: 'التقارير', icon: <FaFileAlt /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === tab.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Analytics Dashboard */}
            {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Revenue Card */}
                    <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 p-6 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-white/80 text-sm">الإيرادات</h3>
                                <p className="text-3xl font-arabicUI3 text-white mt-1">
                                    {calculateMetrics.totalRevenue.toLocaleString('ar-EG')} ج.م
                                </p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-lg">
                                <FaMoneyBillWave className="text-emerald-400 text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Growth Card */}
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-white/80 text-sm">معدل النمو الشهري</h3>
                                <p className="text-3xl font-arabicUI3 text-white mt-1">
                                    {calculateMetrics.growthRate > 0 ? '+' : ''}{calculateMetrics.growthRate}٪
                                </p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-lg">
                                <FaChartLine className="text-purple-400 text-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Popular Courses Card */}
                    <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-6 rounded-2xl border border-white/10">
                        <h3 className="text-white/80 text-sm mb-4">الكورسات الأكثر طلباً</h3>
                        <div className="space-y-3">
                            {calculateMetrics.popularCourses.map((course, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white">{course.name}</span>
                                        <span className="text-white/60">{course.count} طلب</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                                            style={{
                                                width: `${(course.count / calculateMetrics.popularCourses[0].count) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Reports Dashboard */}
            {activeTab === 'reports' && (
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Monthly Report Card */}
                        <div className="p-4 bg-white/5 rounded-xl">
                            <h3 className="text-lg text-white mb-4">التقرير الشهري</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'إجمالي التفعيلات', value: '١٢٣' },
                                    { label: 'نسبة النجاح', value: '٨٩٪' },
                                    { label: 'متوسط وقت المعالجة', value: '٢.٥ ساعة' }
                                ].map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                                        <span className="text-white/70">{item.label}</span>
                                        <span className="text-white font-arabicUI3">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Export Options */}
                        <div className="p-4 bg-white/5 rounded-xl">
                            <h3 className="text-lg text-white mb-4">تصدير التقارير</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { format: 'PDF', icon: <FaFilePdf /> },
                                    { format: 'EXCEL', icon: <FaFileExcel /> },
                                    { format: 'CSV', icon: <FaFileCsv /> },
                                    { format: 'PRINT', icon: <FaPrint /> }
                                ].map((option, index) => (
                                    <button
                                        key={index}
                                        className="flex items-center gap-2 justify-center p-3 bg-white/10 rounded-lg text-white/70 hover:bg-white/20 transition-all"
                                    >
                                        {option.icon}
                                        <span>{option.format}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <FaUsers className="text-2xl text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-white/80 font-arabicUI3 text-sm">إجمالي الطلبات</h3>
                            <p className="text-2xl font-arabicUI3 text-white">{activations.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-500/10 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                            <FaClock className="text-2xl text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-yellow-500/80 font-arabicUI3 text-sm">قيد الانتظار</h3>
                            <p className="text-2xl font-arabicUI3 text-yellow-500">
                                {activations.filter(a => a.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <FaCheckCircle className="text-2xl text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-green-500/80 font-arabicUI3 text-sm">تم التفعيل</h3>
                            <p className="text-2xl font-arabicUI3 text-green-500">
                                {activations.filter(a => a.status === 'approved').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-6 border border-red-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <FaTimesCircle className="text-2xl text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-red-500/80 font-arabicUI3 text-sm">مرفوض</h3>
                            <p className="text-2xl font-arabicUI3 text-red-500">
                                {activations.filter(a => a.status === 'rejected').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Filter Section */}
            <div className="bg-white/5 p-3 lg:p-6 rounded-xl lg:rounded-2xl space-y-3 lg:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-4">
                    {/* Search Bar - Full width on mobile */}
                    <div className="relative col-span-1">
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 text-white pl-10 pr-4 py-2 lg:py-3 text-sm lg:text-base rounded-xl"
                        />
                        <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-sm lg:text-base" />
                    </div>

                    {/* Action Buttons - Stack on mobile */}
                    <ExportButtons />
                </div>

                {/* Advanced Filters - Stack on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-white/10 text-white px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition-all duration-300 hover:bg-white/20"
                        />
                        <label className="absolute -top-2 right-3 px-1 text-xs text-white/60 bg-gray-800">تصفية باليوم</label>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full bg-white/10 text-white px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition-all duration-300 hover:bg-white/20 appearance-none"
                        >
                            <option value="" className="bg-gray-800">كل الكورسات</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id} className="bg-gray-800">
                                    {course.nameofcourse}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* New Price Range Filter */}
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="السعر من"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                            className="w-1/2 bg-white/10 text-white px-4 py-2 rounded-xl"
                        />
                        <input
                            type="number"
                            placeholder="السعر إلى"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                            className="w-1/2 bg-white/10 text-white px-4 py-2 rounded-xl"
                        />
                    </div>
                </div>

                {/* Modern Status Filter Buttons */}
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-2 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {[
                            {
                                id: 'all',
                                label: 'الكل',
                                baseColor: 'bg-indigo-500/20',
                                activeColor: 'bg-indigo-500',
                                hoverColor: 'hover:bg-indigo-500/30',
                                textColor: 'text-indigo-300',
                                icon: <FaFilter className="text-indigo-300 group-hover:text-white transition-colors" />
                            },
                            {
                                id: 'pending',
                                label: 'قيد الانتظار',
                                baseColor: 'bg-amber-500/20',
                                activeColor: 'bg-amber-500',
                                hoverColor: 'hover:bg-amber-500/30',
                                textColor: 'text-amber-300',
                                icon: <FaClock className="text-amber-300 group-hover:text-white transition-colors" />
                            },
                            {
                                id: 'approved',
                                label: 'مفعل',
                                baseColor: 'bg-emerald-500/20',
                                activeColor: 'bg-emerald-500',
                                hoverColor: 'hover:bg-emerald-500/30',
                                textColor: 'text-emerald-300',
                                icon: <FaCheckCircle className="text-emerald-300 group-hover:text-white transition-colors" />
                            },
                            {
                                id: 'rejected',
                                label: 'مرفوض',
                                baseColor: 'bg-rose-500/20',
                                activeColor: 'bg-rose-500',
                                hoverColor: 'hover:bg-rose-500/30',
                                textColor: 'text-rose-300',
                                icon: <FaTimesCircle className="text-rose-300 group-hover:text-white transition-colors" />
                            }
                        ].map((item) => (
                            <motion.button
                                key={item.id}
                                onClick={() => setFilter(item.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    group relative flex items-center gap-2 px-6 py-3 rounded-lg font-arabicUI3
                                    transition-all duration-300
                                    ${filter === item.id
                                        ? `${item.activeColor} text-white shadow-lg`
                                        : `${item.baseColor} ${item.textColor} ${item.hoverColor}`}
                                `}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-4 right-4 left-4 lg:left-auto bg-gray-800 p-3 lg:p-4 rounded-xl shadow-lg"
                >
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                        <span className="text-white text-sm lg:text-base">{selectedItems.length} عناصر محددة</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleBulkAction('approved')}
                                className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base bg-green-500/20 text-green-400 rounded-lg"
                            >
                                تفعيل الكل
                            </button>
                            <button
                                onClick={() => handleBulkAction('rejected')}
                                className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base bg-red-500/20 text-red-400 rounded-lg"
                            >
                                رفض الكل
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Table Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 text-sm lg:text-base">
                                <th className="p-4 text-right text-white/60 font-arabicUI3 font-normal">الطالب</th>
                                <th className="p-4 text-right text-white/60 font-arabicUI3 font-normal">رقم الهاتف</th>
                                <th className="p-4 text-right text-white/60 font-arabicUI3 font-normal">الكورس</th>
                                <th className="p-4 text-right text-white/60 font-arabicUI3 font-normal">السعر</th>
                                <th className="p-4 text-right text-white/60 font-arabicUI3 font-normal">التاريخ</th>
                                <th className="p-4 text-right text-white/60 font-arabicUI3 font-normal">الحالة</th>
                                <th className="p-4 text-right text-white/60 font-arabicUI3 font-normal">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm lg:text-base">
                            {filteredActivations.map((activation, index) => (
                                <motion.tr
                                    key={activation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="border-t border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="p-4">
                                        <div>
                                            <p className="text-white font-medium">{activation.userEmail}</p>
                                            <p className="text-white/60 text-sm">{activation.userName}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white/80 font-arabicUI3">{activation.phoneNumber}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg">
                                            {activation.courseName}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white/80">{activation.price} جنيه</td>
                                    <td className="p-4 text-white/60">{new Date(activation.timestamp).toLocaleDateString('ar-EG')}</td>
                                    <td className="p-4">
                                        <StatusBadge status={activation.status} />
                                    </td>
                                    <td className="p-4">
                                        <ActionButton
                                            activation={activation}
                                            onStatusChange={handleStatusChange}
                                        />
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manual Activation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm p-4">
                    <div className="bg-gray-800/90 p-4 lg:p-8 rounded-xl lg:rounded-2xl w-full max-w-md border border-white/10">
                        <h2 className="text-xl text-white mb-6 font-arabicUI3">إضافة تفعيل يدوي</h2>
                        <form onSubmit={handleManualActivation} className="space-y-5">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="البريد الإلكتروني"
                                    value={newActivation.userEmail || ''}    // Added || '' to prevent undefined
                                    onChange={(e) => {
                                        const email = e.target.value.trim(); // Remove any spaces
                                        setNewActivation({ ...newActivation, userEmail: email });
                                    }}
                                    onBlur={(e) => {
                                        const email = e.target.value.trim();
                                        if (email.includes(' ')) {
                                            toast.error('البريد الإلكتروني لا يجب أن يحتوي على مسافات');
                                        }
                                    }}
                                    className="w-full bg-white/10 text-white px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition-all duration-300"
                                    required
                                    pattern="[^ @]*@[^ @]*" // HTML5 pattern to prevent spaces
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="tel"
                                    placeholder="رقم الهاتف"
                                    value={newActivation.phoneNumber || ''}  // Added || '' to prevent undefined
                                    onChange={(e) => setNewActivation({ ...newActivation, phoneNumber: e.target.value })}
                                    className="w-full bg-white/10 text-white px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition-all duration-300"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={newActivation.courseId || ''}     // Added || '' to prevent undefined
                                    onChange={(e) => {
                                        const course = courses.find(c => c.nicknameforcourse === e.target.value);
                                        if (course) {
                                            setNewActivation({
                                                ...newActivation,
                                                courseId: course.nicknameforcourse,
                                                courseName: course.nameofcourse
                                            });
                                        }
                                    }}
                                    className="w-full bg-white/10 text-white px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition-all duration-300 appearance-none"
                                    required
                                >
                                    <option value="" className="bg-gray-800">اختر الكورس</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.nicknameforcourse} className="bg-gray-800">
                                            {course.nameofcourse} - {course.price} جنيه
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 bg-white/5 text-white/70 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20"
                                >
                                    إضافة
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer
                position="top-right"
                dir="rtl"
                className="text-sm lg:text-base"
            />
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        approved: 'bg-green-500/20 text-green-500',
        rejected: 'bg-red-500/20 text-red-500',
        pending: 'bg-yellow-500/20 text-yellow-500'
    };

    const labels = {
        approved: 'مفعل',
        rejected: 'مرفوض',
        pending: 'قيد الانتظار'
    };

    return (
        <span className={`px-3 py-1.5 rounded-lg text-sm ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

const ActionButton = ({ activation, onStatusChange }) => {
    let buttonStyle = '';
    let buttonText = '';
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const handleDelete = async () => {
        try {
            await GlobalApi.deleteActivation(activation.id);
            toast.success('تم حذف التفعيل بنجاح');
            // Refresh the activations list
            await fetchActivations();
        } catch (error) {
            toast.error('حدث خطأ أثناء حذف التفعيل');
        }
        setShowConfirmDelete(false);
    };

    switch (activation.status) {
        case 'approved':
            buttonStyle = 'bg-red-500/20 text-red-500 hover:bg-red-500/30';
            buttonText = 'إلغاء التفعيل';
            break;
        case 'rejected':
            buttonStyle = 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30';
            buttonText = 'تفعيل';
            break;
        default:
            buttonStyle = 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30';
            buttonText = 'تفعيل';
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={() => onStatusChange(
                    activation.id,
                    activation.status === 'approved' ? 'rejected' : 'approved'
                )}
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${buttonStyle}`}
            >
                {buttonText}
            </button>


            {showConfirmDelete && (
                <div className="fixed inset-0  bg-black/50 flex items-center justify-center backdrop-blur-sm p-4 z-50">
                    <div className="bg-gray-800/90 p-6 rounded-xl border border-white/10 max-w-md w-full">
                        <h3 className="text-lg text-white mb-4">تأكيد الحذف</h3>
                        <p className="text-white/70 mb-6">هل أنت متأكد من حذف هذا التفعيل؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="px-4 py-2 bg-white/5 text-white/70 hover:bg-white/10 rounded-lg"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentActivation;
