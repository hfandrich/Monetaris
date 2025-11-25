

import { CollectionCase, Debtor, Tenant, CaseStatus, DashboardStats, Inquiry, Document, User, SearchResult, ImportProviderType, ImportMapping, CommunicationTemplate, RiskScore, UserRole } from '../types';
import { API_ENDPOINTS } from './api/config';
import { HttpClient } from './api/httpClient';

/**
 * DataService
 * Acts as the Business Logic Layer.
 * Now fetches data from the Backend REST API instead of mock localStorage.
 */
class DataService {

  // --- Read Actions (Scoped) ---

  async getAccessibleTenants(user: User): Promise<Tenant[]> {
    return HttpClient.get<Tenant[]>(API_ENDPOINTS.TENANTS);
  }

  async getAccessibleCases(user: User): Promise<CollectionCase[]> {
    return HttpClient.get<CollectionCase[]>(API_ENDPOINTS.CASES);
  }

  async getAccessibleDebtors(user: User): Promise<Debtor[]> {
    return HttpClient.get<Debtor[]>(API_ENDPOINTS.DEBTORS);
  }

  async getDashboardStats(user?: User): Promise<DashboardStats> {
    return HttpClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
  }

  // --- Global Search (Scoped) ---
  async searchGlobal(query: string, user?: User): Promise<SearchResult[]> {
    return HttpClient.get<SearchResult[]>(`${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}`);
  }

  // --- Legacy Accessors (Raw) ---
  async getCases(): Promise<CollectionCase[]> {
    return HttpClient.get<CollectionCase[]>(API_ENDPOINTS.CASES);
  }

  async getDebtors(): Promise<Debtor[]> {
    return HttpClient.get<Debtor[]>(API_ENDPOINTS.DEBTORS);
  }

  async getTenants(): Promise<Tenant[]> {
    return HttpClient.get<Tenant[]>(API_ENDPOINTS.TENANTS);
  }

  async getDebtorById(id: string): Promise<{ debtor: Debtor, cases: CollectionCase[] } | null> {
    try {
      const debtor = await HttpClient.get<Debtor>(`${API_ENDPOINTS.DEBTORS}/${id}`);
      const allCases = await HttpClient.get<CollectionCase[]>(`${API_ENDPOINTS.DEBTORS}/${id}/cases`);

      return { debtor, cases: allCases };
    } catch (error) {
      return null;
    }
  }

  async getTenantById(id: string): Promise<{ tenant: Tenant, cases: CollectionCase[], users: User[] } | null> {
    try {
      const tenant = await HttpClient.get<Tenant>(`${API_ENDPOINTS.TENANTS}/${id}`);
      const cases = await HttpClient.get<CollectionCase[]>(`${API_ENDPOINTS.TENANTS}/${id}/cases`);
      const users = await HttpClient.get<User[]>(`${API_ENDPOINTS.TENANTS}/${id}/users`);

      return { tenant, cases, users };
    } catch (error) {
      return null;
    }
  }

  async getInquiries(): Promise<Inquiry[]> {
    return HttpClient.get<Inquiry[]>(API_ENDPOINTS.INQUIRIES);
  }

  async getDebtorDocuments(debtorId: string): Promise<Document[]> {
    return HttpClient.get<Document[]>(`${API_ENDPOINTS.DOCUMENTS}?debtorId=${debtorId}`);
  }

  async getTemplates(): Promise<CommunicationTemplate[]> {
    return HttpClient.get<CommunicationTemplate[]>(API_ENDPOINTS.TEMPLATES);
  }

  // --- Write Actions ---

  async addDebtor(debtor: Debtor): Promise<Debtor> {
    return HttpClient.post<Debtor>(API_ENDPOINTS.DEBTORS, debtor);
  }

  async addTenant(tenant: Tenant): Promise<Tenant> {
    return HttpClient.post<Tenant>(API_ENDPOINTS.TENANTS, tenant);
  }

  async addCase(newCase: CollectionCase): Promise<CollectionCase> {
    return HttpClient.post<CollectionCase>(API_ENDPOINTS.CASES, newCase);
  }

  async advanceWorkflow(caseId: string, newStatus: CaseStatus, note: string, actor: string): Promise<void> {
    return HttpClient.post(`${API_ENDPOINTS.CASES}/${caseId}/advance`, {
      newStatus,
      note,
    });
  }

  async uploadDocument(debtorId: string, file: File): Promise<Document> {
    // Note: For file uploads, we'd typically use FormData instead of JSON
    // This is a simplified implementation - actual implementation may need multipart/form-data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('debtorId', debtorId);

    // For now, using a simple approach - actual implementation would need custom fetch logic
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      debtorId,
      name: file.name,
      type: file.type.includes('pdf') ? 'PDF' : file.type.includes('image') ? 'IMAGE' : 'WORD',
      size: file.size,
      uploadedAt: new Date().toISOString(),
      url: '#', // Will be set by backend
      previewUrl: file.type.includes('image') ? URL.createObjectURL(file) : undefined
    };

    return HttpClient.post<Document>(API_ENDPOINTS.DOCUMENTS, newDoc);
  }

  async createTemplate(name: string, type: 'EMAIL' | 'LETTER'): Promise<CommunicationTemplate> {
    const newTpl: CommunicationTemplate = {
      id: `tpl-${Date.now()}`,
      name: name,
      type: type,
      category: 'GENERAL',
      content: '<h1>Neue Vorlage</h1><p>Hier Inhalt einfügen...</p>',
      lastModified: new Date().toISOString()
    };

    return HttpClient.post<CommunicationTemplate>(API_ENDPOINTS.TEMPLATES, newTpl);
  }

  async saveTemplate(template: CommunicationTemplate): Promise<void> {
    await HttpClient.put(`${API_ENDPOINTS.TEMPLATES}/${template.id}`, {
      ...template,
      lastModified: new Date().toISOString()
    });
  }

  // --- Helper Utils ---

  async parseCsvHeaders(file: File): Promise<string[]> {
    // Mock CSV Parsing - this would ideally be done server-side or with a library
    return new Promise(resolve => setTimeout(() => {
      resolve(['Rechnungsnummer', 'Kunde Name', 'Kunde Email', 'Betrag Netto', 'Betrag Brutto', 'Fälligkeitsdatum', 'IBAN', 'Referenz']);
    }, 500));
  }

  async importBatchData(items: any[]): Promise<void> {
    // Send batch data to backend for processing
    await HttpClient.post(`${API_ENDPOINTS.CASES}/batch`, { items });
  }

  async processImport(tenantId: string, mappings: ImportMapping[], provider: ImportProviderType): Promise<void> {
    // Send import configuration to backend
    await HttpClient.post(`${API_ENDPOINTS.CASES}/import`, {
      tenantId,
      mappings,
      provider
    });
  }
}

export const dataService = new DataService();
