/**
 * TemplatePreview Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { Eye, Printer, AlertTriangle } from 'lucide-react';
import type { CommunicationTemplate } from '../types/template.types';

interface TemplatePreviewProps {
  template: CommunicationTemplate | null;
  previewHtml?: string;
  missingVariables?: string[];
  onPrint?: () => void;
}

export function TemplatePreview({ template, previewHtml, missingVariables = [], onPrint }: TemplatePreviewProps) {
  if (!template) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
        <div className="text-center">
          <Eye size={48} className="mx-auto mb-4 opacity-50" />
          <p>Keine Vorschau verfügbar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-[#101010] border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-monetaris-500" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Vorschau</h3>
        </div>
        {onPrint && (
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-500/10 dark:hover:bg-slate-500/20 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Printer size={14} />
            Drucken
          </button>
        )}
      </div>

      {/* Missing Variables Warning */}
      {missingVariables.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 px-4 py-2 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-bold">
          <AlertTriangle size={14} />
          {missingVariables.length} Platzhalter nicht verfügbar
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#050505]">
        <div className="w-full max-w-[210mm] mx-auto bg-white dark:bg-[#0A0A0A] shadow-lg p-[20mm] min-h-[297mm]">
          {/* Subject for Email */}
          {template.type === 'EMAIL' && template.subject && (
            <div className="mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Betreff:</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">{template.subject}</p>
            </div>
          )}

          {/* Template Body */}
          <div
            className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: previewHtml || template.body }}
          />
        </div>
      </div>
    </div>
  );
}
