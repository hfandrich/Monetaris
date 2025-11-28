/**
 * Delete Kreditor API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';

/**
 * Delete kreditor by ID
 */
export async function deleteKreditor(id: string): Promise<void> {
  await HttpClient.delete<void>(`${API_ENDPOINTS.KREDITOREN}/${id}`);
}
