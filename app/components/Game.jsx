import { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

export default function CountdownTimer() {
  // Target date: June 8, 2025
  const targetDate = new Date('2026-06-08T00:00:00');
  
  // State for countdown values
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    // Calculate time remaining
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };
    
    // Initial calculation
    calculateTimeLeft();
    
    // Set up interval
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Clean up interval
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all" dir="rtl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <AlertCircle size={20} className="text-purple-300" />
        </div>
        <h3 className="font-bold text-lg"> استعد خلاص هانت </h3>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-2 h-10 rounded-full bg-blue-500"></div>
            <div>
              <h4 className="font-medium">امتحانات ثانوية عامة</h4>
              <p className="text-sm text-white/60">٨ يونيو 2026</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">
            {timeLeft.days} يوم متبقي
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center gap-3 p-4 bg-white/5 rounded-lg">
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
          <div className="text-xs text-white/60">يوم</div>
        </div>
        
        <div className="text-white text-xl font-bold">:</div>
        
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
          <div className="text-xs text-white/60">ساعة</div>
        </div>
        
        <div className="text-white text-xl font-bold">:</div>
        
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
          <div className="text-xs text-white/60">دقيقة</div>
        </div>
        
        <div className="text-white text-xl font-bold">:</div>
        
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-white">{timeLeft.seconds}</div>
          <div className="text-xs text-white/60">ثانية</div>
        </div>
      </div>
      
      <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-purple-300" />
          <h3 className="font-medium text-white">نصائح للاستعداد</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            <span className="text-sm text-white/70">تنظيم جدول مذاكرة يومي</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            <span className="text-sm text-white/70">حل نماذج امتحانات السنوات السابقة</span>
          </div>
        </div>
      </div>
    </div>
  );
}