'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AiOutlineClockCircle, AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import { FiHelpCircle, FiCheck, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { FaRegQuestionCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { BsBookmarkCheck, BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import axios from 'axios';

const QuizData = ({ params }) => {
    const { quizid } = React.use(params);
    const [quiz, setQuiz] = useState(null);
    const [examInfo, setExamInfo] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [quizComplete, setQuizComplete] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [lastAnswerFeedback, setLastAnswerFeedback] = useState(null);
    const [userData, setUserData] = useState({ email: '', fullName: '' });
    const [showInstructions, setShowInstructions] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(null);
    const [examAvailability, setExamAvailability] = useState(null);

    // Convert English letters to Arabic letters
    const convertToArabicLetter = (englishLetter) => {
        const mapping = {
            'A': 'أ',
            'B': 'ب',
            'C': 'ج',
            'D': 'د',
            'a': 'أ',
            'b': 'ب',
            'c': 'ج',
            'd': 'د'
        };
        return mapping[englishLetter] || englishLetter;
    };

    // Get answer text from question and option letter
    const getAnswerText = (questionResult, optionLetter) => {
        if (!quiz?.questions || !optionLetter) {
            return optionLetter;
        }

        // Find the question that matches the result's question title
        const question = quiz.questions.find(q => q.qus === questionResult.questionTitle);
        if (!question) {
            return optionLetter;
        }

        // Normalize the option letter to uppercase for accessing the option
        const normalizedLetter = optionLetter.toUpperCase();
        const optionKey = `opation${normalizedLetter}`;
        return question[optionKey] || optionLetter;
    };

    // Load user data from cookies
    useEffect(() => {
        const userFullName = Cookies.get('username');
        if (userFullName) {
            setUserData({ fullName: userFullName });
        }
    }, []);

    // Load answers from localStorage on initial load
    useEffect(() => {
        if (quizid) {
            const savedAnswers = localStorage.getItem(`quiz_${quizid}_answers`);
            if (savedAnswers) {
                setSelectedAnswers(JSON.parse(savedAnswers));
            }
        }
    }, [quizid]);

    // Save answers to localStorage whenever they change
    useEffect(() => {
        if (quizid && Object.keys(selectedAnswers).length > 0) {
            localStorage.setItem(`quiz_${quizid}_answers`, JSON.stringify(selectedAnswers));
        }
    }, [selectedAnswers, quizid]);

    useEffect(() => {
        if (quizid) {
            loadQuizData();
        }
    }, [quizid]);
    const loadQuizData = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                await Swal.fire({
                    title: 'تسجيل الدخول مطلوب',
                    text: 'يجب عليك تسجيل الدخول أولاً للوصول إلى هذا الامتحان',
                    icon: 'warning',
                    confirmButtonText: 'تسجيل الدخول'
                });
                window.location.href = '/sign-in';
                return;
            }

            // First check exam availability
            const availabilityResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student-exam/check-availability/${quizid}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const availabilityData = availabilityResponse.data;
            setExamAvailability(availabilityData);

            if (!availabilityData.available) {
                await Swal.fire({
                    title: 'الامتحان غير متاح',
                    text: availabilityData.message,
                    icon: 'warning',
                    confirmButtonText: 'حسناً'
                });
                window.location.href = '/';
                return;
            }

            setRemainingAttempts(availabilityData.remainingAttempts);

            // If available, get the exam data
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student-exam/exam/${quizid}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response || !response.data) {
                throw new Error('لا يمكن الوصول إلى هذا الاختبار');
            }

            const examData = response.data;

            // Store exam information
            setExamInfo({
                visibility: examData.visibility || 'public',
                courseId: examData.courseId || null,
                passingScore: examData.passingScore || 60,
                maxAttempts: examData.maxAttempts || -1,
                isUnlimitedAttempts: examData.isUnlimitedAttempts !== false,
                showResultsImmediately: examData.showResultsImmediately !== false,
                shuffleQuestions: examData.shuffleQuestions || false,
                instructions: examData.instructions || '',
                startDate: examData.startDate || null,
                endDate: examData.endDate || null,
                isActive: examData.isActive !== false,
                duration: examData.duration || (examData.questions?.length * 2) // fallback: 2 minutes per question
            });

            // Convert questions data to the required format
            let questionsToShow = examData.questions.map((q) => ({
                qus: q.title,
                opationA: q.options.a,
                opationB: q.options.b,
                opationC: q.options.c,
                opationD: q.options.d,
                imageUrl: q.imageUrl,
                questionId: q._id // Store question ID for submission
            }));

            // Shuffle questions if enabled
            if (examData.shuffleQuestions) {
                questionsToShow = questionsToShow.sort(() => Math.random() - 0.5);
            }

            setQuiz({
                title: examData.title,
                questions: questionsToShow
            });

            // Set timer based on exam duration (convert minutes to seconds)
            const durationInSeconds = (examData.duration || questionsToShow.length * 2) * 60;
            setTimeLeft(durationInSeconds);

            // Show instructions if available and not empty
            if (examData.instructions && examData.instructions.trim()) {
                setShowInstructions(true);
            }

            setLoading(false);

        } catch (error) {
            console.error('Error loading quiz:', error);

            let errorMessage = 'حدث خطأ أثناء تحميل الاختبار';

            if (error.response) {
                // Server responded with error status
                if (error.response.status === 401) {
                    errorMessage = 'انتهت صلاحية جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى';
                    // Clear invalid token
                    Cookies.remove('token');
                    setTimeout(() => {
                        window.location.href = '/sign-in';
                    }, 2000);
                } else if (error.response.status === 403) {
                    errorMessage = error.response.data?.message || 'ليس لديك صلاحية للوصول إلى هذا الامتحان';
                } else if (error.response.status === 404) {
                    errorMessage = 'الامتحان غير موجود أو تم حذفه';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
                title: 'خطأ',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'حسناً'
            }).then(() => {
                if (!Cookies.get('token')) {
                    window.location.href = '/sign-in';
                } else {
                    window.location.href = '/';
                }
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        if (timeLeft === null || quizComplete) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, quizComplete]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key >= '1' && e.key <= '4') {
                const options = ['a', 'b', 'c', 'd'];
                handleAnswerSelect(options[e.key - 1]);
            } else if (e.key === 'ArrowLeft') handleNextQuestion();
            else if (e.key === 'ArrowRight') handlePrevQuestion();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentQuestion]);

    const handleAnswerSelect = (answer) => {
        const questionId = quiz.questions[currentQuestion].questionId;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
        setLastAnswerFeedback({
            message: 'إجابة مسجلة!',
            timestamp: Date.now()
        });
        setTimeout(() => setLastAnswerFeedback(null), 2000);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const calculateResults = () => {
        let score = 0;
        const detailedResults = quiz.questions.map((q, index) => {
            const questionId = q.questionId;
            const selectedAnswer = selectedAnswers[questionId];
            // Note: We can't calculate correct/incorrect here since we don't have correct answers
            // This will be handled by the server
            return {
                question: q.qus,
                userAnswer: selectedAnswer,
                userAnswerText: selectedAnswer ? q[`opation${selectedAnswer.toUpperCase()}`] : 'لم يتم الإجابة',
                questionId: questionId
            };
        });

        return {
            total: quiz.questions.length,
            details: detailedResults,
            answeredCount: Object.keys(selectedAnswers).length
        };
    };

    const handleSubmitQuiz = async () => {
        // Check for unanswered questions
        const totalQuestions = quiz.questions.length;
        const answeredQuestions = Object.keys(selectedAnswers).length;

        if (answeredQuestions < totalQuestions) {
            const unansweredCount = totalQuestions - answeredQuestions;
            await Swal.fire({
                title: 'أسئلة غير مجابة',
                html: `يرجى الإجابة على جميع الأسئلة.<br>عدد الأسئلة غير مجابة: ${unansweredCount}`,
                icon: 'warning',
                confirmButtonText: 'حسناً'
            });
            return;
        }

        try {
            const result = await Swal.fire({
                title: 'هل أنت متأكد؟',
                text: 'بعد تسليم الاختبار لا يمكنك العودة للإجابات',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'نعم، سلم الاختبار',
                cancelButtonText: 'لا، عودة للاختبار'
            });

            if (!result.isConfirmed) return;

            const token = Cookies.get('token');
            if (!token) {
                throw new Error('لم يتم العثور على رمز المصادقة');
            }

            // Calculate time spent
            const timeSpent = (examInfo ? examInfo.duration * 60 : quiz.questions.length * 120) - timeLeft;

            // Submit exam using new endpoint
            const submitResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/student-exam/submit/${quizid}`, {
                answers: selectedAnswers,
                timeSpent: timeSpent
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const serverResults = submitResponse.data;

            // Update results with server response
            const clientResults = calculateResults();
            setResults({
                ...clientResults,
                score: serverResults.results?.score || 0,
                percentage: serverResults.results?.percentage || 0,
                passed: serverResults.passed,
                showResults: examInfo?.showResultsImmediately !== false,
                serverMessage: serverResults.message,
                questionResults: serverResults.results?.questionResults || []
            });

            setQuizComplete(true);
            localStorage.removeItem(`quiz_${quizid}_answers`);

        } catch (error) {
            console.error('Error submitting quiz:', error);

            let errorMessage = 'حدث خطأ أثناء حفظ النتائج';

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'انتهت صلاحية جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى';
                    Cookies.remove('token');
                } else if (error.response.status === 403) {
                    errorMessage = error.response.data?.message || 'لا يمكنك إجراء هذا الامتحان';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            await Swal.fire({
                title: 'خطأ',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'حسناً'
            });

            if (!Cookies.get('token')) {
                window.location.href = '/sign-in';
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    // Instructions Modal
    if (showInstructions && examInfo?.instructions) {
        return (
            <div className="min-h-screen font-arabicUI3 bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-slate-800">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-arabicUI3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
                            تعليمات الامتحان
                        </h2>
                        <h3 className="text-xl text-slate-200 mb-6">{quiz?.title}</h3>
                    </div>

                    <div className="bg-slate-800/30 rounded-xl p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-400 mb-1">{quiz?.questions?.length}</div>
                                <div className="text-sm text-slate-400">عدد الأسئلة</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-2xl font-bold text-emerald-400 mb-1">{examInfo?.duration || Math.floor(timeLeft / 60)}</div>
                                <div className="text-sm text-slate-400">دقيقة</div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-400 mb-1">{examInfo?.passingScore}%</div>
                                <div className="text-sm text-slate-400">درجة النجاح</div>
                            </div>
                        </div>

                        {examAvailability && (
                            <div className="text-center mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <span className="text-yellow-400">
                                    {examAvailability.isUnlimitedAttempts || examAvailability.maxAttempts === "غير محدود"
                                        ? "محاولات غير محدودة متاحة"
                                        : `المحاولات المتبقية: ${examAvailability.remainingAttempts} من ${examAvailability.maxAttempts}`
                                    }
                                </span>
                            </div>
                        )}

                        {examInfo?.startDate && (
                            <div className="text-center mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <span className="text-blue-400">
                                    تاريخ بداية الامتحان: {new Date(examInfo.startDate).toLocaleDateString('ar-EG')}
                                </span>
                            </div>
                        )}

                        {examInfo?.endDate && (
                            <div className="text-center mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <span className="text-red-400">
                                    تاريخ انتهاء الامتحان: {new Date(examInfo.endDate).toLocaleDateString('ar-EG')}
                                </span>
                            </div>
                        )}

                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {examInfo.instructions}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowInstructions(false)}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 font-medium"
                        >
                            بدء الامتحان
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all duration-300"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (quizComplete) {
        return (
            <div dir='rtl' className="min-h-screen font-arabicUI3 bg-slate-950 text-slate-200 p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-800">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-arabicUI3 text-center mb-6 sm:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                نتائج الاختبار
                            </h2>

                            {/* Results only shown if showResultsImmediately is true */}
                            {results?.showResults !== false ? (
                                <>
                                    <div className="relative bg-slate-800/50 rounded-xl p-4 sm:p-8 mb-8 sm:mb-12">
                                        {/* Pass/Fail Status */}
                                        {results?.passed !== undefined && (
                                            <div className={`text-center mb-6 p-4 rounded-xl ${results.passed
                                                ? 'bg-green-500/10 border border-green-500/20'
                                                : 'bg-red-500/10 border border-red-500/20'
                                                }`}>
                                                <div className={`text-2xl font-bold mb-2 ${results.passed ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {results.serverMessage || (results.passed ? '🎉 تهانينا! لقد نجحت' : '😔 للأسف لم تحقق درجة النجاح')}
                                                </div>
                                                <div className="text-slate-400">
                                                    درجة النجاح المطلوبة: {examInfo?.passingScore}%
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                                            <div className="p-3 sm:p-6 bg-slate-800/30 rounded-xl">
                                                <div className="text-3xl sm:text-5xl font-arabicUI3 mb-1 sm:mb-2 text-blue-400">
                                                    {results.percentage?.toFixed(0) || 0}%
                                                </div>
                                                <div className="text-sm sm:text-base text-slate-400">النسبة المئوية</div>
                                            </div>
                                            <div className="p-3 sm:p-6 bg-slate-800/30 rounded-xl border-y sm:border-y-0 sm:border-x border-slate-700">
                                                <div className="text-3xl sm:text-5xl font-arabicUI3 mb-1 sm:mb-2 text-emerald-400">
                                                    {results.score || 0}
                                                </div>
                                                <div className="text-sm sm:text-base text-slate-400">الإجابات الصحيحة</div>
                                            </div>
                                            <div className="p-3 sm:p-6 bg-slate-800/30 rounded-xl">
                                                <div className="text-3xl sm:text-5xl font-arabicUI3 mb-1 sm:mb-2 text-slate-400">
                                                    {results.total}
                                                </div>
                                                <div className="text-sm sm:text-base text-slate-400">مجموع الأسئلة</div>
                                            </div>
                                        </div>

                                        {/* Show remaining attempts if applicable */}
                                        {examAvailability && !examAvailability.isUnlimitedAttempts && examAvailability.maxAttempts !== "غير محدود" && (examAvailability.remainingAttempts - 1) > 0 && !results?.passed && (
                                            <div className="mt-6 text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                                <div className="text-yellow-400">
                                                    يمكنك إعادة المحاولة. المحاولات المتبقية: {examAvailability.remainingAttempts - 1}
                                                </div>
                                            </div>
                                        )}

                                        {/* Show unlimited attempts message */}
                                        {examAvailability && (examAvailability.isUnlimitedAttempts || examAvailability.maxAttempts === "غير محدود") && !results?.passed && (
                                            <div className="mt-6 text-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                                <div className="text-green-400">
                                                    يمكنك إعادة المحاولة في أي وقت - محاولات غير محدودة
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Display detailed results if available */}
                                    {results.questionResults && results.questionResults.length > 0 && (
                                        <div className="space-y-4 sm:space-y-6">
                                            {results.questionResults.map((result, index) => (
                                                <div key={index}
                                                    className="bg-slate-800/30 rounded-lg p-4 sm:p-6 transition-all duration-300 hover:bg-slate-800/50">
                                                    <div className="flex flex-col gap-3 sm:gap-4">
                                                        {/* Question Details */}
                                                        <div className="flex flex-col sm:flex-row items-start gap-4">
                                                            <div className={`p-2 sm:p-3 rounded-lg ${result.isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                                }`}>
                                                                {result.isCorrect ?
                                                                    <AiOutlineCheckCircle size={24} /> :
                                                                    <AiOutlineCloseCircle size={24} />
                                                                }
                                                            </div>
                                                            <div className="flex-1 w-full">
                                                                <h3 className="text-lg font-medium mb-3">{result.questionTitle}</h3>

                                                                {/* Question Image if available */}
                                                                {quiz.questions[index]?.imageUrl && (
                                                                    <div className="mb-4 flex justify-center">
                                                                        <Image
                                                                            src={quiz.questions[index].imageUrl}
                                                                            alt="Question Image"
                                                                            width={300}
                                                                            height={225}
                                                                            className="rounded-lg border border-slate-700"
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="grid grid-cols-1 gap-4">
                                                                    <div className={`p-3 sm:p-4 rounded-lg ${result.isCorrect ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                                        <div className="text-sm text-slate-400 mb-1">
                                                                            <span className="font-medium">إجابتك: </span>
                                                                            <span className="text-slate-300">
                                                                                {convertToArabicLetter(result.studentAnswer)} - {getAnswerText(result, result.studentAnswer)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {!result.isCorrect && (
                                                                        <div className="p-3 sm:p-4 rounded-lg bg-emerald-500/10">
                                                                            <div className="text-sm text-slate-400 mb-1">
                                                                                <span className="font-medium">الإجابة الصحيحة: </span>
                                                                                <span className="text-emerald-300">
                                                                                    {convertToArabicLetter(result.correctAnswer)} - {getAnswerText(result, result.correctAnswer)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center p-8">
                                    <div className="text-6xl mb-4">✅</div>
                                    <h3 className="text-2xl font-bold text-emerald-400 mb-4">تم تسليم الامتحان بنجاح</h3>
                                    <p className="text-slate-400 mb-6">
                                        سيتم إعلان النتائج لاحقاً من قبل المدرس
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4 mt-8">
                                <Link href="/" className="flex-1">
                                    <button className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                                                     transition-all duration-300 font-medium text-base sm:text-lg">
                                        العودة للصفحة الرئيسية
                                    </button>
                                </Link>

                                {/* Retry button if attempts remaining and failed */}
                                {examAvailability && !results?.passed && (
                                    // Show retry button for unlimited attempts or if limited attempts remain
                                    (examAvailability.isUnlimitedAttempts || examAvailability.maxAttempts === "غير محدود" ||
                                        (examAvailability.remainingAttempts - 1) > 0) && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const token = Cookies.get('token');
                                                    const availabilityResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/student-exam/check-availability/${quizid}`, {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`
                                                        }
                                                    });

                                                    if (availabilityResponse.data.available) {
                                                        window.location.reload();
                                                    } else if (!availabilityResponse.data.isUnlimitedAttempts && availabilityResponse.data.remainingAttempts <= 0) {
                                                        await Swal.fire({
                                                            title: 'انتهت المحاولات',
                                                            text: 'لقد استنفدت جميع المحاولات المسموحة لهذا الامتحان',
                                                            icon: 'warning',
                                                            confirmButtonText: 'حسناً'
                                                        });
                                                    } else {
                                                        await Swal.fire({
                                                            title: 'غير متاح',
                                                            text: availabilityResponse.data.message || 'الامتحان غير متاح حالياً',
                                                            icon: 'warning',
                                                            confirmButtonText: 'حسناً'
                                                        });
                                                    }
                                                } catch (error) {
                                                    await Swal.fire({
                                                        title: 'خطأ',
                                                        text: 'حدث خطأ أثناء التحقق من المحاولات المتبقية',
                                                        icon: 'error',
                                                        confirmButtonText: 'حسناً'
                                                    });
                                                }
                                            }}
                                            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg
                                                     transition-all duration-300 font-medium"
                                        >
                                            إعادة المحاولة
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div dir='rtl' className="min-h-screen bg-slate-950 py-4 sm:py-8 px-2 sm:px-4 relative">
            {/* Enhanced Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <div className="h-1 bg-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${(currentQuestion / quiz.questions.length) * 100}%` }}
                    />
                </div>
                <div className="bg-slate-900/80 backdrop-blur-sm py-2 px-2 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-medium">
                            {Object.keys(selectedAnswers).length} / {quiz.questions.length}
                        </span>
                        <span>تم الإجابة</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>السؤال</span>
                        <span className="text-emerald-400 font-medium">{currentQuestion + 1} / {quiz.questions.length}</span>
                    </div>
                </div>
            </div>

            {/* Help Panel */}


            <div className="max-w-6xl font-arabicUI3  mx-auto">
                <div className="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-4 sm:p-8 shadow-xl border border-slate-800">
                    {/* Enhanced Header */}
                    <header className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="text-center md:text-right">
                            <h1 className="text-2xl sm:text-3xl font-arabicUI3 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                {quiz.title}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                                    درجة النجاح: {examInfo?.passingScore || 60}%
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Timer */}
                            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800/50 rounded-lg">
                                <AiOutlineClockCircle className="text-yellow-400" size={18} />
                                <span className={`font-mono text-base sm:text-lg ${timeLeft < 300 ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>

                        </div>
                    </header>

                    {/* Question Content */}
                    <div className="space-y-6 sm:space-y-8">
                        {/* Question */}
                        <div className="bg-slate-800/30 rounded-xl p-4 sm:p-6">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                                    {currentQuestion + 1}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg sm:text-xl text-slate-200 leading-relaxed mb-4">
                                        {quiz.questions[currentQuestion].qus}
                                    </h2>

                                    {/* Image if available */}
                                    {quiz.questions[currentQuestion].imageUrl && (
                                        <div className="mb-6 flex justify-center">
                                            <Image
                                                src={quiz.questions[currentQuestion].imageUrl}
                                                alt="Question Image"
                                                width={400}
                                                height={300}
                                                className="rounded-lg border border-slate-700 max-w-full h-auto"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Answer Options */}
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                            {['ا', 'ب', 'ج', 'د'].map((option, index) => {
                                const englishOption = ['a', 'b', 'c', 'd'][index];
                                const questionId = quiz.questions[currentQuestion].questionId;
                                const isSelected = selectedAnswers[questionId] === englishOption;
                                return (
                                    <motion.button
                                        key={option}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAnswerSelect(englishOption)}
                                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-right ${isSelected
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 text-slate-300 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                                                }`}>
                                                {option}
                                            </div>
                                            <span className="text-base sm:text-lg leading-relaxed">
                                                {quiz.questions[currentQuestion][`opation${englishOption.toUpperCase()}`]}
                                            </span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Answer Feedback */}
                        <AnimatePresence>
                            {lastAnswerFeedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="text-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                                >
                                    <span className="text-emerald-400 flex items-center justify-center gap-2">
                                        <BsCheckCircleFill />
                                        {lastAnswerFeedback.message}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                            <button
                                onClick={handlePrevQuestion}
                                disabled={currentQuestion === 0}
                                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg transition-all duration-300 ${currentQuestion === 0
                                    ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                    }`}
                            >
                                <FaChevronRight size={16} />
                                السابق
                            </button>

                            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center max-w-xs sm:max-w-none overflow-x-auto">
                                {quiz.questions.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-300 text-xs sm:text-sm flex-shrink-0 ${index === currentQuestion
                                            ? 'bg-blue-500 text-white'
                                            : selectedAnswers[quiz.questions[index].questionId]
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            {currentQuestion === quiz.questions.length - 1 ? (
                                <button
                                    onClick={handleSubmitQuiz}
                                    className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300"
                                >
                                    <BsBookmarkCheck size={16} />
                                    تسليم الاختبار
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextQuestion}
                                    className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                                >
                                    التالي
                                    <FaChevronLeft size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizData;