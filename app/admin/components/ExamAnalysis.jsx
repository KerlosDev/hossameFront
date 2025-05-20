'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Book, Users, Award, Clock, TrendingUp, AlertTriangle, Brain, Target, CheckCircle } from 'lucide-react';

export default function ExamAnalysis() {
    const [selectedTimeRange, setSelectedTimeRange] = useState('month');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedView, setSelectedView] = useState('overview');

    // بيانات تجريبية للرسوم البيانية
    const performanceData = [
        { month: 'يناير', متوسط: 75, أعلى: 95, أدنى: 55, معدل_النجاح: 88 },
        { month: 'فبراير', متوسط: 82, أعلى: 98, أدنى: 60, معدل_النجاح: 92 },
        { month: 'مارس', متوسط: 78, أعلى: 96, أدنى: 58, معدل_النجاح: 85 },
        { month: 'أبريل', متوسط: 85, أعلى: 100, أدنى: 65, معدل_النجاح: 94 },
        { month: 'مايو', متوسط: 88, أعلى: 99, أدنى: 68, معدل_النجاح: 96 },
        { month: 'يونيو', متوسط: 83, أعلى: 97, أدنى: 62, معدل_النجاح: 90 },
    ];

    const distributionData = [
        { name: 'ممتاز (90-100)', value: 30, color: '#4CAF50' },
        { name: 'جيد جداً (80-89)', value: 25, color: '#2196F3' },
        { name: 'جيد (70-79)', value: 20, color: '#FFC107' },
        { name: 'مقبول (60-69)', value: 15, color: '#FF9800' },
        { name: 'ضعيف (أقل من 60)', value: 10, color: '#F44336' },
    ];

    const progressData = [
        { week: 'الأسبوع 1', مستوى_الفهم: 65, معدل_الإكمال: 78 },
        { week: 'الأسبوع 2', مستوى_الفهم: 72, معدل_الإكمال: 82 },
        { week: 'الأسبوع 3', مستوى_الفهم: 78, معدل_الإكمال: 85 },
        { week: 'الأسبوع 4', مستوى_الفهم: 85, معدل_الإكمال: 90 },
    ];

    const examStats = {
        totalExams: 156,
        averageScore: 82,
        passRate: 92,
        topScore: 100,
        participationRate: 88,
        completionTime: 45
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

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <Line type="monotone" dataKey="معدل_النجاح" name="معدل النجاح" stroke="#FFD700" strokeWidth={2} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* رسم بياني دائري للتوزيع */}
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-6">توزيع الدرجات</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label
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

            {/* معلومات إضافية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <TrendingUp className="text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{examStats.topScore}</h3>
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
            </div>
        </div>
    );
}