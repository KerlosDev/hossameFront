'use client'

import { useState, useEffect } from 'react';
import { Save, Wallet, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import Cookies from 'js-cookie';
import './WalletSettings.css';

export default function WalletSettings() {
    const [wallets, setWallets] = useState({
        vodafone: { phone: '', enabled: false },
        orange: { phone: '', enabled: false },
        etisalat: { phone: '', enabled: false },
        instapay: { phone: '', enabled: false }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch current wallet settings on component load
    useEffect(() => {
        const fetchWalletSettings = async () => {
            try {
                const token = Cookies.get('token');
                if (!token) {
                    setError("غير مصرح لك بالوصول");
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/wallets`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('فشل في تحميل بيانات المحافظ');
                }

                const data = await response.json();

                // Update state with fetched wallet data
                if (data && data.wallets) {
                    setWallets(data.wallets);
                }
            } catch (error) {
                console.error("Error fetching wallet settings:", error);
                setError(error.message || 'حدث خطأ أثناء تحميل البيانات');
            } finally {
                setIsLoading(false);
            }
        };

        fetchWalletSettings();
    }, []);

    const handleChange = (wallet, field, value) => {
        setWallets(prev => ({
            ...prev,
            [wallet]: {
                ...prev[wallet],
                [field]: value
            }
        }));

        // Clear any previous messages
        setError(null);
        setSuccess(null);
    };

    const validatePhoneNumber = (number) => {
        // Basic Egyptian phone number validation
        // Should start with 01 followed by 9 digits
        const regex = /^01[0-9]{9}$/;
        return regex.test(number);
    };

    const saveSettings = async () => {
        // Validate that enabled wallets have valid phone numbers
        const enabledWallets = Object.keys(wallets).filter(key => wallets[key].enabled);

        if (enabledWallets.length === 0) {
            setError("يجب تفعيل محفظة واحدة على الأقل");
            return;
        }

        for (const wallet of enabledWallets) {
            if (!wallets[wallet].phone || !validatePhoneNumber(wallets[wallet].phone)) {
                setError(`رقم هاتف ${getWalletName(wallet)} غير صالح. يجب أن يبدأ بـ 01 ويتكون من 11 رقم`);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const token = Cookies.get('token');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/wallets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ wallets })
            });

            if (!response.ok) {
                throw new Error('فشل في حفظ إعدادات المحافظ');
            }

            setSuccess("تم حفظ إعدادات المحافظ بنجاح");

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 3000);

        } catch (error) {
            console.error("Error saving wallet settings:", error);
            setError(error.message || 'حدث خطأ أثناء حفظ البيانات');
        } finally {
            setLoading(false);
        }
    };

    const getWalletName = (key) => {
        const names = {
            vodafone: "فودافون كاش",
            orange: "أورانج كاش",
            etisalat: "اتصالات كاش",
            instapay: "انستا باي"
        };
        return names[key] || key;
    };

    if (isLoading) {
        return (
            <div className="p-8 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent" />
                        <div className="absolute top-0 left-0 animate-pulse rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent border-opacity-30" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div dir='rtl' className="p-8 bg-gradient-to-br font-arabicUI3 from-gray-900/90 to-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-700/40 shadow-xl">
            <div className="space-y-7">
                <div className="flex items-center justify-between border-b border-gray-700/50 pb-5">
                    <h2 className="text-3xl font-bold flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                        <Wallet className="ml-3 text-blue-400" size={28} /> إعدادات المحافظ الإلكترونية
                    </h2>
                </div>

                {error && (
                    <div className="bg-gradient-to-r from-red-500/10 to-red-900/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-5 flex items-start shadow-lg animate-fadeIn">
                        <AlertCircle className="text-red-400 mr-3 shrink-0" size={22} />
                        <p className="text-red-200 font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-5 flex items-start shadow-lg animate-fadeIn">
                        <CheckCircle className="text-emerald-400 mr-3 shrink-0" size={22} />
                        <p className="text-emerald-200 font-medium">{success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mt-2">
                    {Object.keys(wallets).map(wallet => (
                        <div key={wallet}
                            className={`bg-gradient-to-br ${wallet === 'vodafone' ? 'from-red-900/20 to-red-800/10' :
                                wallet === 'orange' ? 'from-orange-900/20 to-orange-800/10' :
                                    wallet === 'etisalat' ? 'from-emerald-900/20 to-teal-800/10' :
                                        'from-blue-900/20 to-indigo-800/10'} 
                              backdrop-blur-md rounded-xl p-6 border border-gray-700/40 hover:border-gray-600/60 transition-all duration-300 shadow-lg hover:shadow-xl group`}>
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-xl font-bold flex items-center">
                                    <img
                                        src={`/${wallet}.png`}
                                        alt={getWalletName(wallet)}
                                        className="w-6 h-6 ml-2 object-contain"
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                    <span className={`${wallet === 'vodafone' ? 'text-red-300' :
                                        wallet === 'orange' ? 'text-orange-300' :
                                            wallet === 'etisalat' ? 'text-emerald-300' :
                                                'text-blue-300'}`}>
                                        {getWalletName(wallet)}
                                    </span>
                                </h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={wallets[wallet].enabled}
                                        onChange={(e) => handleChange(wallet, 'enabled', e.target.checked)}
                                    />
                                    <div className={`w-12 h-6 bg-gray-700 rounded-full peer 
                                                    ${wallet === 'vodafone' ? 'peer-checked:bg-red-600' :
                                            wallet === 'orange' ? 'peer-checked:bg-orange-600' :
                                                wallet === 'etisalat' ? 'peer-checked:bg-emerald-600' :
                                                    'peer-checked:bg-blue-600'} 
                                                    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                                    after:content-[''] after:absolute after:top-[2px] after:right-[2px] 
                                                    after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                                    after:duration-300 shadow-inner`}></div>
                                    <span className={`mr-3 text-sm font-medium ${wallets[wallet].enabled ?
                                        (wallet === 'vodafone' ? 'text-red-300' :
                                            wallet === 'orange' ? 'text-orange-300' :
                                                wallet === 'etisalat' ? 'text-emerald-300' :
                                                    'text-blue-300') : 'text-gray-400'}`}>
                                        {wallets[wallet].enabled ? 'مفعل' : 'غير مفعل'}
                                    </span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 opacity-80">
                                        <span className={wallet === 'vodafone' ? 'text-red-200' :
                                            wallet === 'orange' ? 'text-orange-200' :
                                                wallet === 'etisalat' ? 'text-emerald-200' :
                                                    'text-blue-200'}>
                                            رقم الهاتف
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className={`w-full bg-black/20 border-2 
                                                ${wallets[wallet].enabled && (!wallets[wallet].phone || !validatePhoneNumber(wallets[wallet].phone))
                                                    ? 'border-red-500/50'
                                                    : wallets[wallet].enabled
                                                        ? (wallet === 'vodafone' ? 'border-red-600/30' :
                                                            wallet === 'orange' ? 'border-orange-600/30' :
                                                                wallet === 'etisalat' ? 'border-emerald-600/30' :
                                                                    'border-blue-600/30')
                                                        : 'border-gray-700/40'} 
                                                rounded-xl py-3 px-4 focus:outline-none 
                                                ${wallets[wallet].enabled
                                                    ? (wallet === 'vodafone' ? 'focus:border-red-500 focus:shadow-red-900/20' :
                                                        wallet === 'orange' ? 'focus:border-orange-500 focus:shadow-orange-900/20' :
                                                            wallet === 'etisalat' ? 'focus:border-emerald-500 focus:shadow-emerald-900/20' :
                                                                'focus:border-blue-500 focus:shadow-blue-900/20')
                                                    : 'focus:border-gray-600'} 
                                                focus:shadow-lg text-white transition-all duration-300`}
                                            placeholder="01xxxxxxxxx"
                                            value={wallets[wallet].phone}
                                            onChange={(e) => handleChange(wallet, 'phone', e.target.value)}
                                            disabled={!wallets[wallet].enabled}
                                        />
                                        {wallets[wallet].enabled && (
                                            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                                                {validatePhoneNumber(wallets[wallet].phone) && wallets[wallet].phone && (
                                                    <CheckCircle size={18} className="text-green-400" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {wallets[wallet].enabled && wallets[wallet].phone && !validatePhoneNumber(wallets[wallet].phone) && (
                                        <p className="text-red-400 text-xs mt-2 flex items-center">
                                            <AlertCircle size={12} className="mr-1" />
                                            رقم هاتف غير صالح - يجب أن يبدأ بـ 01 ويتكون من 11 رقم
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center pt-6">
                    <button
                        onClick={saveSettings}
                        disabled={loading}
                        className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-blue-900/20 hover:shadow-xl relative overflow-hidden"
                    >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 group-hover:animate-pulse transition-opacity"></span>
                        {loading ? (
                            <>
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3" />
                                    <div className="absolute top-0 left-0 animate-ping rounded-full h-6 w-6 border-3 border-white border-opacity-20 border-t-transparent mr-3" />
                                </div>
                                <span className="text-lg">جاري الحفظ...</span>
                            </>
                        ) : (
                            <>
                                <Save className="mr-3" size={20} />
                                <span className="text-lg">حفظ الإعدادات</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
