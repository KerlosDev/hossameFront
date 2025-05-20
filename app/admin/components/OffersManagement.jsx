'use client'
import { useState, useEffect, useCallback, memo } from 'react';
import { Trash2, Edit, Plus, Search, Tag, Clock, Circle, Check, X, ArrowRight, ArrowLeft, DollarSign, Star, ListPlus, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';

// Extract OfferModal outside main component
const OfferModal = memo(({ isEdit, onSubmit, onClose, currentStep, steps, formData, onFormChange, onNextStep, onPrevStep }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-2xl w-full mx-4"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-arabicUI2 text-white">{isEdit ? 'تعديل العرض' : 'إضافة عرض جديد'}</h3>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                    <X size={24} className="text-white/70" />
                </button>
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-center">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                        >
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                                        ${currentStep > index + 1 ? 'bg-indigo-500 border-indigo-500' :
                                        currentStep === index + 1 ? 'border-indigo-500' : 'border-white/20'}`}
                            >
                                {currentStep > index + 1 ? (
                                    <Check size={20} className="text-white" />
                                ) : (
                                    <span className={`${step.icon ? '' : 'text-sm'} ${currentStep === index + 1 ? 'text-indigo-500' : 'text-white/50'}`}>
                                        {step.icon}
                                    </span>
                                )}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 ${currentStep > index + 1 ? 'bg-indigo-500' : 'bg-white/20'}`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2">
                    {steps.map((step, index) => (
                        <div key={index} className="text-center">
                            <span className={`text-sm ${currentStep === index + 1 ? 'text-white' : 'text-white/50'}`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
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
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-white/70 text-sm">اسم الدكتور</label>
                                    <input
                                        type="text"
                                        value={formData.docname}
                                        onChange={(e) => onFormChange('docname', e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                                    />
                                </div>                                <div className="space-y-4">
                                    <label className="block text-white/70 text-sm">رابط الكورس</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.courseLink}
                                        onChange={(e) => onFormChange('courseLink', e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                        required
                                    />
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

                <div className="flex justify-between mt-8">
                    <button type="button" onClick={onPrevStep} className={`px-6 py-2 rounded-xl flex items-center gap-2 transition-colors ${currentStep === 1
                        ? 'opacity-50 cursor-not-allowed bg-white/5'
                        : 'bg-white/10 hover:bg-white/20'
                        }`}
                        disabled={currentStep === 1}
                    >
                        <ArrowRight size={20} className="text-white" />
                        <span className="text-white">السابق</span>
                    </button>

                    {currentStep === steps.length ? (
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            <Check size={20} />
                            <span>{isEdit ? 'حفظ التغييرات' : 'إضافة العرض'}</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onNextStep}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            <span>التالي</span>
                            <ArrowLeft size={20} />
                        </button>
                    )}
                </div>
            </form>
        </motion.div>
    </motion.div>
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
    const router = useRouter();    const [formData, setFormData] = useState({
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
            if (data.status === 'success') {
                setShowEditModal(false);
                fetchOffers();
                resetForm();
            }
        } catch (error) {
            console.error('Error editing offer:', error);
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
    };    const resetForm = () => {
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
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }, [steps.length]);

    const handlePrevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    }, []);

    return (
        <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-arabicUI2 text-white">إدارة العروض</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    إضافة عرض جديد
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                    <input
                        type="text"
                        placeholder="البحث عن العروض..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                    <option value="all">جميع الحالات</option>
                    <option value="PUBLISHED">منشور</option>
                    <option value="DRAFT">مسودة</option>
                    <option value="EXPIRED">منتهي</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, index) => (
                        <div key={index} className="animate-pulse bg-white/5 rounded-xl p-6">
                            <div className="h-6 bg-white/10 rounded mb-4"></div>
                            <div className="h-20 bg-white/10 rounded mb-4"></div>
                            <div className="h-6 bg-white/10 rounded w-1/2"></div>
                        </div>
                    ))
                ) : (
                    filteredOffers.map(offer => (
                        <div key={offer._id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group">
                            <div className="flex justify-between items-start mb-4">                            <h3 className="text-xl font-arabicUI2 text-white">{offer.name}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setCurrentOffer(offer);
                                            setFormData(offer);
                                            setShowEditModal(true);
                                        }}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <Edit size={16} className="text-white" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteOffer(offer._id)}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 size={16} className="text-white" />
                                    </button>
                                </div>
                            </div>                            <p className="text-white/70 mb-4 line-clamp-3">د. {offer.docname}</p>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Tag size={16} className="text-white/50" />
                                    <span className="text-white/90">{offer.pricebefore} جنيه</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white/50 line-through">{offer.priceafter} جنيه</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-white/50" />
                                <span className="text-white/70">
                                    {new Date(offer.createdAt).toLocaleDateString('ar-EG')}
                                </span>
                            </div><div className="flex items-center gap-2">
                                    <Circle size={8} className={getStageColor(offer.stage)} />
                                    <span className="text-white/70">{offer.stage}</span>
                                </div>
                            </div>
                        </div>
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
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default OffersManagement;
