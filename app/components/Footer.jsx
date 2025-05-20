'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { FaFacebook, FaYoutube, FaTelegram, FaDiscord, FaChevronUp } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { GiChemicalTank } from "react-icons/gi";

const Footer = () => {
    const [email, setEmail] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    // Show back-to-top button when scrolling down
    React.useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle newsletter subscription
        setEmail('');
        // Add subscription logic here
    };

    const quickLinks = [
        { name: "الرئيسية", href: "/" },
        { name: "الدورات", href: "/courses" },
        { name: "المواد", href: "/subjects" },
        { name: "المقالات", href: "/articles" },
        { name: "عن المنصة", href: "/about" },
    ];

    const communityLinks = [
        { name: "مجتمع الطلاب", href: "/community" },
        { name: "الأسئلة الشائعة", href: "/faq" },
        { name: "تواصل معنا", href: "/contact" },
    ];

    const socials = [
        { icon: <FaFacebook size={20} />, href: "#", label: "Facebook", color: "hover:bg-blue-600" },
        { icon: <FaYoutube size={20} />, href: "#", label: "Youtube", color: "hover:bg-red-600" },
        { icon: <FaTelegram size={20} />, href: "#", label: "Telegram", color: "hover:bg-blue-500" },
        { icon: <BsWhatsapp size={20} />, href: "#", label: "WhatsApp", color: "hover:bg-green-500" },
        { icon: <FaDiscord size={20} />, href: "#", label: "Discord", color: "hover:bg-indigo-500" },
    ];

    return (
        <footer dir="rtl" className="relative font-arabicUI3 bg-white/5 backdrop-blur-xl border-t border-blue-500/10">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50"></div>
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-400/5 rounded-full blur-3xl animate-pulse-delayed"></div>
            </div>
            
            {/* Back to top button */}
            {isVisible && (
                <button 
                    onClick={scrollToTop}
                    className="fixed bottom-8 left-8 z-50 p-3 rounded-full bg-blue-400/80 backdrop-blur text-white shadow-lg 
                             hover:bg-blue-500/80 transition-all duration-300 group animate-bounce-gentle"
                >
                    <FaChevronUp className="group-hover:-translate-y-1 transition-transform duration-300" />
                </button>
            )}

            <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="p-3 bg-gradient-to-br from-blue-400/80 to-purple-400/80 rounded-2xl 
                                        shadow-lg group-hover:scale-105 transition-all duration-300">
                                <GiChemicalTank className="text-3xl text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl text-slate-700 dark:text-white font-arabicUI2 font-bold">
                                    منصة والتر وايت
                                </span>
                                <span className="text-xs text-blue-400">منصة تعليم الكيمياء الأولى</span>
                            </div>
                        </Link>
                        
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            المنصة الأولى لتعليم الكيمياء بطريقة مبسطة وممتعة، نقدم لك تجربة تعليمية فريدة مع أفضل المدرسين والمحتوى التعليمي المميز.
                        </p>
                        
                        {/* Newsletter */}
                       
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-slate-700 dark:text-white font-arabicUI2 text-lg font-bold">
                            روابط سريعة
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href}
                                        className="text-slate-600 dark:text-slate-300 hover:text-blue-400 
                                                 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 
                                                     group-hover:opacity-100 transition-opacity"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community Links */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-slate-700 dark:text-white font-arabicUI2 text-lg font-bold">
                            المجتمع
                        </h3>
                        <ul className="space-y-3">
                            {communityLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href}
                                        className="text-slate-600 dark:text-slate-300 hover:text-blue-400 
                                                 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 
                                                     group-hover:opacity-100 transition-opacity"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="lg:col-span-4 space-y-6">
                        <h3 className="text-slate-700 dark:text-white font-arabicUI2 text-lg font-bold">
                            تواصل معنا
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-xl text-blue-400">
                                    <BsWhatsapp size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">واتساب</p>
                                    <a href="tel:+20123456789" className="text-slate-700 dark:text-white hover:text-blue-400 transition-colors">
                                        +20 123 456 789
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="pt-2">
                            <h4 className="text-slate-700 dark:text-white text-md font-arabicUI2 mb-3">تابعنا على</h4>
                            <div className="flex gap-3">
                                {socials.map((social, idx) => (
                                    <a key={idx}
                                        href={social.href}
                                        aria-label={social.label}
                                        className={`p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-xl text-slate-400 
                                                 ${social.color} hover:text-white hover:scale-110 hover:shadow-lg
                                                 transition-all duration-300`}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-6 border-t border-blue-100 dark:border-blue-500/10 flex flex-col sm:flex-row 
                            justify-between items-center gap-4">
                    <p dir="rtl" className="text-slate-600 dark:text-slate-300 text-sm">
                        © {new Date().getFullYear()} منصة والتر وايت - جميع الحقوق محفوظة
                    </p>
                    
                    <a href="https://kerlos.site/"
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl overflow-hidden relative 
                                 hover:bg-white/5 transition-colors duration-300">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-400 transition-colors">
                            Developed with 
                        </span>
                        <span className="animate-pulse text-red-500">❤️</span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-blue-400 transition-colors">
                            by Kerlos Hany
                        </span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;