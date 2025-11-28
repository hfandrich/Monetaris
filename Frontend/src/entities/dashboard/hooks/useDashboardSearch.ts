/**
 * useDashboardSearch Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useCallback } from 'react';
import { search } from '../api';
import type { SearchResult } from '../types/dashboard.types';

export function useDashboardSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await search(query);
      setResults(searchResults);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    performSearch,
    clear,
  };
}
