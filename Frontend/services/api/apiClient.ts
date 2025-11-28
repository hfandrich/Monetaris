import { API_ENDPOINTS, API_BASE_URL } from './config';
import type {
  User,
  Kreditor,
  Debtor,
  CollectionCase,
  CommunicationTemplate,
  DashboardStats,
  Inquiry,
  Document,
  SearchResult,
  CaseStatus,
  RiskScore,
  AddressStatus,
} from '../../types';
import { RiskScore as RiskScoreEnum, AddressStatus as AddressStatusEnum, CaseStatus as CaseStatusEnum } from '../../types';

// --- Types for API Responses ---

/**
 * Backend API returns this format
 */
interface BackendPaginatedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/**
 * Frontend expects this format
 */
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- Backend Response Types (what the API actually returns) ---

interface BackendDebtor {
  id: string;
  tenantId: string;
  agentId: string | null;
  isCompany: boolean;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string;
  street: string;
  zipCode: string;
  city: string;
  country: string;
  addressStatus: number;
  addressLastChecked: string | null;
  riskScore: number;
  totalDebt: number;
  openCases: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  tenantName: string;
  agentName: string | null;
  displayName: string;
}

interface BackendCase {
  id: string;
  kreditorId: string;
  kreditorName: string;
  debtorId: string;
  debtorName: string;
  agentId?: string;
  invoiceNumber: string;
  status: number;
  principalAmount: number;
  costs: number;
  interest: number;
  totalAmount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  nextActionDate: string | null;
  courtFileNumber?: string;
  createdAt: string;
}

// --- Mapping Functions ---

const RISK_SCORE_MAP: Record<number, RiskScore> = {
  0: RiskScoreEnum.A,
  1: RiskScoreEnum.B,
  2: RiskScoreEnum.C,
  3: RiskScoreEnum.D,
  4: RiskScoreEnum.E,
};

const ADDRESS_STATUS_MAP: Record<number, AddressStatus> = {
  0: AddressStatusEnum.UNKNOWN,
  1: AddressStatusEnum.CONFIRMED,
  2: AddressStatusEnum.MOVED,
  3: AddressStatusEnum.DECEASED,
  4: AddressStatusEnum.RESEARCH_PENDING,
};

const CASE_STATUS_MAP: Record<number, CaseStatus> = {
  0: CaseStatusEnum.DRAFT,
  1: CaseStatusEnum.NEW,
  2: CaseStatusEnum.REMINDER_1,
  3: CaseStatusEnum.REMINDER_2,
  4: CaseStatusEnum.ADDRESS_RESEARCH,
  5: CaseStatusEnum.PREPARE_MB,
  6: CaseStatusEnum.MB_REQUESTED,
  7: CaseStatusEnum.MB_ISSUED,
  8: CaseStatusEnum.MB_OBJECTION,
  9: CaseStatusEnum.PREPARE_VB,
  10: CaseStatusEnum.VB_REQUESTED,
  11: CaseStatusEnum.VB_ISSUED,
  12: CaseStatusEnum.TITLE_OBTAINED,
  13: CaseStatusEnum.ENFORCEMENT_PREP,
  14: CaseStatusEnum.GV_MANDATED,
  15: CaseStatusEnum.EV_TAKEN,
  16: CaseStatusEnum.PAID,
  17: CaseStatusEnum.SETTLED,
  18: CaseStatusEnum.INSOLVENCY,
  19: CaseStatusEnum.UNCOLLECTIBLE,
};

/**
 * Transform backend debtor to frontend Debtor type
 */
const transformDebtor = (backend: BackendDebtor): Debtor => {
  return {
    id: backend.id,
    tenantId: backend.tenantId,
    agentId: backend.agentId || undefined,
    isCompany: backend.isCompany,
    companyName: backend.companyName || undefined,
    firstName: backend.firstName || undefined,
    lastName: backend.lastName || undefined,
    email: backend.email,
    phone: backend.phone,
    address: {
      street: backend.street,
      zipCode: backend.zipCode,
      city: backend.city,
      country: backend.country,
      status: ADDRESS_STATUS_MAP[backend.addressStatus] || AddressStatusEnum.UNKNOWN,
      lastChecked: backend.addressLastChecked || undefined,
    },
    riskScore: RISK_SCORE_MAP[backend.riskScore] || RiskScoreEnum.C,
    totalDebt: backend.totalDebt,
    openCases: backend.openCases,
    notes: backend.notes || undefined,
  };
};

/**
 * Transform backend case to frontend CollectionCase type
 */
const transformCase = (backend: BackendCase): CollectionCase => {
  return {
    id: backend.id,
    kreditorId: backend.kreditorId,
    kreditorName: backend.kreditorName,
    debtorId: backend.debtorId,
    debtorName: backend.debtorName,
    agentId: backend.agentId,
    principalAmount: backend.principalAmount,
    costs: backend.costs,
    interest: backend.interest,
    totalAmount: backend.totalAmount,
    currency: backend.currency,
    invoiceNumber: backend.invoiceNumber,
    invoiceDate: backend.invoiceDate,
    dueDate: backend.dueDate,
    status: CASE_STATUS_MAP[backend.status] || CaseStatusEnum.NEW,
    nextActionDate: backend.nextActionDate || undefined,
    courtFileNumber: backend.courtFileNumber,
    history: [],
    aiAnalysis: undefined,
    createdAt: backend.createdAt,
  };
};

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginDebtorRequest {
  caseNumber: string;
  zipCode: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface WorkflowRequest {
  newStatus: CaseStatus;
  note: string;
}

// --- Helper Functions ---

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('monetaris_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Transform backend paginated response to frontend format
 */
const transformPaginatedResponse = <T>(
  response: BackendPaginatedResponse<T>
): PaginatedResult<T> => {
  return {
    data: response.items,
    total: response.totalCount,
    page: response.page,
    pageSize: response.pageSize,
    totalPages: response.totalPages,
  };
};

class ApiClient {
  /**
   * Base fetch wrapper with error handling and authentication
   */
  private async fetchApi<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers },
      });

      // Handle non-JSON responses (e.g., 204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: data.message || `API Error: ${response.status}`,
          errors: data.errors,
          statusCode: response.status,
        };

        // Handle 401 Unauthorized - clear session
        if (response.status === 401) {
          localStorage.removeItem('monetaris_token');
          localStorage.removeItem('monetaris_user');
          window.location.href = '/#/login';
        }

        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof Error && !(error as ApiError).statusCode) {
        // Network error or other non-API error
        throw {
          message: error.message || 'Network error occurred',
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  /**
   * GET request helper
   */
  private async get<T>(url: string): Promise<T> {
    return this.fetchApi<T>(url, { method: 'GET' });
  }

  /**
   * POST request helper
   */
  private async post<T>(url: string, body?: unknown): Promise<T> {
    return this.fetchApi<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request helper
   */
  private async put<T>(url: string, body?: unknown): Promise<T> {
    return this.fetchApi<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request helper
   */
  private async delete<T>(url: string): Promise<T> {
    return this.fetchApi<T>(url, { method: 'DELETE' });
  }

  /**
   * Build query string from filters object
   */
  private buildQueryString(filters?: Record<string, any>): string {
    if (!filters) return '';
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  // --- Authentication API ---

  auth = {
    login: (credentials: LoginRequest): Promise<AuthResponse> => {
      return this.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    },

    loginDebtor: (credentials: LoginDebtorRequest): Promise<AuthResponse> => {
      return this.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN_DEBTOR,
        credentials
      );
    },

    register: (userData: Partial<User> & { password: string }): Promise<AuthResponse> => {
      return this.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
    },

    refresh: (): Promise<AuthResponse> => {
      return this.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH);
    },

    logout: (): Promise<void> => {
      return this.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
    },

    me: (): Promise<User> => {
      return this.get<User>(API_ENDPOINTS.AUTH.ME);
    },

    forgotPassword: (email: string): Promise<{ message: string; success: boolean }> => {
      return this.post<{ message: string; success: boolean }>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
    },

    updateProfile: (data: { name: string; email: string }): Promise<User> => {
      return this.put<User>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
    },

    updatePassword: (data: { currentPassword: string; newPassword: string }): Promise<void> => {
      return this.put<void>(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, data);
    },
  };

  // --- Dashboard API ---

  dashboard = {
    getStats: (): Promise<DashboardStats> => {
      return this.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
    },

    getFinancial: (): Promise<any> => {
      return this.get<any>(API_ENDPOINTS.DASHBOARD.FINANCIAL);
    },

    getRecentActivity: (): Promise<any[]> => {
      return this.get<any[]>(API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY);
    },

    search: (query: string): Promise<SearchResult[]> => {
      const queryString = new URLSearchParams({ query }).toString();
      return this.get<SearchResult[]>(
        `${API_ENDPOINTS.DASHBOARD.SEARCH}?${queryString}`
      );
    },
  };

  // --- Debtors API ---

  debtors = {
    getAll: async (
      filters?: Record<string, any>
    ): Promise<PaginatedResult<Debtor>> => {
      const queryString = this.buildQueryString(filters);
      const response = await this.get<BackendPaginatedResponse<BackendDebtor>>(
        `${API_ENDPOINTS.DEBTORS}${queryString}`
      );
      return {
        data: response.items.map(transformDebtor),
        total: response.totalCount,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      };
    },

    getById: (id: string): Promise<Debtor> => {
      return this.get<Debtor>(`${API_ENDPOINTS.DEBTORS}/${id}`);
    },

    create: (data: Partial<Debtor>): Promise<Debtor> => {
      return this.post<Debtor>(API_ENDPOINTS.DEBTORS, data);
    },

    update: (id: string, data: Partial<Debtor>): Promise<Debtor> => {
      return this.put<Debtor>(`${API_ENDPOINTS.DEBTORS}/${id}`, data);
    },

    delete: (id: string): Promise<void> => {
      return this.delete<void>(`${API_ENDPOINTS.DEBTORS}/${id}`);
    },
  };

  // --- Cases API ---

  cases = {
    getAll: async (
      filters?: Record<string, any>
    ): Promise<PaginatedResult<CollectionCase>> => {
      const queryString = this.buildQueryString(filters);
      const response = await this.get<BackendPaginatedResponse<BackendCase>>(
        `${API_ENDPOINTS.CASES}${queryString}`
      );
      return {
        data: response.items.map(transformCase),
        total: response.totalCount,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
      };
    },

    getById: (id: string): Promise<CollectionCase> => {
      return this.get<CollectionCase>(`${API_ENDPOINTS.CASES}/${id}`);
    },

    create: (data: Partial<CollectionCase>): Promise<CollectionCase> => {
      return this.post<CollectionCase>(API_ENDPOINTS.CASES, data);
    },

    update: (
      id: string,
      data: Partial<CollectionCase>
    ): Promise<CollectionCase> => {
      return this.put<CollectionCase>(`${API_ENDPOINTS.CASES}/${id}`, data);
    },

    delete: (id: string): Promise<void> => {
      return this.delete<void>(`${API_ENDPOINTS.CASES}/${id}`);
    },

    advanceWorkflow: (
      id: string,
      newStatus: CaseStatus,
      note: string
    ): Promise<CollectionCase> => {
      const request: WorkflowRequest = { newStatus, note };
      return this.post<CollectionCase>(
        `${API_ENDPOINTS.CASES}/${id}/workflow`,
        request
      );
    },

    getHistory: (id: string): Promise<any[]> => {
      return this.get<any[]>(`${API_ENDPOINTS.CASES}/${id}/history`);
    },
  };

  // --- Kreditoren API ---

  kreditoren = {
    getAll: async (
      filters?: Record<string, any>
    ): Promise<PaginatedResult<Kreditor>> => {
      const queryString = this.buildQueryString(filters);
      // Backend /api/kreditoren returns array directly, not paginated
      const response = await this.get<Kreditor[]>(
        `${API_ENDPOINTS.KREDITOREN}${queryString}`
      );
      // Transform array to paginated result
      return {
        data: response,
        total: response.length,
        page: 1,
        pageSize: response.length,
        totalPages: 1,
      };
    },

    getById: (id: string): Promise<Kreditor> => {
      return this.get<Kreditor>(`${API_ENDPOINTS.KREDITOREN}/${id}`);
    },

    create: (data: Partial<Kreditor>): Promise<Kreditor> => {
      return this.post<Kreditor>(API_ENDPOINTS.KREDITOREN, data);
    },

    update: (id: string, data: Partial<Kreditor>): Promise<Kreditor> => {
      return this.put<Kreditor>(`${API_ENDPOINTS.KREDITOREN}/${id}`, data);
    },

    delete: (id: string): Promise<void> => {
      return this.delete<void>(`${API_ENDPOINTS.KREDITOREN}/${id}`);
    },
  };

  // --- Templates API ---

  templates = {
    getAll: async (
      filters?: Record<string, any>
    ): Promise<PaginatedResult<CommunicationTemplate>> => {
      const queryString = this.buildQueryString(filters);
      const response = await this.get<CommunicationTemplate[] | BackendPaginatedResponse<CommunicationTemplate>>(
        `${API_ENDPOINTS.TEMPLATES}${queryString}`
      );
      // Backend returns array directly, not paginated - handle both cases
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          pageSize: response.length,
          totalPages: 1,
        };
      }
      return transformPaginatedResponse(response);
    },

    getById: (id: string): Promise<CommunicationTemplate> => {
      return this.get<CommunicationTemplate>(
        `${API_ENDPOINTS.TEMPLATES}/${id}`
      );
    },

    create: (
      data: Partial<CommunicationTemplate>
    ): Promise<CommunicationTemplate> => {
      return this.post<CommunicationTemplate>(API_ENDPOINTS.TEMPLATES, data);
    },

    update: (
      id: string,
      data: Partial<CommunicationTemplate>
    ): Promise<CommunicationTemplate> => {
      return this.put<CommunicationTemplate>(
        `${API_ENDPOINTS.TEMPLATES}/${id}`,
        data
      );
    },

    delete: (id: string): Promise<void> => {
      return this.delete<void>(`${API_ENDPOINTS.TEMPLATES}/${id}`);
    },

    preview: (id: string, variables: Record<string, any>): Promise<string> => {
      return this.post<string>(
        `${API_ENDPOINTS.TEMPLATES}/${id}/preview`,
        variables
      );
    },
  };

  // --- Documents API ---

  documents = {
    getAll: async (
      filters?: Record<string, any>
    ): Promise<PaginatedResult<Document>> => {
      const queryString = this.buildQueryString(filters);
      const response = await this.get<Document[] | BackendPaginatedResponse<Document>>(
        `${API_ENDPOINTS.DOCUMENTS}${queryString}`
      );
      // Backend returns array directly, not paginated - handle both cases
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          pageSize: response.length,
          totalPages: 1,
        };
      }
      return transformPaginatedResponse(response);
    },

    getById: (id: string): Promise<Document> => {
      return this.get<Document>(`${API_ENDPOINTS.DOCUMENTS}/${id}`);
    },

    upload: async (file: File, metadata?: Record<string, any>): Promise<Document> => {
      const formData = new FormData();
      formData.append('file', file);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const token = localStorage.getItem('monetaris_token');
      const response = await fetch(API_ENDPOINTS.DOCUMENTS, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw {
          message: error.message || 'Upload failed',
          statusCode: response.status,
        } as ApiError;
      }

      return response.json();
    },

    delete: (id: string): Promise<void> => {
      return this.delete<void>(`${API_ENDPOINTS.DOCUMENTS}/${id}`);
    },

    download: (id: string): string => {
      return `${API_ENDPOINTS.DOCUMENTS}/${id}/download`;
    },
  };

  // --- Inquiries API ---

  inquiries = {
    getAll: async (
      filters?: Record<string, any>
    ): Promise<PaginatedResult<Inquiry>> => {
      const queryString = this.buildQueryString(filters);
      const response = await this.get<Inquiry[] | BackendPaginatedResponse<Inquiry>>(
        `${API_ENDPOINTS.INQUIRIES}${queryString}`
      );
      // Backend returns array directly, not paginated - handle both cases
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: 1,
          pageSize: response.length,
          totalPages: 1,
        };
      }
      return transformPaginatedResponse(response);
    },

    getById: (id: string): Promise<Inquiry> => {
      return this.get<Inquiry>(`${API_ENDPOINTS.INQUIRIES}/${id}`);
    },

    create: (data: Partial<Inquiry>): Promise<Inquiry> => {
      return this.post<Inquiry>(API_ENDPOINTS.INQUIRIES, data);
    },

    resolve: (id: string, answer: string): Promise<Inquiry> => {
      return this.post<Inquiry>(`${API_ENDPOINTS.INQUIRIES}/${id}/resolve`, {
        answer,
      });
    },

    delete: (id: string): Promise<void> => {
      return this.delete<void>(`${API_ENDPOINTS.INQUIRIES}/${id}`);
    },
  };

  // --- Global Search API ---

  search = {
    global: (query: string, filters?: Record<string, any>): Promise<SearchResult[]> => {
      const queryParams = this.buildQueryString({ query, ...filters });
      return this.get<SearchResult[]>(`${API_ENDPOINTS.SEARCH}${queryParams}`);
    },
  };
}

// Export singleton instance
const apiClient = new ApiClient();

export default apiClient;

// Export individual API modules for convenience
export const {
  auth: authApi,
  dashboard: dashboardApi,
  debtors: debtorsApi,
  cases: casesApi,
  kreditoren: kreditorenApi,
  templates: templatesApi,
  documents: documentsApi,
  inquiries: inquiriesApi,
  search: searchApi,
} = apiClient;

// Export types
export type { PaginatedResult, ApiError, LoginRequest, LoginDebtorRequest, AuthResponse, WorkflowRequest };
