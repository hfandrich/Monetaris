/**
 * useDashboardStats Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useEffect, useCallback } from 'react';
import { getStats } from '../api';
import type { DashboardStats } from '../types/dashboard.types';

interface UseDashboardStatsOptions {
  autoLoad?: boolean;
}

export function useDashboardStats(options: UseDashboardStatsOptions = {}) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getStats();
      setStats(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoLoad !== false) {
      load();
    }
  }, [load, options.autoLoad]);

  return {
    stats,
    loading,
    error,
    reload: load,
  };
}
