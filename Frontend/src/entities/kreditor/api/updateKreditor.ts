/**
 * Update Kreditor API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendKreditor, Kreditor, UpdateKreditorRequest } from '../types/kreditor.types';
import { transformKreditor, toBackendUpdateRequest } from '../types/kreditor.types';

/**
 * Update existing kreditor
 */
export async function updateKreditor(id: string, data: UpdateKreditorRequest): Promise<Kreditor> {
  const backendRequest = toBackendUpdateRequest(data);

  const response = await HttpClient.put<BackendKreditor>(
    `${API_ENDPOINTS.KREDITOREN}/${id}`,
    backendRequest
  );

  return transformKreditor(response);
}
