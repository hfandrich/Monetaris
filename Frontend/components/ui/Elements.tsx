import React from 'react';
import { FileText, Image as ImageIcon, File } from 'lucide-react';

// --- Brand Logo ---
interface LogoProps {
  className?: string;
  animated?: boolean;
}

export const MonetarisLogo: React.FC<LogoProps> = ({
  className = 'h-10 w-auto',
  animated = false,
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" className={className}>
    <defs>
      <linearGradient id="monetarisGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
        {/* Dynamic Gradient using currentColor context from Tailwind classes */}
        {/* In Barbie mode, monetaris-400/500 are pinks, creating a Rose Gold gradient automatically */}
        <stop offset="0%" stopColor="currentColor" className="text-monetaris-400" />
        <stop offset="50%" stopColor="currentColor" className="text-monetaris-500" />
        <stop offset="100%" stopColor="currentColor" className="text-blue-500" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Stylized M / Graph Icon */}
    <path
      d="M20 60 L50 20 L80 50 L110 15 L140 40"
      fill="none"
      stroke="currentColor"
      className="text-monetaris-500 opacity-80"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#glow)"
    />
    <path
      d="M20 60 L50 20 L80 50 L110 15 L140 40"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-90"
    />
    {animated && (
      <circle
        cx="140"
        cy="40"
        r="4"
        fill="currentColor"
        className="animate-ping text-monetaris-accent"
      />
    )}
  </svg>
);

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

// --- Badge ---
interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' | 'monetaris';
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray' }) => {
  const colors = {
    monetaris:
      'bg-monetaris-500/10 text-monetaris-600 border-monetaris-500/20 dark:text-monetaris-accent dark:border-monetaris-accent/30',
    green:
      'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-400/30',
    red: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 dark:border-red-400/30',
    yellow:
      'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-400/30',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:border-blue-400/30',
    gray: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400 dark:border-slate-400/30',
    purple:
      'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 dark:border-purple-400/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[0.65rem] font-bold uppercase tracking-widest border backdrop-blur-sm whitespace-nowrap shadow-sm ${colors[color]}`}
    >
      {children}
    </span>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full group">
      {label && (
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2 ml-1 group-focus-within:text-monetaris-600 dark:group-focus-within:text-monetaris-accent transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`w-full px-4 py-3 border rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-300 text-sm
            focus:bg-white focus:ring-4 focus:ring-slate-100
            dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-white/10 dark:focus:border-monetaris-accent/50 dark:focus:ring-monetaris-accent/10
            ${
              error
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
            } 
            ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1 flex items-center">
          <span className="w-1 h-1 rounded-full bg-red-500 mr-1.5"></span>
          {error}
        </p>
      )}
    </div>
  )
);

// --- File Icon ---
export const FileIcon: React.FC<{ type: string; className?: string }> = ({
  type,
  className = 'w-6 h-6',
}) => {
  if (type === 'PDF') return <FileText className={`text-red-500 ${className}`} />;
  if (type === 'IMAGE') return <ImageIcon className={`text-blue-500 ${className}`} />;
  if (type === 'EXCEL') return <File className={`text-emerald-500 ${className}`} />;
  return <File className={`text-slate-400 ${className}`} />;
};
