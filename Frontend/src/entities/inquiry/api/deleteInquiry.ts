/**
 * Delete Inquiry API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';

export async function deleteInquiry(id: string): Promise<void> {
  await HttpClient.delete(`${API_ENDPOINTS.INQUIRIES}/${id}`);
}
