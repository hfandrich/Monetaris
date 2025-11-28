/**
 * Get Dashboard Stats API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { DashboardStats } from '../types/dashboard.types';

export async function getStats(): Promise<DashboardStats> {
  const response = await HttpClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
  return response;
}
