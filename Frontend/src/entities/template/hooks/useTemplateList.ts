/**
 * useTemplateList Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useEffect, useCallback } from 'react';
import { getTemplates, type TemplateFilters } from '../api';
import type { CommunicationTemplate } from '../types/template.types';

interface UseTemplateListOptions {
  type?: string;
  category?: string;
  tenantId?: string;
  pageSize?: number;
  autoLoad?: boolean;
}

export function useTemplateList(options: UseTemplateListOptions = {}) {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: TemplateFilters = {
        page,
        pageSize: options.pageSize || 20,
        type: options.type,
        category: options.category,
        tenantId: options.tenantId,
      };

      const result = await getTemplates(filters);

      setTemplates(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [page, options.type, options.category, options.tenantId, options.pageSize]);

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
    templates,
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
