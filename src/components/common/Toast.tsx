import React, { useState, useEffect } from 'react';
import { CheckIcon, AlertCircleIcon, InfoIcon, CloseIcon } from './Icons';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  description?: string;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', description?: string) => {
  const toast: ToastMessage = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    message,
    description
  };
  toastListeners.forEach(listener => listener(toast));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (newToast: ToastMessage) => {
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
    };

    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter(l => l !== handler);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const borderStyle = {
          success: 'border-[#1b5e20] bg-[#f7faf6]',
          error: 'border-[#b91c1c] bg-[#fdf6f6]',
          info: 'border-[#1e40af] bg-[#f5f8ff]'
        }[toast.type];

        const iconComponent = {
          success: <CheckIcon size={16} className="text-[#1b5e20]" />,
          error: <AlertCircleIcon size={16} className="text-[#b91c1c]" />,
          info: <InfoIcon size={16} className="text-[#1e40af]" />
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto border-l-4 border shadow-md p-3.5 flex items-start justify-between gap-3 text-left ${borderStyle}`}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0">{iconComponent}</span>
              <div>
                <p className="text-xs font-bold text-[#14291a]">{toast.message}</p>
                {toast.description && (
                  <p className="text-[11px] text-[#556958] mt-0.5 leading-normal">{toast.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#728776] hover:text-[#14291a] p-0.5 shrink-0"
              title="Dismiss"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
