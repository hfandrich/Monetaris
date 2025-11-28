/**
 * DebtorCard Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { User, Phone, MapPin, Mail, ArrowRight } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import type { Debtor } from '../types/debtor.types';

interface DebtorCardProps {
  debtor: Debtor;
  onClick?: () => void;
}

export function DebtorCard({ debtor, onClick }: DebtorCardProps) {
  const displayName = debtor.isCompany
    ? debtor.companyName
    : `${debtor.lastName}, ${debtor.firstName}`;

  return (
    <div
      onClick={onClick}
      data-testid="debtor-card"
      className="glass-panel rounded-3xl overflow-hidden hover:border-slate-300 dark:hover:bg-[#111111] transition-all duration-300 group border border-slate-200 dark:border-white/10 dark:bg-[#0A0A0A] cursor-pointer hover:scale-[1.01] hover:shadow-xl"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Color Strip based on Risk */}
        <div className={`w-full h-2 md:h-auto md:w-1.5 ${
          debtor.riskScore === 'E' ? 'bg-red-500' :
          debtor.riskScore === 'D' ? 'bg-orange-500' :
          debtor.riskScore === 'C' ? 'bg-amber-500' :
          'bg-monetaris-500'
        }`}></div>

        <div className="p-5 md:p-6 flex-1 flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight truncate">
                {displayName}
              </h3>
              {debtor.isCompany && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  FIRMA
                </span>
              )}
              {debtor.address.status === 'RESEARCH_PENDING' && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400">
                  Prüfung
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center hover:text-slate-900 dark:hover:text-white transition-colors">
                <MapPin size={12} className="mr-2 text-slate-400 dark:text-slate-500" />
                {debtor.address.street}, {debtor.address.zipCode} {debtor.address.city}
              </div>
              <div className="flex items-center hover:text-slate-900 dark:hover:text-white transition-colors">
                <Mail size={12} className="mr-2 text-slate-400 dark:text-slate-500" />
                {debtor.email}
              </div>
              <div className="flex items-center hover:text-slate-900 dark:hover:text-white transition-colors">
                <Phone size={12} className="mr-2 text-slate-400 dark:text-slate-500" />
                {debtor.phone}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full lg:w-auto lg:gap-8 border-t lg:border-t-0 border-slate-100 dark:border-white/5 pt-4 lg:pt-0 lg:pl-8">
            <div className="text-left lg:text-right">
              <p className="text-[0.6rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Offen</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                € {debtor.totalDebt.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-[0.6rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Akten</p>
              <p className="text-lg font-bold text-slate-600 dark:text-slate-400">{debtor.openCases}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[0.6rem] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Score</p>
              <RiskBadge score={debtor.riskScore} />
            </div>
            <button className="p-3 text-slate-400 group-hover:text-monetaris-500 dark:text-slate-500 transition-colors rounded-full">
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
