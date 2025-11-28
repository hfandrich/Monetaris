/**
 * Inquiry Entity Public API
 * Feature-Sliced Design - Entity Layer
 */

// Types
export type {
  Inquiry,
  InquiryStatus,
  BackendInquiry
} from './types/inquiry.types';
export {
  transformInquiry,
  INQUIRY_STATUS_MAP
} from './types/inquiry.types';

// API
export {
  getInquiries,
  createInquiry,
  resolveInquiry,
  deleteInquiry
} from './api';
export type {
  InquiryFilters,
  InquiryListResult,
  CreateInquiryRequest,
  ResolveInquiryRequest
} from './api';

// Hooks
export { useInquiries, useInquiryResolve } from './hooks';

// Components
export {
  InquiryCard,
  InquiryList
} from './components';
