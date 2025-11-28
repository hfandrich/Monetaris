/**
 * Preview Template API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import type { PreviewTemplateRequest } from '../types/template.types';

export async function previewTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
  const response = await HttpClient.post<string>(
    `${API_ENDPOINTS.TEMPLATES}/${templateId}/preview`,
    variables
  );

  return response;
}
