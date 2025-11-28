/**
 * Get Financial Data API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { FinancialData } from '../types/dashboard.types';

export async function getFinancial(): Promise<FinancialData[]> {
  const response = await HttpClient.get<FinancialData[]>(API_ENDPOINTS.DASHBOARD.FINANCIAL);
  return response;
}
