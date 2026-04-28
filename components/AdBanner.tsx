
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { CHEVRON_DOWN_ICON } from '../constants';

const AdBanner: React.FC = () => {
  const { 
    credits, maxCredits, addCredits, adLinks, 
    adStrategy, nextAdIndex, cycleNextAd, sendTele 
  } = useAppContext();
  const { showToast } = useToast();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<{ link: string, text: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper tách URL và Hook
  const parseAdEntry = (entry: string) => {
    if (!entry) return { link: '', text: 'Xem QC' };
    const parts = entry.split('|');
    const link = parts[0].trim();
    const hook = parts.length > 1 ? parts[1].trim() : 'Xem QC'; 
    return { link, text: hook }; 
  };

  // Effect cập nhật Hook hiển thị dựa trên Strategy và Index
  useEffect(() => {
    if (!adLinks || adLinks.length === 0) {
      setCurrentAd(null);
      return;
    }

    if (adStrategy === 'sequential') {
      // Chế độ tuần tự: Luôn bám sát nextAdIndex từ context
      const idx = nextAdIndex % adLinks.length;
      setCurrentAd(parseAdEntry(adLinks[idx]));
    } else if (!currentAd) {
      // Chế độ ngẫu nhiên: Chỉ chọn ngẫu nhiên lần đầu nếu currentAd đang null
      const randomIdx = Math.floor(Math.random() * adLinks.length);
      setCurrentAd(parseAdEntry(adLinks[randomIdx]));
    }
  }, [adLinks, adStrategy, nextAdIndex]); // Re-run khi links, chiến thuật hoặc index thay đổi

  // Xử lý Click Outside để đóng Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hàm thực thi Click Quảng cáo (Logic "Select-to-Execute")
  const executeAd = (ad: { link: string, text: string }) => {
    if (!ad.link) {
      showToast("Link quảng cáo không hợp lệ.", "error");
      return;
    }

    const currentCreditNum = credits || 0;
    const limit = maxCredits || 10;

    // 1. Mở link
    window.open(ad.link, '_blank');
        
    // Tracking Telegram: Click QC
    sendTele(`💰 <b>Click Quảng cáo</b>\n🔗 <code>${ad.text}</code>\n💎 +10 Credit`);

    // 2. Xử lý cộng điểm
    if (currentCreditNum < limit) {
      addCredits(10);
      showToast("Đã xem! +10 Credit", "success");
    } else {
      showToast(`Đã mở link. (Credit đã đạt giới hạn ${limit})`, "info");
    }

    // 3. Cập nhật trạng thái hiển thị tiếp theo
    if (adStrategy === 'sequential') {
      cycleNextAd(); // Tăng index trong context -> useEffect sẽ tự update nhãn mới
    } else {
      // Nếu là random, chủ động chọn một cái khác cho lần hiện thị tới trên nút
      const otherLinks = adLinks.filter(l => !l.startsWith(ad.link));
      const sourceList = otherLinks.length > 0 ? otherLinks : adLinks;
      const nextRandomIdx = Math.floor(Math.random() * sourceList.length);
      setCurrentAd(parseAdEntry(sourceList[nextRandomIdx]));
    }
    
    setIsMenuOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 mt-6 mb-2 animate-fade-in-up px-2 relative z-50">
      
      {/* Khối Credit & Badge */}
      <div className="flex items-center gap-3 shrink-0">
          <div className="bg-gray-800/80 border border-yellow-500/50 rounded-full px-5 py-2 flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.2)] backdrop-blur-sm whitespace-nowrap h-[54px] shrink-0">
            <span className="text-xl">💎</span>
            <div className="flex flex-col items-start leading-none">
                <span className="text-yellow-400 font-bold text-lg">{credits || 0}/{maxCredits || 10}</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest">Credits</span>
            </div>
          </div>

          <div className="bg-gray-800/80 border border-yellow-500/50 rounded-full px-5 py-3 flex items-center gap-2 text-emerald-400 font-bold text-lg whitespace-nowrap shadow-[0_0_15px_rgba(234,179,8,0.2)] backdrop-blur-sm h-[54px] shrink-0">
            <span>+10</span>
            <span className="text-base">💎</span>
            <span className="animate-slide-right ml-1 text-2xl">👉</span>
          </div>
      </div>

      {/* SMART AD DROPDOWN (Split Button) */}
      <div className="relative w-full md:w-auto flex flex-col" ref={dropdownRef}>
        <div className="flex w-full md:w-auto h-[54px] bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] overflow-hidden transition-all duration-300 transform hover:scale-[1.02] group">
          
          {/* Phần Nhãn (Co giãn thông minh) */}
          <button 
            onClick={() => currentAd && executeAd(currentAd)}
            className="relative flex-grow md:w-auto md:min-w-[320px] md:max-w-[800px] h-full flex items-center justify-center px-8 text-white font-bold text-base md:text-lg border-r border-white/20 hover:bg-white/10 transition-colors truncate"
          >
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] group-hover:animate-shine pointer-events-none" />
            <span className="truncate w-full text-center">
              {currentAd ? currentAd.text : 'Đang tải QC...'}
            </span>
          </button>

          {/* Phần Chevron */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-[60px] h-full flex items-center justify-center text-white hover:bg-white/10 transition-all shrink-0 ${isMenuOpen ? 'bg-white/20' : ''}`}
            aria-label="Mở danh sách quảng cáo"
          >
            <div className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}>
              {CHEVRON_DOWN_ICON}
            </div>
          </button>
        </div>

        {/* DROPDOWN MENU */}
        {isMenuOpen && adLinks && adLinks.length > 0 && (
          <div className="absolute top-[60px] left-0 right-0 md:left-auto md:w-full md:min-w-[460px] bg-gray-800/95 border border-emerald-500/30 rounded-2xl shadow-2xl backdrop-blur-xl z-[100] overflow-hidden animate-menu-slide">
            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              <div className="px-3 py-1.5 flex justify-between items-center border-b border-gray-700/50 mb-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Danh sách Quảng cáo</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {adStrategy === 'random' ? 'Ngẫu nhiên' : 'Tuần tự'}
                </span>
              </div>
              {adLinks.map((entry, idx) => {
                const ad = parseAdEntry(entry);
                const isActive = currentAd?.link === ad.link;
                return (
                  <button
                    key={idx}
                    onClick={() => executeAd(ad)}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between gap-3 transition-all hover:bg-emerald-500/10 group/item ${isActive ? 'bg-emerald-500/5' : ''}`}
                  >
                    <span className={`text-sm md:text-base font-medium transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-300 group-hover/item:text-white'}`}>
                      {ad.text}
                    </span>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        .group-hover\\:animate-shine {
          animation: shine 1.5s infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes slideRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .animate-slide-right {
          animation: slideRight 1s ease-in-out infinite;
        }
        @keyframes menuSlide {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-menu-slide {
          animation: menuSlide 0.2s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AdBanner;
