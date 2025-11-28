/**
 * QuickActionsWidget Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { FilePlus, Users, Building2, Send, Zap } from 'lucide-react';
import { Card } from '@/shared/components/ui';
import type { WizardType } from '../types/dashboard.types';

interface QuickActionsWidgetProps {
  onAction: (type: WizardType | string) => void;
  loading?: boolean;
}

const actions = [
  { label: "Neue Akte", icon: FilePlus, action: 'CLAIM', color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
  { label: "Neuer Schuldner", icon: Users, action: 'DEBTOR', color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
  { label: "Neuer Mandant", icon: Building2, action: 'CLIENT', color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
  { label: "Mahnlauf", icon: Send, action: 'RUN', color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" },
];

const SkeletonAction = () => (
  <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-white/5 animate-pulse">
    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
  </div>
);

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ onAction, loading }) => {
  if (loading) {
    return (
      <Card className="h-full dark:bg-[#0A0A0A]">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          <SkeletonAction />
          <SkeletonAction />
          <SkeletonAction />
          <SkeletonAction />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full dark:bg-[#0A0A0A]">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Zap className="text-amber-500" size={18}/> Schnellauswahl
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={() => onAction(a.action)}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-[#151515] transition-colors group"
            data-testid={`quick-action-${a.action.toLowerCase()}`}
          >
            <div className={`p-3 rounded-full mb-2 ${a.color} transition-transform group-hover:scale-110`}>
              <a.icon size={20} />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{a.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};
