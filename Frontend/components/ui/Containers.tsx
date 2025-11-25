import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// --- Card ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hover?: boolean;
  variant?: 'default' | 'glass' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  noPadding = false,
  hover = false,
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 shadow-sm',
    glass:
      'bg-white/60 dark:bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-glass-md',
    flat: 'bg-slate-50 dark:bg-[#101010] border border-transparent',
  };

  return (
    <div
      className={`relative rounded-[20px] overflow-hidden transition-all duration-300 w-full ${variants[variant]} ${hover ? 'hover:shadow-glass-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/10 cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {/* Subtle Top Highlight for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50 dark:opacity-20 pointer-events-none"></div>

      <div className={`relative z-10 ${noPadding ? '' : 'p-4 md:p-6'}`}>{children}</div>
    </div>
  );
};

// --- Page Header ---
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  kicker?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action, kicker }) => (
  <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 md:mb-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 py-10 px-6 md:px-10 -mx-4 md:-mx-0 rounded-[32px] overflow-hidden group">
    {/* Dynamic Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-100/80 via-white/50 to-slate-100/30 dark:from-[#151515] dark:via-[#0A0A0A] dark:to-[#151515] opacity-80 transition-all duration-700 group-hover:scale-[1.01]"></div>

    {/* Glass/Border Overlay */}
    <div className="absolute inset-0 border border-white/50 dark:border-white/5 rounded-[32px] pointer-events-none"></div>

    {/* Decorative Ambient Glow */}
    <div className="absolute -top-24 -right-24 w-64 h-64 bg-monetaris-500/10 dark:bg-monetaris-500/5 rounded-full blur-[80px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>

    <div className="min-w-0 flex-1 relative z-10">
      {kicker && (
        <div className="flex items-center gap-3 mb-3">
          <div className="h-1 w-8 bg-gradient-to-r from-monetaris-500 to-emerald-300 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 drop-shadow-sm">
            {kicker}
          </span>
        </div>
      )}
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05] break-words drop-shadow-sm">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium pl-5 border-l-2 border-monetaris-500/30">
          {subtitle}
        </p>
      )}
    </div>
    <div className="flex shrink-0 self-start lg:self-end w-full lg:w-auto relative z-10">
      {action}
    </div>
  </div>
);

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
