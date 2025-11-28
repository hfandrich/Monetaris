/**
 * useTemplate Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useEffect, useCallback } from 'react';
import { getTemplate, createTemplate, updateTemplate, deleteTemplate } from '../api';
import type { CommunicationTemplate, CreateTemplateRequest, UpdateTemplateRequest } from '../types/template.types';

interface UseTemplateOptions {
  id?: string;
  autoLoad?: boolean;
}

export function useTemplate(options: UseTemplateOptions = {}) {
  const [template, setTemplate] = useState<CommunicationTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTemplate(id);
      setTemplate(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateTemplateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createTemplate(data);
      setTemplate(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateTemplateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateTemplate(id, data);
      setTemplate(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteTemplate(id);
      setTemplate(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
      throw err;
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
    template,
    loading,
    error,
    load,
    create,
    update,
    remove,
    setTemplate,
  };
}
