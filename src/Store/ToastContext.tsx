import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastType } from '../Components/Regular/Toast';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setCurrentToast({ id, message, type, duration });
  };

  const showSuccess = (message: string, duration = 3000) => {
    showToast(message, 'success', duration);
  };

  const showError = (message: string, duration = 3000) => {
    showToast(message, 'error', duration);
  };

  const showInfo = (message: string, duration = 3000) => {
    showToast(message, 'info', duration);
  };

  const showWarning = (message: string, duration = 3000) => {
    showToast(message, 'warning', duration);
  };

  const hideToast = () => {
    setCurrentToast(null);
  };

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {currentToast && (
        <Toast
          message={currentToast.message}
          type={currentToast.type}
          visible={!!currentToast}
          onHide={hideToast}
          duration={currentToast.duration}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};