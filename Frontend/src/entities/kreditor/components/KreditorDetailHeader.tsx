/**
 * KreditorDetailHeader Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { Building2, Settings } from 'lucide-react';
import type { Kreditor } from '../types/kreditor.types';

interface KreditorDetailHeaderProps {
  kreditor: Kreditor;
  onSettingsClick?: () => void;
  onReportClick?: () => void;
}

export function KreditorDetailHeader({ kreditor, onSettingsClick, onReportClick }: KreditorDetailHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
      <div>
        <div className="flex items-start md:items-center gap-4 mb-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shrink-0">
            <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-display font-bold text-slate-900 dark:text-white break-all">
              {kreditor.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                Aktiv
              </span>
              <span className="font-mono text-xs text-slate-500">
                {kreditor.registrationNumber}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 w-full lg:w-auto">
        <button
          onClick={onSettingsClick}
          className="flex-1 lg:flex-none px-4 py-2 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#202020] transition-colors flex items-center justify-center gap-2"
        >
          <Settings size={18} /> Einstellungen
        </button>
        <button
          onClick={onReportClick}
          className="flex-1 lg:flex-none px-6 py-2 bg-gradient-to-r from-monetaris-500 to-emerald-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-monetaris-500/30 transition-all"
        >
          Bericht erstellen
        </button>
      </div>
    </div>
  );
}
