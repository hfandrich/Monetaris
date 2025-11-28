/**
 * Create Inquiry API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendInquiry, Inquiry } from '../types/inquiry.types';
import { transformInquiry } from '../types/inquiry.types';

export interface CreateInquiryRequest {
  caseId: string;
  question: string;
}

export async function createInquiry(data: CreateInquiryRequest): Promise<Inquiry> {
  const response = await HttpClient.post<BackendInquiry>(
    API_ENDPOINTS.INQUIRIES,
    data
  );

  return transformInquiry(response);
}
