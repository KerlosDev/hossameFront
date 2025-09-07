import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FileText, AlertCircle, Clock, Download, Play, PieChart, BarChart, Award, Book, Users, Brain, X, Check, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartPieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from "recharts";
import { LightbulbIcon } from "lucide-react";
import { Lightbulb, BookmarkPlus, BookmarkCheck, RefreshCw } from 'lucide-react';
import { FaSquareRootAlt, FaInfinity, FaCalculator } from "react-icons/fa";
import MemoryGame from "./Game";

// Colors for charts
const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#ec4899', '#f43f5e', '#f97316'];


const adviceDatabase = [
  {
    title: "نصيحة اليوم",
    content: "التعلم المستمر هو مفتاح النجاح. خصص 30 دقيقة يومياً للمراجعة وستلاحظ تحسناً كبيراً في مستواك الدراسي.",
    tags: ["دراسة", "تنظيم الوقت", "نجاح"]
  },
  {
    title: "فكرة مفيدة",
    content: "تقسيم المهام الكبيرة إلى خطوات صغيرة يجعلها أكثر قابلية للإنجاز. ركز على إنجاز خطوة واحدة في كل مرة.",
    tags: ["إنتاجية", "تخطيط", "إدارة المهام"]
  },
  {
    title: "نصيحة صحية",
    content: "شرب الماء بكميات كافية يحسن التركيز ويزيد من الطاقة. احرص على شرب 8 أكواب يومياً على الأقل.",
    tags: ["صحة", "طاقة", "تركيز"]
  },
  {
    title: "للنجاح المهني",
    content: "تطوير مهاراتك باستمرار يفتح أبواباً جديدة للفرص. خصص وقتاً أسبوعياً لتعلم مهارة جديدة.",
    tags: ["تطوير ذاتي", "مهارات", "عمل"]
  },
  {
    title: "للحياة المتوازنة",
    content: "خصص وقتاً للاسترخاء والتأمل يومياً. عشر دقائق من التأمل تساعد في تقليل التوتر وتحسين جودة الحياة.",
    tags: ["توازن", "صحة نفسية", "تأمل"]
  },
  {
    title: "نصيحة للمذاكرة",
    content: "تغيير مكان المذاكرة من وقت لآخر يساعد على تحسين التركيز وتنشيط الذاكرة. جرب الدراسة في أماكن مختلفة.",
    tags: ["دراسة", "تركيز", "ذاكرة"]
  },
  {
    title: "للعلاقات الإيجابية",
    content: "الاستماع الجيد هو أساس التواصل الفعال. ركز على فهم الآخرين قبل أن تتوقع منهم فهمك.",
    tags: ["علاقات", "تواصل", "استماع"]
  }
];

// Helper function to convert seconds to minutes and seconds format
const convertSecondsToMinutes = (seconds) => {
  if (!seconds && seconds !== 0) return '0 ث';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes} م ${remainingSeconds} ث`;
  } else if (minutes > 0) {
    return `${minutes} م`;
  } else {
    return `${remainingSeconds} ث`;
  }
};

// Helper function to calculate time remaining until results are revealed
const getTimeUntilReveal = (revealDate) => {
  if (!revealDate) return null;

  const now = new Date();
  const reveal = new Date(revealDate);
  const diff = reveal.getTime() - now.getTime();

  if (diff <= 0) return null; // Results should be available now

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} يوم ${hours} ساعة`;
  } else if (hours > 0) {
    return `${hours} ساعة ${minutes} دقيقة`;
  } else {
    return `${minutes} دقيقة`;
  }
};

export default function EnhancedCourseOverview() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [todayAdvice, setTodayAdvice] = useState(null);
  const [hiddenResults, setHiddenResults] = useState([]);
  const [newResultsAvailable, setNewResultsAvailable] = useState(false);
  const [selectedExamDetails, setSelectedExamDetails] = useState(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [expandedExams, setExpandedExams] = useState(new Set());
  const [selectedExamFilter, setSelectedExamFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const examsPerPage = 5;

  // Theme state - synced with header theme toggle
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load theme preference and sync with document class
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    setIsDarkMode(isDark);

    // Sync with document class
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Listen for theme changes from other components (like header)
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
    };

    // Listen for storage changes (when theme is changed in other tabs/components)
    window.addEventListener('storage', handleThemeChange);

    // Also check periodically in case theme is changed by other components in same tab
    const interval = setInterval(() => {
      const savedTheme = localStorage.getItem('theme');
      const isDark = savedTheme === 'dark';
      if (isDark !== isDarkMode) {
        setIsDarkMode(isDark);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      clearInterval(interval);
    };
  }, [isDarkMode]);



  // Check for newly available results
  const checkForNewResults = async () => {
    try {
      const cookies = document.cookie.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.trim().split('=');
        cookies[name] = value;
        return cookies;
      }, {});

      const token = cookies.token || '';

      // Check if there are any results that should now be visible
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-exam/check-results-availability`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.newResultsAvailable) {
          setNewResultsAvailable(true);
          // Refresh the student data to get updated results
          fetchStudentData();
        }
      }
    } catch (error) {
      console.error('Error checking for new results:', error);
    }
  };

  // Fetch student data from API
  const fetchStudentData = async () => {
    try {
      // Get token from cookies
      const cookies = document.cookie.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.trim().split('=');
        cookies[name] = value;
        return cookies;
      }, {});

      const token = cookies.token || '';

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-exam/my-results`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.message === "No results found.") {
        setStudentData({ results: [] });
      } else {
        setStudentData(data);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const getDailyAdvice = () => {
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const adviceIndex = dayOfYear % adviceDatabase.length;
      return adviceDatabase[adviceIndex];
    };

    setTodayAdvice(getDailyAdvice());
    fetchStudentData();

    // Set up periodic checking for new results (every 5 minutes)
    const resultCheckInterval = setInterval(() => {
      checkForNewResults();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(resultCheckInterval);
    };
  }, []);


  // Process exam data to generate statistics
  const processExamData = () => {
    if (!studentData) return null;

    // Calculate average score across all exams
    const totalScores = studentData.results.reduce((sum, exam) => {
      return sum + (exam.correctAnswers / exam.totalQuestions * 100);
    }, 0);

    const averageScore = studentData.results.length > 0 ? totalScores / studentData.results.length : 0;

    // Get unique exam titles
    const uniqueExamTitles = [...new Set(studentData.results.map(result => result.examTitle))];

    // Group exams by title and sort attempts
    const examsByTitle = {};
    studentData.results.forEach(exam => {
      if (!examsByTitle[exam.examTitle]) {
        examsByTitle[exam.examTitle] = [];
      }
      examsByTitle[exam.examTitle].push(exam);
    });

    // Sort attempts by attempt number for each exam
    Object.keys(examsByTitle).forEach(title => {
      examsByTitle[title].sort((a, b) => a.attemptNumber - b.attemptNumber);
    });

    // Get latest attempt for each unique exam (for overview)
    const latestExams = uniqueExamTitles.map(title => {
      const examsForTitle = studentData.results.filter(result => result.examTitle === title);
      return examsForTitle.reduce((latest, current) => {
        return new Date(current.examDate) > new Date(latest.examDate) ? current : latest;
      });
    });

    // Format exam dates by day for progress chart
    const examsByDay = {};
    studentData.results.forEach(exam => {
      const date = new Date(exam.examDate);
      const dayKey = date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });

      if (!examsByDay[dayKey]) {
        examsByDay[dayKey] = [];
      }

      examsByDay[dayKey].push(exam.correctAnswers / exam.totalQuestions * 100);
    });

    const progressData = Object.keys(examsByDay).map(day => ({
      day,
      score: Math.round(examsByDay[day].reduce((sum, score) => sum + score, 0) / examsByDay[day].length)
    }));

    // Create skill data based on exam performance
    const mathExams = studentData.results.filter(exam => exam.examTitle.includes("رياض") || exam.examTitle.includes("Math"));
    const generalExams = studentData.results.filter(exam => exam.examTitle.includes("عام"));

    const mathScore = mathExams.length > 0 ?
      mathExams.reduce((avg, exam) => avg + (exam.correctAnswers / exam.totalQuestions * 100), 0) / mathExams.length : 0;

    const generalScore = generalExams.length > 0 ?
      generalExams.reduce((avg, exam) => avg + (exam.correctAnswers / exam.totalQuestions * 100), 0) / generalExams.length : 0;

    const skillsData = [
      { name: "الرياضيات", value: Math.round(mathScore) || Math.round(generalScore) || 70 },
      { name: "المعرفة العامة", value: Math.round(generalScore) || 50 },
      { name: "التفكير المنطقي", value: Math.round((mathScore + generalScore) / 2) || 60 },
      { name: "التحليل", value: Math.round((mathScore * 0.7 + generalScore * 0.3)) || 65 },
      { name: "حل المشكلات", value: Math.round((mathScore * 0.6 + generalScore * 0.4)) || 75 }
    ];

    return {
      title: "نظرة عامة على الأداء",
      studentName: studentData.studentId.name,
      studentEmail: studentData.studentId.email,
      progress: Math.round(averageScore),
      level: averageScore >= 80 ? "متقدم" : averageScore >= 60 ? "متوسط" : "مبتدئ",
      rank: 5, // Placeholder since we don't have ranking data
      totalStudents: 30, // Placeholder
      progressData,
      skillsData,
      examsByTitle,
      latestExams,
      upcomingEvents: [
        { title: "امتحان الفيزياء", date: "15 مايو 2025", daysLeft: 9 },
        { title: "امتحان الأحياء", date: "22 مايو 2025", daysLeft: 16 },
      ]
    };
  };

  const course = processExamData();

  const [currentAdvice, setCurrentAdvice] = useState(null);
  const [savedAdvice, setSavedAdvice] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  // Get random advice that isn't already saved
  const getRandomAdvice = () => {
    let availableAdvice = [...adviceDatabase];

    // Filter out saved advice if there are still other options available
    if (savedAdvice.length < adviceDatabase.length) {
      availableAdvice = adviceDatabase.filter(advice =>
        !savedAdvice.some(saved => saved.content === advice.content)
      );
    }

    const randomIndex = Math.floor(Math.random() * availableAdvice.length);
    return availableAdvice[randomIndex];
  };

  // Initialize with random advice
  useEffect(() => {
    const advice = getRandomAdvice();
    setCurrentAdvice(advice);
    setIsSaved(false);
  }, []);

  // Get new advice
  const handleNewAdvice = () => {
    const advice = getRandomAdvice();
    setCurrentAdvice(advice);
    setIsSaved(false);
  };

  // Save current advice
  const handleSaveAdvice = () => {
    if (!isSaved && currentAdvice) {
      setSavedAdvice([...savedAdvice, currentAdvice]);
      setIsSaved(true);
    }
  };

  if (!currentAdvice) return null;
  const skillsData = [
    { name: 'الشرح', value: 70 },

    { name: 'الحل', value: 99 },
    { name: 'الاستمرارية', value: 95 },
    { name: 'الحفظ', value: 75 },
    { name: 'الفهم', value: 95 },]

  // Calculate level color based on progress
  const getLevelColor = () => {
    if (!course) return "text-yellow-400";
    if (course.progress >= 80) return "text-green-400";
    if (course.progress >= 60) return "text-blue-400";
    if (course.progress >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  // Format percentage for display
  const formatPercent = (value) => `${value}%`;

  // Toggle exam expansion
  const toggleExamExpansion = (examTitle) => {
    const newExpanded = new Set(expandedExams);
    if (newExpanded.has(examTitle)) {
      newExpanded.delete(examTitle);
    } else {
      newExpanded.add(examTitle);
    }
    setExpandedExams(newExpanded);
  };

  // Show exam details modal
  const showExamDetails = (exam) => {
    setSelectedExamDetails(exam);
    setShowExamModal(true);
  };

  // Close exam details modal
  const closeExamModal = () => {
    setShowExamModal(false);
    setSelectedExamDetails(null);
  };

  // ExamDetailsModal component - Optimized for performance
  const ExamDetailsModal = React.memo(({ exam, onClose }) => {
    if (!exam) return null;

    // Memoize expensive calculations
    const score = React.useMemo(() =>
      Math.round(exam.correctAnswers / exam.totalQuestions * 100), [exam.correctAnswers, exam.totalQuestions]
    );

    const { scoreColor, grade } = React.useMemo(() => {
      if (score >= 90) return { scoreColor: 'text-emerald-400', grade: 'ممتاز' };
      if (score >= 80) return { scoreColor: 'text-green-400', grade: 'جيد جداً' };
      if (score >= 70) return { scoreColor: 'text-yellow-400', grade: 'جيد' };
      if (score >= 60) return { scoreColor: 'text-orange-400', grade: 'مقبول' };
      return { scoreColor: 'text-red-400', grade: 'ضعيف' };
    }, [score]);

    return (
      <div className="fixed inset-0 bg-black/50  backdrop-blur-sm flex items-start justify-center z-[100] p-3 pt-6 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-[95vw] xl:max-w-[90vw] 2xl:max-w-[85vw] w-full mt-20 mb-10  shadow-xl border border-gray-200 dark:border-gray-700">

          {/* Compact Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 text-white rounded-t-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">{exam.examTitle}</h2>
                <p className="text-xs text-purple-100">المحاولة {exam.attemptNumber}</p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="إغلاق">
                <X size={18} />
              </button>
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 rounded-lg p-2">
                <div className={`text-lg font-bold ${scoreColor}`}>{score}%</div>
                <div className="text-xs text-purple-100">النتيجة</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <div className="text-sm font-bold text-blue-300">{exam.correctAnswers}/{exam.totalQuestions}</div>
                <div className="text-xs text-purple-100">صحيحة</div>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <div className="text-sm font-bold text-emerald-300">{convertSecondsToMinutes(exam.timeSpent)}</div>
                <div className="text-xs text-purple-100">الوقت</div>
              </div>
            </div>
          </div>

          {/* Questions Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="p-4">
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                {exam.questionResults.map((question, index) => {
                  return (
                    <div key={question._id} className={`relative border rounded-xl p-4 ${question.isCorrect ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-500/5' : 'border-red-200 bg-red-50/50 dark:border-red-500/30 dark:bg-red-500/5'
                      }`}>

                      {/* Question Badge */}
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-600 dark:text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {index + 1}
                      </div>

                      {/* Question Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${question.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                          }`}>
                          {question.isCorrect ? <Check size={14} /> : <X size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                            {question.questionTitle}
                          </h4>

                          {/* Question Image - Optimized */}
                          {question.questionImageUrl && (
                            <div className="mb-3">
                              <img
                                src={question.questionImageUrl}
                                alt="صورة السؤال"
                                className="rounded-lg max-w-full h-auto object-contain mx-auto border border-gray-200 dark:border-gray-700"
                                style={{ maxHeight: '150px' }}
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${question.isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                          }`}>
                          {question.isCorrect ? '✓' : '✗'}
                        </div>
                      </div>

                      {/* Answer Options - Simplified */}
                      <div className="space-y-2 mb-3">
                        {Object.entries(question.questionOptions).map(([key, value]) => {
                          const isStudentAnswer = question.studentAnswer === key;
                          const isCorrectAnswer = question.correctAnswer === key;

                          // Convert English letters to Arabic letters
                          const arabicLetters = { a: 'أ', b: 'ب', c: 'ج', d: 'د' };
                          const arabicKey = arabicLetters[key.toLowerCase()] || key.toUpperCase();

                          let optionClass = "p-3 rounded-lg border-2 transition-colors ";
                          let iconElement = null;
                          let optionLabelClass = "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ";

                          if (isCorrectAnswer) {
                            optionClass += "border-emerald-300 bg-emerald-50/80 dark:bg-emerald-500/15 dark:border-emerald-400/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20";
                            optionLabelClass += "bg-emerald-200 dark:bg-emerald-600 text-emerald-800 dark:text-emerald-100";
                            iconElement = <Check size={14} className="text-emerald-600 dark:text-emerald-400" />;
                          } else if (isStudentAnswer && question.studentAnswerText !== "لم يتم الإجابة") {
                            optionClass += "border-red-300 bg-red-50/80 dark:bg-red-500/15 dark:border-red-400/50 hover:bg-red-100/80 dark:hover:bg-red-500/20";
                            optionLabelClass += "bg-red-200 dark:bg-red-600 text-red-800 dark:text-red-100";
                            iconElement = <X size={14} className="text-red-600 dark:text-red-400" />;
                          } else {
                            optionClass += "border-gray-200 bg-white/80 dark:bg-gray-800/60 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-gray-700/60";
                            optionLabelClass += "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200";
                          }

                          return (
                            <div key={key} className={optionClass}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={optionLabelClass}>
                                    {arabicKey}
                                  </div>
                                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-relaxed">{value}</span>
                                </div>
                                {iconElement}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Answer Summary - Minimal */}
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">إجابتك:</span>
                            <span className={`font-medium ${question.studentAnswerText === "لم يتم الإجابة" ? 'text-gray-500' :
                              question.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                              {question.studentAnswerText}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">الصحيحة:</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{question.correctAnswerText}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simple Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {exam.totalQuestions} سؤال • {exam.correctAnswers} صحيحة • {score}%
              </div>
              <button onClick={onClose} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen relative  transition-colors duration-300" dir="rtl">
        <div className="relative z-20 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-800 dark:text-white">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-300" dir="rtl">
        <div className="relative z-20 flex items-center justify-center h-screen">
          <div className="bg-red-100 dark:bg-red-900/20 backdrop-blur-sm rounded-xl p-6 border border-red-300 dark:border-red-500/30 max-w-md text-center">
            <AlertCircle size={40} className="text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-red-800 dark:text-white">حدث خطأ أثناء تحميل البيانات</h3>
            <p className="text-red-600 dark:text-white/70">{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors text-white"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!studentData || (!course && studentData?.results?.length === 0)) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-300" dir="rtl">
        <div className="relative z-20 flex items-center justify-center h-screen">
          <div className="bg-white/80 border-gray-200 dark:bg-purple-900/20 dark:border-purple-500/30 backdrop-blur-sm rounded-xl p-6 border max-w-md text-center shadow-lg">
            <FileText size={40} className="text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">لم تقم بإجراء أي امتحانات بعد</h3>
            <p className="text-gray-600 dark:text-white/70 mb-4">ابدأ رحلتك التعليمية وقم بحل بعض الامتحانات لتتمكن من رؤية تقدمك وتحليل أدائك</p>
            <button
              onClick={() => window.location.href = '/Courses'}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors text-white"
            >
              استكشف الدورات والامتحانات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative    transition-colors duration-300" dir="rtl">
      {/* Exam Details Modal */}
      {showExamModal && selectedExamDetails && (
        <ExamDetailsModal exam={selectedExamDetails} onClose={closeExamModal} />
      )}

      {/* New Results Notification */}
      {newResultsAvailable && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="font-medium">نتائج جديدة متاحة!</span>
            <button
              onClick={() => {
                setNewResultsAvailable(false);
                window.location.reload();
              }}
              className="ml-2 px-3 py-1 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors"
            >
              تحديث
            </button>
          </div>
        </div>
      )}

      <div className="relative z-20 p-6 text-gray-900 dark:text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
              <p className="text-gray-600 dark:text-white/60">{course.studentName} • {course.studentEmail}</p>
            </div>
            <div className="bg-white/80 border-gray-200 dark:bg-purple-900/30 dark:border-white/10 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-white/60 text-sm">المستوى الحالي:</span>
                <span className={`font-bold ${getLevelColor()}`}>{course.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-white/10 pb-2">
          <button
            className={`px-4 py-2 ${activeTab === 'overview' ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' : 'text-gray-600 dark:text-white/70'}`}
            onClick={() => setActiveTab('overview')}
          >
            نظرة عامة
          </button>

          <button
            className={`px-4 py-2 ${activeTab === 'exams' ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' : 'text-gray-600 dark:text-white/70'}`}
            onClick={() => setActiveTab('exams')}
          >
            الامتحانات
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Overview sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Progress summary card */}
              <div className="  border-gray-200 hover:border-purple-400 dark:bg-gradient-to-br dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-white/10 dark:hover:border-purple-500/30 backdrop-blur-sm rounded-xl p-6 border transition-all shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <PieChart size={20} className="text-purple-600 dark:text-purple-300" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">تقدمك الإجمالي</h3>
                </div>

                <div className="flex justify-center py-4">
                  <div className="relative h-36 w-36 flex items-center justify-center">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={isDarkMode ? "#1f2937" : "#e5e7eb"}
                        strokeWidth="10"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${course.progress * 2.83} ${283 - course.progress * 2.83}`}
                        strokeDashoffset="70.75" // 283/4 to start at top
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{course.progress}%</span>
                      <span className="text-xs text-gray-600 dark:text-white/60">مكتمل</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-gray-600 dark:text-white/70 text-sm">متبقي {100 - course.progress}% لإكمال المستوى</p>
                </div>
              </div>

              {/* advice card */}
              <div className="max-w-md h-full mx-auto">
                <div className="  border-gray-200 hover:border-emerald-400  dark:bg-gradient-to-br dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-white/10 dark:hover:border-emerald-500/30 backdrop-blur-sm rounded-xl p-6 border transition-all shadow-lg h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Lightbulb size={20} className="text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{todayAdvice.title}</h3>
                  </div>

                  <div className="py-4">
                    <p className="text-gray-700 dark:text-white/80 leading-relaxed text-right mb-6">{todayAdvice.content}</p>

                    <div className="flex flex-wrap gap-2 justify-end mt-4">
                      {todayAdvice.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>



              {/* Skills radar card */}

              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Brain size={20} className="text-purple-300" />
                  </div>
                  <h3 className="font-bold text-lg">ركز علي الحاجات دي</h3>
                </div>

                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                      <PolarGrid stroke="#3f3f46" />
                      <PolarAngleAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                      <Radar
                        name="المهارات"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Progress chart */}
            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <BarChart size={20} className="text-purple-300" />
                </div>
                <h3 className="font-bold text-lg">تقدمك اليومي</h3>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={course.progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="day" tick={{ fill: '#a1a1aa' }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        borderColor: '#4c1d95',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                      }}
                      formatter={(value) => [`${value}%`, 'التقدم']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 6 }}
                      activeDot={{ r: 8, fill: '#c4b5fd' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time distribution and upcoming events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exam distribution */}

              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <FileText size={20} className="text-purple-300" />
                  </div>
                  <h3 className="font-bold text-lg">آخر الامتحانات</h3>
                </div>

                <div className="space-y-4">
                  {studentData.results.slice(-3).reverse().map((exam, index) => {
                    const score = Math.round(exam.correctAnswers / exam.totalQuestions * 100) || 0;
                    const examDate = new Date(exam.examDate);
                    const formattedDate = examDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-10 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                          <div>
                            <h4 className="font-medium">{exam.examTitle}</h4>
                            <p className="text-sm text-white/60">{formattedDate}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs ${score >= 70 ? 'bg-green-500/20 text-green-300' :
                          score >= 50 ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                          {score}%
                        </div>
                      </div>
                    );
                  })}
                </div>


              </div>

              {/* Upcoming events */}
              <MemoryGame></MemoryGame>
            </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="space-y-6">
            {/* Header with filters and search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-purple-600 dark:text-purple-400" />
                  الامتحانات
                </h3>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  {Object.keys(course?.examsByTitle || {}).length} امتحان
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600 dark:text-white/60">
                  إجمالي المحاولات: {studentData?.results?.length || 0}
                </div>
                <select
                  value={selectedExamFilter}
                  onChange={(e) => setSelectedExamFilter(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">جميع الامتحانات</option>
                  <option value="recent">الحديثة</option>
                  <option value="high-score">الأعلى درجة</option>
                </select>
              </div>
            </div>

            {studentData?.results && studentData.results.length > 0 ? (
              <div className="space-y-4">
                {/* Exams List */}
                {Object.entries(course.examsByTitle)
                  .slice((currentPage - 1) * examsPerPage, currentPage * examsPerPage)
                  .map(([examTitle, attempts]) => {
                    const bestAttempt = attempts.reduce((best, current) =>
                      (current.correctAnswers / current.totalQuestions) > (best.correctAnswers / best.totalQuestions) ? current : best
                    );
                    const latestAttempt = attempts[attempts.length - 1];
                    const averageScore = Math.round(
                      attempts.reduce((sum, attempt) => sum + (attempt.correctAnswers / attempt.totalQuestions * 100), 0) / attempts.length
                    );
                    const improvementScore = attempts.length > 1 ?
                      Math.round((latestAttempt.correctAnswers / latestAttempt.totalQuestions * 100) -
                        (attempts[0].correctAnswers / attempts[0].totalQuestions * 100)) : 0;

                    const isExpanded = expandedExams.has(examTitle);

                    return (
                      <div key={examTitle} className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
                        {/* Exam Summary Card */}
                        <div
                          className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors rounded-2xl"
                          onClick={() => toggleExamExpansion(examTitle)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                                <FileText size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                  {examTitle}
                                </h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm text-gray-600 dark:text-white/60">
                                    {attempts.length} محاولة
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-white/60">
                                    {latestAttempt.totalQuestions} سؤال
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-white/60">
                                    آخر محاولة: {new Date(latestAttempt.examDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="flex items-center gap-6">
                              {/* Best Score */}
                              <div className="text-center">
                                <div className={`text-2xl font-bold ${Math.round(bestAttempt.correctAnswers / bestAttempt.totalQuestions * 100) >= 70 ? 'text-green-600 dark:text-green-400' :
                                  Math.round(bestAttempt.correctAnswers / bestAttempt.totalQuestions * 100) >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-red-600 dark:text-red-400'}`}>
                                  {Math.round(bestAttempt.correctAnswers / bestAttempt.totalQuestions * 100)}%
                                </div>
                                <div className="text-xs text-gray-600 dark:text-white/60">أفضل نتيجة</div>
                              </div>

                              {/* Average Score */}
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-700 dark:text-white/80">
                                  {averageScore}%
                                </div>
                                <div className="text-xs text-gray-600 dark:text-white/60">متوسط</div>
                              </div>

                              {/* Improvement */}
                              {attempts.length > 1 && (
                                <div className="text-center">
                                  <div className={`text-lg font-semibold flex items-center gap-1 ${improvementScore > 0 ? 'text-green-600 dark:text-green-400' : improvementScore < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-white/60'}`}>
                                    {improvementScore > 0 ? '+' : ''}{improvementScore}%
                                    {improvementScore > 0 ? (
                                      <ChevronRight size={14} className="rotate-[-90deg]" />
                                    ) : improvementScore < 0 ? (
                                      <ChevronRight size={14} className="rotate-90" />
                                    ) : null}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-white/60">تحسن</div>
                                </div>
                              )}

                              {/* Expand Button */}
                              <button className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                                <ChevronRight
                                  size={20}
                                  className={`text-purple-600 dark:text-purple-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Attempts Section */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  <Clock size={18} className="text-purple-600 dark:text-purple-400" />
                                  تفاصيل المحاولات ({attempts.length})
                                </h5>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 dark:text-white/60">أفضل: </span>
                                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    المحاولة #{bestAttempt.attemptNumber}
                                  </span>
                                </div>
                              </div>

                              {/* Attempts Grid */}
                              <div className="grid gap-3">
                                {attempts.slice(-6).reverse().map((attempt, index) => {
                                  const score = Math.round(attempt.correctAnswers / attempt.totalQuestions * 100);
                                  const attemptDate = new Date(attempt.examDate);
                                  const formattedDate = attemptDate.toLocaleDateString('ar-EG', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });

                                  const hasDetailedResults = attempt.showDetailedResults && attempt.questionResults && attempt.questionResults.length > 0;
                                  const isBestAttempt = attempt._id === bestAttempt._id;
                                  const isLatestAttempt = attempt._id === latestAttempt._id;

                                  return (
                                    <div
                                      key={attempt._id}
                                      className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-sm ${isBestAttempt
                                        ? 'border-green-300 bg-green-50 dark:bg-green-500/10 dark:border-green-500/30'
                                        : isLatestAttempt
                                          ? 'border-blue-300 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/30'
                                          : 'border-gray-200 bg-white dark:bg-gray-800/50 dark:border-gray-600'
                                        }`}
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}>
                                            {attempt.attemptNumber}
                                          </div>
                                          <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                              المحاولة {attempt.attemptNumber}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-white/60">
                                              {formattedDate} • {convertSecondsToMinutes(attempt.timeSpent)}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex gap-2">
                                          {isBestAttempt && (
                                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                                              <Award size={10} />
                                              الأفضل
                                            </span>
                                          )}
                                          {isLatestAttempt && !isBestAttempt && (
                                            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1">
                                              <Clock size={10} />
                                              الأحدث
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-4">
                                        {/* Score */}
                                        <div className="text-center">
                                          <div className={`text-xl font-bold ${score >= 70 ? 'text-green-600 dark:text-green-400' :
                                            score >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                                              'text-red-600 dark:text-red-400'
                                            }`}>
                                            {score}%
                                          </div>
                                          <div className="text-xs text-gray-600 dark:text-white/60">
                                            {attempt.correctAnswers}/{attempt.totalQuestions}
                                          </div>
                                        </div>

                                        {/* Action Button */}
                                        {hasDetailedResults ? (
                                          <button
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              showExamDetails(attempt);
                                            }}
                                          >
                                            <Download size={14} />
                                            التفاصيل
                                          </button>
                                        ) : (
                                          <div className="flex flex-col items-end gap-2">
                                            <button
                                              className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm"
                                              disabled
                                            >
                                              <Download size={14} />
                                              مخفية
                                            </button>
                                            {attempt.resultsRevealDate && getTimeUntilReveal(attempt.resultsRevealDate) && (
                                              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg text-xs border border-yellow-200 dark:border-yellow-500/30">
                                                <AlertCircle size={12} />
                                                <span>ستظهر خلال {getTimeUntilReveal(attempt.resultsRevealDate)}</span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {attempts.length > 6 && (
                                <div className="mt-4 text-center">
                                  <span className="text-sm text-gray-600 dark:text-white/60">
                                    عرض آخر 6 محاولات من أصل {attempts.length}
                                  </span>
                                </div>
                              )}

                              {/* Performance Summary */}
                              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-purple-500/20">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                  <div>
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                      {Math.round(bestAttempt.correctAnswers / bestAttempt.totalQuestions * 100)}%
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-white/60">أفضل درجة</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">{averageScore}%</div>
                                    <div className="text-xs text-gray-600 dark:text-white/60">المتوسط</div>
                                  </div>
                                  <div>
                                    <div className={`text-lg font-bold ${improvementScore >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                      {improvementScore > 0 ? '+' : ''}{improvementScore}%
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-white/60">التحسن</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">{attempts.length}</div>
                                    <div className="text-xs text-gray-600 dark:text-white/60">المحاولات</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Pagination */}
                {Object.keys(course?.examsByTitle || {}).length > examsPerPage && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      السابق
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(Object.keys(course?.examsByTitle || {}).length / examsPerPage) }, (_, i) => i + 1).map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(Object.keys(course?.examsByTitle || {}).length / examsPerPage), currentPage + 1))}
                      disabled={currentPage === Math.ceil(Object.keys(course?.examsByTitle || {}).length / examsPerPage)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 max-w-md mx-auto shadow-sm">
                  <FileText size={48} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد نتائج امتحانات</h4>
                  <p className="text-gray-600 dark:text-white/70 mb-6">لم تقم بإجراء أي امتحانات بعد</p>
                  <button
                    onClick={() => window.location.href = '/Courses'}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium"
                  >
                    ابدأ الآن
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}