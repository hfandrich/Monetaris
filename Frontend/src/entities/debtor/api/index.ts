/**
 * Debtor API Exports
 * Feature-Sliced Design - Entity Layer
 */

export { getDebtors, type DebtorFilters, type PaginatedDebtors } from './getDebtors';
export { getDebtor } from './getDebtor';
export { createDebtor, type CreateDebtorRequest } from './createDebtor';
export { updateDebtor, type UpdateDebtorRequest } from './updateDebtor';
export { deleteDebtor } from './deleteDebtor';
