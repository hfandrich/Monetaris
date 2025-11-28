/**
 * Get Inquiries API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import { buildQueryString } from '@/shared/api/apiHelpers';
import type { BackendInquiry, Inquiry } from '../types/inquiry.types';
import { transformInquiry } from '../types/inquiry.types';

export interface InquiryFilters {
  status?: 'OPEN' | 'RESOLVED';
  caseId?: string;
  search?: string;
}

export interface InquiryListResult {
  data: Inquiry[];
  total: number;
}

export async function getInquiries(filters: InquiryFilters = {}): Promise<InquiryListResult> {
  const queryString = buildQueryString(filters);
  const response = await HttpClient.get<BackendInquiry[]>(
    `${API_ENDPOINTS.INQUIRIES}${queryString}`
  );

  const transformedData = response.map(transformInquiry);

  return {
    data: transformedData,
    total: transformedData.length
  };
}
