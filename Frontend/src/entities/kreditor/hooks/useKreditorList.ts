/**
 * useKreditorList Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useEffect, useCallback } from 'react';
import { getKreditoren, type KreditorFilters } from '../api';
import type { Kreditor } from '../types/kreditor.types';

interface UseKreditorListOptions {
  search?: string;
  pageSize?: number;
  autoLoad?: boolean;
}

export function useKreditorList(options: UseKreditorListOptions = {}) {
  const [kreditoren, setKreditoren] = useState<Kreditor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: KreditorFilters = {
        page,
        pageSize: options.pageSize || 50,
        search: options.search,
      };

      const result = await getKreditoren(filters);

      setKreditoren(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load kreditoren');
      setKreditoren([]);
    } finally {
      setLoading(false);
    }
  }, [page, options.search, options.pageSize]);

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
    kreditoren,
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
