'use client'
import { useState } from 'react';
import { Bell, Search, Settings, User } from 'lucide-react';

export default function AdminHeader({ searchQuery, setSearchQuery, notifications }) {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 mb-6">
            <div className="flex items-center justify-between">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                        <input
                            type="text"
                            placeholder="البحث عن طلاب، كورسات، أو مدفوعات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-white/30 transition-all"
                        />
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <Bell className="text-white" size={20} />
                            {notifications?.filter(n => !n.read).length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg overflow-hidden z-50">
                                <div className="p-4">
                                    <h3 className="text-white font-arabicUI2 mb-2">الإشعارات</h3>
                                    <div className="space-y-2">
                                        {notifications?.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-3 rounded-lg ${notification.read ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/15 transition-all cursor-pointer`}
                                            >
                                                <p className="text-sm text-white">{notification.message}</p>
                                                <span className="text-xs text-white/60">{notification.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <Settings className="text-white" size={20} />
                    </button>

                    {/* Profile */}
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <User className="text-white" size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}