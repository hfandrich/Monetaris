/**
 * Create Kreditor API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendKreditor, Kreditor, CreateKreditorRequest } from '../types/kreditor.types';
import { transformKreditor, toBackendCreateRequest } from '../types/kreditor.types';

/**
 * Create new kreditor
 */
export async function createKreditor(data: CreateKreditorRequest): Promise<Kreditor> {
  const backendRequest = toBackendCreateRequest(data);

  const response = await HttpClient.post<BackendKreditor>(
    API_ENDPOINTS.KREDITOREN,
    backendRequest
  );

  return transformKreditor(response);
}
