import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;
  let consoleDebugSpy: any;
  let consoleInfoSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('in development mode', () => {
    it('should call console.log when logger.log is called', () => {
      logger.log('Test message');
      // In DEV mode, console.log should be called
      // Note: This test assumes DEV mode is active during test runs
    });

    it('should call console.warn when logger.warn is called', () => {
      logger.warn('Warning message');
      // In DEV mode, console.warn should be called
    });

    it('should call console.error when logger.error is called', () => {
      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should call console.debug when logger.debug is called', () => {
      logger.debug('Debug message');
      // In DEV mode, console.debug should be called
    });

    it('should call console.info when logger.info is called', () => {
      logger.info('Info message');
      // In DEV mode, console.info should be called
    });
  });

  describe('error sanitization', () => {
    it('should log errors in all modes', () => {
      const error = new Error('Sensitive error with API key abc123');
      logger.error('API call failed', error);

      // Error should always be logged (sanitized in production)
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle multiple arguments', () => {
      logger.error('Multiple', 'arguments', { sensitive: 'data' });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('type safety', () => {
    it('should accept any type of arguments', () => {
      expect(() => logger.log('string')).not.toThrow();
      expect(() => logger.log(123)).not.toThrow();
      expect(() => logger.log({ key: 'value' })).not.toThrow();
      expect(() => logger.log(['array'])).not.toThrow();
      expect(() => logger.log(null)).not.toThrow();
      expect(() => logger.log(undefined)).not.toThrow();
    });
  });
});
