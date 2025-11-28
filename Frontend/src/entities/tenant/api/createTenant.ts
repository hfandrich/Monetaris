/**
 * Create Tenant API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendTenant, Tenant, CreateTenantRequest } from '../types/tenant.types';
import { transformTenant, toBackendCreateRequest } from '../types/tenant.types';

/**
 * Create new tenant
 */
export async function createTenant(data: CreateTenantRequest): Promise<Tenant> {
  const backendRequest = toBackendCreateRequest(data);

  const response = await HttpClient.post<BackendTenant>(
    API_ENDPOINTS.TENANTS,
    backendRequest
  );

  return transformTenant(response);
}
