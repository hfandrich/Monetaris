/**
 * Dashboard Entity - Public API
 * Feature-Sliced Design - Entity Layer
 */

// Types
export type {
  DashboardStats,
  FinancialData,
  RecentActivity,
  SearchResult,
  WidgetType,
  DashboardWidgetConfig,
  WizardType,
} from './types/dashboard.types';

// API
export {
  getStats,
  getFinancial,
  getRecentActivity,
  search,
} from './api';

// Hooks
export {
  useDashboardStats,
  useDashboardSearch,
} from './hooks';

// Components
export {
  StatsOverviewWidget,
  FinancialChartWidget,
  InquiriesListWidget,
  UrgentTasksWidget,
  QuickActionsWidget,
  PerformanceWidget,
} from './components';
