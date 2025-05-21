'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Book, Users, Award, Clock, TrendingUp, AlertTriangle, Brain, Target, CheckCircle, RotateCw } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function ExamAnalysis() {
    const [selectedTimeRange, setSelectedTimeRange] = useState('month');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedView, setSelectedView] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [examStats, setExamStats] = useState({
        totalExams: 0,
        averageScore: 0,
        passRate: 0,
        topScore: 0,
        participationRate: 0,
        completionTime: 0,
        averageAttempts: 0
    });
    const [performanceData, setPerformanceData] = useState([]);
    const [distributionData, setDistributionData] = useState([
        { name: 'ممتاز (90-100)', value: 0, color: '#4CAF50' },
        { name: 'جيد جداً (80-89)', value: 0, color: '#2196F3' },
        { name: 'جيد (70-79)', value: 0, color: '#FFC107' },
        { name: 'مقبول (60-69)', value: 0, color: '#FF9800' },
        { name: 'ضعيف (أقل من 60)', value: 0, color: '#F44336' }
    ]);

    useEffect(() => {
        fetchExamResults();
    }, [selectedTimeRange, selectedCourse, selectedLevel]);

    const fetchExamResults = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token'); // Get token from cookies

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/examResult/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const results = response.data.data;

            // Process results for statistics
            processExamStats(results);
            processPerformanceData(results);
            processDistributionData(results);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching exam results:', error);
            setLoading(false);
        }
    };

    const processExamStats = (results) => {
        const examAttempts = {};
        const totalExams = results.reduce((sum, student) => sum + student.results.length, 0);
        let totalScore = 0;
        let totalCorrect = 0;
        let totalQuestions = 0;
        let maxScore = 0;
        let totalTime = 0;
        let participatingStudents = new Set();
        let totalAttempts = 0;
        let uniqueExams = 0;

        results.forEach(student => {
            student.results.forEach(exam => {
                const examKey = `${student.studentId?._id || student._id}-${exam.examTitle}`;
                if (!examAttempts[examKey]) {
                    examAttempts[examKey] = [];
                    uniqueExams++;
                }
                examAttempts[examKey].push({
                    attempt: exam.attemptNumber,
                    score: (exam.correctAnswers / exam.totalQuestions) * 100
                });

                totalCorrect += exam.correctAnswers;
                totalQuestions += exam.totalQuestions;
                totalTime += exam.duration || 0;
                const score = (exam.correctAnswers / exam.totalQuestions) * 100;
                maxScore = Math.max(maxScore, score);
                if (student.studentId?._id) {
                    participatingStudents.add(student.studentId._id);
                }
            });
        });

        // Calculate average attempts per exam
        const totalAttemptsSum = Object.values(examAttempts).reduce((sum, attempts) => sum + attempts.length, 0);
        const avgAttempts = uniqueExams > 0 ? totalAttemptsSum / uniqueExams : 0;

        // Calculate improvement rate between first and last attempts
        let improvementRate = 0;
        let examWithMultipleAttempts = 0;
        Object.values(examAttempts).forEach(attempts => {
            if (attempts.length > 1) {
                examWithMultipleAttempts++;
                const firstScore = attempts[0].score;
                const lastScore = attempts[attempts.length - 1].score;
                improvementRate += lastScore - firstScore;
            }
        });

        improvementRate = examWithMultipleAttempts > 0 ? improvementRate / examWithMultipleAttempts : 0;

        const avgScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
        const passCount = Object.values(examAttempts).filter(attempts =>
            attempts.some(attempt => attempt.score >= 60)
        ).length;
        const passRate = uniqueExams > 0 ? (passCount / uniqueExams) * 100 : 0;

        setExamStats({
            totalExams,
            averageScore: Math.round(avgScore),
            passRate: Math.round(passRate),
            topScore: Math.round(maxScore),
            participationRate: Math.round((participatingStudents.size / (results.length || 1)) * 100),
            completionTime: Math.round(totalTime / totalExams) || 0,
            averageAttempts: Math.round(avgAttempts * 10) / 10,
            improvementRate: Math.round(improvementRate)
        });
    };

    const processPerformanceData = (results) => {
        const monthlyData = {};

        results.forEach(student => {
            student.results.forEach(exam => {
                const date = new Date(exam.examDate);
                const monthYear = date.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

                if (!monthlyData[monthYear]) {
                    monthlyData[monthYear] = {
                        month: monthYear,
                        متوسط: 0,
                        أعلى: 0,
                        أدنى: 100,
                        معدل_النجاح: 0,
                        count: 0
                    };
                }

                const score = (exam.correctAnswers / exam.totalQuestions) * 100;
                monthlyData[monthYear].أعلى = Math.max(monthlyData[monthYear].أعلى, score);
                monthlyData[monthYear].أدنى = Math.min(monthlyData[monthYear].أدنى, score);
                monthlyData[monthYear].متوسط =
                    (monthlyData[monthYear].متوسط * monthlyData[monthYear].count + score) /
                    (monthlyData[monthYear].count + 1);
                monthlyData[monthYear].count++;
                monthlyData[monthYear].معدل_النجاح =
                    (score >= 60 ? monthlyData[monthYear].معدل_النجاح + 1 : monthlyData[monthYear].معدل_النجاح);
            });
        });

        // Convert to array and calculate final pass rate
        const performanceDataArray = Object.values(monthlyData).map(data => ({
            ...data,
            متوسط: Math.round(data.متوسط),
            أعلى: Math.round(data.أعلى),
            أدنى: Math.round(data.أدنى),
            معدل_النجاح: Math.round((data.معدل_النجاح / data.count) * 100)
        }));

        setPerformanceData(performanceDataArray.slice(-6)); // Last 6 months
    };

    const processDistributionData = (results) => {
        const distribution = {
            'ممتاز (90-100)': 0,
            'جيد جداً (80-89)': 0,
            'جيد (70-79)': 0,
            'مقبول (60-69)': 0,
            'ضعيف (أقل من 60)': 0
        };

        let totalScores = 0;

        results.forEach(student => {
            student.results.forEach(exam => {
                const score = (exam.correctAnswers / exam.totalQuestions) * 100;
                totalScores++;

                if (score >= 90) distribution['ممتاز (90-100)']++;
                else if (score >= 80) distribution['جيد جداً (80-89)']++;
                else if (score >= 70) distribution['جيد (70-79)']++;
                else if (score >= 60) distribution['مقبول (60-69)']++;
                else distribution['ضعيف (أقل من 60)']++;
            });
        });

        setDistributionData(prevData => prevData.map(item => ({
            ...item,
            value: Math.round((distribution[item.name] / totalScores) * 100) || 0
        })));
    };

    return (
        <div className="space-y-6">
            {/* رأس الصفحة */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">تحليل الامتحانات</h2>
                <p className="text-blue-100">تحليل شامل لأداء الطلاب في الامتحانات</p>

                {/* أزرار التصفية والتحكم */}
                <div className="flex flex-wrap gap-4 mt-4">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                    >
                        <option value="week">آخر أسبوع</option>
                        <option value="month">آخر شهر</option>
                        <option value="year">آخر سنة</option>
                    </select>

                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                    >
                        <option value="all">جميع الكورسات</option>
                        <option value="organic">الكيمياء العضوية</option>
                        <option value="inorganic">الكيمياء غير العضوية</option>
                        <option value="analytical">الكيمياء التحليلية</option>
                        <option value="physical">الكيمياء الفيزيائية</option>
                        <option value="nuclear">الكيمياء النووية</option>
                    </select>

                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                    >
                        <option value="all">جميع المستويات</option>
                        <option value="first">الصف الأول الثانوي</option>
                        <option value="second">الصف الثاني الثانوي</option>
                        <option value="third">الصف الثالث الثانوي</option>
                    </select>
                </div>
            </div>

            {loading ? (
                // Loading skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 h-32" />
                    ))}
                </div>
            ) : (
                <>
                    {/* إحصائيات سريعة */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-lg">
                                    <Book className="text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{examStats.totalExams}</h3>
                                    <p className="text-gray-400">إجمالي الامتحانات</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-lg">
                                    <Award className="text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{examStats.averageScore}%</h3>
                                    <p className="text-gray-400">متوسط الدرجات</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/20 rounded-lg">
                                    <Users className="text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{examStats.passRate}%</h3>
                                    <p className="text-gray-400">نسبة النجاح</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-500/20 rounded-lg">
                                    <TrendingUp className="text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{examStats.topScore}%</h3>
                                    <p className="text-gray-400">أعلى درجة</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-pink-500/20 rounded-lg">
                                    <Users className="text-pink-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{examStats.participationRate}%</h3>
                                    <p className="text-gray-400">نسبة المشاركة</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-500/20 rounded-lg">
                                    <Clock className="text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{examStats.completionTime} دقيقة</h3>
                                    <p className="text-gray-400">متوسط وقت الإكمال</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/20 rounded-lg">
                                    <RotateCw className="text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{examStats.averageAttempts}</h3>
                                    <p className="text-gray-400">متوسط المحاولات</p>
                                </div>
                            </div>
                        </div>

                        {examStats.improvementRate > 0 && (
                            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/20 rounded-lg">
                                        <TrendingUp className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">+{examStats.improvementRate}%</h3>
                                        <p className="text-gray-400">معدل التحسن</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* أزرار عرض التحليلات */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <button
                            onClick={() => setSelectedView('overview')}
                            className={`px-4 py-2 rounded-lg transition-all ${selectedView === 'overview' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`}
                        >
                            نظرة عامة
                        </button>
                        <button
                            onClick={() => setSelectedView('detailed')}
                            className={`px-4 py-2 rounded-lg transition-all ${selectedView === 'detailed' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`}
                        >
                            تحليل تفصيلي
                        </button>
                        <button
                            onClick={() => setSelectedView('progress')}
                            className={`px-4 py-2 rounded-lg transition-all ${selectedView === 'progress' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`}
                        >
                            تقدم الطلاب
                        </button>
                    </div>

                    {/* الرسوم البيانية */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* رسم بياني للأداء */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-6">تحليل الأداء</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                    <XAxis dataKey="month" stroke="#fff" />
                                    <YAxis stroke="#fff" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid rgba(255,255,255,0.2)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="أعلى" name="أعلى درجة" fill="#4CAF50" />
                                    <Bar dataKey="متوسط" name="متوسط الدرجات" fill="#2196F3" />
                                    <Bar dataKey="أدنى" name="أدنى درجة" fill="#F44336" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* توزيع الدرجات */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-6">توزيع الدرجات</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a1a',
                                            border: '1px solid rgba(255,255,255,0.2)'
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}