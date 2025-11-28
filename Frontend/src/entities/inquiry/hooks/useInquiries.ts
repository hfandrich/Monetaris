/**
 * useInquiries Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useEffect, useCallback } from 'react';
import { getInquiries, type InquiryFilters } from '../api';
import type { Inquiry } from '../types/inquiry.types';

interface UseInquiriesOptions {
  status?: 'OPEN' | 'RESOLVED';
  caseId?: string;
  search?: string;
  autoLoad?: boolean;
}

export function useInquiries(options: UseInquiriesOptions = {}) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: InquiryFilters = {
        status: options.status,
        caseId: options.caseId,
        search: options.search,
      };

      const result = await getInquiries(filters);

      setInquiries(result.data);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load inquiries');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [options.status, options.caseId, options.search]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      load();
    }
  }, [load, options.autoLoad]);

  return {
    inquiries,
    total,
    loading,
    error,
    reload: load,
  };
}
