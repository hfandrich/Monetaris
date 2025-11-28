/**
 * Inquiry Entity Tests
 * Feature-Sliced Design - Entity Layer
 */

import { describe, it, expect } from 'vitest';
import { transformInquiry, INQUIRY_STATUS_MAP } from '../types/inquiry.types';
import type { BackendInquiry } from '../types/inquiry.types';

describe('Inquiry Entity', () => {
  describe('INQUIRY_STATUS_MAP', () => {
    it('should map status 0 to OPEN', () => {
      expect(INQUIRY_STATUS_MAP[0]).toBe('OPEN');
    });

    it('should map status 1 to RESOLVED', () => {
      expect(INQUIRY_STATUS_MAP[1]).toBe('RESOLVED');
    });
  });

  describe('transformInquiry', () => {
    it('should transform backend inquiry with all fields', () => {
      const backend: BackendInquiry = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        caseId: '123e4567-e89b-12d3-a456-426614174001',
        caseNumber: 'INV-2024-001',
        debtorName: 'John Doe',
        question: 'When is the payment due?',
        answer: 'Payment is due by end of month',
        status: 1,
        createdBy: '123e4567-e89b-12d3-a456-426614174002',
        createdByName: 'Agent Smith',
        resolvedAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-10T09:00:00Z',
      };

      const result = transformInquiry(backend);

      expect(result).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        caseId: '123e4567-e89b-12d3-a456-426614174001',
        caseNumber: 'INV-2024-001',
        debtorName: 'John Doe',
        question: 'When is the payment due?',
        answer: 'Payment is due by end of month',
        status: 'RESOLVED',
        createdBy: '123e4567-e89b-12d3-a456-426614174002',
        createdByName: 'Agent Smith',
        resolvedAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-10T09:00:00Z',
      });
    });

    it('should transform backend inquiry with null answer', () => {
      const backend: BackendInquiry = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        caseId: '123e4567-e89b-12d3-a456-426614174001',
        caseNumber: 'INV-2024-001',
        debtorName: 'John Doe',
        question: 'When is the payment due?',
        answer: null,
        status: 0,
        createdBy: '123e4567-e89b-12d3-a456-426614174002',
        createdByName: 'Agent Smith',
        resolvedAt: null,
        createdAt: '2024-01-10T09:00:00Z',
      };

      const result = transformInquiry(backend);

      expect(result.answer).toBeUndefined();
      expect(result.resolvedAt).toBeUndefined();
      expect(result.status).toBe('OPEN');
    });

    it('should default to OPEN status for unknown status code', () => {
      const backend: BackendInquiry = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        caseId: '123e4567-e89b-12d3-a456-426614174001',
        caseNumber: 'INV-2024-001',
        debtorName: 'John Doe',
        question: 'When is the payment due?',
        answer: null,
        status: 999, // Unknown status
        createdBy: '123e4567-e89b-12d3-a456-426614174002',
        createdByName: 'Agent Smith',
        resolvedAt: null,
        createdAt: '2024-01-10T09:00:00Z',
      };

      const result = transformInquiry(backend);

      expect(result.status).toBe('OPEN');
    });
  });
});
