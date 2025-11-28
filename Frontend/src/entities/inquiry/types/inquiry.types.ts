/**
 * Inquiry Entity Types
 * Feature-Sliced Design - Entity Layer
 */

export type InquiryStatus = 'OPEN' | 'RESOLVED';

export interface Inquiry {
  id: string;
  caseId: string;
  caseNumber: string;
  debtorName: string;
  question: string;
  answer?: string;
  status: InquiryStatus;
  createdBy: string;
  createdByName: string;
  resolvedAt?: string;
  createdAt: string;
}

// Backend response format
export interface BackendInquiry {
  id: string;
  caseId: string;
  caseNumber: string;
  debtorName: string;
  question: string;
  answer: string | null;
  status: number;
  createdBy: string;
  createdByName: string;
  resolvedAt: string | null;
  createdAt: string;
}

// Transformation map
export const INQUIRY_STATUS_MAP: Record<number, InquiryStatus> = {
  0: 'OPEN',
  1: 'RESOLVED'
};

export function transformInquiry(backend: BackendInquiry): Inquiry {
  return {
    id: backend.id,
    caseId: backend.caseId,
    caseNumber: backend.caseNumber,
    debtorName: backend.debtorName,
    question: backend.question,
    answer: backend.answer || undefined,
    status: INQUIRY_STATUS_MAP[backend.status] || 'OPEN',
    createdBy: backend.createdBy,
    createdByName: backend.createdByName,
    resolvedAt: backend.resolvedAt || undefined,
    createdAt: backend.createdAt,
  };
}
