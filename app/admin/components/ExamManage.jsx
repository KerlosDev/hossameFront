'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Book, Plus, Save, X, Image as ImageIcon,
    Edit2, Trash2, CheckCircle, AlertCircle, HelpCircle,
    BarChart2, Users, Award, Search, Filter, Calendar, ArrowDown, ArrowUp, Download
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

const SearchBar = ({ value, onChange }) => (
    <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400" size={20} />
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="البحث عن امتحان..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:border-blue-400 transition-colors rounded-xl dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500/50"
        />
    </div>
);

const FilterButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${active
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10'
            }`}
    >
        {children}
    </button>
);

const ExamStats = ({ exams }) => {
    const totalQuestions = exams.reduce((sum, exam) => sum + (exam.questions?.length || 0), 0);
    const totalDuration = exams.reduce((sum, exam) => sum + (exam.duration || 0), 0);
    const avgScore = "85%"; // You can calculate this from actual exam results

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-white/5 dark:border-white/10">
                <p className="text-gray-500 text-sm dark:text-gray-400">إجمالي الأسئلة</p>
                <p className="text-2xl font-bold text-gray-800 mt-1 dark:text-white">{totalQuestions}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-white/5 dark:border-white/10">
                <p className="text-gray-500 text-sm dark:text-gray-400">إجمالي المدة</p>
                <p className="text-2xl font-bold text-gray-800 mt-1 dark:text-white">{totalDuration} دقيقة</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-white/5 dark:border-white/10">
                <p className="text-gray-500 text-sm dark:text-gray-400">متوسط الدرجات</p>
                <p className="text-2xl font-bold text-gray-800 mt-1 dark:text-white">{avgScore}</p>
            </div>
        </div>
    );
};

const DraggableQuestion = ({ question, index, onEdit, onDelete, onDragEnd }) => {
    return (<motion.div
        className="p-4 bg-white border border-gray-200 rounded-xl dark:bg-white/5 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
    >
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">                            <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const newIndex = index - 1;
                            if (newIndex >= 0) {
                                onDragEnd(null, { point: { y: newIndex * 100 } });
                            }
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50 dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
                        disabled={index === 0}
                        title="تحريك لأعلى"
                    >
                        ▲
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const newIndex = index + 1;
                            onDragEnd(null, { point: { y: newIndex * 100 } });
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors dark:hover:text-blue-400 dark:hover:bg-blue-500/10"
                        title="تحريك لأسفل"
                    >
                        ▼
                    </button>
                </div>
                <span className="text-gray-400">#{index + 1}</span>
                <h4 className="text-gray-800 dark:text-white">{question.title}</h4>
            </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(index)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors dark:text-blue-400 dark:hover:bg-blue-500/10"
                        title="تعديل السؤال"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(index)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded transition-colors dark:text-red-400 dark:hover:bg-red-500/10"
                        title="حذف السؤال"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {question.imageUrl && (
                <img
                    src={question.imageUrl}
                    alt="Question"
                    className="mt-2 h-32 object-cover rounded-lg"
                />
            )}

            <div className="grid grid-cols-2 gap-2">
                {Object.entries(question.options).map(([key, value]) => (
                    <div
                        key={key}
                        className={`text-sm p-2 rounded ${question.correctAnswer === key
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
                            }`}
                    >
                        {key}: {value}
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
    );
};

const ExamManage = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [editingExamId, setEditingExamId] = useState(null);
    const [newExam, setNewExam] = useState({
        title: '',
        duration: 30,
        questions: []
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
    }, [debouncedSearchTerm, pagination.currentPage, pageSize]);

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

            // Set the form data
            setNewExam({
                title: fullExam.title,
                duration: fullExam.duration,
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

        try {
            const formData = new FormData();
            formData.append('title', newExam.title);
            formData.append('duration', newExam.duration);

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
            setNewExam({ title: '', duration: 30, questions: [] });
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

    const TabButton = ({ id, active, children }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 rounded-lg transition-all duration-300 ${active
                ? 'bg-blue-500/20 text-blue-400'
                : 'hover:bg-white/5 text-gray-400'
                }`}
        >
            {children}
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const filteredExams = exams.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 font-arabicUI3 rounded-lg min-h-screen bg-gray-50 text-gray-800 dark:bg-transparent dark:text-white">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="إجمالي الامتحانات"
                    value={pagination.totalExams}
                    icon={<Book className="text-blue-500" />}
                    change="إجمالي الامتحانات المتاحة"
                    isLoading={loading}
                />
                <StatsCard
                    title="متوسط الدرجات"
                    value={examStats.averageGrade || "0%"}
                    icon={<Award className="text-green-500" />}
                    change="متوسط الدرجات لجميع الطلاب"
                    isLoading={statsLoading}
                />
                <StatsCard
                    title="عدد الطلاب المشاركين"
                    value={examStats.totalStudents || 0}
                    icon={<Users className="text-purple-500" />}
                    change="عدد الطلاب المشاركين في الامتحانات"
                    isLoading={statsLoading}
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <TabButton id="manage" active={activeTab === 'manage'}>
                    إدارة الامتحانات
                </TabButton>
                <TabButton id="create" active={activeTab === 'create'}>
                    إنشاء امتحان جديد
                </TabButton>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 gap-6">
                {activeTab === 'manage' ? (
                    /* Manage Exams Tab */
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">قائمة الامتحانات</h2>
                            <button
                                onClick={() => setActiveTab('create')}
                                className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-400"
                            >
                                <Plus size={20} />
                                إضافة امتحان جديد
                            </button>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <SearchBar value={searchTerm} onChange={setSearchTerm} />
                            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
                                <Filter size={20} />
                                الكل
                            </FilterButton>
                            <FilterButton active={filter === 'recent'} onClick={() => setFilter('recent')}>
                                <Calendar size={20} />
                                الأحدث
                            </FilterButton>
                        </div>

                        <div className="grid gap-4">                            {filteredExams.map((exam) => (
                            <ExamCard
                                key={exam._id}
                                exam={exam}
                                onDelete={handleDeleteExam}
                                onEdit={handleEditExam}
                            />
                        ))}
                        </div>

                        {/* Add Pagination component here */}
                        {!loading && exams.length > 0 && <Pagination />}
                    </div>
                ) : (
                    /* Create Exam Tab */
                    <div className="bg-white border border-gray-200 backdrop-blur-xl rounded-xl p-6 dark:bg-white/5 dark:border-white/10">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 dark:text-white">إنشاء امتحان جديد</h3>
                        {/* Move the exam creation form here */}
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="عنوان الامتحان"
                                    value={newExam.title}
                                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-800 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                />
                                <div className="flex items-center gap-4">
                                    <Clock className="text-gray-400" />
                                    <input
                                        type="number"
                                        placeholder="مدة الامتحان (دقائق)"
                                        value={newExam.duration}
                                        onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-800 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">الأسئلة</h4>

                                {/* Question Input */}
                                <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200 dark:bg-white/5 dark:border-white/10">
                                    <input
                                        type="text"
                                        placeholder="السؤال"
                                        value={currentQuestion.title}
                                        onChange={(e) => setCurrentQuestion({
                                            ...currentQuestion,
                                            title: e.target.value
                                        })}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-800 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                    />

                                    {/* Options */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.keys(currentQuestion.options).map((key) => (
                                            <input
                                                key={key}
                                                type="text"
                                                placeholder={`الإجابة ${key}`}
                                                value={currentQuestion.options[key]}
                                                onChange={(e) => setCurrentQuestion({
                                                    ...currentQuestion,
                                                    options: {
                                                        ...currentQuestion.options,
                                                        [key]: e.target.value
                                                    }
                                                })}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-800 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                            />
                                        ))}
                                    </div>

                                    {/* Correct Answer & Image Upload */}
                                    <div className="flex gap-4">
                                        <select
                                            value={currentQuestion.correctAnswer}
                                            onChange={(e) => setCurrentQuestion({
                                                ...currentQuestion,
                                                correctAnswer: e.target.value
                                            })}
                                            className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-gray-800 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                        >
                                            <option value="">الإجابة الصحيحة</option>
                                            {Object.keys(currentQuestion.options).map((key, idx) => {
                                                const arabicOptions = ['ا', 'ب', 'ج', 'د'];
                                                return (
                                                    <option className='text-black' key={key} value={key}>
                                                        الإجابة {arabicOptions[idx]}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        <label className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl text-gray-800 cursor-pointer hover:bg-gray-100 transition-colors dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10">
                                            <ImageIcon size={20} />
                                            <input
                                                type="file"
                                                onChange={handleImageChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {currentQuestion.imagePreview && (
                                        <div className="relative">
                                            <img
                                                src={currentQuestion.imagePreview}
                                                alt="Preview"
                                                className="w-full h-40 object-cover rounded-xl"
                                            />
                                            <button
                                                onClick={() => setCurrentQuestion({
                                                    ...currentQuestion,
                                                    imageFile: null,
                                                    imagePreview: null
                                                })}
                                                className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        onClick={addQuestion}
                                        className="w-full p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-colors dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-400"
                                    >
                                        إضافة السؤال
                                    </button>
                                </div>

                                {/* Questions List */}
                                <div className="space-y-2">                                    {newExam.questions.map((q, index) => (
                                    <DraggableQuestion
                                        key={index}
                                        question={q}
                                        index={index}
                                        onEdit={handleEditQuestion}
                                        onDelete={(i) => {
                                            setNewExam({
                                                ...newExam,
                                                questions: newExam.questions.filter((_, idx) => idx !== i)
                                            });
                                        }}
                                        onDragEnd={(e, info) => {
                                            if (!info?.point?.y && info?.point?.y !== 0) return;
                                            const hoverIndex = Math.round(info.point.y / 100);
                                            if (hoverIndex >= 0 && hoverIndex < newExam.questions.length) {
                                                handleReorderQuestions(index, hoverIndex);
                                            }
                                        }}
                                    />
                                ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!newExam.title || newExam.questions.length === 0}
                                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-500 dark:disabled:text-white"
                            >
                                {isEditing ? 'تحديث الامتحان' : 'إنشاء الامتحان'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 backdrop-blur-xl rounded-xl p-6 hover:border-gray-300 transition-all dark:bg-white/5 dark:border-white/10 dark:hover:border-white/20"
        >
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{exam.title}</h3>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-gray-500 flex items-center gap-2 dark:text-gray-400">
                                <Clock size={16} />
                                {exam.duration} دقيقة
                            </span>
                            <span className="text-gray-500 flex items-center gap-2 dark:text-gray-400">
                                <HelpCircle size={16} />
                                {exam.questions?.length || 0} أسئلة
                            </span>
                        </div>
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
