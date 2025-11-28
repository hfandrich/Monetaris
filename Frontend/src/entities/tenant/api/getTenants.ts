/**
 * Get Tenants API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import { buildQueryString } from '@/shared/api/apiHelpers';
import type { BackendTenant, Tenant } from '../types/tenant.types';
import { transformTenant } from '../types/tenant.types';

export interface TenantFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PaginatedTenants {
  data: Tenant[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch all tenants with optional filters
 * Backend returns array directly, not paginated
 */
export async function getTenants(filters: TenantFilters = {}): Promise<PaginatedTenants> {
  const queryString = buildQueryString(filters);

  // Backend /api/kreditoren returns array directly
  const response = await HttpClient.get<BackendTenant[]>(
    `${API_ENDPOINTS.TENANTS}${queryString}`
  );

  // Transform array to paginated result
  const transformedData = response.map(transformTenant);

  return {
    data: transformedData,
    total: transformedData.length,
    page: 1,
    pageSize: transformedData.length,
    totalPages: 1
  };
}
