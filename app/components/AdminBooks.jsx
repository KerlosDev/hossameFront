'use client';
import React, { useState } from 'react';
import BooksManager from '../admin/components/BooksManager';
import BookOrders from './BookOrders';

export default function AdminBooks() {
    const [activeTab, setActiveTab] = useState('manage');

    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`px-6 py-3 rounded-xl font-arabicUI3 transition-colors
                             ${activeTab === 'manage' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                >
                    إدارة الكتب
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-3 rounded-xl font-arabicUI3 transition-colors
                             ${activeTab === 'orders' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                >
                    طلبات الكتب
                </button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                {activeTab === 'manage' ? (
                    <BooksManager />
                ) : (
                    <BookOrders />
                )}
            </div>
        </div>
    );
}
