/**
 * Get Kreditoren API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import { buildQueryString } from '@/shared/api/apiHelpers';
import type { BackendKreditor, Kreditor } from '../types/kreditor.types';
import { transformKreditor } from '../types/kreditor.types';

export interface KreditorFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PaginatedKreditoren {
  data: Kreditor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch all kreditoren with optional filters
 * Backend returns array directly, not paginated
 */
export async function getKreditoren(filters: KreditorFilters = {}): Promise<PaginatedKreditoren> {
  const queryString = buildQueryString(filters);

  // Backend /api/kreditoren returns array directly
  const response = await HttpClient.get<BackendKreditor[]>(
    `${API_ENDPOINTS.KREDITOREN}${queryString}`
  );

  // Transform array to paginated result
  const transformedData = response.map(transformKreditor);

  return {
    data: transformedData,
    total: transformedData.length,
    page: 1,
    pageSize: transformedData.length,
    totalPages: 1
  };
}
