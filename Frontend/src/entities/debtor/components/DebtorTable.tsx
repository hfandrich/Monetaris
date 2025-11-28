/**
 * DebtorTable Component - Table view for debtors
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { RiskBadge } from './RiskBadge';
import type { Debtor } from '../types/debtor.types';

interface DebtorTableProps {
  debtors: Debtor[];
  onRowClick?: (debtor: Debtor) => void;
}

export function DebtorTable({ debtors, onRowClick }: DebtorTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10">
            <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              Name
            </th>
            <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              Kontakt
            </th>
            <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              Adresse
            </th>
            <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              Schuld
            </th>
            <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              Akten
            </th>
            <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-500">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {debtors.map((debtor) => {
            const displayName = debtor.isCompany
              ? debtor.companyName
              : `${debtor.lastName}, ${debtor.firstName}`;

            return (
              <tr
                key={debtor.id}
                onClick={() => onRowClick?.(debtor)}
                className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-[#111111] cursor-pointer transition-colors"
                data-testid="debtor-row"
              >
                <td className="py-4 px-4">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {displayName}
                  </div>
                  {debtor.isCompany && (
                    <span className="text-xs text-blue-500">Firma</span>
                  )}
                </td>
                <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">
                  <div>{debtor.email}</div>
                  <div className="text-xs text-slate-500">{debtor.phone}</div>
                </td>
                <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">
                  {debtor.address.zipCode} {debtor.address.city}
                </td>
                <td className="py-4 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                  € {debtor.totalDebt.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                  {debtor.openCases}
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-center">
                    <RiskBadge score={debtor.riskScore} size="sm" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
