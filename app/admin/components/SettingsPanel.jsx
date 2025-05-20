'use client'
import { useState } from 'react';
import { Settings, Bell, Shield, Database, Globe, Mail, Save, RefreshCw } from 'lucide-react';

export default function SettingsPanel() {
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            browser: true,
            mobile: false,
        },
        security: {
            twoFactor: false,
            sessionTimeout: 30,
            ipRestriction: false,
        },
        system: {
            maintenance: false,
            debugMode: false,
            cacheTimeout: 60,
        },
        localization: {
            language: 'ar',
            timezone: 'Africa/Cairo',
            dateFormat: 'DD/MM/YYYY',
        },
        email: {
            dailyReports: true,
            weeklyAnalytics: true,
            securityAlerts: true,
        }
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSettingChange = (category, setting, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [setting]: value
            }
        }));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />

                <div className="relative flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                        <Settings className="text-3xl text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-arabicUI3">إعدادات النظام</h1>
                        <p className="text-blue-100 mt-1">تخصيص وتكوين إعدادات المنصة</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notifications Settings */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <Bell className="text-yellow-500" size={24} />
                        </div>
                        <h2 className="text-xl font-arabicUI2 text-white">إعدادات الإشعارات</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-white">إشعارات البريد الإلكتروني</label>
                            <input
                                type="checkbox"
                                checked={settings.notifications.email}
                                onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                                className="toggle-checkbox"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-white">إشعارات المتصفح</label>
                            <input
                                type="checkbox"
                                checked={settings.notifications.browser}
                                onChange={(e) => handleSettingChange('notifications', 'browser', e.target.checked)}
                                className="toggle-checkbox"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-white">إشعارات الجوال</label>
                            <input
                                type="checkbox"
                                checked={settings.notifications.mobile}
                                onChange={(e) => handleSettingChange('notifications', 'mobile', e.target.checked)}
                                className="toggle-checkbox"
                            />
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Shield className="text-green-500" size={24} />
                        </div>
                        <h2 className="text-xl font-arabicUI2 text-white">إعدادات الأمان</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-white">المصادقة الثنائية</label>
                            <input
                                type="checkbox"
                                checked={settings.security.twoFactor}
                                onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                                className="toggle-checkbox"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-white block">مهلة الجلسة (دقائق)</label>
                            <input
                                type="number"
                                value={settings.security.sessionTimeout}
                                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Database className="text-purple-500" size={24} />
                        </div>
                        <h2 className="text-xl font-arabicUI2 text-white">إعدادات النظام</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-white">وضع الصيانة</label>
                            <input
                                type="checkbox"
                                checked={settings.system.maintenance}
                                onChange={(e) => handleSettingChange('system', 'maintenance', e.target.checked)}
                                className="toggle-checkbox"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-white">وضع التصحيح</label>
                            <input
                                type="checkbox"
                                checked={settings.system.debugMode}
                                onChange={(e) => handleSettingChange('system', 'debugMode', e.target.checked)}
                                className="toggle-checkbox"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-white block">مهلة التخزين المؤقت (دقائق)</label>
                            <input
                                type="number"
                                value={settings.system.cacheTimeout}
                                onChange={(e) => handleSettingChange('system', 'cacheTimeout', parseInt(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Localization Settings */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Globe className="text-blue-500" size={24} />
                        </div>
                        <h2 className="text-xl font-arabicUI2 text-white">إعدادات اللغة والتوقيت</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-white block">اللغة</label>
                            <select
                                value={settings.localization.language}
                                onChange={(e) => handleSettingChange('localization', 'language', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                            >
                                <option value="ar">العربية</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-white block">المنطقة الزمنية</label>
                            <select
                                value={settings.localization.timezone}
                                onChange={(e) => handleSettingChange('localization', 'timezone', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                            >
                                <option value="Africa/Cairo">توقيت القاهرة (GMT+2)</option>
                                <option value="Asia/Riyadh">توقيت الرياض (GMT+3)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <RefreshCw className="animate-spin" size={18} />
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            حفظ الإعدادات
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}