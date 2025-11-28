/**
 * useDebtorList Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useEffect, useCallback } from 'react';
import { getDebtors, type DebtorFilters } from '../api';
import type { Debtor } from '../types/debtor.types';

interface UseDebtorListOptions {
  search?: string;
  riskScore?: string;
  agentId?: string;
  tenantId?: string;
  pageSize?: number;
  autoLoad?: boolean;
}

export function useDebtorList(options: UseDebtorListOptions = {}) {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: DebtorFilters = {
        page,
        pageSize: options.pageSize || 20,
        search: options.search,
        riskScore: options.riskScore,
        agentId: options.agentId,
        tenantId: options.tenantId,
      };

      const result = await getDebtors(filters);

      setDebtors(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load debtors');
      setDebtors([]);
    } finally {
      setLoading(false);
    }
  }, [page, options.search, options.riskScore, options.agentId, options.tenantId, options.pageSize]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      load();
    }
  }, [load, options.autoLoad]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  return {
    debtors,
    total,
    page,
    totalPages,
    loading,
    error,
    reload: load,
    nextPage,
    prevPage,
    goToPage,
    setPage,
  };
}
