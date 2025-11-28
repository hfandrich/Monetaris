import React from 'react';
import { useDashboardStats } from '@/entities/dashboard';
import {
  StatsOverviewWidget,
  FinancialChartWidget,
  InquiriesListWidget,
  UrgentTasksWidget,
  QuickActionsWidget,
  PerformanceWidget
} from '@/entities/dashboard';
import { PageHeader } from '@/shared/components/ui';

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded">
        Fehler beim Laden: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Übersicht Ihrer Inkassovorgänge"
      />

      <StatsOverviewWidget stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialChartWidget loading={loading} />
        <InquiriesListWidget loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UrgentTasksWidget loading={loading} />
        <PerformanceWidget loading={loading} />
      </div>

      <QuickActionsWidget />
    </div>
  );
}
