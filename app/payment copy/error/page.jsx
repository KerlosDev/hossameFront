'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ErrorPage = () => {
    // Get error message from URL query parameter
    useEffect(() => {
        // Parse URL to get the error message
        const params = new URLSearchParams(window.location.search);
        const errorMessage = params.get('message') || 'حدث خطأ غير معروف';

        // Map error codes to user-friendly messages
        const errorMessages = {
            'user_not_found': 'لم يتم العثور على بيانات المستخدم',
            'server_error': 'حدث خطأ في الخادم',
            'payment_error': 'حدث خطأ أثناء معالجة الدفع',
            'course_not_found': 'لم يتم العثور على الكورس',
            'invalid_amount': 'المبلغ غير صحيح',
        };

        // Show error notification
        toast.error(errorMessages[errorMessage] || errorMessage, {
            position: "top-center",
            autoClose: 5000,
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#0A1121] text-white font-arabicUI3 flex items-center justify-center">
            <ToastContainer
                position="top-center"
                rtl={true}
                theme="dark"
            />

            <div className="relative container mx-auto px-4">
                <div className="max-w-md mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center space-y-6">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold">حدث خطأ</h2>
                        <p className="text-gray-400">حدث خطأ أثناء معالجة عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.</p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Link href="/profile">
                            <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl py-3">
                                العودة إلى صفحة الملف الشخصي
                            </button>
                        </Link>

                        <Link href="/">
                            <button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-3">
                                العودة للصفحة الرئيسية
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage
