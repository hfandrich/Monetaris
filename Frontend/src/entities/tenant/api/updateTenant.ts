/**
 * Update Tenant API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendTenant, Tenant, UpdateTenantRequest } from '../types/tenant.types';
import { transformTenant, toBackendUpdateRequest } from '../types/tenant.types';

/**
 * Update existing tenant
 */
export async function updateTenant(id: string, data: UpdateTenantRequest): Promise<Tenant> {
  const backendRequest = toBackendUpdateRequest(data);

  const response = await HttpClient.put<BackendTenant>(
    `${API_ENDPOINTS.TENANTS}/${id}`,
    backendRequest
  );

  return transformTenant(response);
}
