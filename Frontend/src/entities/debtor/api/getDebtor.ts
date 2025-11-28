/**
 * Get Single Debtor API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendDebtor, Debtor } from '../types/debtor.types';
import { transformDebtor } from '../types/debtor.types';

export async function getDebtor(id: string): Promise<Debtor> {
  const response = await HttpClient.get<BackendDebtor>(
    `${API_ENDPOINTS.DEBTORS}/${id}`
  );

  return transformDebtor(response);
}
