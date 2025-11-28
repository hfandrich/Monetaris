/**
 * StatsOverviewWidget Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { TrendingUp, Wallet, Activity, Zap, Sparkles } from 'lucide-react';
import type { DashboardStats } from '../types/dashboard.types';
import { UserRole } from '@/types';

interface StatsOverviewWidgetProps {
  stats: DashboardStats;
  userRole: UserRole;
  loading?: boolean;
}

const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
  <div className="flex flex-col justify-between h-full p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${color.split(' ')[0]}`}></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} transition-transform group-hover:scale-110 duration-300`}>
        <Icon size={20} />
      </div>
    </div>
    {subtitle && (
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 relative z-10">
        {subtitle}
      </div>
    )}
  </div>
);

const SkeletonCard = () => (
  <div className="flex flex-col justify-between h-full p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
      </div>
      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
    </div>
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
  </div>
);

export const StatsOverviewWidget: React.FC<StatsOverviewWidgetProps> = ({ stats, userRole, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 h-full">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 h-full">
      <StatCard
        title="Gesamtvolumen"
        value={`€ ${(stats.totalVolume / 1000).toFixed(1)}k`}
        subtitle={<span className="text-emerald-500 font-bold flex items-center gap-1"><TrendingUp size={12}/> +12.5%</span>}
        icon={Wallet}
        color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
      />
      <StatCard
        title="Aktive Akten"
        value={stats.activeCases}
        subtitle="In Bearbeitung"
        icon={Activity}
        color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
      />
      <StatCard
        title="Erfolgsquote"
        value={`${stats.successRate}%`}
        subtitle="Performance"
        icon={Zap}
        color="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
      />
      <StatCard
        title="Prognose (Q4)"
        value={`€ ${(stats.projectedRecovery / 1000).toFixed(1)}k`}
        subtitle="AI Prediction"
        icon={Sparkles}
        color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
      />
    </div>
  );
};
