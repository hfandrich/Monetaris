/**
 * Kreditor Entity Exports
 * Feature-Sliced Design - Entity Layer
 */

// Types
export type {
  Kreditor,
  BackendKreditor,
  CreateKreditorRequest,
  UpdateKreditorRequest,
  Address,
  BankAccount,
} from './types/kreditor.types';

export {
  transformKreditor,
  toBackendCreateRequest,
  toBackendUpdateRequest,
} from './types/kreditor.types';

// API
export {
  getKreditoren,
  getKreditor,
  createKreditor,
  updateKreditor,
  deleteKreditor,
  type KreditorFilters,
  type PaginatedKreditoren,
} from './api';

// Hooks
export { useKreditor, useKreditorList } from './hooks';

// Components
export { KreditorCard, KreditorTable, KreditorDetailHeader, KreditorStats } from './components';
