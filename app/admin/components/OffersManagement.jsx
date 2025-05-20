'use client'
import { useState, useEffect, useCallback, memo } from 'react';
import { Trash2, Edit, Plus, Search, Tag, Clock, Circle, Check, X, ArrowRight, ArrowLeft, DollarSign, Star, ListPlus, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
// Extract OfferModal outside main component
const OfferModal = memo(({ isEdit, onSubmit, onClose, currentStep, steps, formData, onFormChange, onNextStep, onPrevStep, formErrors }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]">
        <div className="min-h-screen px-4 text-center">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
            >
                &#8203;
            </span>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-block w-full max-w-5xl my-8 align-middle"
            >
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700/50">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Header */}
                    <div className="sticky top-0 backdrop-blur-xl bg-gray-900/90 p-6 border-b border-white/10 flex justify-between items-center z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                {isEdit ? <Edit size={20} /> : <Plus size={20} />}
                            </div>
                            <div>
                                <h3 className="text-2xl font-arabicUI3 text-white">
                                    {isEdit ? 'تعديل العرض' : 'إضافة عرض جديد'}
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">{steps[currentStep - 1].title}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <X className="text-gray-400 hover:text-white text-xl" />
                        </button>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="max-h-[calc(100vh-200px)] overflow-y-auto">
                        <div className="p-6 space-y-6">
                            <AnimatePresence mode="wait">
                                <div key={currentStep}>
                                    {currentStep === 1 && (
                                        // Step 1 content
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="block text-white/70 text-sm">عنوان العرض</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => onFormChange('name', e.target.value)}
                                                    className={`w-full px-4 py-3 bg-white/5 border ${formErrors.name ? 'border-red-500' : 'border-white/10'} rounded-xl text-white`}
                                                />
                                                {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-white/70 text-sm">اسم الدكتور</label>
                                                <input
                                                    type="text"
                                                    value={formData.docname}
                                                    onChange={(e) => onFormChange('docname', e.target.value)}
                                                    className={`w-full px-4 py-3 bg-white/5 border ${formErrors.docname ? 'border-red-500' : 'border-white/10'} rounded-xl text-white`}
                                                />
                                                {formErrors.docname && <p className="text-red-500 text-sm">{formErrors.docname}</p>}
                                            </div>                                <div className="space-y-4">
                                                <label className="block text-white/70 text-sm">رابط الكورس</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://..."
                                                    value={formData.courseLink}
                                                    onChange={(e) => onFormChange('courseLink', e.target.value)}
                                                    className={`w-full px-4 py-3 bg-white/5 border ${formErrors.courseLink ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all`}
                                                    required
                                                />
                                                {formErrors.courseLink && <p className="text-red-500 text-sm">{formErrors.courseLink}</p>}
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-white/70 text-sm">حالة العرض</label>
                                                <select
                                                    value={formData.stage}
                                                    onChange={(e) => onFormChange('stage', e.target.value)}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                                >
                                                    <option value="DRAFT">مسودة</option>
                                                    <option value="PUBLISHED">نشر</option>
                                                    {isEdit && <option value="EXPIRED">منتهي</option>}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {currentStep === 2 && (
                                        // Step 2 content
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="block text-white/70 text-sm">السعر قبل الخصم</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={formData.pricebefore}
                                                        onChange={(e) => onFormChange('pricebefore', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-16"
                                                        required
                                                    />
                                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">جنيه</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-white/70 text-sm">السعر بعد الخصم</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={formData.priceafter}
                                                        onChange={(e) => onFormChange('priceafter', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-16"
                                                        required
                                                    />
                                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">جنيه</span>
                                                </div>
                                            </div>
                                            {formData.pricebefore && formData.priceafter && (
                                                <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
                                                    <p className="text-white/70 text-sm">نسبة الخصم:</p>
                                                    <p className="text-2xl font-bold text-indigo-400">
                                                        {Math.round(((formData.pricebefore - formData.priceafter) / formData.pricebefore) * 100)}%
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {currentStep === 3 && (
                                        // Step 3 content
                                        <div className="space-y-6">
                                            {['first', 'second', 'third', 'fourth'].map((feature, index) => (
                                                <div key={feature} className="space-y-4">
                                                    <label className="block text-white/70 text-sm">ميزة {index + 1}</label>
                                                    <div className="relative">
                                                        <Star className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/20" size={20} />
                                                        <input
                                                            type="text"
                                                            placeholder={`أدخل الميزة ${index + 1} هنا...`}
                                                            value={formData[feature]}
                                                            onChange={(e) => onFormChange(feature, e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pr-12"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {currentStep === 4 && (
                                        // Step 4 content
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="block text-white/70 text-sm">المميزات الإضافية</label>
                                                <div className="relative">
                                                    <textarea
                                                        placeholder="اكتب كل ميزة في سطر جديد..."
                                                        value={formData.fetures}
                                                        onChange={(e) => onFormChange('fetures', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[200px]"
                                                    />
                                                </div>
                                                <p className="text-white/50 text-sm">اكتب كل ميزة في سطر جديد للحصول على أفضل تنسيق</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 backdrop-blur-xl bg-gray-900/90 p-6 border-t border-white/10">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center justify-between">
                                    {/* Step Indicators */}
                                    <div className="hidden md:flex items-center gap-8">
                                        {steps.map((step, index) => (
                                            <React.Fragment key={index}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                                                        ${currentStep > index + 1 ? 'border-green-400 bg-green-400/10' :
                                                            currentStep === index + 1 ? 'border-blue-400 bg-blue-400/10' :
                                                                'border-gray-600 bg-gray-700/50'}`}>
                                                        {currentStep > index + 1 ? (
                                                            <Check className="text-green-400" size={12} />
                                                        ) : (
                                                            <span className={`text-sm ${currentStep === index + 1 ? 'text-blue-400' : 'text-gray-400'}`}>
                                                                {index + 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`text-sm ${currentStep === index + 1 ? 'text-white' : 'text-gray-400'}`}>
                                                        {step.title}
                                                    </span>
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div className="w-12 h-0.5 bg-gray-700" />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Mobile Step Indicators */}
                                    <div className="flex md:hidden items-center gap-2">
                                        {steps.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 
                                                    ${currentStep === index + 1 ? 'bg-blue-500 w-8' :
                                                        currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-600'}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex gap-3">
                                        {currentStep > 1 && (
                                            <button
                                                type="button"
                                                onClick={onPrevStep}
                                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl 
                                                    transition-all duration-300 flex items-center gap-2"
                                            >
                                                <ArrowRight size={14} />
                                                السابق
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={currentStep === steps.length ? onSubmit : onNextStep}
                                            className={`px-5 py-2.5 rounded-xl transition-all duration-300 
                                                flex items-center gap-2 ${currentStep === steps.length ?
                                                    'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' :
                                                    'bg-blue-500 hover:bg-blue-600 text-white'
                                                }`}
                                        >
                                            {currentStep === steps.length ? (
                                                <>
                                                    <Check size={14} />
                                                    {isEdit ? 'حفظ التغييرات' : 'إضافة العرض'}
                                                </>
                                            ) : (
                                                <>
                                                    التالي
                                                    <ArrowLeft size={14} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    </div>
));

const OffersManagement = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentOffer, setCurrentOffer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStage, setFilterStage] = useState('all');
    const [currentStep, setCurrentStep] = useState(1);
    const [formErrors, setFormErrors] = useState({});

    const router = useRouter(); const [formData, setFormData] = useState({
        name: '',
        docname: '',
        courseLink: '',
        pricebefore: '',
        priceafter: '',
        first: '',
        second: '',
        third: '',
        fourth: '',
        fetures: '',
        stage: 'DRAFT'
    });

    const steps = [
        { title: 'معلومات أساسية', icon: <Flag size={20} /> },
        { title: 'التسعير', icon: <DollarSign size={20} /> },
        { title: 'المميزات', icon: <Star size={20} /> },
        { title: 'المميزات الإضافية', icon: <ListPlus size={20} /> }
    ];

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []); const fetchOffers = async () => {
        try {
            const token = Cookies.get('token');
            const response = await fetch('http://localhost:9000/offers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
            const data = await response.json();
            if (data.status === 'success') {
                setOffers(data.offers);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    }; const handleAddOffer = async (e) => {
        e.preventDefault();
        const errors = validateForm(currentStep);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            const token = Cookies.get('token');
            const response = await fetch('http://localhost:9000/offers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.status === 'success') {
                setShowAddModal(false);
                fetchOffers();
                resetForm();
            }
        } catch (error) {
            console.error('Error adding offer:', error);
        }
    }; const handleEditOffer = async (e) => {
        e.preventDefault();
        const errors = validateForm(currentStep);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            const token = Cookies.get('token');
            const response = await fetch(`http://localhost:9000/offers/${currentOffer._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                setShowEditModal(false);
                fetchOffers();
                resetForm();
            } else {
                // Show alert with error message
                alert(data.message || 'رابط الكورس مطلوب. يرجى إضافة رابط صحيح.');
            }
        } catch (error) {
            console.error('Error editing offer:', error);
            alert('حدث خطأ أثناء تحديث العرض. يرجى المحاولة مرة أخرى.');
        }
    }; const handleDeleteOffer = async (offerId) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العرض؟')) {
            try {
                const token = Cookies.get('token');
                const response = await fetch(`http://localhost:9000/offers/${offerId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include'
                });
                if (response.ok) {
                    fetchOffers();
                }
            } catch (error) {
                console.error('Error deleting offer:', error);
            }
        }
    };

    const handleAddFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const handleRemoveFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleFeatureChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map((feature, i) => i === index ? value : feature)
        }));
    }; const resetForm = () => {
        setFormData({
            name: '',
            docname: '',
            courseLink: '',
            pricebefore: '',
            priceafter: '',
            first: '',
            second: '',
            third: '',
            fourth: '',
            fetures: '',
            stage: 'DRAFT'
        });
    };

    const getStageColor = (stage) => {
        switch (stage) {
            case 'PUBLISHED':
                return 'bg-green-500';
            case 'DRAFT':
                return 'bg-yellow-500';
            case 'EXPIRED':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    // Add debounced search
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Debounce search query updates
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter offers using debounced value
    const filteredOffers = offers.filter(offer => {
        const matchesSearch = (offer.name?.toLowerCase() || '').includes(debouncedSearchQuery.toLowerCase()) ||
            (offer.docname?.toLowerCase() || '').includes(debouncedSearchQuery.toLowerCase());
        const matchesStage = filterStage === 'all' || offer.stage === filterStage;
        return matchesSearch && matchesStage;
    });

    // Use useCallback for modal handlers
    const handleCloseAddModal = useCallback(() => {
        setShowAddModal(false);
        resetForm();
        setCurrentStep(1);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setShowEditModal(false);
        resetForm();
        setCurrentStep(1);
    }, []);

    const handleFormChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleNextStep = useCallback(() => {
        const errors = validateForm(currentStep);
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length));
        }
    }, [currentStep, formData, steps.length]);

    const handlePrevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    }, []);

    const validateForm = (step) => {
        const errors = {};
        switch (step) {
            case 1:
                if (!formData.name?.trim()) errors.name = 'عنوان العرض مطلوب';
                if (!formData.docname?.trim()) errors.docname = 'اسم الدكتور مطلوب';
                if (!formData.courseLink?.trim()) errors.courseLink = 'رابط الكورس مطلوب';
                if (!formData.courseLink?.startsWith('http')) errors.courseLink = 'يجب أن يبدأ الرابط بـ http:// أو https://';
                break;
            case 2:
                if (!formData.pricebefore) errors.pricebefore = 'السعر قبل الخصم مطلوب';
                if (!formData.priceafter) errors.priceafter = 'السعر بعد الخصم مطلوب';
                if (Number(formData.priceafter) >= Number(formData.pricebefore)) {
                    errors.priceafter = 'يجب أن يكون السعر بعد الخصم أقل من السعر قبل الخصم';
                }
                break;
            case 3:
                if (!formData.first?.trim()) errors.first = 'الميزة الأولى مطلوبة';
                if (!formData.second?.trim()) errors.second = 'الميزة الثانية مطلوبة';
                break;
        }
        return errors;
    };

    // Modify the button click handlers to reset step
    const handleOpenEditModal = useCallback((offer) => {
        setCurrentOffer(offer);
        setFormData(offer);
        setCurrentStep(1);
        setFormErrors({});
        setShowEditModal(true);
    }, []);

    return (
        <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 shadow-2xl">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-12 bg-gradient-to-r from-gray-800/80 to-gray-900/90 p-4 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold text-white font-arabicUI3">إدارة العروض</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300"
                >
                    <Plus className="stroke-2" /> إضافة عرض جديد
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[{
                    label: 'إجمالي العروض',
                    value: offers.length,
                    icon: Tag,
                    color: 'from-blue-600/20 to-blue-400/20',
                    iconColor: 'text-blue-400',
                    borderColor: 'border-blue-500/20'
                },
                {
                    label: 'العروض المنشورة',
                    value: offers.filter(o => o.stage === 'PUBLISHED').length,
                    icon: Check,
                    color: 'from-green-600/20 to-green-400/20',
                    iconColor: 'text-green-400',
                    borderColor: 'border-green-500/20'
                },
                {
                    label: 'المسودات',
                    value: offers.filter(o => o.stage === 'DRAFT').length,
                    icon: Edit,
                    color: 'from-yellow-600/20 to-yellow-400/20',
                    iconColor: 'text-yellow-400',
                    borderColor: 'border-yellow-500/20'
                },
                {
                    label: 'العروض المنتهية',
                    value: offers.filter(o => o.stage === 'EXPIRED').length,
                    icon: Clock,
                    color: 'from-red-600/20 to-red-400/20',
                    iconColor: 'text-red-400',
                    borderColor: 'border-red-500/20'
                }].map((stat, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className={`relative overflow-hidden bg-gradient-to-br ${stat.color} 
                            backdrop-blur-xl rounded-xl p-6 border ${stat.borderColor}
                            hover:shadow-lg hover:shadow-white/5 transition-all duration-300`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg bg-white/5 ${stat.iconColor}`}>
                                <stat.icon className="stroke-2" size={20} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-3xl font-arabicUI3 text-white mt-1">
                                    {stat.value}
                                </h3>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 transform translate-x-2 translate-y-2">
                            <stat.icon className={`${stat.iconColor} opacity-10`} size={64} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Search and Filter Section */}
            <div className="flex gap-4 mb-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-white/10">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="بحث عن عرض..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white 
                                 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
                <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white 
                             focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                    <option value="all">جميع الحالات</option>
                    <option value="PUBLISHED">منشور</option>
                    <option value="DRAFT">مسودة</option>
                    <option value="EXPIRED">منتهي</option>
                </select>
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, index) => (
                        <div key={index} className="animate-pulse bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="h-6 bg-white/10 rounded mb-4"></div>
                            <div className="h-20 bg-white/10 rounded mb-4"></div>
                            <div className="h-6 bg-white/10 rounded w-1/2"></div>
                        </div>
                    ))
                ) : (
                    filteredOffers.map(offer => (
                        <motion.div
                            key={offer._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-xl 
                                     rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2
                                     hover:shadow-blue-500/30 border border-white/10 hover:border-blue-500/50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0 
                                          group-hover:opacity-100 transition-opacity duration-500"/>
                            
                            <div className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-arabicUI3 text-white group-hover:text-blue-400 
                                                     transition-colors duration-300">
                                            {offer.name}
                                        </h3>
                                        <p className="text-gray-400 mt-1">د. {offer.docname}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium 
                                        ${offer.stage === 'PUBLISHED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                          offer.stage === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                          'bg-red-500/20 text-red-400 border-red-500/30'}
                                        border backdrop-blur-md`}>
                                        {offer.stage}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} className="text-blue-400" />
                                            <span className="text-white font-medium">{offer.pricebefore} جنيه</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-400 line-through">{offer.priceafter} جنيه</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>{new Date(offer.createdAt).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 
                                              transition-opacity duration-300">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenEditModal(offer)}
                                            className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 
                                                     rounded-lg transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteOffer(offer._id)}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 
                                                     rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Offer Modal */}
            <AnimatePresence mode="wait">
                {showAddModal && (
                    <OfferModal
                        isEdit={false}
                        onSubmit={handleAddOffer}
                        onClose={handleCloseAddModal}
                        currentStep={currentStep}
                        steps={steps}
                        formData={formData}
                        onFormChange={handleFormChange}
                        onNextStep={handleNextStep}
                        onPrevStep={handlePrevStep}
                        formErrors={formErrors}
                    />
                )}
            </AnimatePresence>

            {/* Edit Offer Modal */}
            <AnimatePresence mode="wait">
                {showEditModal && (
                    <OfferModal
                        isEdit={true}
                        onSubmit={handleEditOffer}
                        onClose={handleCloseEditModal}
                        currentStep={currentStep}
                        steps={steps}
                        formData={formData}
                        onFormChange={handleFormChange}
                        onNextStep={handleNextStep}
                        onPrevStep={handlePrevStep}
                        formErrors={formErrors}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default OffersManagement;
