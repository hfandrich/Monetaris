import React from 'react';

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
