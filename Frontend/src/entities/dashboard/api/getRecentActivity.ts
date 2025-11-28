/**
 * Get Recent Activity API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { RecentActivity } from '../types/dashboard.types';

export async function getRecentActivity(): Promise<RecentActivity[]> {
  const response = await HttpClient.get<RecentActivity[]>(API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY);
  return response;
}
