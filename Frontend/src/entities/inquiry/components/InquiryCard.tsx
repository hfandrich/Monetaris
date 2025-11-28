/**
 * InquiryCard Component
 * Feature-Sliced Design - Entity Layer
 */

import React from 'react';
import { MessageCircle, CheckCircle, Clock } from 'lucide-react';
import type { Inquiry } from '../types/inquiry.types';

interface InquiryCardProps {
  inquiry: Inquiry;
  onClick?: () => void;
}

export function InquiryCard({ inquiry, onClick }: InquiryCardProps) {
  const isResolved = inquiry.status === 'RESOLVED';

  return (
    <div
      className={`p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
        isResolved ? 'border-gray-200' : 'border-orange-200 bg-orange-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900">{inquiry.caseNumber}</span>
        </div>
        <div className="flex items-center gap-1">
          {isResolved ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">Resolved</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-orange-600">Open</span>
            </>
          )}
        </div>
      </div>

      <div className="mb-2">
        <p className="text-sm text-gray-600 mb-1">{inquiry.debtorName}</p>
        <p className="text-sm text-gray-900 line-clamp-2">{inquiry.question}</p>
      </div>

      {inquiry.answer && (
        <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-700 line-clamp-2">
            <strong>Answer:</strong> {inquiry.answer}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>By: {inquiry.createdByName}</span>
        <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
