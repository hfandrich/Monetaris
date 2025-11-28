/**
 * Update Debtor API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendDebtor, Debtor } from '../types/debtor.types';
import { transformDebtor } from '../types/debtor.types';

export interface UpdateDebtorRequest {
  isCompany?: boolean;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  notes?: string;
}

export async function updateDebtor(id: string, data: UpdateDebtorRequest): Promise<Debtor> {
  const response = await HttpClient.put<BackendDebtor>(
    `${API_ENDPOINTS.DEBTORS}/${id}`,
    data
  );

  return transformDebtor(response);
}
