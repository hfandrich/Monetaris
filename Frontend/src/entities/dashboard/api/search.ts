/**
 * Dashboard Search API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { SearchResult } from '../types/dashboard.types';

export async function search(query: string): Promise<SearchResult[]> {
  const queryString = new URLSearchParams({ query }).toString();
  const response = await HttpClient.get<SearchResult[]>(
    `${API_ENDPOINTS.DASHBOARD.SEARCH}?${queryString}`
  );
  return response;
}
