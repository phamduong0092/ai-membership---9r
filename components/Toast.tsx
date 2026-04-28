
import React, { useEffect } from 'react';
import { ToastMessage, useToast } from '../contexts/ToastContext';
import { CHECK_CIRCLE_ICON, X_CIRCLE_ICON, X_ICON } from '../constants';

interface ToastProps {
  toast: ToastMessage;
}

const toastConfig = {
  success: {
    icon: CHECK_CIRCLE_ICON,
    style: 'bg-green-500 border-green-400',
  },
  error: {
    icon: X_CIRCLE_ICON,
    style: 'bg-red-500 border-red-400',
  },
  info: {
    icon: null, // Add an info icon if needed
    style: 'bg-blue-500 border-blue-400',
  },
};

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { hideToast } = useToast();
  const config = toastConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      hideToast(toast.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, hideToast]);

  return (
    <div
      className={`relative w-full max-w-sm rounded-lg shadow-lg text-white p-4 pr-10 border-l-4 ${config.style} animate-toast-in`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">{config.icon}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={() => hideToast(toast.id)}
        className="absolute top-1.5 right-1.5 p-1 text-white/70 hover:text-white/100 rounded-md focus:outline-none"
        aria-label="Đóng"
      >
        <div className="h-5 w-5">{X_ICON}</div>
      </button>
       <style>{`
        @keyframes toast-in {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .animate-toast-in {
            animation: toast-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;