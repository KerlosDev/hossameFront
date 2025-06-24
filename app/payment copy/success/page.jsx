'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const SuccessPage = () => {
    useEffect(() => {
        // Show success notification
        toast.success("تم الدفع بنجاح! تم تفعيل الكورس.", {
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
                    <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold">تم الدفع بنجاح!</h2>
                        <p className="text-gray-400">تم تفعيل الكورس بنجاح، يمكنك الآن الوصول إلى المحتوى التعليمي.</p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Link href="/profile">
                            <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl py-3">
                                الذهاب إلى صفحة الملف الشخصي
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

export default SuccessPage
