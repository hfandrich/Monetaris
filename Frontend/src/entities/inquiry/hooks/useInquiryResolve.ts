/**
 * useInquiryResolve Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState } from 'react';
import { resolveInquiry, type ResolveInquiryRequest } from '../api';
import type { Inquiry } from '../types/inquiry.types';

export function useInquiryResolve() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = async (
    id: string,
    data: ResolveInquiryRequest
  ): Promise<Inquiry | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await resolveInquiry(id, data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to resolve inquiry');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    resolve,
    loading,
    error,
  };
}
