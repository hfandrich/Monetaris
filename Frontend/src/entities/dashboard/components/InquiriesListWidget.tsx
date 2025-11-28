/**
 * InquiriesListWidget Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Card, Badge } from '@/shared/components/ui';
import type { Inquiry } from '@/entities/inquiry/types/inquiry.types';

interface InquiriesListWidgetProps {
  inquiries: Inquiry[];
  loading?: boolean;
  onInquiryClick?: (inquiry: Inquiry) => void;
}

const SkeletonInquiry = () => (
  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151515] border border-slate-100 dark:border-white/5 animate-pulse">
    <div className="flex justify-between items-start mb-2">
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
    </div>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
  </div>
);

export const InquiriesListWidget: React.FC<InquiriesListWidgetProps> = ({
  inquiries,
  loading,
  onInquiryClick
}) => {
  if (loading) {
    return (
      <Card className="h-full dark:bg-[#0A0A0A]">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-8 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <SkeletonInquiry />
          <SkeletonInquiry />
          <SkeletonInquiry />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full dark:bg-[#0A0A0A]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare size={18} className="text-monetaris-500" /> Rückfragen
        </h3>
        <Badge color="yellow">{inquiries.length}</Badge>
      </div>
      <div className="space-y-4 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
        {inquiries.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-100 dark:border-white/5 rounded-xl">
            Keine offenen Aufgaben.
          </div>
        ) : (
          inquiries.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-[#151515] border border-slate-100 dark:border-white/5 hover:border-monetaris-200 dark:hover:border-monetaris-500/30 transition-all cursor-pointer group"
              onClick={() => onInquiryClick?.(item)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono font-bold text-slate-500">{item.caseNumber}</span>
                <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-white line-clamp-2 mb-2">"{item.question}"</p>
              <p className="text-xs font-bold text-monetaris-600 dark:text-monetaris-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Antworten <ArrowRight size={12}/>
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
