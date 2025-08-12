'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Book, Plus, Save, X, Image as ImageIcon,
    Edit2, Trash2, CheckCircle, AlertCircle, HelpCircle,
    BarChart2, Users, Award, Search, Filter, Calendar, ArrowDown, ArrowUp,
    Download, Settings, Copy, Eye, EyeOff, FileText, Target, Timer,
    GraduationCap, TrendingUp, Activity, Zap, ChevronRight, ChevronLeft
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}`
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

const SearchBar = ({ value, onChange, placeholder = "البحث عن امتحان..." }) => (
    <div className="relative flex-1 min-w-[300px]">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400" size={20} />
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500/50 dark:focus:ring-blue-500/10"
        />
    </div>
);

const FilterChip = ({ active, onClick, children, icon, count }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-3 font-medium border-2 ${active
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25'
            : 'bg-white/50 text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md dark:bg-white/5 dark:text-gray-400 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20'
            }`}
    >
        {icon}
        <span>{children}</span>
        {count !== undefined && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${active
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400'
                }`}>
                {count}
            </span>
        )}
    </motion.button>
);

const ExamStats = ({ exams, examStats, isLoading = false }) => {
    const totalQuestions = exams.reduce((sum, exam) => sum + (exam.questions?.length || 0), 0);
    const totalDuration = exams.reduce((sum, exam) => sum + (exam.duration || 0), 0);
    const activeExams = exams.filter(exam => exam.isActive).length;

    const stats = [
        {
            title: "إجمالي الامتحانات",
            value: exams.length,
            icon: <Book className="text-blue-500" size={24} />,
            gradient: "from-blue-500 to-blue-600",
            bgGradient: "from-blue-50 to-blue-100",
            darkBg: "from-emerald-500/10 to-emerald-600/10",
            subtitle: `${activeExams} امتحان نشط`
        },
        {
            title: "إجمالي الأسئلة",
            value: totalQuestions,
            icon: <HelpCircle className="text-emerald-500" size={24} />,
            gradient: "from-emerald-500 to-emerald-600",
            bgGradient: "from-emerald-50 to-emerald-100",
            darkBg: "from-emerald-500/10 to-emerald-600/10",
            subtitle: "في جميع الامتحانات"
        },
        {
            title: "متوسط الدرجات",
            value: examStats.averageGrade || "0%",
            icon: <Award className="text-amber-500" size={24} />,
            gradient: "from-amber-500 to-amber-600",
            bgGradient: "from-amber-50 to-amber-100",
            darkBg: "from-emerald-500/10 to-emerald-600/10",
            subtitle: "متوسط جميع الطلاب"
        },
        {
            title: "الطلاب المشاركون",
            value: examStats.totalStudents || 0,
            icon: <Users className="text-purple-500" size={24} />,
            gradient: "from-purple-500 to-purple-600",
            bgGradient: "from-purple-50 to-purple-100",
            darkBg: "from-emerald-500/10 to-emerald-600/10",
            subtitle: "إجمالي المشاركين"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} dark:bg-gradient-to-br dark:${stat.darkBg} rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 dark:border-white/10`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">{stat.title}</p>
                            {isLoading ? (
                                <div className="h-8 w-20 bg-gray-200 dark:bg-white/10 animate-pulse rounded-lg"></div>
                            ) : (
                                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</h3>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.subtitle}</p>
                        </div>
                        <div className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg`}>
                            {stat.icon}
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full"></div>
                    <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-white/5 rounded-full"></div>
                </motion.div>
            ))}
        </div>
    );
};

const DraggableQuestion = ({ question, index, onEdit, onDelete, onDragEnd }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300 dark:bg-white/5 dark:border-white/10 dark:hover:border-white/20"
        >
            {/* Question Number Badge */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                {index + 1}
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Reorder Controls */}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const newIndex = index - 1;
                                    if (newIndex >= 0) {
                                        onDragEnd(null, { point: { y: newIndex * 100 } });
                                    }
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all disabled:opacity-30 dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
                                disabled={index === 0}
                                title="تحريك لأعلى"
                            >
                                <ArrowUp size={14} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const newIndex = index + 1;
                                    onDragEnd(null, { point: { y: newIndex * 100 } });
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
                                title="تحريك لأسفل"
                            >
                                <ArrowDown size={14} />
                            </motion.button>
                        </div>

                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white leading-relaxed">
                                {question.title}
                            </h4>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onEdit(index)}
                            className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 dark:text-blue-400 dark:hover:bg-blue-500/10"
                            title="تعديل السؤال"
                        >
                            <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDelete(index)}
                            className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl transition-all duration-200 dark:text-red-400 dark:hover:bg-red-500/10"
                            title="حذف السؤال"
                        >
                            <Trash2 size={18} />
                        </motion.button>
                    </div>
                </div>

                {/* Question Image */}
                {question.imageUrl && (
                    <div className="relative">
                        <img
                            src={question.imageUrl}
                            alt="Question"
                            className="w-full h-48 object-cover rounded-xl border-2 border-gray-100 dark:border-white/10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                    </div>
                )}

                {/* Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(question.options).map(([key, value], idx) => {
                        const isCorrect = question.correctAnswer === key;
                        const arabicLabels = ['أ', 'ب', 'ج', 'د'];

                        return (
                            <div
                                key={key}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${isCorrect
                                    ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800 dark:from-emerald-500/10 dark:to-emerald-600/10 dark:border-emerald-500/30 dark:text-emerald-400'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCorrect
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                                        }`}>
                                        {arabicLabels[idx]}
                                    </div>
                                    <span className="flex-1 font-medium">{value}</span>
                                    {isCorrect && (
                                        <CheckCircle size={20} className="text-emerald-500" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

const ExamManage = () => {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [editingExamId, setEditingExamId] = useState(null);
    const [newExam, setNewExam] = useState({
        title: '',
        duration: 30,
        questions: [],
        visibility: 'public',
        courseId: '',
        passingScore: 60,
        maxAttempts: -1,
        isUnlimitedAttempts: true,
        showResultsImmediately: true,
        shuffleQuestions: false,
        isActive: true,
        startDate: '',
        endDate: '',
        instructions: ''
    });
    const [activeTab, setActiveTab] = useState('manage');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState({ field: 'title', direction: 'asc' });
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState({
        title: 'الاختيار الصح ؟',
        options: { a: 'أ', b: 'ب', c: 'ج', d: 'د' },
        correctAnswer: '',
        imageFile: null,
        imagePreview: null
    });
    // Add stats state
    const [examStats, setExamStats] = useState({
        totalStudents: 0,
        averageGrade: 0
    });
    // Add loading state for stats
    const [statsLoading, setStatsLoading] = useState(true);

    // Add pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalExams: 0
    });
    const [pageSize] = useState(10);

    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Add useDebounce hook at the top of your file
    function useDebounce(value, delay) {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);

        return debouncedValue;
    }

    useEffect(() => {
        fetchExams();
        fetchExamStats(); // Fetch exam statistics
        fetchCourses(); // Fetch available courses
    }, [debouncedSearchTerm, pagination.currentPage, pageSize]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/exam/courses');
            setCourses(response.data.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('حدث خطأ في تحميل الكورسات');
        }
    };

    const fetchExamStats = async () => {
        try {
            setStatsLoading(true); // Start loading
            // Fetch student rankings to get number of students and avg grades
            const response = await api.get('/rank/all');

            if (response.data && response.data.success) {
                const students = response.data.data || [];

                // Calculate average percentage across all students
                let totalPercentage = 0;
                students.forEach(student => {
                    totalPercentage += (student.percentage || 0);
                });

                const averageGrade = students.length > 0
                    ? Math.round(totalPercentage / students.length)
                    : 0;

                setExamStats({
                    totalStudents: students.length,
                    averageGrade: `${averageGrade}%`
                });
            }
        } catch (error) {
            console.error('Error fetching exam stats:', error);
            // Set default values in case of error
            setExamStats({
                totalStudents: 0,
                averageGrade: "0%"
            });
        } finally {
            setStatsLoading(false); // End loading
        }
    };

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/exam`, {
                params: {
                    page: pagination.currentPage,
                    limit: pageSize,
                    search: debouncedSearchTerm
                }
            });

            setExams(response.data.exams);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                totalExams: response.data.totalExams
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching exams:', error);
            toast.error('حدث خطأ في تحميل الامتحانات');
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    // Add Pagination Component
    const Pagination = () => (
        <div className="flex justify-center items-center gap-2 mt-4">
            <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5"
            >
                السابق
            </button>
            <span className="text-white">
                صفحة {pagination.currentPage} من {pagination.totalPages}
            </span>
            <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5"
            >
                التالي
            </button>
        </div>
    );

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCurrentQuestion(prev => ({
                ...prev,
                imageFile: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleEditQuestion = (questionIndex) => {
        const question = newExam.questions[questionIndex];
        setCurrentQuestion({
            ...question,
            imageFile: null,
            imagePreview: question.imageUrl
        });
        setEditingQuestionIndex(questionIndex);
    };

    const addQuestion = () => {
        if (!currentQuestion.title || !currentQuestion.correctAnswer) {
            toast.error('يرجى إكمال بيانات السؤال');
            return;
        }

        if (editingQuestionIndex !== null) {
            // Update existing question
            setNewExam(prev => ({
                ...prev,
                questions: prev.questions.map((q, index) =>
                    index === editingQuestionIndex ? currentQuestion : q
                )
            }));
            setEditingQuestionIndex(null);
        } else {
            // Add new question
            setNewExam(prev => ({
                ...prev,
                questions: [...prev.questions, currentQuestion]
            }));
        }

        // Reset form
        setCurrentQuestion({
            title: 'الاختيار الصح ؟',
            options: { a: 'أ', b: 'ب', c: 'ج', d: 'د' },
            correctAnswer: '',
            imageFile: null,
            imagePreview: null
        });
    };

    const handleReorderQuestions = (dragIndex, hoverIndex) => {
        setNewExam(prev => {
            const updatedQuestions = [...prev.questions];
            const draggedQuestion = updatedQuestions[dragIndex];
            updatedQuestions.splice(dragIndex, 1);
            updatedQuestions.splice(hoverIndex, 0, draggedQuestion);
            return { ...prev, questions: updatedQuestions };
        });
    };

   const handleEditExam = async (exam) => {
    try {
        // Fetch the full exam data first
        const response = await api.get(`/exam/${exam._id}`);
        const fullExam = response.data;

        setIsEditing(true);
        setEditingExamId(exam._id);
        setActiveTab('create'); // Switch to create tab for editing

        // Handle courseId properly - check if it's an object or string
        let courseId = '';
        if (fullExam.courseId) {
            if (typeof fullExam.courseId === 'object' && fullExam.courseId._id) {
                courseId = fullExam.courseId._id;
            } else if (typeof fullExam.courseId === 'string') {
                courseId = fullExam.courseId;
            }
        }

        // Set the form data
        setNewExam({
            title: fullExam.title,
            duration: fullExam.duration,
            visibility: fullExam.visibility || 'public',
            courseId: courseId,
            passingScore: fullExam.passingScore || 60,
            maxAttempts: fullExam.maxAttempts || -1,
            isUnlimitedAttempts: fullExam.isUnlimitedAttempts !== false,
            showResultsImmediately: fullExam.showResultsImmediately !== false,
            shuffleQuestions: fullExam.shuffleQuestions || false,
            isActive: fullExam.isActive !== false,
            startDate: fullExam.startDate ? new Date(fullExam.startDate).toISOString().slice(0, 16) : '',
            endDate: fullExam.endDate ? new Date(fullExam.endDate).toISOString().slice(0, 16) : '',
            instructions: fullExam.instructions || '',
            questions: fullExam.questions.map(q => ({
                title: q.title,
                options: {
                    a: q.options.a || '',
                    b: q.options.b || '',
                    c: q.options.c || '',
                    d: q.options.d || ''
                },
                correctAnswer: q.correctAnswer,
                imageUrl: q.imageUrl,
                imageFile: null,
                imagePreview: q.imageUrl
            }))
        });

        // Debug log to see what courseId we're setting
        console.log('Setting courseId:', courseId, 'from fullExam.courseId:', fullExam.courseId);
    } catch (error) {
        console.error('Error fetching exam details:', error);
        toast.error('حدث خطأ في تحميل بيانات الامتحان');
    }
};
    const handleDeleteExam = async (examId) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
            try {
                await api.delete(`/exam/${examId}`);
                toast.success('تم حذف الامتحان بنجاح');
                fetchExams(); // Refresh the list
            } catch (error) {
                console.error('Error deleting exam:', error);
                toast.error('حدث خطأ في حذف الامتحان');
            }
        }
    };

    const handleSubmit = async () => {
        if (!newExam.title || newExam.questions.length === 0) {
            toast.error('يرجى إكمال جميع البيانات المطلوبة');
            return;
        }

        // Additional validation for course-specific exams
        if ((newExam.visibility === 'course_only' || newExam.visibility === 'both') && !newExam.courseId) {
            toast.error('يرجى اختيار كورس للامتحان');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newExam.title);
            formData.append('duration', newExam.duration);

            // Add all the new exam settings
            formData.append('visibility', newExam.visibility);
            if (newExam.courseId && newExam.courseId.trim() !== '') {
                formData.append('courseId', newExam.courseId);
            }
            formData.append('passingScore', newExam.passingScore);
            formData.append('maxAttempts', newExam.isUnlimitedAttempts ? -1 : newExam.maxAttempts);
            formData.append('isUnlimitedAttempts', newExam.isUnlimitedAttempts);
            formData.append('showResultsImmediately', newExam.showResultsImmediately);
            formData.append('shuffleQuestions', newExam.shuffleQuestions);
            formData.append('isActive', newExam.isActive);
            if (newExam.startDate && newExam.startDate.trim() !== '') {
                formData.append('startDate', newExam.startDate);
            }
            if (newExam.endDate && newExam.endDate.trim() !== '') {
                formData.append('endDate', newExam.endDate);
            }
            formData.append('instructions', newExam.instructions);

            // Process questions
            const questionsToSubmit = newExam.questions.map(q => {
                // Remove client-side only properties
                const { imageFile, imagePreview, ...questionData } = q;

                // Ensure proper structure
                return {
                    title: questionData.title,
                    options: {
                        a: questionData.options.a,
                        b: questionData.options.b,
                        c: questionData.options.c,
                        d: questionData.options.d
                    },
                    correctAnswer: questionData.correctAnswer,
                    imageUrl: questionData.imageUrl || null
                };
            });

            // Append image files if they exist
            newExam.questions.forEach((question, index) => {
                if (question.imageFile) {
                    formData.append(`questions[${index}]`, question.imageFile);
                }
            });

            formData.append('questions', JSON.stringify(questionsToSubmit));

            // Debug log to see what's being sent
            console.log('Submitting exam with data:', {
                title: newExam.title,
                duration: newExam.duration,
                visibility: newExam.visibility,
                courseId: newExam.courseId,
                passingScore: newExam.passingScore,
                maxAttempts: newExam.isUnlimitedAttempts ? -1 : newExam.maxAttempts,
                isUnlimitedAttempts: newExam.isUnlimitedAttempts,
                showResultsImmediately: newExam.showResultsImmediately,
                shuffleQuestions: newExam.shuffleQuestions,
                isActive: newExam.isActive,
                startDate: newExam.startDate,
                endDate: newExam.endDate,
                instructions: newExam.instructions
            });

            if (isEditing) {
                await api.put(`/exam/${editingExamId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('تم تحديث الامتحان بنجاح');
            } else {
                await api.post('/exam', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('تم إنشاء الامتحان بنجاح');
            }

            // Reset form and switch to manage tab
            setNewExam({
                title: '',
                duration: 30,
                questions: [],
                visibility: 'public',
                courseId: '',
                passingScore: 60,
                maxAttempts: -1,
                isUnlimitedAttempts: true,
                showResultsImmediately: true,
                shuffleQuestions: false,
                isActive: true,
                startDate: '',
                endDate: '',
                instructions: ''
            });
            setCurrentQuestion({
                title: '',
                options: { a: '', b: '', c: '', d: '' },
                correctAnswer: '',
                imageFile: null,
                imagePreview: null
            });
            setIsEditing(false);
            setEditingExamId(null);
            setActiveTab('manage'); // Switch to manage tab
            fetchExams(); // Refresh the list
        } catch (error) {
            console.error('Error submitting exam:', error);
            toast.error(isEditing ? 'حدث خطأ في تحديث الامتحان' : 'حدث خطأ في إنشاء الامتحان');
        }
    };

    const TabButton = ({ id, active, children, icon }) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(id)}
            className={`relative px-8 py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 font-semibold text-lg ${active
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-md border-2 border-gray-200 hover:border-gray-300 dark:bg-white/5 dark:text-gray-400 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20'
                }`}
        >
            {icon}
            <span>{children}</span>
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
        </motion.button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const filteredExams = exams.filter(exam => {
        // Search filter
        const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Visibility filter
        if (filter === 'all') return matchesSearch;
        if (filter === 'public') return matchesSearch && exam.visibility === 'public';
        if (filter === 'course_only') return matchesSearch && exam.visibility === 'course_only';
        if (filter === 'both') return matchesSearch && exam.visibility === 'both';
        if (filter === 'inactive') return matchesSearch && !exam.isActive;

        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
            <div className="container mx-auto p-6 font-arabicUI3">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                                إدارة الامتحانات
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                قم بإنشاء وإدارة امتحاناتك بسهولة ومرونة
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('create')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl flex items-center gap-3 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                            >
                                <Plus size={20} />
                                امتحان جديد
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Dashboard */}
                <ExamStats
                    exams={exams}
                    examStats={examStats}
                    isLoading={statsLoading || loading}
                />

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-4 mb-8 bg-white/60 backdrop-blur-sm p-2 rounded-3xl border-2 border-gray-100 dark:bg-white/5 dark:border-white/10"
                >
                    <TabButton
                        id="manage"
                        active={activeTab === 'manage'}
                        icon={<BarChart2 size={20} />}
                    >
                        إدارة الامتحانات
                    </TabButton>
                    <TabButton
                        id="create"
                        active={activeTab === 'create'}
                        icon={<Plus size={20} />}
                    >
                        {isEditing ? 'تعديل امتحان' : 'إنشاء امتحان جديد'}
                    </TabButton>
                </motion.div>

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'manage' ? (
                        <motion.div
                            key="manage"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Search and Filters */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 mb-8 border-2 border-gray-100 dark:bg-white/5 dark:border-white/10">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <SearchBar value={searchTerm} onChange={setSearchTerm} />
                                    <div className="flex flex-wrap gap-3">
                                        <FilterChip
                                            active={filter === 'all'}
                                            onClick={() => setFilter('all')}
                                            icon={<Filter size={18} />}
                                            count={exams.length}
                                        >
                                            الكل
                                        </FilterChip>
                                        <FilterChip
                                            active={filter === 'public'}
                                            onClick={() => setFilter('public')}
                                            icon={<Users size={18} />}
                                            count={exams.filter(e => e.visibility === 'public').length}
                                        >
                                            عام
                                        </FilterChip>
                                        <FilterChip
                                            active={filter === 'course_only'}
                                            onClick={() => setFilter('course_only')}
                                            icon={<GraduationCap size={18} />}
                                            count={exams.filter(e => e.visibility === 'course_only').length}
                                        >
                                            كورسات
                                        </FilterChip>
                                        <FilterChip
                                            active={filter === 'inactive'}
                                            onClick={() => setFilter('inactive')}
                                            icon={<EyeOff size={18} />}
                                            count={exams.filter(e => !e.isActive).length}
                                        >
                                            غير نشط
                                        </FilterChip>
                                    </div>
                                </div>
                            </div>

                            {/* Exams List */}
                            <div className="space-y-6">
                                {loading ? (
                                    <div className="grid gap-6">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="bg-white/60 rounded-3xl p-6 animate-pulse">
                                                <div className="h-6 bg-gray-200 rounded-xl mb-4 w-1/3"></div>
                                                <div className="h-4 bg-gray-200 rounded-lg mb-2 w-2/3"></div>
                                                <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredExams.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-16 bg-white/60 rounded-3xl border-2 border-dashed border-gray-300 dark:bg-white/5 dark:border-white/20"
                                    >
                                        <Book size={64} className="mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                            لا توجد امتحانات
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                                            قم بإنشاء امتحان جديد للبدء
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setActiveTab('create')}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold"
                                        >
                                            إنشاء امتحان جديد
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    filteredExams.map((exam, index) => (
                                        <motion.div
                                            key={exam._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <ExamCard
                                                exam={exam}
                                                onDelete={handleDeleteExam}
                                                onEdit={handleEditExam}
                                            />
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {!loading && exams.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-8"
                                >
                                    <Pagination />
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="create"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-3xl p-8 shadow-xl dark:bg-white/5 dark:border-white/10"
                        >
                            <ExamCreationForm
                                newExam={newExam}
                                setNewExam={setNewExam}
                                currentQuestion={currentQuestion}
                                setCurrentQuestion={setCurrentQuestion}
                                editingQuestionIndex={editingQuestionIndex}
                                courses={courses}
                                isEditing={isEditing}
                                onSubmit={handleSubmit}
                                onAddQuestion={addQuestion}
                                onEditQuestion={handleEditQuestion}
                                onDeleteQuestion={(index) => {
                                    setNewExam({
                                        ...newExam,
                                        questions: newExam.questions.filter((_, idx) => idx !== index)
                                    });
                                }}
                                onReorderQuestions={handleReorderQuestions}
                                onImageChange={handleImageChange}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Question Management Component
const QuestionManagement = ({
    newExam, currentQuestion, setCurrentQuestion, editingQuestionIndex,
    onAddQuestion, onEditQuestion, onDeleteQuestion, onReorderQuestions, onImageChange
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl p-6 border-2 border-amber-100 dark:border-amber-500/20"
        >
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <HelpCircle className="text-amber-500" size={24} />
                إدارة الأسئلة
                <span className="text-sm bg-amber-100 text-amber-600 px-3 py-1 rounded-full dark:bg-amber-500/20 dark:text-amber-400">
                    {newExam.questions.length} سؤال
                </span>
            </h4>

            {/* Question Input Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-gray-100 dark:bg-white/5 dark:border-white/10">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            نص السؤال
                        </label>
                        <input
                            type="text"
                            placeholder="أدخل نص السؤال هنا..."
                            value={currentQuestion.title}
                            onChange={(e) => setCurrentQuestion({
                                ...currentQuestion,
                                title: e.target.value
                            })}
                            className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white"
                        />
                    </div>

                    {/* Answer Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            خيارات الإجابة
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(currentQuestion.options).map((key, idx) => {
                                const arabicLabels = ['أ', 'ب', 'ج', 'د'];
                                return (
                                    <div key={key} className="relative">
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            الخيار {arabicLabels[idx]}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={`أدخل الخيار ${arabicLabels[idx]}`}
                                            value={currentQuestion.options[key]}
                                            onChange={(e) => setCurrentQuestion({
                                                ...currentQuestion,
                                                options: {
                                                    ...currentQuestion.options,
                                                    [key]: e.target.value
                                                }
                                            })}
                                            className="w-full p-3 bg-white/80 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Correct Answer and Image Upload */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                الإجابة الصحيحة
                            </label>
                            <select
                                value={currentQuestion.correctAnswer}
                                onChange={(e) => setCurrentQuestion({
                                    ...currentQuestion,
                                    correctAnswer: e.target.value
                                })}
                                className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white"
                            >
                                 <option className=' text-black' value="">اختر الإجابة الصحيحة</option>
                                {Object.keys(currentQuestion.options).map((key, idx) => {
                                    const arabicOptions = ['أ', 'ب', 'ج', 'د'];
                                    return (
                                         <option className=' text-black' key={key} value={key}>
                                            الخيار {arabicOptions[idx]}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                صورة السؤال (اختياري)
                            </label>
                            <label className="flex items-center justify-center w-full md:w-auto p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-300 gap-2">
                                <ImageIcon size={20} />
                                <span>رفع صورة</span>
                                <input
                                    type="file"
                                    onChange={onImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Image Preview */}
                    {currentQuestion.imagePreview && (
                        <div className="relative">
                            <img
                                src={currentQuestion.imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-2xl border-2 border-gray-200"
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setCurrentQuestion({
                                    ...currentQuestion,
                                    imageFile: null,
                                    imagePreview: null
                                })}
                                className="absolute top-3 right-3 p-2 bg-red-500 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
                            >
                                <X size={16} />
                            </motion.button>
                        </div>
                    )}

                    {/* Add Question Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onAddQuestion}
                        disabled={!currentQuestion.title || !currentQuestion.correctAnswer}
                        className="w-full p-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-semibold transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        {editingQuestionIndex !== null ? 'تحديث السؤال' : 'إضافة السؤال'}
                    </motion.button>
                </div>
            </div>

            {/* Questions List */}
            {newExam.questions.length > 0 && (
                <div className="space-y-4">
                    <h5 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText className="text-amber-500" size={20} />
                        قائمة الأسئلة
                    </h5>
                    <div className="space-y-4">
                        {newExam.questions.map((q, index) => (
                            <DraggableQuestion
                                key={index}
                                question={q}
                                index={index}
                                onEdit={onEditQuestion}
                                onDelete={onDeleteQuestion}
                                onDragEnd={(e, info) => {
                                    if (!info?.point?.y && info?.point?.y !== 0) return;
                                    const hoverIndex = Math.round(info.point.y / 100);
                                    if (hoverIndex >= 0 && hoverIndex < newExam.questions.length && hoverIndex !== index) {
                                        onReorderQuestions(index, hoverIndex);
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Enhanced Exam Creation Form Component
const ExamCreationForm = ({
    newExam, setNewExam, currentQuestion, setCurrentQuestion,
    editingQuestionIndex, courses, isEditing, onSubmit,
    onAddQuestion, onEditQuestion, onDeleteQuestion, onReorderQuestions, onImageChange
}) => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {isEditing ? 'تعديل الامتحان' : 'إنشاء امتحان جديد'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    {isEditing ? 'قم بتعديل بيانات الامتحان' : 'أضف امتحان جديد مع الأسئلة والإعدادات'}
                </p>
            </div>

            {/* Basic Information */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border-2 border-blue-100 dark:border-blue-500/20"
            >
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                    <FileText className="text-blue-500" size={24} />
                    المعلومات الأساسية
                </h4>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            عنوان الامتحان
                        </label>
                        <input
                            type="text"
                            placeholder="أدخل عنوان الامتحان..."
                            value={newExam.title}
                            onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                            className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-blue-500/50"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Timer className="text-blue-500" size={16} />
                                مدة الامتحان (دقيقة)
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="30"
                                value={newExam.duration}
                                onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                                className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-blue-500/50"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Eye className="text-blue-500" size={16} />
                                نوع الامتحان
                            </label>
                            <select
                                value={newExam.visibility}
                                onChange={(e) => setNewExam({ ...newExam, visibility: e.target.value })}
                                className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-blue-500/50"
                            >
                                 <option className=' text-black' value="public">عام - متاح للجميع</option>
                                 <option className=' text-black' value="course_only">خاص بكورس - للمشتركين فقط</option>
                                 <option className=' text-black' value="both">مختلط - متاح في الكورس وعام</option>
                            </select>
                        </div>
                    </div>

                    {/* Course Selection */}
                    {(newExam.visibility === 'course_only' || newExam.visibility === 'both') && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <GraduationCap className="text-blue-500" size={16} />
                                اختر الكورس
                            </label>
                            <select
                                value={newExam.courseId}
                                onChange={(e) => setNewExam({ ...newExam, courseId: e.target.value })}
                                className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-blue-500/50"
                                required={newExam.visibility === 'course_only'}
                            >
                                 <option className=' text-black' value="">اختر كورس...</option>
                                {courses.map(course => (
                                     <option className=' text-black' key={course._id} value={course._id}>
                                        {course.name} - {course.level}
                                    </option>
                                ))}
                            </select>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Advanced Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-2xl p-6 border-2 border-emerald-100 dark:border-emerald-500/20"
            >
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                    <Settings className="text-emerald-500" size={24} />
                    الإعدادات المتقدمة
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Target className="text-emerald-500" size={16} />
                            الدرجة المطلوبة للنجاح (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={newExam.passingScore}
                            onChange={(e) => setNewExam({ ...newExam, passingScore: e.target.value })}
                            className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            عدد المحاولات المسموحة
                        </label>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    id="unlimited"
                                    name="attemptType"
                                    checked={newExam.isUnlimitedAttempts}
                                    onChange={() => setNewExam({ ...newExam, isUnlimitedAttempts: true, maxAttempts: -1 })}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label htmlFor="unlimited" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    محاولات غير محدودة
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    id="limited"
                                    name="attemptType"
                                    checked={!newExam.isUnlimitedAttempts}
                                    onChange={() => setNewExam({ ...newExam, isUnlimitedAttempts: false, maxAttempts: 1 })}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label htmlFor="limited" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    عدد محدود من المحاولات
                                </label>
                            </div>
                            {!newExam.isUnlimitedAttempts && (
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={newExam.maxAttempts > 0 ? newExam.maxAttempts : 1}
                                    onChange={(e) => setNewExam({ ...newExam, maxAttempts: parseInt(e.target.value) || 1 })}
                                    className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white"
                                    placeholder="أدخل عدد المحاولات"
                                />
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar className="text-emerald-500" size={16} />
                            تاريخ البداية (اختياري)
                        </label>
                        <input
                            type="datetime-local"
                            value={newExam.startDate}
                            onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
                            className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar className="text-emerald-500" size={16} />
                            تاريخ النهاية (اختياري)
                        </label>
                        <input
                            type="datetime-local"
                            value={newExam.endDate}
                            onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
                            className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تعليمات الامتحان
                    </label>
                    <textarea
                        value={newExam.instructions}
                        onChange={(e) => setNewExam({ ...newExam, instructions: e.target.value })}
                        placeholder="أدخل التعليمات والملاحظات للطلاب..."
                        rows="4"
                        className="w-full p-4 bg-white/80 border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all resize-none dark:bg-white/5 dark:border-white/10 dark:text-white"
                    />
                </div>

                <div className="flex flex-wrap gap-6 mt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={newExam.showResultsImmediately}
                            onChange={(e) => setNewExam({ ...newExam, showResultsImmediately: e.target.checked })}
                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">إظهار النتائج فوراً</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={newExam.shuffleQuestions}
                            onChange={(e) => setNewExam({ ...newExam, shuffleQuestions: e.target.checked })}
                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ترتيب عشوائي للأسئلة</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={newExam.isActive}
                            onChange={(e) => setNewExam({ ...newExam, isActive: e.target.checked })}
                            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">تفعيل الامتحان</span>
                    </label>
                </div>
            </motion.div>

            {/* Questions Section */}
            <QuestionManagement
                newExam={newExam}
                currentQuestion={currentQuestion}
                setCurrentQuestion={setCurrentQuestion}
                editingQuestionIndex={editingQuestionIndex}
                onAddQuestion={onAddQuestion}
                onEditQuestion={onEditQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onReorderQuestions={onReorderQuestions}
                onImageChange={onImageChange}
            />

            {/* Submit Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSubmit}
                disabled={!newExam.title || newExam.questions.length === 0}
                className="w-full p-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-3xl text-xl font-bold transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none dark:disabled:from-gray-600 dark:disabled:to-gray-700"
            >
                {isEditing ? 'تحديث الامتحان' : 'إنشاء الامتحان'}
            </motion.button>
        </div>
    );
};

// Sub-components
const StatsCard = ({ title, value, icon, change, isLoading }) => (
    <div className="bg-white border border-gray-200 backdrop-blur-xl rounded-xl p-6 dark:bg-white/5 dark:border-white/10">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm dark:text-gray-400">{title}</p>
                {isLoading ? (
                    <div className="h-7 w-24 mt-1 bg-gray-200 animate-pulse rounded-md dark:bg-white/10"></div>
                ) : (
                    <h3 className="text-2xl font-bold text-gray-800 mt-1 dark:text-white">{value}</h3>
                )}
                <p className="text-sm text-gray-400 mt-2">{change}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg dark:bg-white/5">
                {icon}
            </div>
        </div>
    </div>
);

const ExamCard = ({ exam, onDelete, onEdit }) => {
    const examUrl = `${window.location.origin}/quiz/${exam._id}`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(examUrl);
            toast.success('تم نسخ رابط الامتحان');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('فشل نسخ الرابط');
        }
    };

    const getVisibilityLabel = (visibility) => {
        switch (visibility) {
            case 'public': return 'عام';
            case 'course_only': return 'خاص بكورس';
            case 'both': return 'مختلط';
            default: return 'عام';
        }
    };

    const getVisibilityColor = (visibility) => {
        switch (visibility) {
            case 'public': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
            case 'course_only': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
            case 'both': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 backdrop-blur-xl rounded-xl p-6 hover:border-gray-300 transition-all dark:bg-white/5 dark:border-white/10 dark:hover:border-white/20"
        >
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{exam.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityColor(exam.visibility)}`}>
                                {getVisibilityLabel(exam.visibility)}
                            </span>
                            {!exam.isActive && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                                    غير مفعل
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            <span className="text-gray-500 flex items-center gap-2 dark:text-gray-400">
                                <Clock size={16} />
                                {exam.duration} دقيقة
                            </span>
                            <span className="text-gray-500 flex items-center gap-2 dark:text-gray-400">
                                <HelpCircle size={16} />
                                {exam.questions?.length || 0} أسئلة
                            </span>
                            <span className="text-gray-500 flex items-center gap-2 dark:text-gray-400">
                                <Award size={16} />
                                {exam.passingScore}% للنجاح
                            </span>
                            <span className="text-gray-500 flex items-center gap-2 dark:text-gray-400">
                                <Users size={16} />
                                {exam.isUnlimitedAttempts || exam.maxAttempts === -1
                                    ? 'محاولات غير محدودة'
                                    : `${exam.maxAttempts} محاولة`
                                }
                            </span>
                        </div>

                        {exam.courseId && (
                            <div className="mt-2">
                                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded dark:bg-blue-500/20 dark:text-blue-400">
                                    الكورس: {exam.courseId.name} - {exam.courseId.level}
                                </span>
                            </div>
                        )}

                        {exam.instructions && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {exam.instructions}
                            </div>
                        )}

                        {(exam.startDate || exam.endDate) && (
                            <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {exam.startDate && (
                                    <span>البداية: {new Date(exam.startDate).toLocaleDateString('ar-EG')}</span>
                                )}
                                {exam.endDate && (
                                    <span>النهاية: {new Date(exam.endDate).toLocaleDateString('ar-EG')}</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit && onEdit(exam)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors dark:text-blue-400 dark:hover:bg-blue-500/10"
                            title="تعديل"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => onDelete && onDelete(exam._id)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-500/10"
                            title="حذف"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 dark:bg-white/5 dark:border-white/10">
                    <input
                        type="text"
                        value={examUrl}
                        readOnly
                        className="flex-1 bg-transparent text-gray-500 text-sm outline-none dark:text-gray-400"
                    />
                    <button
                        onClick={copyLink}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded transition-colors text-sm dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-400"
                    >
                        نسخ الرابط
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ExamManage;
