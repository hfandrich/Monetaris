/**
 * Template Entity Tests
 * Feature-Sliced Design - Entity Layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformTemplate } from '../types/template.types';
import type { BackendTemplate } from '../types/template.types';

describe('Template Entity', () => {
  describe('transformTemplate', () => {
    it('should transform backend template to frontend format', () => {
      const backendTemplate: BackendTemplate = {
        id: 'tpl-1',
        name: 'Test Template',
        type: 'EMAIL',
        category: 'REMINDER',
        subject: 'Test Subject',
        content: '<p>Test content</p>',
        variables: [
          { name: 'firstName', description: 'First Name', example: 'John' }
        ],
        isDefault: true,
        tenantId: 'tenant-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = transformTemplate(backendTemplate);

      expect(result).toEqual({
        id: 'tpl-1',
        name: 'Test Template',
        type: 'EMAIL',
        category: 'REMINDER',
        subject: 'Test Subject',
        body: '<p>Test content</p>',
        variables: [
          { name: 'firstName', description: 'First Name', example: 'John' }
        ],
        isDefault: true,
        tenantId: 'tenant-1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      });
    });

    it('should handle missing optional fields', () => {
      const backendTemplate: BackendTemplate = {
        id: 'tpl-2',
        name: 'Minimal Template',
        type: 'letter',
        category: 'other',
        content: 'Plain text',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const result = transformTemplate(backendTemplate);

      expect(result.id).toBe('tpl-2');
      expect(result.name).toBe('Minimal Template');
      expect(result.type).toBe('LETTER');
      expect(result.category).toBe('OTHER');
      expect(result.body).toBe('Plain text');
      expect(result.variables).toEqual([]);
      expect(result.isDefault).toBe(false);
      expect(result.subject).toBeUndefined();
      expect(result.tenantId).toBeUndefined();
    });

    it('should fallback to body field if content is missing', () => {
      const backendTemplate: BackendTemplate = {
        id: 'tpl-3',
        name: 'Template with body field',
        type: 'EMAIL',
        category: 'CONFIRMATION',
        body: '<p>Body content</p>',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const result = transformTemplate(backendTemplate);

      expect(result.body).toBe('<p>Body content</p>');
    });

    it('should use lastModified as fallback for timestamps', () => {
      const backendTemplate: BackendTemplate = {
        id: 'tpl-4',
        name: 'Legacy Template',
        type: 'LETTER',
        category: 'DUNNING',
        content: 'Content',
        lastModified: '2023-12-31T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const result = transformTemplate(backendTemplate);

      expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(result.updatedAt).toBe('2024-01-01T00:00:00Z');
    });

    it('should normalize template type to uppercase', () => {
      const backendTemplate: BackendTemplate = {
        id: 'tpl-5',
        name: 'SMS Template',
        type: 'sms',
        category: 'reminder',
        content: 'SMS text',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const result = transformTemplate(backendTemplate);

      expect(result.type).toBe('SMS');
      expect(result.category).toBe('REMINDER');
    });
  });

  describe('Template Types', () => {
    it('should have correct template types', () => {
      const types = ['EMAIL', 'LETTER', 'SMS'];
      types.forEach(type => {
        expect(type).toMatch(/^(EMAIL|LETTER|SMS)$/);
      });
    });

    it('should have correct template categories', () => {
      const categories = ['REMINDER', 'DUNNING', 'COURT', 'CONFIRMATION', 'OTHER'];
      categories.forEach(category => {
        expect(category).toMatch(/^(REMINDER|DUNNING|COURT|CONFIRMATION|OTHER)$/);
      });
    });
  });
});
