/**
 * TenantCard Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { Building2, Mail, CreditCard, Users, Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import type { Tenant } from '../types/tenant.types';

interface TenantCardProps {
  tenant: Tenant;
  onClick?: () => void;
  showStats?: boolean;
}

export function TenantCard({ tenant, onClick, showStats = true }: TenantCardProps) {
  return (
    <div
      onClick={onClick}
      data-testid="tenant-card"
      className="glass-panel p-8 rounded-[32px] border border-slate-200 dark:border-white/10 dark:bg-[#0A0A0A] group hover:border-monetaris-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20 dark:shadow-black/50">
            <Building2 size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display group-hover:text-monetaris-500 transition-colors">
              {tenant.name}
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
              {tenant.registrationNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 dark:bg-[#151515] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
              <Wallet size={10} /> Volumen
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              € {((tenant.totalVolume || 0) / 1000).toFixed(1)}k
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-[#151515] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
              <TrendingUp size={10} /> Akten
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {tenant.totalCases || 0} <ArrowRight size={12} className="text-slate-400" />
            </p>
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
          <Mail size={16} className="mr-3 text-slate-400" />
          {tenant.email}
        </div>
        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
          <CreditCard size={16} className="mr-3 text-slate-400" />
          <span className="font-mono text-xs">{tenant.bankAccountIBAN}</span>
        </div>
        {showStats && (
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
            <Users size={16} className="mr-3 text-slate-400" />
            {tenant.totalDebtors || 0} Schuldner aktiv
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
          Aktiv
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          Premium Plan
        </span>
        <button className="ml-auto p-2 text-slate-400 group-hover:text-monetaris-500 transition-colors rounded-full">
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
