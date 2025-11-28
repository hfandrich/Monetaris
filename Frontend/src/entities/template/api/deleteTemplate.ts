/**
 * Delete Template API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';

export async function deleteTemplate(id: string): Promise<void> {
  await HttpClient.delete(`${API_ENDPOINTS.TEMPLATES}/${id}`);
}
