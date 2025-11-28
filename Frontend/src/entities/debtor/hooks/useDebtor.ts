/**
 * useDebtor Hook - Single debtor CRUD operations
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useEffect, useCallback } from 'react';
import { getDebtor, createDebtor, updateDebtor, deleteDebtor } from '../api';
import type { CreateDebtorRequest, UpdateDebtorRequest } from '../api';
import type { Debtor } from '../types/debtor.types';

interface UseDebtorOptions {
  id?: string;
  autoLoad?: boolean;
}

export function useDebtor(options: UseDebtorOptions = {}) {
  const [debtor, setDebtor] = useState<Debtor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDebtor(id);
      setDebtor(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load debtor');
      setDebtor(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateDebtorRequest): Promise<Debtor | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await createDebtor(data);
      setDebtor(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create debtor');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateDebtorRequest): Promise<Debtor | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateDebtor(id, data);
      setDebtor(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update debtor');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await deleteDebtor(id);
      setDebtor(null);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete debtor');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.id && options.autoLoad !== false) {
      load(options.id);
    }
  }, [options.id, options.autoLoad, load]);

  return {
    debtor,
    loading,
    error,
    load,
    create,
    update,
    remove,
  };
}
