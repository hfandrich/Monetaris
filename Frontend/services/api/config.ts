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
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
    UPDATE_PASSWORD: `${API_BASE_URL}/auth/password`,
  },
  // Kreditoren (Mandanten/Tenants)
  KREDITOREN: `${API_BASE_URL}/kreditoren`,
  TENANTS: `${API_BASE_URL}/kreditoren`, // Alias for KREDITOREN
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
    STATS: `${API_BASE_URL}/dashboard/statistics`,
    FINANCIAL: `${API_BASE_URL}/dashboard/financial`,
    RECENT_ACTIVITY: `${API_BASE_URL}/dashboard/recent-activity`,
    SEARCH: `${API_BASE_URL}/dashboard/search`,
  },
  SEARCH: `${API_BASE_URL}/search`,
  // AI Assistant
  AI: {
    CHAT: `${API_BASE_URL}/ai/chat`,
  },
};

export { API_BASE_URL };
