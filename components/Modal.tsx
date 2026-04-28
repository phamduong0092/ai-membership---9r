
import React from 'react';
import { X_ICON } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'normal' | 'large' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'normal' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    normal: 'max-w-md',
    large: 'max-w-5xl',
    xl: 'max-w-[95vw] w-full',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 transition-opacity duration-300 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-gray-800 rounded-2xl shadow-2xl ${sizeClasses[size]} m-4 border border-gray-700 transform transition-all duration-300 scale-95 opacity-0 animate-scale-in overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scale-in 0.2s ease-out forwards' }}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg">
            {X_ICON}
          </button>
        </div>
        <div className="p-0">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;
