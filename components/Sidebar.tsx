
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { 
  SPARKLES_ICON, 
  VIDEO_ICON, 
  COG_ICON, 
  COFFEE_ICON_STEAMING, 
  BELL_ICON 
} from '../constants';

interface SidebarProps {
  currentView: 'apps' | 'lab' | 'gallery';
  onViewChange: (view: 'apps' | 'lab' | 'gallery') => void;
  onAdminClick: () => void;
  onPaymentClick: () => void;
  onNotiClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  onAdminClick, 
  onPaymentClick, 
  onNotiClick 
}) => {
  const { credits, maxCredits } = useAppContext();

  const menuItems = [
    { id: 'apps', label: 'Trang chủ', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ) },
    { id: 'lab', label: 'Phòng Lab', icon: SPARKLES_ICON },
    { id: 'gallery', label: 'Dự án của tôi', icon: VIDEO_ICON },
  ];

  return (
    <div className="w-full lg:w-72 bg-gray-950 border-r border-gray-800 flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="p-8 pb-4">
        <h1 
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500"
          style={{ fontFamily: "'Cinzel Decorative', cursive" }}
        >
          AI VIDEO 9R
        </h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">Creative Dashboard</p>
      </div>

      {/* Credit Widget */}
      <div className="px-6 py-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-500/30 rounded-2xl p-4 shadow-lg shadow-amber-500/5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Tài nguyên</span>
            <span className="text-xs font-mono text-white">{credits}/{maxCredits}</span>
          </div>
          <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${((credits || 0) / (maxCredits || 1) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-gray-500 mt-2 italic text-center">Tăng Credit bằng cách xem QC</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as any)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
              currentView === item.id 
                ? 'bg-sky-500/10 text-sky-400 shadow-[inset_0_0_10px_rgba(56,189,248,0.1)] border border-sky-500/20' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
            }`}
          >
            <span className={currentView === item.id ? 'scale-110 text-sky-400' : ''}>
                {item.icon}
            </span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer Controls */}
      <div className="p-4 border-t border-gray-900 space-y-4">
        <div className="grid grid-cols-2 gap-2">
            <button onClick={onPaymentClick} className="flex items-center justify-center gap-2 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-all text-xs font-bold">
                {COFFEE_ICON_STEAMING} CAFE
            </button>
            <button onClick={onNotiClick} className="flex items-center justify-center gap-2 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg transition-all text-xs font-bold">
                {BELL_ICON} TIN TỨC
            </button>
        </div>
        
        <div className="flex items-center justify-between px-2">
            <div className="text-[10px] text-gray-600">
                v4.7 (Stable)
            </div>
            <button 
                onClick={onAdminClick}
                className="p-2 text-gray-700 hover:text-sky-400 transition-all hover:bg-gray-900 rounded-full"
            >
                {COG_ICON}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
