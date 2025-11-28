/**
 * useKreditor Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useEffect, useCallback } from 'react';
import { getKreditor, createKreditor, updateKreditor, deleteKreditor } from '../api';
import type { Kreditor, CreateKreditorRequest, UpdateKreditorRequest } from '../types/kreditor.types';

interface UseKreditorOptions {
  id?: string;
  autoLoad?: boolean;
}

export function useKreditor(options: UseKreditorOptions = {}) {
  const [kreditor, setKreditor] = useState<Kreditor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!options.id) {
      setKreditor(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getKreditor(options.id);
      setKreditor(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load kreditor');
      setKreditor(null);
    } finally {
      setLoading(false);
    }
  }, [options.id]);

  useEffect(() => {
    if (options.autoLoad !== false && options.id) {
      load();
    }
  }, [load, options.autoLoad, options.id]);

  const create = useCallback(async (data: CreateKreditorRequest): Promise<Kreditor> => {
    setLoading(true);
    setError(null);

    try {
      const result = await createKreditor(data);
      setKreditor(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create kreditor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateKreditorRequest): Promise<Kreditor> => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateKreditor(id, data);
      setKreditor(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update kreditor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await deleteKreditor(id);
      setKreditor(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete kreditor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    kreditor,
    loading,
    error,
    reload: load,
    create,
    update,
    delete: remove,
  };
}
