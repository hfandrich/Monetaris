/**
 * KreditorTable Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { Building2, Mail, CreditCard } from 'lucide-react';
import type { Kreditor } from '../types/kreditor.types';

interface KreditorTableProps {
  tenants: Kreditor[];
  onKreditorClick?: (kreditor: Kreditor) => void;
}

export function KreditorTable({ tenants, onKreditorClick }: KreditorTableProps) {
  if (tenants.length === 0) {
    return (
      <div className="glass-panel p-12 text-center rounded-[32px] border-dashed border-2 border-slate-200 dark:border-white/10">
        <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-bold">Keine Mandanten gefunden.</p>
      </div>
    );
  }

  return (
    <div data-testid="tenant-table" className="glass-panel rounded-[32px] overflow-hidden border border-slate-200 dark:border-white/10 dark:bg-[#0A0A0A]">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5">
          <thead className="bg-slate-50 dark:bg-[#050505]">
            <tr>
              <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Firma
              </th>
              <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                HRB-Nr.
              </th>
              <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                E-Mail
              </th>
              <th className="px-6 py-4 text-left text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                IBAN
              </th>
              <th className="px-6 py-4 text-right text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Akten
              </th>
              <th className="px-6 py-4 text-right text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Volumen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {tenants.map((tenant) => (
              <tr
                key={kreditor.id}
                onClick={() => onKreditorClick?.(tenant)}
                className="hover:bg-slate-50 dark:hover:bg-[#111111] transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-monetaris-600 transition-colors">
                        {kreditor.name}
                      </p>
                      {kreditor.contactPerson && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {kreditor.contactPerson}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    {kreditor.registrationNumber}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <Mail size={14} className="mr-2 text-slate-400" />
                    {kreditor.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                    <CreditCard size={14} className="mr-2 text-slate-400" />
                    <span className="font-mono text-xs">{kreditor.bankAccountIBAN}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {kreditor.totalCases || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    € {((kreditor.totalVolume || 0) / 1000).toFixed(1)}k
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
