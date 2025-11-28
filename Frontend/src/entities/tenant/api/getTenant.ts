/**
 * Get Single Tenant API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendTenant, Tenant } from '../types/tenant.types';
import { transformTenant } from '../types/tenant.types';

/**
 * Fetch single tenant by ID
 */
export async function getTenant(id: string): Promise<Tenant> {
  const response = await HttpClient.get<BackendTenant>(
    `${API_ENDPOINTS.TENANTS}/${id}`
  );

  return transformTenant(response);
}
