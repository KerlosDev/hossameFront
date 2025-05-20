'use client'

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#0A1121] to-[#1a2236] relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0">
                {/* Stars effect */}
                <div className="stars"></div>

                {/* Shooting stars */}
                <div className="shooting-stars"></div>

                {/* Glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-lg w-full mx-4">
                {/* 404 Number */}
                <div className="relative">
                    <div className="text-[180px] font-bold text-center leading-none select-none">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">404</span>
                    </div>
                    <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
                </div>

                {/* Message */}
                <div className="text-center -mt-8 relative">
                    <h1 className="text-4xl font-bold text-white mb-4 tracking-wider">عذراً!</h1>
                    <p className="text-lg text-gray-400 mb-8">
                        لم نتمكن من العثور على الصفحة التي تبحث عنها
                    </p>

                    {/* Return button */}
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                    >
                        <span className="relative z-10">العودة للصفحة الرئيسية</span>
                    </Link>
                </div>
            </div>

            {/* Additional decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
    );
}

// Add this to your globals.css
const styles = `
@keyframes twinkle {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
}

.stars {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.stars::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
                      radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
                      radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
                      radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
                      radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0));
    background-repeat: repeat;
    background-size: 200px 200px;
    animation: twinkle 4s ease-in-out infinite;
    transform: rotate(45deg);
}

.shooting-stars {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
}

@keyframes shoot {
    from {
        transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    to {
        transform: translateX(100%) translateY(100%) rotate(45deg);
    }
}

.shooting-stars::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100px;
    height: 1px;
    background: linear-gradient(90deg, #fff, transparent);
    animation: shoot 8s ease-in-out infinite;
}

@keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.animate-gradient {
    background-size: 200% auto;
    animation: gradient 4s ease infinite;
}
`;
