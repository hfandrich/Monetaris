import React from 'react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glow' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  className = '',
  ...props
}) => {
  const base =
    'relative inline-flex items-center justify-center font-sans font-bold transition-all duration-300 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] tracking-wide overflow-hidden group';

  const variants = {
    // In Barbie mode (via .theme-barbie parent class), primary buttons pick up the pink hues
    primary:
      'bg-slate-900 text-white border border-slate-800 dark:bg-white dark:text-black dark:border-transparent shadow-lg hover:shadow-xl dark:shadow-white/10',

    // Glow buttons use monetaris-accent (Pink/Fuchsia in Barbie mode)
    glow: 'text-black bg-monetaris-accent shadow-[0_0_20px_-5px_rgba(0,240,149,0.4)] hover:shadow-[0_0_30px_-5px_rgba(0,240,149,0.6)] border border-transparent hover:brightness-110',

    secondary:
      'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20 backdrop-blur-md',

    danger:
      'bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 dark:text-red-400',

    ghost:
      'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5',

    outline:
      'border border-slate-300 text-slate-700 hover:border-slate-900 hover:text-slate-900 dark:border-white/20 dark:text-slate-300 dark:hover:border-white dark:hover:text-white bg-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {/* Inner Lighting Effect for Glow/Primary */}
      {(variant === 'glow' || variant === 'primary') && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
      )}

      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : null}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};
