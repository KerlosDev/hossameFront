'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import { useRouter } from 'next/navigation'
import { PiMathOperations, PiStudentBold } from "react-icons/pi";
import { TbAtom, TbFlask, TbMouseFilled } from "react-icons/tb";
import { PiTestTubeBold, PiMoleculeBold } from "react-icons/pi";
import { RiMenu4Fill } from "react-icons/ri";
import { IoClose, IoNotifications, IoPersonCircle, IoSettingsSharp, IoShieldCheckmark } from "react-icons/io5";
import NotificationButton from './NotificationButton';
import { LuUser, LuLogOut, LuUserCircle, LuChevronDown, LuLogIn, LuUserPlus, LuGraduationCap, LuBookOpen, LuTrendingUp } from 'react-icons/lu';
import { HiAcademicCap, HiUser, HiCog, HiLogout } from 'react-icons/hi';
import sessionManager from '../utils/sessionManager';
import { Beaker } from 'lucide-react'
import { FaFlask, FaUserGraduate } from 'react-icons/fa'
import { MdOutlineCalculate } from 'react-icons/md'

const Header = () => {
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [username, setUsername] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [showMobileNotifications, setShowMobileNotifications] = useState(false);
    const dropdownRef = useRef(null);
    const [lastReadTime, setLastReadTime] = useState('0');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Mark as client-side after hydration
        setIsClient(true);

        // Set lastReadTime from localStorage after component mounts
        if (typeof window !== 'undefined') {
            const storedTime = localStorage.getItem('lastReadTime') || '0';
            setLastReadTime(storedTime);
        }
    }, []);

    useEffect(() => {
        // Check if user is logged in on component mount
        checkUserLogin();

        // Set up session manager listener
        const unsubscribe = sessionManager.addListener((event, data) => {
            if (event === 'login') {
                checkUserLogin();
            } else if (event === 'logout') {
                setIsLoggedIn(false);
                setUsername('');
                setIsAdmin(false);
                setNotifications([]);
                setUnreadCount(0);
            }
        });

        // Set up event listeners for auth state changes
        window.addEventListener('storage', checkUserLogin);
        window.addEventListener('auth_state_change', checkUserLogin);

        // Listen for session invalidation events
        const handleSessionInvalidated = (event) => {
            setIsLoggedIn(false);
            setUsername('');
            setIsAdmin(false);
            setNotifications([]);
            setUnreadCount(0);
        };
        window.addEventListener('session_invalidated', handleSessionInvalidated);

        // Custom event dispatch for login success
        const handleLoginSuccess = () => {
            checkUserLogin();
        };
        window.addEventListener('login_success', handleLoginSuccess);

        // Click outside handler for dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            unsubscribe();
            window.removeEventListener('storage', checkUserLogin);
            window.removeEventListener('auth_state_change', checkUserLogin);
            window.removeEventListener('session_invalidated', handleSessionInvalidated);
            window.removeEventListener('login_success', handleLoginSuccess);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchNotifications();
            // Fetch notifications every 5 minutes
            const interval = setInterval(fetchNotifications, 300000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn]); const checkUserLogin = () => {
        try {
            const userData = sessionManager.getUserData();

            if (userData) {
                setUsername(userData.username);
                setIsLoggedIn(true);
                setIsAdmin(userData.role === 'admin' || userData.role === 'instructor');
                return;
            }

            setUsername('');
            setIsLoggedIn(false);
            setIsAdmin(false);
        } catch (error) {
            console.error("Error checking user login:", error);
            setUsername('');
            setIsLoggedIn(false);
            setIsAdmin(false);
        }
    }; const fetchNotifications = async () => {
        try {
            const response = await sessionManager.makeAuthenticatedRequest(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/recent`,
                {
                    method: 'GET'
                }
            );

            const data = await response.json();

            if (data.success && data.data) {
                const notifArray = data.data.map(n => ({
                    id: n._id,
                    message: n.message,
                    createdAt: n.createdAt,
                    updatedAt: n.updatedAt
                }));

                setNotifications(notifArray);

                // Only calculate unread count on client side
                if (isClient) {
                    const unread = notifArray.filter(n =>
                        new Date(n.createdAt) > new Date(lastReadTime)
                    ).length;
                    setUnreadCount(unread);
                }
            } else {
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            if (error.message === 'SESSION_INVALID') {
                // Session manager will handle this automatically
                return;
            }
            console.error("Error fetching notifications:", error);
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const handleNotificationOpen = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications && isClient) {
            const now = new Date().toISOString();
            setLastReadTime(now);
            if (typeof window !== 'undefined') {
                localStorage.setItem('lastReadTime', now);
            }
            setUnreadCount(0);
        }
    };

    const handleMobileNotificationClick = () => {
        setShowMobileNotifications(!showMobileNotifications);
        if (!showMobileNotifications && isClient) {
            const now = new Date().toISOString();
            setLastReadTime(now);
            if (typeof window !== 'undefined') {
                localStorage.setItem('lastReadTime', now);
            }
            setUnreadCount(0);
        }
    };

    const handleSignUp = () => {
        router.push("/sign-up")
    }

    const handleSignIn = () => {
        router.push("/sign-in")
    }

    const handleCoursesClick = () => {
        router.push("/profile?tab=courses");
        setIsMobileMenuOpen(false);
    }; const handleProfileClick = () => {
        router.push("/profile");
        setUserDropdownOpen(false);
    }

    const handleSignOut = async () => {
        try {
            // Use session manager to handle logout
            await sessionManager.logout();

            // Clear state (session manager listener will also handle this)
            setIsLoggedIn(false);
            setUsername('');
            setUserDropdownOpen(false);
            setNotifications([]);
            setUnreadCount(0);
            setIsAdmin(false);

            // Redirect with a smooth transition
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
            // Fallback: clear session anyway
            sessionManager.clearSession();
            router.push('/');
        }
    }

    return (
        <header dir='rtl' className="sticky top-0 z-[100] bg-gradient-to-b from-white/80 to-white/60 dark:from-slate-900/80 dark:to-slate-900/60 
                          backdrop-blur-xl border-b border-blue-500/10 dark:border-blue-500/5">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
                    <TbAtom className="text-blue-500/20 text-2xl animate-spin-slow" />
                </div>
                <div className="absolute top-1/2 right-1/3 transform -translate-y-1/2">
                    <TbFlask className="text-emerald-500/20 text-xl animate-pulse" />
                </div>
                <div className="absolute top-1/2 left-2/3 transform -translate-y-1/2">
                    <MdOutlineCalculate className="text-purple-500/20 text-lg animate-bounce" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex justify-between items-center h-16 lg:h-20">                    {/* Enhanced Logo */}
                    <Link href='/' className='shrink-0 group'>
                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="relative">
                                <div className="relative z-10 flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14
                                              bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl
                                              transform group-hover:scale-105 transition-all duration-300
                                              shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40">
                                    <Image
                                        src="/pi.png"
                                        alt="Walter White Logo"
                                        width={28}
                                        height={28}
                                        className="lg:w-8 lg:h-8 brightness-0 invert group-hover:animate-pulse"
                                    />
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 
                                              rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="font-arabicUI2 text-xl lg:text-2xl font-bold 
                                             bg-clip-text text-transparent bg-gradient-to-r 
                                             from-slate-800 to-slate-600 dark:from-white dark:to-slate-200
                                             group-hover:from-blue-600 group-hover:to-blue-800 
                                             dark:group-hover:from-blue-400 dark:group-hover:to-blue-300
                                             transition-all duration-300">
                                    حسام ميرة
                                </h2>
                                <span className="text-sm lg:text-base text-slate-500 dark:text-slate-400 font-arabicUI2
                                               group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    مدرس الرياضيات
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-6">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                {/* Admin Dashboard Link */}
                                {isAdmin && (
                                    <Link href="/admin"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl 
                                             bg-gradient-to-r from-emerald-50 to-emerald-100 
                                             dark:from-emerald-900/20 dark:to-emerald-800/20
                                             text-emerald-700 dark:text-emerald-400 
                                             hover:from-emerald-100 hover:to-emerald-200
                                             dark:hover:from-emerald-800/30 dark:hover:to-emerald-700/30
                                             border border-emerald-200 dark:border-emerald-700/50
                                             transition-all duration-300 group">
                                        <IoShieldCheckmark className="text-lg group-hover:scale-110 transition-transform" />
                                        <span className="font-arabicUI3 font-medium text-xl">لوحة التحكم</span>
                                    </Link>
                                )}

                                {/* My Courses Link */}
                                <Link href="/profile?tab=courses"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl 
                                         bg-gradient-to-r from-blue-50 to-blue-100 
                                         dark:from-blue-900/20 dark:to-blue-800/20
                                         text-blue-700 dark:text-blue-400 
                                         hover:from-blue-100 hover:to-blue-200
                                         dark:hover:from-blue-800/30 dark:hover:to-blue-700/30
                                         border border-blue-200 dark:border-blue-700/50
                                         transition-all duration-300 group">
                                    <LuGraduationCap className="text-lg group-hover:scale-110 transition-transform" />
                                    <span className="font-arabicUI3 font-medium text-xl">كورساتي</span>
                                </Link>

                                {/* Notifications */}
                                <NotificationButton
                                    notifications={notifications}
                                    unreadCount={unreadCount}
                                    lastReadTime={lastReadTime}
                                    setLastReadTime={setLastReadTime}
                                />

                                {/* Enhanced User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                        className="flex items-center gap-3 p-2 pr-4 rounded-xl 
                                             bg-slate-50 dark:bg-slate-800/50 
                                             hover:bg-slate-100 dark:hover:bg-slate-700/50
                                             border border-slate-200 dark:border-slate-700
                                             transition-all duration-300 group min-w-[160px] max-w-[200px]
                                             hover:shadow-md hover:scale-[1.02]"
                                    >
                                        {/* User Avatar */}
                                        <div className="relative">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                                                      flex items-center justify-center text-white shadow-lg
                                                      group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                                                <span className="font-bold text-sm">
                                                    {username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 
                                                      rounded-full border-2 border-white dark:border-slate-800"></div>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex flex-col items-start min-w-0 flex-1">
                                            <span className="font-arabicUI3 font-semibold text-slate-700 dark:text-slate-200 
                                                       truncate max-w-full text-sm">
                                                {username}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-arabicUI3">
                                                {isAdmin ? 'مدير' : 'طالب'}
                                            </span>
                                        </div>

                                        {/* Chevron */}
                                        <LuChevronDown className={`text-slate-400 transition-transform duration-300 text-sm
                                                             ${userDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Enhanced Dropdown Menu */}
                                    {userDropdownOpen && (
                                        <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 
                                                  rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 
                                                  overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">

                                            {/* User Header */}
                                            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 
                                                      dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                                                                  flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                            {username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 
                                                                  rounded-full border-2 border-white dark:border-slate-800"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-arabicUI3 font-bold text-lg text-slate-800 dark:text-white break-words">
                                                            {username}
                                                        </h3>
                                                        <p className="text-slate-600 dark:text-slate-300 font-arabicUI3 text-sm">
                                                            {isAdmin ? 'مدير النظام' : 'طالب'}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span className="text-xs text-green-600 dark:text-green-400 font-arabicUI3">
                                                                متصل الآن
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-3">
                                                {/* Profile Section */}
                                                <div className="mb-2">
                                                    <button
                                                        onClick={handleProfileClick}
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                                             hover:bg-blue-50 dark:hover:bg-blue-900/20
                                                             text-slate-700 dark:text-slate-200 
                                                             transition-all duration-200 group"
                                                    >
                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl 
                                                                  flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <HiUser className="text-blue-600 dark:text-blue-400 text-lg" />
                                                        </div>
                                                        <div className="flex-1 text-right">
                                                            <span className="font-arabicUI3 font-medium">الملف الشخصي</span>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-arabicUI3">
                                                                عرض وتعديل البيانات الشخصية
                                                            </p>
                                                        </div>
                                                        <LuChevronDown className="rotate-[-90deg] text-slate-400" />
                                                    </button>
                                                </div>

                                                {/* Courses Section */}
                                                <div className="mb-2">
                                                    <button
                                                        onClick={handleCoursesClick}
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                                             hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                                                             text-slate-700 dark:text-slate-200 
                                                             transition-all duration-200 group"
                                                    >
                                                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl 
                                                                  flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <LuBookOpen className="text-emerald-600 dark:text-emerald-400 text-lg" />
                                                        </div>
                                                        <div className="flex-1 text-right">
                                                            <span className="font-arabicUI3 font-medium">كورساتي</span>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-arabicUI3">
                                                                الكورسات المسجل بها
                                                            </p>
                                                        </div>
                                                        <LuChevronDown className="rotate-[-90deg] text-slate-400" />
                                                    </button>
                                                </div>

                                                {/* Settings Section (if admin) */}
                                                {isAdmin && (
                                                    <div className="mb-2">
                                                        <Link href="/admin"
                                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                                                 hover:bg-purple-50 dark:hover:bg-purple-900/20
                                                                 text-slate-700 dark:text-slate-200 
                                                                 transition-all duration-200 group"
                                                            onClick={() => setUserDropdownOpen(false)}
                                                        >
                                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl 
                                                                      flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                <HiCog className="text-purple-600 dark:text-purple-400 text-lg" />
                                                            </div>
                                                            <div className="flex-1 text-right">
                                                                <span className="font-arabicUI3 font-medium text-lg">لوحة التحكم</span>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-arabicUI3">
                                                                    إدارة النظام والمحتوى
                                                                </p>
                                                            </div>
                                                            <LuChevronDown className="rotate-[-90deg] text-slate-400" />
                                                        </Link>
                                                    </div>
                                                )}

                                                {/* Divider */}
                                                <div className="border-t border-slate-200 dark:border-slate-600 my-3"></div>

                                                {/* Logout Section */}
                                                <div>
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                                             hover:bg-red-50 dark:hover:bg-red-900/20
                                                             text-red-600 dark:text-red-400 
                                                             transition-all duration-200 group"
                                                    >
                                                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl 
                                                                  flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <HiLogout className="text-red-500 text-lg" />
                                                        </div>
                                                        <div className="flex-1 text-right">
                                                            <span className="font-arabicUI3 font-medium">تسجيل الخروج</span>
                                                            <p className="text-xs text-red-400 font-arabicUI3">
                                                                إنهاء الجلسة الحالية
                                                            </p>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {/* Sign In Button */}
                                <button
                                    onClick={handleSignIn}
                                    className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-xl 
                                         text-slate-600 dark:text-slate-300 font-arabicUI2 
                                         hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg 
                                         transition-all duration-300 relative group flex items-center gap-1.5
                                         border-2 border-blue-200 dark:border-blue-700 
                                         hover:border-blue-400 dark:hover:border-blue-500"
                                >
                                    <span className="relative z-10">تسجيل الدخول</span>
                                    <PiStudentBold className="text-blue-500 text-sm sm:text-xl animate-pulse group-hover:animate-none" />
                                    <div className="absolute inset-0 bg-blue-500/5 rounded-lg scale-0 
                                                      group-hover:scale-100 transition-transform duration-300"></div>
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg opacity-0 
                                                      group-hover:opacity-20 blur-md transition-opacity duration-500"></div>
                                </button>

                                {/* Sign Up Button */}
                                <button
                                    onClick={handleSignUp}
                                    className="relative overflow-hidden px-2 py-1.5 sm:px-3 sm:py-2 
                                         bg-gradient-to-r from-blue-500 to-blue-600 
                                         text-white text-xs sm:text-xl font-arabicUI3 rounded-lg
                                         transition-all duration-300 hover:shadow-lg
                                         hover:shadow-blue-500/40 flex items-center gap-1.5 hover:scale-105
                                         border-2 border-blue-400 dark:border-blue-400 
                                         hover:border-blue-300 dark:hover:border-blue-300
                                         outline outline-1 outline-white/40 dark:outline-white/20"
                                >
                                    <div className="absolute inset-0 bg-white/20 rounded-lg scale-0 
                                                      hover:scale-100 transition-transform duration-300"></div>
                                    <span className="hidden xs:inline relative z-10">انشاء حساب</span>
                                    <span className="xs:hidden relative z-10">حساب جديد</span>
                                    <PiMathOperations className="text-white text-sm sm:text-xl animate-duration-2000" />
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/50 to-blue-700/50 rounded-lg blur-md 
                                                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                                </button>
                            </div>
                        )}

                        {/* Theme Toggle */}
                        <div className="ml-4">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-3 text-slate-600 dark:text-slate-300 
                             hover:bg-slate-100 dark:hover:bg-slate-800 
                             rounded-xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
                    >
                        {isMobileMenuOpen ?
                            <IoClose className="text-2xl" /> :
                            <RiMenu4Fill className="text-2xl" />
                        }
                    </button>
                </div>
            </div>

            {/* Enhanced Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[200] ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300
                        ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Enhanced Menu Panel */}
                <div className={`absolute right-0 top-0 h-[100dvh] w-80 bg-white dark:bg-slate-900 shadow-2xl 
                                transform transition-transform duration-300 ease-in-out overflow-y-auto
                                border-l border-slate-200 dark:border-slate-700
                                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    {/* Menu Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 
                              p-6 border-b border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl 
                                          flex items-center justify-center shadow-lg">
                                    <Image
                                        src="/pi.png"
                                        alt="Walter White Logo"
                                        width={28}
                                        height={28}
                                        className="lg:w-8 lg:h-8 brightness-0 invert group-hover:animate-pulse"
                                    />                                </div>
                                <div>
                                    <h3 className="text-lg font-arabicUI2 font-bold text-slate-800 dark:text-white">
                                        حسام ميرة
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 font-arabicUI3">
                                        القائمة الرئيسية
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <IoClose className="text-2xl text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* User Info Section (if logged in) */}
                        {isLoggedIn && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 
                                      dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl 
                                      border border-blue-200 dark:border-blue-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                                                  flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                            {username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 
                                                  rounded-full border-3 border-white dark:border-blue-900"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-arabicUI3 font-bold text-base text-slate-800 dark:text-white break-words">
                                            {username}
                                        </h4>
                                        <p className="text-slate-600 dark:text-slate-300 font-arabicUI3 text-sm">
                                            {isAdmin ? 'مدير النظام' : 'طالب'}
                                        </p>
                                        <button
                                            onClick={handleProfileClick}
                                            className="text-xs text-blue-600 dark:text-blue-400 font-arabicUI3 
                                                 hover:underline transition-colors"
                                        >
                                            عرض الملف الشخصي ←
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Enhanced Menu Items */}
                        <div className="space-y-3">
                            {/* Admin Dashboard */}
                            {isAdmin && (
                                <Link href="/admin"
                                    className="flex items-center gap-4 px-4 py-4 
                                         bg-gradient-to-r from-emerald-50 to-emerald-100 
                                         dark:from-emerald-900/20 dark:to-emerald-800/20
                                         text-emerald-700 dark:text-emerald-400 
                                         hover:from-emerald-100 hover:to-emerald-200
                                         dark:hover:from-emerald-800/30 dark:hover:to-emerald-700/30
                                         rounded-2xl font-arabicUI3 font-medium
                                         transition-all duration-300 group border border-emerald-200 dark:border-emerald-700/50"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl 
                                              flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <IoShieldCheckmark className="text-emerald-600 dark:text-emerald-400 text-xl" />
                                    </div>
                                    <div className="flex-1 text-right">
                                        <span className="block">لوحة التحكم</span>
                                        <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                                            إدارة النظام والمحتوى
                                        </span>
                                    </div>
                                    <LuChevronDown className="rotate-[-90deg] text-emerald-500" />
                                </Link>
                            )}

                            {/* My Courses */}
                            <button
                                onClick={handleCoursesClick}
                                className="w-full flex items-center gap-4 px-4 py-4 
                                     text-slate-700 dark:text-slate-300 
                                     hover:bg-blue-50 dark:hover:bg-blue-900/20 
                                     rounded-2xl font-arabicUI3 font-medium
                                     transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl 
                                          flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <LuGraduationCap className="text-blue-600 dark:text-blue-400 text-xl" />
                                </div>
                                <div className="flex-1 text-right">
                                    <span className="block text-lg font-semibold">كورساتي</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        الكورسات المسجل بها
                                    </span>
                                </div>
                                <LuChevronDown className="rotate-[-90deg] text-slate-400" />
                            </button>

                            {/* Auth Section */}
                            {isLoggedIn ? (
                                <>
                                    {/* Notifications */}
                                    <button
                                        onClick={handleMobileNotificationClick}
                                        className="w-full flex items-center gap-4 px-4 py-4 
                                             text-slate-700 dark:text-slate-300 
                                             hover:bg-orange-50 dark:hover:bg-orange-900/20 
                                             rounded-2xl font-arabicUI3 font-medium
                                             transition-all duration-300 group"
                                    >
                                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl 
                                                  flex items-center justify-center group-hover:scale-110 transition-transform relative">
                                            <IoNotifications className="text-orange-600 dark:text-orange-400 text-xl" />
                                            {isClient && unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 
                                                           text-white text-xs flex items-center justify-center 
                                                           rounded-full font-bold">{unreadCount}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 text-right">
                                            <span className="block">الاشعارات</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {isClient && unreadCount > 0 ? `${unreadCount} اشعار جديد` : 'لا توجد اشعارات جديدة'}
                                            </span>
                                        </div>
                                        <LuChevronDown className="rotate-[-90deg] text-slate-400" />
                                    </button>

                                    {/* Divider */}
                                    <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

                                    {/* Logout */}
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-4 px-4 py-4 
                                             text-red-600 dark:text-red-400
                                             hover:bg-red-50 dark:hover:bg-red-900/20 
                                             rounded-2xl font-arabicUI3 font-medium
                                             transition-all duration-300 group"
                                    >
                                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl 
                                                  flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <HiLogout className="text-red-500 text-xl" />
                                        </div>
                                        <div className="flex-1 text-right">
                                            <span className="block">تسجيل الخروج</span>
                                            <span className="text-xs text-red-400">
                                                إنهاء الجلسة الحالية
                                            </span>
                                        </div>
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    {/* Sign In */}
                                    <button
                                        onClick={() => { handleSignIn(); setIsMobileMenuOpen(false); }}
                                        className="w-full flex items-center gap-4 px-4 py-4 
                                             text-slate-600 dark:text-slate-300 font-arabicUI2 
                                             hover:bg-blue-50 dark:hover:bg-blue-500/10 
                                             rounded-2xl transition-all duration-300 group relative
                                             border-2 border-blue-200 dark:border-blue-700
                                             hover:border-blue-400 dark:hover:border-blue-500"
                                    >
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl 
                                                  flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <PiStudentBold className="text-blue-500 text-xl animate-pulse group-hover:animate-none" />
                                        </div>
                                        <div className="flex-1 text-right relative z-10">
                                            <span className="block">تسجيل الدخول</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                ادخل إلى حسابك
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-blue-500/5 rounded-2xl scale-0 
                                                  group-hover:scale-100 transition-transform duration-300"></div>
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl opacity-0 
                                                  group-hover:opacity-20 blur-md transition-opacity duration-500"></div>
                                    </button>

                                    {/* Sign Up */}
                                    <button
                                        onClick={() => { handleSignUp(); setIsMobileMenuOpen(false); }}
                                        className="w-full flex items-center gap-4 px-4 py-4 relative overflow-hidden
                                             bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                             font-arabicUI3 font-semibold hover:from-blue-600 hover:to-blue-700 
                                             rounded-2xl transition-all duration-300 group hover:scale-105
                                             shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50
                                             border-2 border-blue-400 dark:border-blue-400 
                                             hover:border-blue-300 dark:hover:border-blue-300
                                             outline outline-1 outline-white/40 dark:outline-white/20"
                                    >
                                        <div className="w-12 h-12 bg-white/20 rounded-xl 
                                                  flex items-center justify-center group-hover:scale-110 transition-transform
                                                  ring-2 ring-white/40">
                                            <PiMathOperations className="text-white text-xl animate-duration-2000" />
                                        </div>
                                        <div className="flex-1 text-right relative z-10">
                                            <span className="block">انشاء حساب جديد</span>
                                            <span className="text-xs text-blue-100">
                                                ابدأ رحلتك التعليمية
                                            </span>
                                        </div>
                                        <div className="absolute inset-0 bg-white/20 rounded-2xl scale-0 
                                                  group-hover:scale-100 transition-transform duration-300"></div>
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/50 to-blue-700/50 rounded-2xl blur-md 
                                                  opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                                    </button>
                                </div>
                            )}

                            {/* Theme Toggle */}
                            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Mobile Notifications Popup */}
            {showMobileNotifications && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-4"
                    onClick={(e) => e.stopPropagation()}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowMobileNotifications(false)}></div>
                    <div className="relative w-full max-w-md max-h-[80vh] bg-white dark:bg-slate-800 
                              rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700
                              animate-in fade-in zoom-in duration-200">

                        {/* Popup Header */}
                        <div className="flex items-center justify-between p-6 border-b 
                                  border-slate-200 dark:border-slate-700 bg-gradient-to-r 
                                  from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl 
                                          flex items-center justify-center">
                                    <IoNotifications className="text-orange-600 dark:text-orange-400 text-xl" />
                                </div>
                                <h3 className="font-arabicUI3 font-bold text-lg text-slate-800 dark:text-white">
                                    الاشعارات
                                </h3>
                            </div>
                            <button onClick={() => setShowMobileNotifications(false)}
                                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors">
                                <IoClose className="text-xl text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>

                        {/* Notifications Content */}
                        <div className="overflow-y-auto p-6 max-h-[60vh]">
                            {notifications.length > 0 ? (
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div key={notification.id}
                                            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 
                                                 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600
                                                 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            <p className="font-arabicUI3 leading-relaxed">{notification.message}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {isClient ? new Date(notification.updatedAt).toLocaleString('ar-EG') : 'منذ قليل'}
                                                </span>
                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl 
                                              flex items-center justify-center mx-auto mb-4">
                                        <IoNotifications className="text-3xl text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-arabicUI3 text-lg">
                                        لا توجد اشعارات
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-arabicUI3 mt-1">
                                        ستظهر الاشعارات الجديدة هنا
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;