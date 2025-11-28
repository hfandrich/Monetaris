/**
 * RiskBadge Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import type { RiskScore } from '../types/debtor.types';

interface RiskBadgeProps {
  score: RiskScore;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-16 h-16 text-3xl'
};

const RISK_COLORS: Record<RiskScore, string> = {
  A: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/50',
  B: 'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30',
  C: 'bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30',
  D: 'bg-orange-50 text-orange-500 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/30',
  E: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/50',
};

export function RiskBadge({ score, size = 'md' }: RiskBadgeProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl font-bold font-display border ${SIZE_CLASSES[size]} ${RISK_COLORS[score]}`}
      data-testid="risk-badge"
      title={`Risk Score: ${score}`}
    >
      {score}
    </div>
  );
}
