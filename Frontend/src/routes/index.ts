/**
 * Application Routes
 * Feature-Sliced Design - Routes Layer
 *
 * This file exports all route components for use in the application router.
 * Each route is a minimal composition of entity hooks and components.
 */

// Main Application Routes
export { default as DashboardPage } from './dashboard/page';
export { default as ClaimsPage } from './claims/page';
export { default as DebtorsPage } from './debtors/page';
export { default as DebtorDetailPage } from './debtors/[id]/page';
export { default as ClientsPage } from './clients/page';
export { default as ClientDetailPage } from './clients/[id]/page';
export { default as TenantsPage } from './tenants/page';
export { default as TenantDetailPage } from './tenants/[id]/page';
export { default as TemplatesPage } from './templates/page';

// Authentication
export { default as LoginPage } from './login/page';

// Portals
export { default as DebtorPortalPage } from './portal/debtor/page';
export { default as ClientPortalPage } from './portal/client/page';
