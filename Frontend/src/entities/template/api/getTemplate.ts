/**
 * Get Template By ID API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendTemplate, CommunicationTemplate } from '../types/template.types';
import { transformTemplate } from '../types/template.types';

export async function getTemplate(id: string): Promise<CommunicationTemplate> {
  const response = await HttpClient.get<BackendTemplate>(
    `${API_ENDPOINTS.TEMPLATES}/${id}`
  );

  return transformTemplate(response);
}
