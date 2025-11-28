/**
 * KreditorStats Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { Wallet, FileText, Gavel, Filter } from 'lucide-react';

interface KreditorStatsProps {
  totalVolume: number;
  openCases: number;
  legalCases: number;
  onStatClick?: (type: 'ALL' | 'OPEN' | 'LEGAL') => void;
}

export function KreditorStats({ totalVolume, openCases, legalCases, onStatClick }: KreditorStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Volume */}
      <div
        onClick={() => onStatClick?.('ALL')}
        className="cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      >
        <div className="glass-panel bg-gradient-to-br from-monetaris-600 to-emerald-600 text-white border-none relative overflow-hidden h-full rounded-[32px]">
          <div className="p-6 md:p-8 relative z-10">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <p className="text-white/80 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1">
              <Wallet size={12} /> Gesamtvolumen
            </p>
            <h3 className="text-3xl font-display font-bold">
              € {(totalVolume / 1000).toFixed(1)}k
            </h3>
            <p className="text-xs text-white/60 mt-2 font-bold flex items-center">
              <Filter size={10} className="mr-1" /> Alle anzeigen
            </p>
          </div>
        </div>
      </div>

      {/* Open Cases */}
      <div
        onClick={() => onStatClick?.('OPEN')}
        className="cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      >
        <div className="glass-panel dark:bg-[#0A0A0A] h-full border border-slate-200 dark:border-white/10 hover:border-monetaris-500 dark:hover:border-monetaris-500/50 transition-colors rounded-[32px] p-6 md:p-8">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1">
            <FileText size={12} /> Offene Akten
          </p>
          <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
            {openCases}
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-bold flex items-center group-hover:text-monetaris-500">
            <Filter size={10} className="mr-1" /> Filtern
          </p>
        </div>
      </div>

      {/* Legal Cases */}
      <div
        onClick={() => onStatClick?.('LEGAL')}
        className="cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      >
        <div className="glass-panel dark:bg-[#0A0A0A] h-full border border-slate-200 dark:border-white/10 hover:border-monetaris-500 dark:hover:border-monetaris-500/50 transition-colors rounded-[32px] p-6 md:p-8">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1">
            <Gavel size={12} /> Gerichtliche Verfahren
          </p>
          <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
            {legalCases}
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-bold flex items-center group-hover:text-monetaris-500">
            <Filter size={10} className="mr-1" /> Filtern
          </p>
        </div>
      </div>
    </div>
  );
}
