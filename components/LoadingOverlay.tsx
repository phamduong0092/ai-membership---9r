
import React from 'react';

interface LoadingOverlayProps {
  isOpen: boolean;
  message?: string;
  subMessage?: string; // New prop for the URL
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isOpen, message = "Đang kết nối...", subMessage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center backdrop-blur-md transition-opacity duration-300">
      <div className="relative mb-6">
        <div className="w-20 h-20 border-4 border-gray-700 border-t-sky-500 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-b-purple-500 rounded-full animate-spin-reverse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        </div>
      </div>
      
      <p className="text-2xl font-bold text-white mb-2 animate-pulse">
        {message}
      </p>

      {subMessage && (
        <div className="mt-2 p-3 bg-gray-800/80 border border-gray-700 rounded-lg max-w-md text-center mx-4">
             <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Link kích hoạt</p>
             <p className="text-sky-400 font-mono text-sm break-all">
                {subMessage}
             </p>
        </div>
      )}
      
      <style>{`
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
