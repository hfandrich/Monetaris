import React from 'react';

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
