/**
 * Get Debtors API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import { buildQueryString } from '@/shared/api/apiHelpers';
import type { BackendDebtor, Debtor } from '../types/debtor.types';
import { transformDebtor } from '../types/debtor.types';

interface BackendPaginatedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface DebtorFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  riskScore?: string;
  agentId?: string;
  tenantId?: string;
}

export interface PaginatedDebtors {
  data: Debtor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getDebtors(filters: DebtorFilters = {}): Promise<PaginatedDebtors> {
  const queryString = buildQueryString(filters);
  const response = await HttpClient.get<BackendPaginatedResponse<BackendDebtor>>(
    `${API_ENDPOINTS.DEBTORS}${queryString}`
  );

  return {
    data: response.items.map(transformDebtor),
    total: response.totalCount,
    page: response.page,
    pageSize: response.pageSize,
    totalPages: response.totalPages
  };
}
