/**
 * Debtor Entity Public API
 * Feature-Sliced Design - Entity Layer
 */

// Types
export type {
  Debtor,
  Address,
  RiskScore,
  AddressStatus,
  BackendDebtor
} from './types/debtor.types';
export {
  transformDebtor,
  RISK_SCORE_MAP,
  ADDRESS_STATUS_MAP
} from './types/debtor.types';

// API
export {
  getDebtors,
  getDebtor,
  createDebtor,
  updateDebtor,
  deleteDebtor
} from './api';
export type {
  DebtorFilters,
  PaginatedDebtors,
  CreateDebtorRequest,
  UpdateDebtorRequest
} from './api';

// Hooks
export { useDebtorList, useDebtor } from './hooks';

// Components
export {
  DebtorCard,
  DebtorTable,
  RiskBadge,
  DebtorDetailHeader
} from './components';
