import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative bg-white dark:bg-[#0A0A0A] rounded-[24px] w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-black ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 shrink-0 bg-white/50 dark:bg-white/5 backdrop-blur-md z-20">
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar relative z-10">{children}</div>
      </div>
    </div>
  );
};
