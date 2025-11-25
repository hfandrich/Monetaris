const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGIN_DEBTOR: `${API_BASE_URL}/auth/login-debtor`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  // Tenants
  TENANTS: `${API_BASE_URL}/tenants`,
  // Debtors
  DEBTORS: `${API_BASE_URL}/debtors`,
  // Cases
  CASES: `${API_BASE_URL}/cases`,
  // Documents
  DOCUMENTS: `${API_BASE_URL}/documents`,
  // Inquiries
  INQUIRIES: `${API_BASE_URL}/inquiries`,
  // Templates
  TEMPLATES: `${API_BASE_URL}/templates`,
  // Dashboard
  DASHBOARD: {
    STATS: `${API_BASE_URL}/dashboard/stats`,
    FINANCIAL: `${API_BASE_URL}/dashboard/financial`,
  },
  SEARCH: `${API_BASE_URL}/search`,
};

export { API_BASE_URL };
