import React from 'react';

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
