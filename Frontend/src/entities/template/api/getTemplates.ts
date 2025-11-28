/**
 * Get Templates API
 * Feature-Sliced Design - Entity Layer
 */

import { HttpClient } from '@/shared/api/httpClient';
import { API_ENDPOINTS } from '@/shared/api/config';
import { buildQueryString, type BackendPaginatedResponse } from '@/shared/api/apiHelpers';
import type { BackendTemplate, CommunicationTemplate } from '../types/template.types';
import { transformTemplate } from '../types/template.types';

export interface TemplateFilters {
  page?: number;
  pageSize?: number;
  type?: string;
  category?: string;
  tenantId?: string;
}

export interface PaginatedTemplates {
  data: CommunicationTemplate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getTemplates(filters: TemplateFilters = {}): Promise<PaginatedTemplates> {
  const queryString = buildQueryString(filters);
  const response = await HttpClient.get<BackendTemplate[] | BackendPaginatedResponse<BackendTemplate>>(
    `${API_ENDPOINTS.TEMPLATES}${queryString}`
  );

  // Backend may return array directly or paginated response
  if (Array.isArray(response)) {
    const templates = response.map(transformTemplate);
    return {
      data: templates,
      total: templates.length,
      page: 1,
      pageSize: templates.length,
      totalPages: 1,
    };
  }

  // Paginated response
  return {
    data: response.items.map(transformTemplate),
    total: response.totalCount,
    page: response.page,
    pageSize: response.pageSize,
    totalPages: response.totalPages,
  };
}
