/**
 * useTenant Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useEffect, useCallback } from 'react';
import { getTenant, createTenant, updateTenant, deleteTenant } from '../api';
import type { Tenant, CreateTenantRequest, UpdateTenantRequest } from '../types/tenant.types';

interface UseTenantOptions {
  id?: string;
  autoLoad?: boolean;
}

export function useTenant(options: UseTenantOptions = {}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!options.id) {
      setTenant(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTenant(options.id);
      setTenant(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenant');
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }, [options.id]);

  useEffect(() => {
    if (options.autoLoad !== false && options.id) {
      load();
    }
  }, [load, options.autoLoad, options.id]);

  const create = useCallback(async (data: CreateTenantRequest): Promise<Tenant> => {
    setLoading(true);
    setError(null);

    try {
      const result = await createTenant(data);
      setTenant(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create tenant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateTenantRequest): Promise<Tenant> => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateTenant(id, data);
      setTenant(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update tenant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await deleteTenant(id);
      setTenant(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete tenant');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tenant,
    loading,
    error,
    reload: load,
    create,
    update,
    delete: remove,
  };
}
