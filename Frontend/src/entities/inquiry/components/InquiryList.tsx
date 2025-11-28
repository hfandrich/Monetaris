/**
 * InquiryList Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { InquiryCard } from './InquiryCard';
import type { Inquiry } from '../types/inquiry.types';

interface InquiryListProps {
  inquiries: Inquiry[];
  loading?: boolean;
  error?: string | null;
  onInquiryClick?: (inquiry: Inquiry) => void;
  emptyMessage?: string;
}

export function InquiryList({
  inquiries,
  loading = false,
  error = null,
  onInquiryClick,
  emptyMessage = 'No inquiries found'
}: InquiryListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {inquiries.map((inquiry) => (
        <InquiryCard
          key={inquiry.id}
          inquiry={inquiry}
          onClick={() => onInquiryClick?.(inquiry)}
        />
      ))}
    </div>
  );
}
