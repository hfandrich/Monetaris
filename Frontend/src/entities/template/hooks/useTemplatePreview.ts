/**
 * useTemplatePreview Hook
 * Feature-Sliced Design - Entity Layer
 */

import { useState, useCallback } from 'react';
import { previewTemplate } from '../api';

export function useTemplatePreview() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = useCallback(async (templateId: string, variables: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await previewTemplate(templateId, variables);
      setPreview(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to generate preview');
      setPreview(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return {
    preview,
    loading,
    error,
    generatePreview,
    clearPreview,
  };
}
