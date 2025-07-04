'use client'
import { useState, useEffect } from 'react';
import {
    User, Save, XCircle, AlertCircle, CheckCircle, ArrowLeft,
    Mail, Phone, UserCircle, MapPin, Book, Calendar
} from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function Settings({ userData, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        parentPhoneNumber: "",
        level: "",
        gender: "",
        government: ""
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: null, message: null });
    const [activeTab, setActiveTab] = useState('personalInfo');

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                phoneNumber: userData.phoneNumber || "",
                parentPhoneNumber: userData.parentPhoneNumber || "",
                level: userData.level || "",
                gender: userData.gender || "",
                government: userData.government || ""
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: null, message: null });

        try {
            // Get token from cookies
            const token = Cookies.get('token');

            if (!token) {
                setStatus({
                    type: 'error',
                    message: 'لم يتم العثور على رمز التحقق، يرجى تسجيل الدخول من جديد'
                });
                setLoading(false);
                return;
            }

            // Send update request
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/user/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update cookies with new data
            Cookies.set('username', encodeURIComponent(formData.name));
            Cookies.set('email', encodeURIComponent(formData.email));
            Cookies.set('phone', encodeURIComponent(formData.phoneNumber));

            // Set success status
            setStatus({
                type: 'success',
                message: 'تم تحديث بياناتك بنجاح'
            });

            // Call the onUpdate callback to update parent component state
            if (onUpdate) {
                onUpdate(formData);
            }

            // Auto close after success (optional)
            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);

        } catch (err) {
            console.error('Error updating user data:', err);
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات'
            });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'personalInfo', label: 'المعلومات الشخصية', icon: <UserCircle size={20} /> },
        { id: 'contactInfo', label: 'معلومات الاتصال', icon: <Phone size={20} /> },
        { id: 'academicInfo', label: 'المعلومات الدراسية', icon: <Book size={20} /> }
    ];

    return (
        <div className="min-h-full bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 transition-all duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                        <User size={20} className="text-white" />
                    </div>
                    <h2 className="text-xl font-arabicUI2 text-white">إعدادات الحساب</h2>
                </div>

                <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            {/* Status Message */}
            {status.type && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
                    }`}>
                    {status.type === 'success' ? (
                        <CheckCircle className="flex-shrink-0" size={20} />
                    ) : (
                        <AlertCircle className="flex-shrink-0" size={20} />
                    )}
                    <p>{status.message}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                            }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                {activeTab === 'personalInfo' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white/80 mb-2 text-sm">الاسم</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none transition-all duration-300"
                                placeholder="أدخل اسمك"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2 text-sm">الجنس</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none transition-all duration-300"
                            >
                                <option className='text-black' value="">اختر الجنس</option>
                                <option className='text-black' value="ذكر">ذكر</option>
                                <option className='text-black' value="أنثى">أنثى</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2 text-sm">المحافظة</label>
                            <input
                                type="text"
                                name="government"
                                value={formData.government}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none transition-all duration-300"
                                placeholder="المحافظة"
                            />
                        </div>
                    </div>
                )}

                {/* Contact Information */}
                {activeTab === 'contactInfo' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white/80 mb-2 text-sm">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full p-3 pr-10 rounded-xl bg-white/10 border border-white/10 text-white/50 cursor-not-allowed outline-none"
                                    placeholder="example@email.com"
                                />

                            </div>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2 text-sm">رقم الهاتف</label>
                            <div className="relative">
                                <Phone size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full p-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none transition-all duration-300"
                                    placeholder="01xxxxxxxxx"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/80 mb-2 text-sm">رقم هاتف ولي الأمر</label>
                            <div className="relative">
                                <Phone size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                                <input
                                    type="tel"
                                    name="parentPhoneNumber"
                                    value={formData.parentPhoneNumber}
                                    disabled
                                    className="w-full p-3 pr-10 rounded-xl bg-white/10 border border-white/10 text-white/50 cursor-not-allowed outline-none"
                                    placeholder="01xxxxxxxxx"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Academic Information */}
                {activeTab === 'academicInfo' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white/80 mb-2 text-sm">المستوى الدراسي</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none transition-all duration-300"
                            >
                                <option className='text-black' value="">اختر المستوى</option>
                                <option className='text-black' value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                                <option className='text-black' value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                                <option className='text-black' value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                        disabled={loading}
                    >
                        <XCircle size={18} />
                        <span>إلغاء</span>
                    </button>

                    <button
                        type="submit"
                        className={`px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
              hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 
              flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>جاري الحفظ...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>حفظ التغييرات</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}