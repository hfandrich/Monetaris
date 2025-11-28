import {
  RiskScore as RiskScoreEnum,
  AddressStatus as AddressStatusEnum,
  CaseStatus as CaseStatusEnum,
  type RiskScore,
  type AddressStatus,
  type CaseStatus,
} from '../../types';

// --- Transformation Maps ---

export const RISK_SCORE_MAP: Record<number, RiskScore> = {
  0: RiskScoreEnum.A,
  1: RiskScoreEnum.B,
  2: RiskScoreEnum.C,
  3: RiskScoreEnum.D,
  4: RiskScoreEnum.E,
};

export const ADDRESS_STATUS_MAP: Record<number, AddressStatus> = {
  0: AddressStatusEnum.UNKNOWN,
  1: AddressStatusEnum.CONFIRMED,
  2: AddressStatusEnum.MOVED,
  3: AddressStatusEnum.DECEASED,
  4: AddressStatusEnum.RESEARCH_PENDING,
};

export const CASE_STATUS_MAP: Record<number, CaseStatus> = {
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

export const USER_ROLE_MAP: Record<number, string> = {
  0: 'ADMIN',
  1: 'AGENT',
  2: 'CLIENT',
  3: 'DEBTOR',
};

// --- Helper Functions ---

/**
 * Build query string from filters object
 */
export function buildQueryString(filters?: Record<string, any>): string {
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

/**
 * Get authorization headers with Bearer token
 */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('monetaris_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// --- Pagination Types ---

/**
 * Backend API returns this format
 */
export interface BackendPaginatedResponse<T> {
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
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

/**
 * Transform backend paginated response to frontend format
 */
export function transformPaginatedResponse<TBackend, TFrontend>(
  response: BackendPaginatedResponse<TBackend>,
  transform?: (item: TBackend) => TFrontend
): PaginatedResult<TFrontend> {
  return {
    data: transform ? response.items.map(transform) : (response.items as unknown as TFrontend[]),
    total: response.totalCount,
    totalPages: response.totalPages,
    page: response.page,
    pageSize: response.pageSize,
  };
}
