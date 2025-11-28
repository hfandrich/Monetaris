/**
 * Template Entity Types
 * Feature-Sliced Design - Entity Layer
 */

export type TemplateType = 'EMAIL' | 'LETTER' | 'SMS';
export type TemplateCategory = 'REMINDER' | 'DUNNING' | 'COURT' | 'CONFIRMATION' | 'OTHER';

export interface TemplateVariable {
  name: string;
  description: string;
  example?: string;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: TemplateType;
  category: TemplateCategory;
  subject?: string;
  body: string;
  variables: TemplateVariable[];
  isDefault: boolean;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

// Backend response format (if different from frontend)
export interface BackendTemplate {
  id: string;
  name: string;
  type: string;  // May come as string from backend
  category: string;
  subject?: string;
  content?: string;  // Backend uses 'content' instead of 'body'
  body?: string;
  variables?: TemplateVariable[];
  isDefault?: boolean;
  tenantId?: string | null;
  createdAt: string;
  updatedAt: string;
  lastModified?: string;
}

// Transform backend template to frontend format
export function transformTemplate(backend: BackendTemplate): CommunicationTemplate {
  return {
    id: backend.id,
    name: backend.name,
    type: (backend.type.toUpperCase() as TemplateType) || 'LETTER',
    category: (backend.category.toUpperCase() as TemplateCategory) || 'OTHER',
    subject: backend.subject,
    body: backend.content || backend.body || '',
    variables: backend.variables || [],
    isDefault: backend.isDefault || false,
    tenantId: backend.tenantId || undefined,
    createdAt: backend.createdAt || backend.lastModified || new Date().toISOString(),
    updatedAt: backend.updatedAt || backend.lastModified || new Date().toISOString(),
  };
}

// Request types
export interface CreateTemplateRequest {
  name: string;
  type: TemplateType;
  category: TemplateCategory;
  subject?: string;
  body?: string;
  content?: string;
  variables?: TemplateVariable[];
  isDefault?: boolean;
}

export interface UpdateTemplateRequest {
  name?: string;
  type?: TemplateType;
  category?: TemplateCategory;
  subject?: string;
  body?: string;
  content?: string;
  variables?: TemplateVariable[];
  isDefault?: boolean;
}

export interface PreviewTemplateRequest {
  templateId: string;
  variables: Record<string, any>;
}
