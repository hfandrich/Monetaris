/**
 * DebtorDetailHeader Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { MapPin, Mail, Phone, AlertTriangle } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import type { Debtor } from '../types/debtor.types';

interface DebtorDetailHeaderProps {
  debtor: Debtor;
}

export function DebtorDetailHeader({ debtor }: DebtorDetailHeaderProps) {
  const displayName = debtor.isCompany
    ? debtor.companyName
    : `${debtor.lastName}, ${debtor.firstName}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="mb-2 text-sm font-mono text-slate-500">
          ID: {debtor.id}
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">
          {displayName}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Schuldner-Detailansicht
        </p>

        <div className="glass-panel p-8 rounded-[32px] border border-slate-200 dark:border-white/10 dark:bg-[#0A0A0A]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                Kontaktdaten
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <MapPin className="mt-1 text-slate-400" size={18} />
                  <span>
                    {debtor.address.street}<br/>
                    {debtor.address.zipCode} {debtor.address.city}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Mail className="text-slate-400" size={18} />
                  <a
                    href={`mailto:${debtor.email}`}
                    className="hover:text-monetaris-500 transition-colors"
                  >
                    {debtor.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Phone className="text-slate-400" size={18} />
                  <span>{debtor.phone}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                Interne Notizen
              </h4>
              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-500/20">
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                  "{debtor.notes || 'Keine Notizen vorhanden.'}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="h-full bg-slate-900 text-white dark:bg-[#111111] flex flex-col justify-between border-none relative overflow-hidden rounded-[32px] p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-monetaris-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">
              Bonität & Risiko
            </h4>
            <div className="flex items-center justify-between mb-8">
              <div className="text-center">
                <RiskBadge score={debtor.riskScore} size="lg" />
                <p className="text-xs text-slate-400 uppercase font-bold mt-2">Score</p>
              </div>
              <div className="h-16 w-[1px] bg-white/10"></div>
              <div className="text-right">
                <div className="text-3xl font-display font-bold text-white">
                  € {debtor.totalDebt.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 uppercase font-bold">Gesamtschuld</p>
              </div>
            </div>
          </div>
          {debtor.riskScore === 'D' || debtor.riskScore === 'E' ? (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-400 shrink-0" size={20} />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Systemwarnung: Erhöhtes Ausfallrisiko. Inkassoprozess beschleunigen empfohlen.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
