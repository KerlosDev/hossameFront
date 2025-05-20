'use client'
import { useState, useEffect, useRef } from 'react'
import { IoNotifications } from "react-icons/io5";
import { GiMolecule } from "react-icons/gi";

const NotificationButton = ({ notifications, unreadCount, lastReadTime, setLastReadTime }) => {
    const [showNotifications, setShowNotifications] = useState(false);
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
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            const now = new Date().toISOString();
            setLastReadTime(now);
            localStorage.setItem('lastReadTime', now);
        }
    };

    return (
        <div className="relative" ref={notificationRef}>
            <button
                onClick={handleNotificationOpen}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-300"
            >
                <IoNotifications className={`text-xl ${unreadCount > 0 ? 'text-blue-500' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs
                                   rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 max-h-[70vh] overflow-y-auto
                               bg-white dark:bg-slate-800 rounded-xl shadow-xl
                               border border-blue-500/10 dark:border-blue-500/5
                               transform opacity-100 scale-100 transition-all duration-300
                               z-50 custom-scrollbar">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700
                                  bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                        <h3 className="text-2xl font-arabicUI2 font-semibold
                                     text-slate-800 dark:text-white flex items-center gap-2">
                            <IoNotifications className="text-xl text-blue-400" />
                            الإشعارات
                        </h3>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {notifications && notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="p-4 transition-colors duration-200 bg-transparent"
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className="mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                            <GiMolecule className="text-xl text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-arabicUI2 text-slate-600 dark:text-slate-300">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {new Date(notification.createdAt).toLocaleString('ar-EG')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-slate-500 dark:text-slate-400 font-arabicUI">
                                    لا توجد إشعارات جديدة
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationButton;
