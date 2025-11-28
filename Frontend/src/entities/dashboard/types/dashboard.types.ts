/**
 * Dashboard Entity Types
 * Feature-Sliced Design - Entity Layer
 */

export interface DashboardStats {
  totalVolume: number;
  activeCases: number;
  legalCases: number;
  successRate: number;
  projectedRecovery: number;
}

export interface FinancialData {
  name: string;
  actual: number;
  projected: number;
}

export interface RecentActivity {
  id: string;
  type: 'case' | 'payment' | 'inquiry' | 'document';
  description: string;
  timestamp: string;
}

export interface SearchResult {
  id: string;
  type: 'CASE' | 'DEBTOR' | 'TENANT';
  title: string;
  subtitle: string;
  link: string;
}

// Widget configuration types
export type WidgetType =
  | 'STATS_OVERVIEW'
  | 'FINANCIAL_CHART'
  | 'INQUIRIES_LIST'
  | 'URGENT_TASKS'
  | 'QUICK_ACTIONS'
  | 'PERFORMANCE_BARS'
  | 'RISK_RADAR'
  | 'CONVERSION_FUNNEL'
  | 'ACTIVITY_HEATMAP';

export interface DashboardWidgetConfig {
  id: string;
  type: WidgetType;
  visible: boolean;
  order: number;
  colSpan: 1 | 2 | 3 | 4;
}

export type WizardType = 'CLAIM' | 'DEBTOR' | 'CLIENT';
