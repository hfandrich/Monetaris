/**
 * Create Template API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { BackendTemplate, CommunicationTemplate, CreateTemplateRequest } from '../types/template.types';
import { transformTemplate } from '../types/template.types';

export async function createTemplate(data: CreateTemplateRequest): Promise<CommunicationTemplate> {
  // Transform frontend request to backend format
  const backendRequest = {
    name: data.name,
    type: data.type,
    category: data.category,
    subject: data.subject,
    content: data.content || data.body || '',  // Backend expects 'content'
    variables: data.variables,
    isDefault: data.isDefault,
  };

  const response = await HttpClient.post<BackendTemplate>(
    API_ENDPOINTS.TEMPLATES,
    backendRequest
  );

  return transformTemplate(response);
}
