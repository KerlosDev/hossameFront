'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FaLock, FaPlay } from "react-icons/fa";
import Link from 'next/link';
import { FaChalkboardTeacher } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import Head from 'next/head';
import axios from 'axios';
import Cookies from 'js-cookie';
import VideoPlayer from '../../components/player';
import { File } from 'lucide-react';

// Dynamically import Plyr with no SSR to avoid hydration issues
const Plyr = dynamic(() => import('plyr-react'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-900 flex items-center justify-center">جاري تحميل...</div>
});

const CoursePageSkeleton = dynamic(() => import('../../admin/components/CoursePageSkeleton'));

// Dynamic import for EnrollmentSection with loading fallback
const EnrollmentSection = dynamic(
    () => import('../../components/EnrollmentSection'),
    {
        loading: () => <div className="w-full md:w-96 h-48 bg-white/5 animate-pulse rounded-xl"></div>,
        ssr: false
    }
);



const CoursePage = () => {
    const params = useParams();
    const { courseid } = params;

    const [courseInfo, setCourseInfo] = useState({});
    const [courseVideoChapters, setCourseVideoChapters] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeIndex2, setActiveIndex2] = useState(100);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);
    const [activeChapter, setActiveChapter] = useState(0);
    const [activeLesson, setActiveLesson] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [chapterDetails, setChapterDetails] = useState([]);
    const [enrollmentMessage, setEnrollmentMessage] = useState("");

    // Fetch course data and check enrollment status
    useEffect(() => {
        const fetchCourseData = async () => {
            setLoading(true);
            try {
                // Get basic course data first
                const courseResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/course/${courseid}`);
                let courseData = courseResponse.data;

                // Set basic course info
                setCourseInfo({
                    nameofcourse: courseData.name,
                    description: courseData.description,
                    price: courseData.price,
                    isFree: courseData.isFree,
                    level: courseData.level,
                    nicknameforcourse: courseid
                });

                // Check if user is logged in by getting token from cookies
                const token = Cookies.get('token');
                let chaptersData = courseData.chapters || [];
                let enrollmentStatus = false;

                if (token) {
                    setUser({ token });
                    try {
                        // Check enrollment status
                        const enrollmentResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/active/${courseid}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (enrollmentResponse.data) {
                            enrollmentStatus = enrollmentResponse.data.isHeEnrolled;
                            setIsEnrolled(enrollmentStatus);
                            setEnrollmentMessage(enrollmentResponse.data.message);

                            // If enrolled, use the detailed chapter data from enrollment response
                            if (enrollmentStatus && enrollmentResponse.data.enrollment?.courseId?.chapters) {
                                chaptersData = enrollmentResponse.data.enrollment.courseId.chapters;
                            }
                        }
                    } catch (error) {
                        console.error("Error checking enrollment:", error);
                        setIsEnrolled(false);
                    }
                }

                // Process chapters
                if (chaptersData.length > 0) {
                    setChapterDetails(chaptersData);
                    const formattedChapters = chaptersData.map(chapter => {
                        // Check if the chapter has lessons
                        const hasLessons = chapter.lessons && chapter.lessons.length > 0;

                        return {
                            id: chapter._id,
                            nameofchapter: chapter.title,
                            lessons: hasLessons
                                ? chapter.lessons.map(lesson => ({
                                    id: lesson._id,
                                    name: lesson.title,
                                    // Always include fileName from API
                                    fileName: lesson.fileName,
                                    // Only include link and fileUrl if enrolled
                                    link: enrollmentStatus ? lesson.videoUrl : null,
                                    fileUrl: enrollmentStatus ? lesson.fileUrl : null,
                                    // Lock lessons for non-enrolled users
                                    locked: !enrollmentStatus
                                }))
                                : enrollmentStatus
                                    ? [] // Empty array if enrolled but no lessons
                                    : [{ id: '1', name: 'لا توجد دروس متاحة', locked: true }] // Placeholder if not enrolled and no lessons
                        };
                    });
                    setCourseVideoChapters(formattedChapters);
                }

                // Set exams
                if (courseData.exams && courseData.exams.length > 0) {
                    const examData = courseData.exams.map(exam => ({
                        id: exam._id,
                        title: exam.title
                    }));
                    setExams(examData);
                }

            } catch (error) {
                console.error("Error fetching course data:", error);
            } finally {
                setLoading(false);
                setIsLoaded(true);
            }
        };

        if (courseid) {
            fetchCourseData();
        }
    }, [courseid]);

    useEffect(() => {
        // Update the document title when courseInfo changes
        if (courseInfo.nameofcourse) {
            document.title = `${courseInfo.nameofcourse} - منصة حسام ميرة `;
        }
    }, [courseInfo]);

    useEffect(() => {
        // Set isReady after hydration
        setIsReady(true);
    }, []);

    const handlechapterClick = (index) => {
        setActiveIndex(index);
        setActiveIndex2(100);
    };

    const handlechapterClick2 = (index) => {
        setActiveIndex2(index);
        setActiveIndex(1000);
    };
    const handleLessonClick = async (chapterIndex, lessonIndex) => {
        // ✅ لو نفس الدرس اللي شغال، بلاش تبعت تاني
        if (activeChapter === chapterIndex && activeLesson === lessonIndex) return;

        setActiveChapter(chapterIndex);
        setActiveLesson(lessonIndex);
        setActiveIndex2(100); // Reset exam selection

        const selectedLesson = courseVideoChapters[chapterIndex]?.lessons[lessonIndex];
        const selectedChapter = chapterDetails[chapterIndex];

        if (!selectedLesson || !selectedChapter || !courseid || !user?.token) return;

        // Only record watch history if the lesson has a video URL
        if (selectedLesson.link) {
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/watchHistory`,
                    {
                        courseId: courseid,
                        chapterId: selectedChapter._id,
                        lessonId: selectedLesson.id,
                        lessonTitle: selectedLesson.name
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        }
                    }
                );


            } catch (error) {
                console.error('❌ خطأ في تسجيل المشاهدة:', error);
            }
        }
    };


    // Show locked content if no user or not enrolled
    const isContentLocked = !user || !isEnrolled;

    // Combine all loading states
    const isPageLoading = loading || !isReady || !isLoaded;

    if (isPageLoading) {
        return (
            <>
                <Head>
                    <title>جاري التحميل... -  حسام ميرة  </title>
                </Head>
                <div dir='rtl' className="min-h-screen bg-[#0A1121] text-white font-arabicUI3">
                    <div className="fixed inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
                        <div className="absolute h-full w-full bg-[url('/grid.svg')] opacity-[0.02]" />
                    </div>
                    <div className="relative max-w-7xl mx-auto px-4 py-8">
                        <CoursePageSkeleton />
                    </div>
                </div>
            </>
        );
    }

    // Get current video URL
    const currentVideoUrl = courseVideoChapters.length > 0 &&
        courseVideoChapters[activeChapter]?.lessons &&
        courseVideoChapters[activeChapter]?.lessons[activeLesson]?.link;

    return (
        <>
            <Head>
                <title>{courseInfo.nameofcourse ? `${courseInfo.nameofcourse} - منصة حسام ميرة   ` : 'منصة  حسام ميرة   '}</title>
                {/* Add Plyr CSS */}
                <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
                {/* Add custom styling for Plyr */}
                <style jsx global>{`
                    .plyr-container {
                        --plyr-color-main: #3b82f6;
                        --plyr-video-control-color: white;
                        --plyr-menu-background: rgba(30, 41, 59, 0.9);
                        --plyr-menu-color: white;
                        height: 100%;
                        width: 100%;
                    }
                    .plyr {
                        height: 100%; 
                        width: 100%;
                    }
                `}</style>
            </Head>
            <div dir='rtl' className="min-h-screen bg-[#0A1121] text-white font-arabicUI3">
                {/* Animated Background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
                    <div className="absolute h-full w-full bg-[url('/grid.svg')] opacity-[0.02]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-8">

                    {/* Course Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Course Info */}
                            <div className="flex-1 space-y-4">
                                <div className="inline-flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full">
                                    <FaChalkboardTeacher className="text-blue-400" />
                                    <span className="text-blue-400">كورس {courseInfo.level || "تعليمي"}</span>
                                </div>
                                <h1 className="text-4xl font-bold text-white">{courseInfo.nameofcourse}</h1>
                                <pre className="text-gray-400 text-lg whitespace-pre-line" style={{ fontFamily: 'inherit', background: 'none', border: 'none', padding: 0, margin: 0 }}>{courseInfo.description}</pre>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <img src="/prof.jpg"
                                            className="w-10 h-10 rounded-full border-2 border-blue-500" />
                                        <div>
                                            <p className="text-white">أ/ حسام ميرة   </p>
                                            <p className="text-sm text-gray-400">مدرس المادة</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Show enrollment status if enrolled */}
                                {isEnrolled && (
                                    <div className="mt-2 inline-flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-green-400">أنت مشترك في هذا الكورس</span>
                                    </div>
                                )}
                            </div>

                            {/* Enrollment Card */}
                            <div className="w-full md:w-96">
                                <EnrollmentSection courseInfo={courseInfo} isCourseFound={isEnrolled} />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Video Section */}


                        <div className="lg:col-span-2 space-y-6">                            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                            {currentVideoUrl && !isContentLocked && isReady ? (
                                <VideoPlayer
                                    videoUrl={currentVideoUrl}
                                ></VideoPlayer>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <FaLock className="text-4xl text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">
                                            {!user ? "قم بتسجيل الدخول للوصول إلى المحتوى" :
                                                !isEnrolled ? "اشترك في الكورس للوصول إلى المحتوى" :
                                                    !currentVideoUrl && courseVideoChapters.length > 0 ? "لا يوجد فيديو متاح لهذا الدرس" :
                                                        courseVideoChapters.length === 0 ? "لا يوجد دروس متاحة حالياً" :
                                                            "اختر درساً للمشاهدة"}
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>

                            {/* Chapter and Lesson Info */}
                            <div className="bg-gray-800/50 rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-2">
                                    {courseVideoChapters.length > 0 ? courseVideoChapters[activeChapter]?.nameofchapter : "المحتوى مقفل"}
                                </h2>
                                <h3 className="text-lg text-gray-200 mb-4">
                                    {courseVideoChapters.length > 0 && courseVideoChapters[activeChapter]?.lessons.length > 0
                                        ? courseVideoChapters[activeChapter]?.lessons[activeLesson]?.name
                                        : "قم بالاشتراك لعرض المحتوى"}
                                </h3>
                            </div>
                        </div>

                        {/* Chapters List */}
                        <div className="bg-gray-800/50 rounded-xl h-fit">
                            <div className="p-4 border-b border-gray-700">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    محتويات الكورس
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-700/50 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700">
                                {courseVideoChapters.length > 0 ? (
                                    courseVideoChapters.map((chapter, chapterIndex) => (
                                        <div key={chapter.id} className="p-4 hover:bg-gray-700/30 transition-colors">
                                            <div className="mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                        <span className="text-blue-400 font-medium">{chapterIndex + 1}</span>
                                                    </div>
                                                    <h4 className="text-white font-medium">{chapter.nameofchapter}</h4>
                                                </div>
                                            </div>                                            <div className="space-y-2 pr-4">
                                                {chapter.lessons.map((lesson, lessonIndex) => (
                                                    <div key={lesson.id} className="mb-1">
                                                        <button
                                                            onClick={() => isEnrolled && handleLessonClick(chapterIndex, lessonIndex)}
                                                            className={`w-full p-3 flex items-center gap-3 rounded-lg transition-all duration-200 
                                                                ${activeChapter === chapterIndex && activeLesson === lessonIndex
                                                                    ? 'bg-blue-500/20 shadow-lg shadow-blue-500/10'
                                                                    : 'hover:bg-gray-700/30'}`}
                                                            disabled={!isEnrolled || lesson.locked}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                                ${activeChapter === chapterIndex && activeLesson === lessonIndex
                                                                    ? 'bg-blue-500'
                                                                    : 'bg-gray-700'}`}
                                                            >
                                                                {!isEnrolled || lesson.locked ? (
                                                                    <FaLock className="text-gray-400 text-xs" />
                                                                ) : (
                                                                    <FaPlay className={`${activeChapter === chapterIndex && activeLesson === lessonIndex
                                                                        ? 'text-white'
                                                                        : 'text-gray-400'
                                                                        } text-xs`} />
                                                                )}
                                                            </div>
                                                            <div className="text-right flex-1">
                                                                <p className={`text-sm transition-colors ${activeChapter === chapterIndex && activeLesson === lessonIndex
                                                                    ? 'text-blue-400 font-medium'
                                                                    : lesson.locked ? 'text-gray-500' : 'text-gray-300'
                                                                    }`}>
                                                                    {lesson.name}
                                                                </p>
                                                            </div>
                                                        </button>
                                                        {/* File name or link below lesson button - always show fileName if present */}

                                                        {lesson && lesson.fileName && (  
                                                            <div className="flex items-center mt-2 mr-12 group">
                                                                {isEnrolled && lesson.fileUrl ? (
                                                                    <a
                                                                        href={lesson.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-5 py-2 rounded-lg w-full bg-green-500/10 text-green-400 text-lg font-semibold transition ease-in-out ml-1 flex items-center gap-1 group-hover:text-green-900 group-hover:bg-green-500"
                                                                    >
                                                                        <File className="w-6 h-6 text-green-500 group-hover:text-green-900" />
                                                                        {lesson.fileName || "تحميل الملف"}
                                                                    </a>
                                                                ) : (
                                                                    <div className="px-5 py-2 rounded-lg w-full bg-gray-700/30 text-gray-400 text-lg font-semibold flex items-center gap-1">
                                                                        <FaLock className="w-5 h-5 text-gray-400" />
                                                                        {lesson.fileName}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-400">
                                        {isEnrolled ? "لا يوجد دروس متاحة حالياً" : "محتويات الكورس مقفلة - يرجى الاشتراك لعرض المحتوى"}
                                    </div>
                                )}
                            </div>

                            {/* Quiz Section */}
                            <div className="border-t border-gray-700">
                                <div className="p-4 border-b border-gray-700">
                                    <h3 className="text-lg font-medium text-white">الاختبارات</h3>
                                </div>
                                <div className="divide-y divide-gray-700">
                                    {exams?.length > 0 ? (
                                        exams.map((quiz, index) => (
                                            <Link
                                                href={isEnrolled ? `/quiz/${quiz.id}` : '#'}
                                                key={index}
                                                className={`w-full p-4 flex items-center gap-4 hover:bg-gray-700/50 transition
                                                ${activeIndex2 === index ? 'bg-blue-500/20' : ''}
                                                ${!isEnrolled ? 'pointer-events-none opacity-50' : ''}`}
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                                                ${activeIndex2 === index ? 'bg-blue-500' : 'bg-gray-700'}`}>
                                                    {isEnrolled ? <BiSolidPencil className="text-white" /> : <FaLock className="text-gray-400" />}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white font-medium">{quiz.title}</p>
                                                    <p className="text-sm text-gray-400">اختبار تفاعلي</p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-400">
                                            لا يوجد اختبارات متاحة حالياً
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Show login prompt if no user */}
                {!user && !loading && (
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-center p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">يرجى تسجيل الدخول</h2>
                        <p className="text-gray-400 mb-4">قم بتسجيل الدخول للوصول إلى محتوى الكورس</p>
                        <Link href="/sign-in">
                            <button className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl">
                                تسجيل الدخول
                            </button>
                        </Link>
                    </div>
                )}

                {/* Show enrollment prompt if user is logged in but not enrolled */}
                {user && !isEnrolled && !loading && (
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-center p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">لم يتم تفعيل الكورس بعد</h2>
                        <p className="text-gray-400 mb-4">يرجى الاشتراك للحصول على كامل المحتوى</p>
                        <Link href={`/payment/${courseInfo.nicknameforcourse || courseid}`}>
                            <button className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl">
                                الذهاب لصفحة الدفع
                            </button>
                        </Link>
                    </div>
                )}
            </div >
        </>
    );
};

export default CoursePage;