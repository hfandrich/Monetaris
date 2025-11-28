/**
 * Production-safe logger utility
 *
 * This logger ensures that:
 * 1. Console statements are only active in development mode
 * 2. Sensitive data is not leaked in production error logs
 * 3. Errors are still logged for debugging but sanitized
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/logger';
 *
 * logger.log('User clicked button');
 * logger.error('API call failed', error);
 * logger.warn('Deprecated feature used');
 * logger.debug('Complex object:', obj);
 * ```
 */

const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production';

/**
 * Sanitizes error messages in production to avoid leaking sensitive data
 */
const sanitizeError = (args: any[]): any[] => {
  if (isDev) {
    return args;
  }

  // In production, only show generic error message
  return ['An error occurred. Please contact support if this persists.'];
};

export const logger = {
  /**
   * Log general information (development only)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log warnings (development only)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log errors
   * - In development: Full error details
   * - In production: Sanitized generic message
   */
  error: (...args: any[]) => {
    console.error(...sanitizeError(args));
  },

  /**
   * Log debug information (development only)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log informational messages (development only)
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  }
};
