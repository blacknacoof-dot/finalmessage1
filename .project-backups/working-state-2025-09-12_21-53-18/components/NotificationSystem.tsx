import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './icons';

// Custom icons for missing ones
const XCircleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

const InformationCircleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

interface Modal {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const NotificationSystem: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<Modal | null>(null);

  // Toast management
  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { message, type, duration } = event.detail;
      const id = Math.random().toString(36).substr(2, 9);
      const toast = { id, message, type, duration };
      
      setToasts(prev => [...prev, toast]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  // Modal management
  useEffect(() => {
    const handleShowModal = (event: CustomEvent) => {
      setModal(event.detail);
    };

    window.addEventListener('show-modal', handleShowModal);
    return () => window.removeEventListener('show-modal', handleShowModal);
  }, []);

  const closeModal = () => {
    if (modal?.onClose) modal.onClose();
    setModal(null);
  };

  const handleConfirm = () => {
    if (modal?.onConfirm) modal.onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (modal?.onCancel) modal.onCancel();
    closeModal();
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error': return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      default: return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getToastColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-900/20 border-green-500/30 text-green-400';
      case 'error': return 'bg-red-900/20 border-red-500/30 text-red-400';
      case 'warning': return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
      default: return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center p-4 border rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${getToastColors(toast.type)}`}
            style={{ minWidth: '320px' }}
          >
            {getToastIcon(toast.type)}
            <span className="ml-3 text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-3 text-slate-400 hover:text-slate-200"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={modal.type !== 'confirm' ? closeModal : undefined}
          />
          
          {/* Modal Content */}
          <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 m-4 max-w-md w-full transform transition-all duration-200 scale-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getToastIcon(modal.type)}
              </div>
              
              <div className="ml-3 flex-1">
                {modal.title && (
                  <h3 className="text-lg font-medium text-white mb-2">
                    {modal.title}
                  </h3>
                )}
                <p className="text-sm text-slate-300 leading-relaxed">
                  {modal.message}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              {modal.type === 'confirm' ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    {modal.cancelText || '취소'}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {modal.confirmText || '확인'}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};