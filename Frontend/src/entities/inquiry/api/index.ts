/**
 * Inquiry API Exports
 * Feature-Sliced Design - Entity Layer
 */

export { getInquiries, type InquiryFilters, type InquiryListResult } from './getInquiries';
export { createInquiry, type CreateInquiryRequest } from './createInquiry';
export { resolveInquiry, type ResolveInquiryRequest } from './resolveInquiry';
export { deleteInquiry } from './deleteInquiry';
