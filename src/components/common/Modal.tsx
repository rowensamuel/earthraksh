import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  actions?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  actions
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0f2416]/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthClass} bg-white border border-[#c9d4c6] shadow-xl z-10 max-h-[92dvh] flex flex-col text-left`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#e2e8df] flex items-start justify-between bg-[#fafbfa] gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold font-display text-[#14291a] break-words">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#5e7362] mt-0.5 break-words">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#667a69] hover:text-[#14291a] hover:bg-[#edf1ea] transition-colors shrink-0 cursor-pointer"
            title="Close dialog"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-sm text-[#1c2e22]">
          {children}
        </div>

        {/* Footer Actions */}
        {actions && (
          <div className="p-3 sm:p-4 border-t border-[#e2e8df] bg-[#fafbfa] flex flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
