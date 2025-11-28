/**
 * Delete Tenant API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';

/**
 * Delete tenant by ID
 */
export async function deleteTenant(id: string): Promise<void> {
  await HttpClient.delete<void>(`${API_ENDPOINTS.TENANTS}/${id}`);
}
