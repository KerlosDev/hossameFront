import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaYoutube, FaTelegram, FaDiscord } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { GiChemicalTank } from "react-icons/gi";

const Footer = () => {
    const links = [
        {
            title: "روابط سريعة", items: [
                { name: "الرئيسية", href: "/" },
                { name: "الدورات", href: "/courses" },
                { name: "المواد", href: "/subjects" },
            ]
        },
        {
            title: "معلومات التواصل", items: [

                { name: "واتساب", href: "tel:+201080506463" },
            ]
        },
    ];

    const socials = [
        { icon: <FaFacebook size={20} />, href: "#", label: "Facebook" },
        { icon: <FaYoutube size={20} />, href: "#", label: "Youtube" },
        { icon: <FaTelegram size={20} />, href: "#", label: "Telegram" },
        { icon: <BsWhatsapp size={20} />, href: "#", label: "WhatsApp" },
        { icon: <FaDiscord size={20} />, href: "#", label: "Discord" },
    ];

    return (
        <footer dir="rtl" className="bg-gradient-to-b font-arabicUI3 from-slate-900  to-slate-950">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <GiChemicalTank className="text-3xl text-teal-500" />
                            <span className="text-2xl text-white font-arabicUI2">
                                منصة والتر وايت
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm">
                            المنصة الأولى لتعليم الكيمياء بطريقة مبسطة وممتعة
                        </p>
                    </div>

                    {/* Quick Links */}
                    {links.map((section, idx) => (
                        <div key={idx} className="space-y-4">
                            <h3 className="text-white font-arabicUI2 text-lg">{section.title}</h3>
                            <ul className="space-y-2">
                                {section.items.map((item, index) => (
                                    <li key={index}>
                                        <Link href={item.href}
                                            className="text-gray-400 hover:text-teal-400 transition-colors">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Social Media */}
                    <div className="space-y-4">
                        <h3 className="text-white font-arabicUI2 text-lg">تابعنا</h3>
                        <div className="flex gap-4">
                            {socials.map((social, idx) => (
                                <a key={idx}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="p-2 bg-slate-800 rounded-lg hover:bg-blue-500 
                                             text-gray-400 hover:text-white transition-all">
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p dir='rtl' className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} منصة والتر وايت - جميع الحقوق محفوظة
                    </p>
                     <a  href="https://kerlos.site/"
                        className="group hover:scale-110 ease-in-out flex items-center gap-2 px-4 py-2 rounded-xl overflow-hidden relative 
                                   backdrop-blur border border-green-500/20
                                  bg-green-500/10 transition-all duration-300">
                        <span className="text-sm font-medium     text-green-400 transition-colors">
                            by Kerlos Hany
                        </span>
                        <span className="animate-pulse text-red-500">❤️</span>
                        <span className="text-sm font-medium     text-green-400 transition-colors">
                            Developed with
                        </span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;