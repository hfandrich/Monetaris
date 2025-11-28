/**
 * TemplateCard Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { FileText, Mail, MessageSquare, ArrowRight, Star } from 'lucide-react';
import type { CommunicationTemplate } from '../types/template.types';

interface TemplateCardProps {
  template: CommunicationTemplate;
  onClick?: () => void;
  isSelected?: boolean;
}

export function TemplateCard({ template, onClick, isSelected = false }: TemplateCardProps) {
  const getIcon = () => {
    switch (template.type) {
      case 'EMAIL':
        return <Mail size={18} className="text-blue-500" />;
      case 'SMS':
        return <MessageSquare size={18} className="text-green-500" />;
      case 'LETTER':
      default:
        return <FileText size={18} className="text-slate-500" />;
    }
  };

  const getCategoryColor = () => {
    switch (template.category) {
      case 'REMINDER':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400';
      case 'DUNNING':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400';
      case 'COURT':
        return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
      case 'CONFIRMATION':
        return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400';
    }
  };

  return (
    <div
      onClick={onClick}
      data-testid="template-card"
      className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer hover:scale-[1.01] hover:shadow-lg ${
        isSelected
          ? 'border-2 border-monetaris-500 bg-monetaris-50 dark:bg-monetaris-500/10'
          : 'border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:bg-[#111111]'
      }`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display tracking-tight">
              {template.name}
            </h3>
          </div>
          {template.isDefault && (
            <Star size={16} className="text-amber-500 fill-amber-500" />
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${getCategoryColor()}`}>
            {template.category}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400">
            {template.type}
          </span>
        </div>

        {template.subject && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
            <span className="font-bold">Betreff:</span> {template.subject}
          </p>
        )}

        <div className="flex-1 min-h-[3rem]">
          <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-3">
            {template.body.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
          <div className="text-xs text-slate-400 dark:text-slate-500">
            {template.variables.length} Variablen
          </div>
          <button className="p-2 text-slate-400 group-hover:text-monetaris-500 dark:text-slate-500 transition-colors rounded-full">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
