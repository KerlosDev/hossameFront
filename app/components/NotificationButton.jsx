'use client'
import { useState, useEffect, useRef } from 'react'
import { IoNotifications, IoCheckmarkCircle, IoInformationCircle, IoWarning, IoClose } from "react-icons/io5";
import { HiSparkles, HiClock } from "react-icons/hi2";

const NotificationButton = ({ notifications, unreadCount, lastReadTime, setLastReadTime }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        // Add click outside listener
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationOpen = () => {
        setIsLoading(true);
        setTimeout(() => {
            setShowNotifications(!showNotifications);
            setIsLoading(false);
            if (!showNotifications) {
                const now = new Date().toISOString();
                setLastReadTime(now);
                localStorage.setItem('lastReadTime', now);
            }
        }, 150);
    };

    const getNotificationIcon = (type) => {
        const iconClass = "text-lg";
        switch (type) {
            case 'success':
                return <IoCheckmarkCircle className={`${iconClass} text-emerald-500`} />;
            case 'warning':
                return <IoWarning className={`${iconClass} text-amber-500`} />;
            case 'error':
                return <IoClose className={`${iconClass} text-red-500`} />;
            default:
                return <IoInformationCircle className={`${iconClass} text-blue-500`} />;
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

        if (diffInMinutes < 1) return 'الآن';
        if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
        if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
        return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
    };

    return (
        <div className="relative" ref={notificationRef}>
            {/* Modern Notification Button */}
            <button
                onClick={handleNotificationOpen}
                disabled={isLoading}
                className="group relative p-3 rounded-2xl bg-white dark:bg-slate-800 
                          shadow-lg shadow-slate-200/60 dark:shadow-slate-900/40
                          border border-slate-200/80 dark:border-slate-700/80
                          hover:shadow-xl hover:shadow-blue-200/40 dark:hover:shadow-blue-900/20
                          hover:border-blue-300/60 dark:hover:border-blue-600/60
                          transition-all duration-300 ease-out
                          hover:scale-105 active:scale-95
                          backdrop-blur-sm"
            >
                <div className="relative">
                    <IoNotifications
                        className={`text-xl transition-all duration-300 
                                  ${unreadCount > 0
                                ? 'text-blue-600 dark:text-blue-400 animate-pulse'
                                : 'text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                            }
                                  ${isLoading ? 'animate-spin' : ''}`}
                    />

                    {/* Premium Unread Badge */}
                    {unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                <div className="relative bg-gradient-to-r from-red-500 to-red-600 text-white 
                                              text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5
                                              flex items-center justify-center shadow-lg shadow-red-500/30">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </button>

            {/* Premium Notifications Dropdown */}
            {showNotifications && (
                <div className="absolute right-0 mt-4 w-96 max-h-[85vh] 
                              bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl
                              rounded-3xl shadow-2xl shadow-slate-300/50 dark:shadow-slate-900/60
                              border border-slate-200/60 dark:border-slate-700/60
                              transform transition-all duration-500 ease-out origin-top-right
                              animate-in slide-in-from-top-2 fade-in-0 zoom-in-95
                              z-50 overflow-hidden">

                    {/* Elegant Header */}
                    <div className="relative p-6 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 
                                  dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/10
                                  border-b border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 
                                              ring-1 ring-blue-500/20 dark:ring-blue-500/30">
                                    <IoNotifications className="text-xl text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white font-arabicUI2">
                                        الإشعارات
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                        {notifications?.length || 0} إشعار جديد
                                    </p>
                                </div>
                            </div>
                            <HiSparkles className="text-blue-400 text-xl animate-pulse" />
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-transparent 
                                  scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                        {notifications && notifications.length > 0 ? (
                            <div className="p-2">
                                {notifications.map((notification, index) => {
                                    const isNew = new Date(notification.createdAt) > new Date(lastReadTime);
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`relative p-4 m-2 rounded-2xl transition-all duration-300 
                                                      hover:bg-slate-50/80 dark:hover:bg-slate-700/50
                                                      border border-transparent hover:border-slate-200/60 
                                                      dark:hover:border-slate-600/60
                                                      group cursor-pointer transform hover:scale-[1.02]
                                                      ${isNew ? 'bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-200/40 dark:ring-blue-800/40' : ''}
                                                      ${index === 0 ? 'mt-0' : ''}`}
                                        >
                                            <div className="flex gap-4 items-start">
                                                {/* Modern Icon Container */}
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 
                                                                  dark:from-slate-600 dark:to-slate-700
                                                                  group-hover:from-blue-100 group-hover:to-blue-200
                                                                  dark:group-hover:from-blue-800/30 dark:group-hover:to-blue-700/30
                                                                  transition-all duration-300 shadow-sm">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 
                                                                font-arabicUI2 leading-relaxed mb-2">
                                                        {notification.message}
                                                    </p>

                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                        <HiClock className="text-xs" />
                                                        <span>{formatTimeAgo(notification.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {/* New Indicator */}
                                                {isNew && (
                                                    <div className="flex-shrink-0 self-center">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse 
                                                                      shadow-sm shadow-blue-500/50"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br 
                                              from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 
                                              flex items-center justify-center shadow-inner">
                                    <IoNotifications className="text-3xl text-slate-400 dark:text-slate-500" />
                                </div>
                                <h4 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2 font-arabicUI2">
                                    لا توجد إشعارات
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    ستظهر الإشعارات الجديدة هنا عند وصولها
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Elegant Footer */}
                    {notifications && notifications.length > 0 && (
                        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 
                                      border-t border-slate-200/60 dark:border-slate-700/60">
                            <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700
                                             hover:from-blue-700 hover:to-blue-800 text-white font-medium
                                             transition-all duration-300 transform hover:scale-[1.02]
                                             shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30">
                                عرض جميع الإشعارات
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationButton;
