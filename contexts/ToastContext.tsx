
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// --- TYPES ---
export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type: ToastType) => void;
  hideToast: (id: number) => void;
}

// --- CONTEXT ---
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const showToast = useCallback((message: string, type: ToastType) => {
    const id = new Date().getTime();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  }, []);

  const hideToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const value = { toasts, showToast, hideToast };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

// --- CUSTOM HOOK ---
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};