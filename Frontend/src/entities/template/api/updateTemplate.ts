/**
 * Update Template API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendTemplate, CommunicationTemplate, UpdateTemplateRequest } from '../types/template.types';
import { transformTemplate } from '../types/template.types';

export async function updateTemplate(id: string, data: UpdateTemplateRequest): Promise<CommunicationTemplate> {
  // Transform frontend request to backend format
  const backendRequest = {
    ...data,
    content: data.content || data.body,  // Backend expects 'content'
  };

  const response = await HttpClient.put<BackendTemplate>(
    `${API_ENDPOINTS.TEMPLATES}/${id}`,
    backendRequest
  );

  return transformTemplate(response);
}
