import Link from 'next/link';
import { FaYoutube, FaFacebook, FaWhatsapp, FaCalculator } from 'react-icons/fa';
import { BsBook, BsGraphUp } from 'react-icons/bs';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Hossam Mera MATH</h3>
            <p className="text-gray-300">منصة تعليمية متكاملة للرياضيات تقدم محتوى عالي الجودة لجميع المراحل الثانوية</p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaYoutube className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <FaWhatsapp className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/Courses" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <BsBook className="w-4 h-4" />
                  <span>الدورات التعليمية</span>
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <BsGraphUp className="w-4 h-4" />
                  <span>الإختبارات</span>
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <FaCalculator className="w-4 h-4" />
                  <span>حسابي</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Educational Stages */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">المراحل الدراسية</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/Courses" className="text-gray-300 hover:text-white transition-colors">
                  الصف الأول الثانوي
                </Link>
              </li>
              <li>
                <Link href="/Courses" className="text-gray-300 hover:text-white transition-colors">
                  الصف الثاني الثانوي
                </Link>
              </li>
              <li>
                <Link href="/Courses" className="text-gray-300 hover:text-white transition-colors">
                  الصف الثالث الثانوي
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">تواصل معنا</h4>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center gap-2">
                <span>رقم الهاتف:</span>
                <a href="tel:+20123456789" className="hover:text-white transition-colors">
                  +20 123 456 789
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span>البريد الإلكتروني:</span>
                <a href="mailto:info@hossammera.math" className="hover:text-white transition-colors">
                  info@hossammera.math
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Hossam Mera MATH. جميع الحقوق محفوظة
            </p>
            <a
              href="https://kerlos.site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
            >
              <span>Developed by Kerlos Hany</span>
              <svg
                className="w-4 h-4 mr-2 rtl:ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;