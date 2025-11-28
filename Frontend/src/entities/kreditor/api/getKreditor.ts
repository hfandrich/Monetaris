/**
 * Get Single Kreditor API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendKreditor, Kreditor } from '../types/kreditor.types';
import { transformKreditor } from '../types/kreditor.types';

/**
 * Fetch single kreditor by ID
 */
export async function getKreditor(id: string): Promise<Kreditor> {
  const response = await HttpClient.get<BackendKreditor>(
    `${API_ENDPOINTS.KREDITOREN}/${id}`
  );

  return transformKreditor(response);
}
