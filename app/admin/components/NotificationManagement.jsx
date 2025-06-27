'use client'

import { useState, useEffect } from 'react';
import { Trash2, Plus, Search, RefreshCcw, AlertCircle, CheckCircle } from 'lucide-react';
import Cookies from 'js-cookie';

export default function NotificationManagement() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Clear status message after 3 seconds
    useEffect(() => {
        if (status.message) {
            const timer = setTimeout(() => {
                setStatus({ type: '', message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    // Fetch notifications
    const fetchNotifications = async (page = 1) => {
        setLoading(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/admin?page=${page}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setNotifications(data.data.notifications);
                setTotalPages(data.data.pagination.totalPages);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
        setLoading(false);
    };

    // Create notification
    const createNotification = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            if (response.ok) {
                setMessage('');
                setStatus({ type: 'success', message: 'تمت إضافة الإشعار بنجاح.' });
                fetchNotifications();
            } else {
                setStatus({ type: 'error', message: 'فشل في إضافة الإشعار.' });
            }
        } catch (error) {
            console.error('Error creating notification:', error);
            setStatus({ type: 'error', message: 'حدث خطأ أثناء إضافة الإشعار.' });
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId) => {
        if (!confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;

        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'تم حذف الإشعار بنجاح.' });
                fetchNotifications(currentPage);
            } else {
                setStatus({ type: 'error', message: 'فشل في حذف الإشعار.' });
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            setStatus({ type: 'error', message: 'حدث خطأ أثناء حذف الإشعار.' });
        }
    };

    // Delete all notifications
    const deleteAllNotifications = async () => {
        if (!confirm('Are you sure you want to delete all notifications?')) return;

        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        }
    };

    // Filter notifications based on search query
    const filteredNotifications = notifications.filter(notification =>
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="p-6  font-arabicUI3 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">إدارة الإشعارات</h2>

            {/* Create Notification Form */}
            <form onSubmit={createNotification} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="أدخل نص الإشعار..."
                        className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        إضافة
                    </button>
                </div>
            </form>

            {/* Search and Actions */}
            <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Search size={20} className="text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث في الإشعارات..."
                        className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <div className="flex gap-2">                    <button
                    onClick={() => fetchNotifications(currentPage)}
                    className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg dark:hover:bg-gray-700"
                >
                    <RefreshCcw size={20} />
                </button>
                    <button
                        onClick={deleteAllNotifications}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg dark:hover:bg-gray-700"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Status Message */}
            {status.message && (
                <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{status.message}</span>
                </div>
            )}

            {/* Notifications List */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="flex-1">
                                <p className="text-gray-800 dark:text-white">{notification.message}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(notification.createdAt).toLocaleString('ar-EG')}
                                </p>
                            </div>
                            <button
                                onClick={() => deleteNotification(notification._id)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg dark:hover:bg-gray-700"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => fetchNotifications(index + 1)}
                            className={`px-3 py-1 rounded-lg ${currentPage === index + 1
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
