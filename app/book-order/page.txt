'use client';
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { IoBookSharp, IoArrowForward } from 'react-icons/io5';
import { BsCheck2Circle, BsArrowRight, BsStars } from 'react-icons/bs';
import { FiPackage } from 'react-icons/fi';
import { RiBookLine } from 'react-icons/ri';
import { IoSchoolOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalApi from '../api/GlobalApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const egyptianGovernorates = [
    "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة",
    "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية",
    "الوادي الجديد", "السويس", "اسوان", "اسيوط", "بني سويف", "بورسعيد",
    "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
    "قنا", "شمال سيناء", "سوهاج"
];

export default function BookOrder() {
    const { user, isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const [userOrders, setUserOrders] = useState([]);
    const [showHistory, setShowHistory] = useState(true);
    const [validationErrors, setValidationErrors] = useState({});
    const [books, setBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        governorate: '',
        address: '',
        selectedBooks: [],
    });
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [step, setStep] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in?redirect_url=' + encodeURIComponent('/book-order'));
        }
    }, [isLoaded, isSignedIn, router]);

    useEffect(() => {
        if (isSignedIn && user) {
            fetchUserOrders();
            fetchBooks();
        }
    }, [isSignedIn, user]);

    const fetchBooks = async () => {
        try {
            const result = await GlobalApi.getBooks();
            const booksList = JSON.parse(result.bookOrder?.books || '[]');
            setBooks(booksList.filter(book => book.isAvailable !== false));
        } catch (error) {
            console.error('Error fetching books:', error);
            toast.error('حدث خطأ أثناء تحميل الكتب');
        } finally {
            setBooksLoading(false);
        }
    };

    const fetchUserOrders = async () => {
        try {
            const result = await GlobalApi.getBookOrders();
            const orders = JSON.parse(result.bookOrder.books || '[]');
            const userOrders = orders.filter(order => order.userEmail === user.primaryEmailAddress.emailAddress);
            setUserOrders(userOrders);
            // Set showHistory based on whether user has orders
            setShowHistory(userOrders.length > 0);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.phone.match(/^01[0125][0-9]{8}$/)) {
            errors.phone = 'يجب أن يكون رقم الهاتف 11 رقم ويبدأ ب 01';
        }
        if (formData.name.length < 3) {
            errors.name = 'يجب أن يكون الاسم أكثر من 3 أحرف';
        }
        if (!formData.address || formData.address.length < 10) {
            errors.address = 'يجب إدخال العنوان بالتفصيل';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setStep(prev => prev + 1);
            setIsAnimating(false);
        }, 300);
    };

    const prevStep = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setStep(prev => prev - 1);
            setIsAnimating(false);
        }, 300);
    };

    const handleBookSelection = (bookId) => {
        setFormData(prev => {
            const bookIdStr = bookId.toString();
            const selectedBooks = prev.selectedBooks.includes(bookIdStr)
                ? prev.selectedBooks.filter(id => id !== bookIdStr)
                : [...prev.selectedBooks, bookIdStr];
            return { ...prev, selectedBooks };
        });
    };

    // Calculate total price
    const totalPrice = formData.selectedBooks.reduce((total, bookId) => {
        const book = books.find(b => b.id.toString() === bookId);
        return total + (book?.price || 0);
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (formData.selectedBooks.length === 0) {
            toast.error('الرجاء اختيار كتاب واحد على الأقل');
            return;
        }
        setLoading(true);
        try {
            const selectedBooksData = formData.selectedBooks.map(bookId => {
                const book = books.find(b => b.id.toString() === bookId);
                return {
                    bookId,
                    bookName: book?.name,
                    price: book?.price
                };
            });
            const orderData = {
                ...formData,
                userEmail: user.primaryEmailAddress.emailAddress,
                userName: user.fullName,
                books: selectedBooksData,
                totalPrice: totalPrice,
                status: 'pending',
                orderDate: new Date().toISOString()
            };
            await GlobalApi.saveBookOrder(orderData);
            await fetchUserOrders();
            setShowSuccess(true);
            setFormData({
                name: '',
                phone: '',
                governorate: '',
                address: '',
                selectedBooks: [],
            });
            setTimeout(() => {
                router.push('/');
            }, 2000);
        } catch (error) {
            if (error.message === 'لديك طلب معلق لنفس الكتاب') {
                toast.error(error.message);
            } else {
                toast.error('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isSignedIn) {
        return null; // Router will handle redirect
    }

    return (
        <div className="min-h-screen bg-[url('/chemistry-pattern.png')] bg-fixed bg-opacity-5 
                        bg-gradient-to-br from-blue-50 via-white to-slate-50 
                        dark:from-blue-950 dark:via-slate-900 dark:to-slate-950">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"></div>
            </div>
            <div className="relative max-w-6xl mx-auto px-4 py-16">
                {/* Enhanced Header with 3D Effect */}
                <div className="text-center mb-16 transform hover:scale-105 transition-transform duration-500">
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-6"
                    >
                        <IoBookSharp className="text-7xl text-white" />
                    </motion.div>
                    <h1 className="text-6xl font-arabicUI2 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 
                                 bg-clip-text text-transparent drop-shadow-lg">
                        اطلب كتابك الآن
                    </h1>
                    <div className="flex items-center justify-center gap-8 text-lg text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                            <BsStars className="text-yellow-500" />
                            <span>جودة عالية</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RiBookLine className="text-blue-500" />
                            <span>محتوى متميز</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <IoSchoolOutline className="text-purple-500" />
                            <span>تعليم احترافي</span>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-center gap-4">
                        {userOrders.length > 0 && (
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="px-6 py-3 rounded-xl bg-blue-500 text-white font-arabicUI3
                                     hover:bg-blue-600 transition-colors duration-300"
                            >
                                {showHistory ? 'طلب جديد' : 'عرض طلباتي'}
                            </button>
                        )}
                    </div>
                </div>
                {showHistory ? (
                    <div className="grid gap-6">
                        {userOrders.length === 0 ? (
                            <div className="text-center text-slate-600 dark:text-slate-300 font-arabicUI3">
                                لا يوجد طلبات سابقة
                            </div>
                        ) : (
                            userOrders.map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl
                                             shadow-lg border border-blue-500/20"
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-arabicUI2 text-slate-800 dark:text-white">
                                                    {order.bookName}
                                                </h3>
                                                <p className="text-slate-600 dark:text-slate-300">
                                                    تاريخ الطلب: {new Date(order.orderDate).toLocaleDateString('ar-EG')}
                                                </p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-xl text-sm font-arabicUI3
                                                ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                                  order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                                  'bg-red-500/20 text-red-500'}`}>
                                                {order.status === 'pending' ? 'قيد الانتظار' :
                                                 order.status === 'completed' ? 'تم التسليم' : 'ملغي'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div className="space-y-2">
                                                <p className="text-slate-600 dark:text-slate-400">
                                                    <span className="font-semibold">الاسم: </span>
                                                    {order.name}
                                                </p>
                                                <p className="text-slate-600 dark:text-slate-400">
                                                    <span className="font-semibold">رقم الهاتف: </span>
                                                    {order.phone}
                                                </p>
                                                <p className="text-slate-600 dark:text-slate-400">
                                                    <span className="font-semibold">المحافظة: </span>
                                                    {order.governorate}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-slate-600 dark:text-slate-400">
                                                    <span className="font-semibold">العنوان: </span>
                                                    {order.address}
                                                </p>
                                                <p className="text-slate-600 dark:text-slate-400">
                                                    <span className="font-semibold">السعر: </span>
                                                    {order.price} جنيه
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
                    >
                        {/* Book Selection Cards */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-arabicUI2 text-slate-800 dark:text-white mb-6">
                                اختر الكتب المطلوبة
                            </h2>
                            <div className="grid gap-6">
                                {books.map((book) => (
                                    <motion.div
                                        key={book.id}
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`relative group cursor-pointer`}
                                        onClick={() => handleBookSelection(book.id)}
                                    >
                                        <div className={`relative rounded-2xl p-6 transform transition-all duration-300
                                            ${formData.selectedBooks.includes(book.id.toString())
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-xl shadow-blue-500/20'
                                                : 'bg-white/80 dark:bg-slate-800/80 hover:shadow-2xl hover:shadow-blue-500/10'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className={`text-xl font-arabicUI2 mb-2
                                                        ${formData.selectedBooks.includes(book.id.toString()) ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                                                        {book.name}
                                                    </h3>
                                                    <p className={`text-3xl font-bold
                                                        ${formData.selectedBooks.includes(book.id.toString()) ? 'text-white' : 'text-blue-500'}`}>
                                                        {book.price} جنيه
                                                    </p>
                                                </div>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center
                                                    ${formData.selectedBooks.includes(book.id.toString())
                                                        ? 'bg-white text-blue-500'
                                                        : 'bg-blue-500/10 text-blue-500'}`}>
                                                    <BsCheck2Circle className="text-2xl" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            {formData.selectedBooks.length > 0 && (
                                <div className="mt-4 p-4 bg-blue-500/10 rounded-xl">
                                    <p className="text-xl font-arabicUI2 text-slate-800 dark:text-white">
                                        إجمالي السعر: <span className="text-blue-500 font-bold">{totalPrice} جنيه</span>
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Enhanced Form Section */}
                        <motion.form 
                            onSubmit={handleSubmit}
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl
                                     border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
                        >
                            <h2 className="text-2xl font-arabicUI2 text-slate-800 dark:text-white mb-8">
                                معلومات التوصيل
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-lg text-slate-700 dark:text-slate-200 font-arabicUI3 mb-2">
                                            الاسم الكامل
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            className={`w-full px-6 py-4 rounded-xl border-2 
                                                     ${validationErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}
                                                     bg-white/50 dark:bg-slate-700/50 text-slate-800 dark:text-white
                                                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                        {validationErrors.name && (
                                            <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-lg text-slate-700 dark:text-slate-200 font-arabicUI3 mb-2">
                                            رقم الهاتف
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            className={`w-full px-6 py-4 rounded-xl border-2 
                                                     ${validationErrors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}
                                                     bg-white/50 dark:bg-slate-700/50 text-slate-800 dark:text-white
                                                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                        {validationErrors.phone && (
                                            <p className="mt-1 text-sm text-red-500">{validationErrors.phone}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <label className="block text-lg text-slate-700 dark:text-slate-200 font-arabicUI3 mb-2">
                                            المحافظة
                                        </label>
                                        <select
                                            name="governorate"
                                            required
                                            className="w-full px-6 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 
                                                     bg-white/50 dark:bg-slate-700/50 text-slate-800 dark:text-white
                                                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                            value={formData.governorate}
                                            onChange={handleChange}
                                        >
                                            <option value="">اختر المحافظة</option>
                                            {egyptianGovernorates.map((gov) => (
                                                <option key={gov} value={gov}>{gov}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-lg text-slate-700 dark:text-slate-200 font-arabicUI3 mb-2">
                                            العنوان بالتفصيل
                                        </label>
                                        <textarea
                                            name="address"
                                            required
                                            rows="3"
                                            className={`w-full px-6 py-4 rounded-xl border-2 
                                                     ${validationErrors.address ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}
                                                     bg-white/50 dark:bg-slate-700/50 text-slate-800 dark:text-white
                                                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                        {validationErrors.address && (
                                            <p className="mt-1 text-sm text-red-500">{validationErrors.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <motion.button 
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-500 to-purple-500 
                                         text-white rounded-xl py-4 px-8 text-lg font-arabicUI3 mt-8
                                         shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40
                                         transition-all duration-300"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <span>جاري إرسال الطلب</span>
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        تأكيد الطلب
                                        <BsArrowRight className="text-xl" />
                                    </span>
                                )}
                            </motion.button>
                        </motion.form>
                    </motion.div>
                )}
            </div>
            {/* Enhanced Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900
                                     rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="mb-6 relative"
                            >
                                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                                <BsCheck2Circle className="text-8xl text-green-500 relative z-10 mx-auto" />
                            </motion.div>
                            <h2 className="text-3xl font-arabicUI2 text-center mb-4
                                         bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                                تم استلام طلبك بنجاح!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 text-center mb-8 text-lg">
                                سنقوم بالتواصل معك قريباً لتأكيد الطلب وترتيب التوصيل
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <ToastContainer 
                position="top-right"
                rtl={true}
                theme="colored"
                className="font-arabicUI2"
            />
        </div>
    );
}
