/**
 * Resolve Inquiry API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendInquiry, Inquiry } from '../types/inquiry.types';
import { transformInquiry } from '../types/inquiry.types';

export interface ResolveInquiryRequest {
  answer: string;
}

export async function resolveInquiry(
  id: string,
  data: ResolveInquiryRequest
): Promise<Inquiry> {
  const response = await HttpClient.post<BackendInquiry>(
    `${API_ENDPOINTS.INQUIRIES}/${id}/resolve`,
    data
  );

  return transformInquiry(response);
}
