'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const FailurePage = () => {
    useEffect(() => {
        // Show error notification
        toast.error("فشلت عملية الدفع. يرجى المحاولة مرة أخرى.", {
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
                    <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold">فشلت عملية الدفع</h2>
                        <p className="text-gray-400">حدث خطأ أثناء معالجة عملية الدفع. يرجى المحاولة مرة أخرى أو استخدام طريقة دفع أخرى.</p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Link href="/profile">
                            <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl py-3">
                                المحاولة مرة أخرى
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

export default FailurePage
