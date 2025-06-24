'use client'
import React, { use, useEffect, useState } from 'react'
// Import useRef for client-only rendering
import { useRef } from 'react'
import { HiHeart } from "react-icons/hi";
import { ToastContainer, toast } from 'react-toastify';
import { GiMolecule } from "react-icons/gi";
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Page = ({ params }) => {
    const { idpay } = use(params);
    const router = useRouter();
    const [courseInfo, setCourseInfo] = useState(null);
    const [number, setNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [userLoading, setUserLoading] = useState(true);
    const [showmodel, setshowmodel] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [userData, setUserData] = useState(null);
    // Track if component is mounted (client-side only)
    const isMounted = useRef(false);
    const [isClient, setIsClient] = useState(false);
    // Fawaterak payment gateway states
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState('');

    // Safe token access (client-side only)
    const [token, setToken] = useState('');    // Add debug state
    const [debugInfo, setDebugInfo] = useState({
        tokenAvailable: false,
        methodsFetched: false,
        fetchMethodsError: null,
        userDataLoaded: false,
        courseDataLoaded: false
    });

    // Handle client-side initialization
    useEffect(() => {
        setIsClient(true);
        isMounted.current = true;

        // Now safely get the token from cookies (client-side only)
        const cookieToken = Cookies.get("token");
        setToken(cookieToken || '');
        setDebugInfo(prev => ({ ...prev, tokenAvailable: !!cookieToken }));

        return () => {
            isMounted.current = false;
        };
    }, []);

    // Check for token after client-side initialization
    useEffect(() => {
        if (!isClient) return; // Skip server-side execution

        if (!token) {
            router.replace("/sign-in");
        } else {
            // Fetch user data after confirming token exists
            fetchUserData();
        }
    }, [router, token, isClient]);    // Fetch user data from API
    const fetchUserData = async () => {
        setUserLoading(true);
        try {
            console.log("Fetching user data with token:", token ? "Token exists" : "No token");
            
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                console.log("User data fetched successfully");
                setUserData(response.data);
                setDebugInfo(prev => ({ ...prev, userDataLoaded: true }));
                // Pre-fill the phone number from user data 
                if (response.data.phoneNumber) {
                    setNumber(response.data.phoneNumber);
                }
            } else {
                throw new Error("فشل في جلب بيانات المستخدم");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("حدث خطأ أثناء جلب بيانات المستخدم");
        } finally {
            setUserLoading(false);
        }
    };

    const handlenumber = (e) => {
        setNumber(e.target.value);
    };    const getallcoures = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course/${idpay}`);
            if (!res.ok) {
                throw new Error('Failed to fetch course');
            }

            const data = await res.json();
            console.log("Course data fetched:", data);
            if (!data) {
                setError('الكورس غير موجود');
                return;
            }
            setCourseInfo(data);
            setDebugInfo(prev => ({ ...prev, courseDataLoaded: true }));
        } catch (error) {
            console.error("Error fetching course info:", error);
            setError('حدث خطأ في تحميل بيانات الكورس');
        } finally {
            setLoading(false);
        }
    };useEffect(() => {
        if (idpay) {
            getallcoures();
        }
    }, [idpay]);
    
    // Add a new useEffect to fetch payment methods once all dependencies are available
    useEffect(() => {
        if (isClient && token && userData && courseInfo) {
            console.log("All dependencies ready, fetching payment methods");
            fetchPaymentMethods();
        }
    }, [isClient, token, userData, courseInfo]);    // Fetch available payment methods from Fawaterak API
    const fetchPaymentMethods = async () => {
        try {
            console.log("Fetching payment methods with token:", token ? "Token exists" : "No token");
            
            if (!token) {
                setDebugInfo(prev => ({ 
                    ...prev, 
                    methodsFetched: false,
                    fetchMethodsError: "No authentication token available" 
                }));
                throw new Error("No authentication token available");
            }

            // Call backend to get payment methods from Fawaterak
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/payment/methods`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log("Payment methods API response:", response.data);

            if (response.data && response.data.methods && response.data.methods.length > 0) {
                console.log("Setting payment methods:", response.data.methods);
                setPaymentMethods(response.data.methods);
                // Set the first method as default selected
                setSelectedPaymentMethod(response.data.methods[0].id);
                setDebugInfo(prev => ({ ...prev, methodsFetched: true, fetchMethodsError: null }));
            } else {
                console.log("No payment methods returned, using defaults");
                // Fallback to default payment methods if API returns empty
                useDefaultPaymentMethods();
                setDebugInfo(prev => ({ 
                    ...prev, 
                    methodsFetched: true, 
                    fetchMethodsError: "API returned empty methods array" 
                }));
            }
        } catch (error) {
            console.error("Error fetching payment methods:", error.response?.data || error.message);
            
            // Provide more detailed error message
            if (error.response) {
                console.log("Error status:", error.response.status);
                console.log("Error data:", error.response.data);
                setDebugInfo(prev => ({ 
                    ...prev, 
                    methodsFetched: false, 
                    fetchMethodsError: `API error: ${error.response.status} - ${JSON.stringify(error.response.data)}` 
                }));
            } else {
                setDebugInfo(prev => ({ 
                    ...prev, 
                    methodsFetched: false, 
                    fetchMethodsError: error.message
                }));
            }
            
            // Fallback to default payment methods if API fails
            useDefaultPaymentMethods();
            
            toast.error("فشل في جلب طرق الدفع المتاحة");
        }
    };
    
    // Helper function to set default payment methods
    const useDefaultPaymentMethods = () => {
        const defaultMethods = [
            { id: 'credit_card', name: 'بطاقة الائتمان', icon: 'credit-card' },
            { id: 'mwallet', name: 'محفظة الهاتف', icon: 'wallet' },
            { id: 'fawry', name: 'فوري', icon: 'receipt' },
            { id: 'meeza', name: 'ميزة', icon: 'credit-card' }
        ];
        console.log("Using default payment methods");
        setPaymentMethods(defaultMethods);
        setSelectedPaymentMethod(defaultMethods[0].id);
    };

    // Handle payment method selection
    const handlePaymentMethodSelect = (methodId) => {
        setSelectedPaymentMethod(methodId);
    };

    // Process payment with Fawaterak
    const processPayment = async () => {
        if (!token) {
            toast.error("يرجى تسجيل الدخول أولا");
            return;
        }

        if (number.length < 10) {
            toast.error("رقم الموبايل غير صحيح");
            return;
        }

        if (!selectedPaymentMethod) {
            toast.error("يرجى اختيار طريقة دفع");
            return;
        }

        setPaymentLoading(true);
        try {
            // Prepare payment data
            const paymentData = {
                // This would be your Fawaterak API key from your account
                apiKey: process.env.NEXT_PUBLIC_FAWATERAK_API_KEY,
                // The currency for the transaction (e.g., 'EGP' for Egyptian Pound)
                currency: 'EGP',
                // The total amount of the invoice
                amount: courseInfo.price,
                // Customer details
                customerName: userData.name,
                customerEmail: userData.email,
                customerPhone: number,
                // Payment method selected by the customer
                paymentMethodId: selectedPaymentMethod,
                // Your reference (can be order ID)
                orderReference: `course_${idpay}_${new Date().getTime()}`,
                // Redirect URLs after payment
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/failure`,
                // Product details
                cartItems: [
                    {
                        itemId: courseInfo._id,
                        description: courseInfo.name,
                        price: courseInfo.price,
                        quantity: 1
                    }
                ]
            };            // Example API call to your backend which will then call Fawaterak API
            console.log("Sending payment request to:", `${process.env.NEXT_PUBLIC_API_URL}/payment/create`);
            console.log("Payment data:", { ...paymentData, apiKey: "HIDDEN" });
            
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment/create`, paymentData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("Payment response:", response.data);

            if (response.status === 200 || response.status === 201) {
                // Save enrollment info in your database
                await saveEnrollment();

                // Redirect user to payment page
                if (response.data.paymentUrl) {
                    console.log("Redirecting to payment URL:", response.data.paymentUrl);
                    window.location.href = response.data.paymentUrl;
                } else {
                    console.error("No payment URL in response:", response.data);
                    toast.error("لم يتم الحصول على رابط الدفع");
                }
            } else {
                throw new Error("فشل في إنشاء عملية الدفع");
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            toast.error(error.response?.data?.message || "حدث خطأ أثناء معالجة الدفع");
        } finally {
            setPaymentLoading(false);
        }
    };

    // Save enrollment information to your database
    const saveEnrollment = async () => {
        try {
            const enrollmentData = {
                phoneNumber: number,
                courseId: idpay,
                price: courseInfo.price
            };

            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/active`, enrollmentData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Error saving enrollment:", error);
            // We don't show an error here as the payment is already being processed
        }
    };

    // For legacy support - modified to use new payment system
    const handleclicknum = async () => {
        // This function now just calls the processPayment function
        processPayment();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            processPayment();
        }
    };

    // Only render login requirement after client-side hydration
    if (isClient && !token) {
        return (
            <div className="min-h-screen bg-[#0A1121] text-white font-arabicUI3 flex items-center justify-center">
                <div className="relative container mx-auto px-4">
                    <div className="max-w-md mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center space-y-4">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m5-6a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">يجب تسجيل الدخول</h2>
                        <p className="text-gray-400">الرجاء تسجيل الدخول أو إنشاء حساب للوصول إلى صفحة الدفع</p>
                        <div className="space-y-3">
                            <Link href="/sign-in">
                                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl py-3">
                                    تسجيل الدخول
                                </button>
                            </Link>
                            <Link href="/sign-up">
                                <button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-3">
                                    إنشاء حساب جديد
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading state during initial client-side hydration
    if (!isClient) {
        return (
            <div className="min-h-screen bg-[#0A1121] text-white font-arabicUI3 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    const renderPaymentContent = () => {
        if (showmodel && submitted) {
            return (
                <div className="text-center space-y-6 py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-medium text-green-400">تم استلام طلبك بنجاح</h3>
                        <p className="text-blue-400">سيتم تفعيل الكورس خلال 24 ساعة</p>
                    </div>
                    <Link href="/">
                        <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all duration-300">
                            العودة للصفحة الرئيسية
                        </button>
                    </Link>
                </div>
            );
        }

        // Show payment form with Fawaterak gateway options
        return (
            <div className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-medium text-center">اختر طريقة الدفع</h3>                    {/* Payment Methods Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.length > 0 ? (
                            paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => handlePaymentMethodSelect(method.id)}
                                    className={`
                                        p-4 rounded-xl cursor-pointer transition-all duration-300
                                        flex flex-col items-center justify-center gap-2
                                        ${selectedPaymentMethod === method.id
                                            ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/50'
                                            : 'bg-white/5 border border-white/10 hover:bg-white/10'}
                                    `}
                                >
                                    <div className="w-12 h-12 flex items-center justify-center">
                                        {method.icon === 'credit-card' && (
                                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        )}
                                        {method.icon === 'wallet' && (
                                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        )}
                                        {method.icon === 'receipt' && (
                                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                        )}
                                        {!method.icon && (
                                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{method.name}</span>
                                </div>
                            ))
                        ) : (
                            // Show loading state when payment methods are being fetched
                            <>
                                {[1, 2, 3, 4].map((index) => (
                                    <div 
                                        key={index}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 rounded-full bg-white/10"></div>
                                            <div className="w-16 h-4 bg-white/10 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm text-blue-400">أدخل رقم الموبايل</label>
                        <span className={`text-xs ${number.length >= 10 ? 'text-green-400' : 'text-gray-400'}`}>
                            {number.length}/10 أرقام
                        </span>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <input
                            type="tel"
                            value={number}
                            placeholder="01XXXXXXXXX"
                            onChange={handlenumber}
                            onKeyDown={handleKeyPress}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10
                                 text-center focus:outline-none focus:border-blue-500 transition-colors"
                            maxLength={11}
                        />
                    </div>
                    
                    {number.length > 0 && number.length < 10 && (
                        <p className="text-xs text-orange-400">يجب أن يكون رقم الموبايل مكون من 10 أرقام على الأقل</p>
                    )}                    <button
                        disabled={number.length < 10 || paymentLoading || !selectedPaymentMethod}
                        onClick={processPayment}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 
                             hover:from-blue-600 hover:to-indigo-600 
                             disabled:from-gray-600 disabled:to-gray-700
                             text-white rounded-xl py-4 transition-all duration-300
                             flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20"
                    >
                        {paymentLoading ? (
                            <div className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                <span>جاري التحقق...</span>
                            </div>
                        ) : (
                            <>
                                <span className="font-medium">الانتقال إلى صفحة الدفع</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </>
                        )}
                    </button>
                    
                    <div className="flex items-center justify-center text-xs text-gray-400 gap-1 mt-2">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m5-6a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>بالضغط على زر الدفع، أنت توافق على شروط الخدمة وسياسة الخصوصية</span>
                    </div>
                </div>
            </div>
        );
    };    return (
        <div className="min-h-screen bg-[#0A1121] text-white font-arabicUI3">
            {/* Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0   opacity-5" />
                <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/20 to-transparent blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-indigo-500/20 to-transparent blur-[120px]" />
            </div>

            {isClient && (
                <ToastContainer
                    position="top-center"
                    rtl={true}
                    theme="dark"
                />
            )}

            {/* Debug Panel - only visible in development mode */}
            {process.env.NODE_ENV !== 'production' && (
                <div className="fixed bottom-4 left-4 bg-black/80 p-3 rounded-lg text-xs text-white max-w-xs overflow-auto z-50">
                    <h4 className="font-bold mb-1 text-yellow-400">Debug Info:</h4>
                    <div>
                        <div>Token: {debugInfo.tokenAvailable ? '✅' : '❌'}</div>
                        <div>User Data: {debugInfo.userDataLoaded ? '✅' : '❌'}</div>
                        <div>Course Data: {debugInfo.courseDataLoaded ? '✅' : '❌'}</div>
                        <div>Methods Fetched: {debugInfo.methodsFetched ? '✅' : '❌'}</div>
                        {debugInfo.fetchMethodsError && (
                            <div className="text-red-400 mt-1">Error: {debugInfo.fetchMethodsError}</div>
                        )}
                        <div className="mt-1">Methods Count: {paymentMethods.length}</div>
                        <div>API URL: {process.env.NEXT_PUBLIC_API_URL}</div>
                        <button 
                            className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs"
                            onClick={() => fetchPaymentMethods()}
                        >
                            Retry Fetch Methods
                        </button>
                    </div>
                </div>
            )}

            <div className="relative container mx-auto px-4 py-4 sm:py-8">
                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full" />
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">إتمام عملية الشراء</h1>
                        <p className="text-blue-400 text-sm sm:text-base">خطوة واحدة تفصلك عن بداية رحلتك العلمية</p>
                    </div>

                    {error ? (
                        <div className="text-center p-8 bg-red-500/10 rounded-xl border border-red-500/20">
                            <h2 className="text-xl text-red-400 mb-4">{error}</h2>
                            <Link href="/">
                                <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl">
                                    العودة للصفحة الرئيسية
                                </button>
                            </Link>
                        </div>
                    ) : loading && !courseInfo ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                        </div>
                    ) : courseInfo ? (
                        <div className="grid md:grid-cols-5 gap-4 sm:gap-8">
                            {/* Left Section: Course Details */}
                            <div dir='rtl' className="md:col-span-2 space-y-4 sm:space-y-6">
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                                <GiMolecule className="text-2xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium">{courseInfo.name}</h3>
                                                <p className="text-blue-400 text-sm">مع أ/  حسام ميرا</p>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-blue-400">سعر الكورس</span>
                                                <span className="text-2xl font-bold">{courseInfo.price} جنيه</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div dir='rtl' className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-lg font-medium mb-4">معلومات المشترك</h3>
                                    {userLoading ? (
                                        <div className="text-center text-gray-400 py-4">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
                                            </div>
                                            <p className="mt-2">جاري تحميل معلومات المستخدم...</p>
                                        </div>
                                    ) : userData ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                                <span className="text-blue-400">الاسم</span>
                                                <span>{userData.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                                <span className="text-blue-400">البريد الإلكتروني</span>
                                                <span className="text-sm">{userData.email}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                                <span className="text-blue-400">رقم الهاتف</span>
                                                <span>{userData.phoneNumber}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                                <span className="text-blue-400">المرحلة الدراسية</span>
                                                <span>{userData.level}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                                <span className="text-blue-400">المحافظة</span>
                                                <span>{userData.government}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-red-400 py-4">
                                            <p>حدث خطأ في جلب معلومات المستخدم</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Form Section */}
                            <div className="md:col-span-3">
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
                                    {renderPaymentContent()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Page;