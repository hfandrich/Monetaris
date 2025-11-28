/**
 * UrgentTasksWidget Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, Badge } from '@/shared/components/ui';
import type { CollectionCase } from '@/types';

interface UrgentTasksWidgetProps {
  urgentCases: CollectionCase[];
  loading?: boolean;
  onCaseClick?: (caseItem: CollectionCase) => void;
}

const SkeletonTask = () => (
  <div className="p-3 bg-white dark:bg-[#151515] rounded-xl border border-slate-200 dark:border-white/5 animate-pulse">
    <div className="flex justify-between items-center mb-1">
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
    </div>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
    <div className="flex justify-between items-center">
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4"></div>
    </div>
  </div>
);

export const UrgentTasksWidget: React.FC<UrgentTasksWidgetProps> = ({
  urgentCases,
  loading,
  onCaseClick
}) => {
  if (loading) {
    return (
      <Card className="h-full dark:bg-[#0A0A0A]">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-8 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <SkeletonTask />
          <SkeletonTask />
          <SkeletonTask />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full dark:bg-[#0A0A0A]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock size={18} className="text-red-500" /> Dringend
        </h3>
        <Badge color="red">{urgentCases.length}</Badge>
      </div>
      <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
        {urgentCases.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl">
            Alles erledigt.
          </div>
        ) : (
          urgentCases.map((c) => (
            <div
              key={c.id}
              className="p-3 bg-white dark:bg-[#151515] rounded-xl border border-slate-200 dark:border-white/5 hover:border-red-300 dark:hover:border-red-500/50 transition-colors cursor-pointer group"
              onClick={() => onCaseClick?.(c)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">{c.invoiceNumber}</span>
                <Badge color="red">Fällig</Badge>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.debtorName}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-500">€ {c.totalAmount.toLocaleString()}</span>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-red-500 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
