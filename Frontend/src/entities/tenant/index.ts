/**
 * Tenant Entity Exports
 * Feature-Sliced Design - Entity Layer
 */

// Types
export type {
  Tenant,
  BackendTenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  Address,
  BankAccount,
} from './types/tenant.types';

export {
  transformTenant,
  toBackendCreateRequest,
  toBackendUpdateRequest,
} from './types/tenant.types';

// API
export {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  type TenantFilters,
  type PaginatedTenants,
} from './api';

// Hooks
export { useTenant, useTenantList } from './hooks';

// Components
export { TenantCard, TenantTable, TenantDetailHeader, TenantStats } from './components';
