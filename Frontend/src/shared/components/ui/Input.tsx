import React from 'react';

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

Input.displayName = 'Input';
