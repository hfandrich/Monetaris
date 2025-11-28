/**
 * CSRF Token Management Service
 *
 * Handles retrieval and caching of CSRF tokens for state-changing requests (POST/PUT/DELETE).
 * Tokens are fetched from the backend and cached until explicitly invalidated.
 */

// Use VITE_API_URL and strip /api suffix to get base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5033/api';
const API_BASE_URL = API_URL.replace(/\/api$/, '');

interface CsrfTokenResponse {
  token: string;
}

class CsrfService {
  private token: string | null = null;
  private isFetching: boolean = false;
  private fetchPromise: Promise<string> | null = null;

  /**
   * Get CSRF token, fetching from server if not cached
   * Uses promise caching to prevent concurrent requests
   */
  async getToken(): Promise<string> {
    // Return cached token if available
    if (this.token) {
      return this.token;
    }

    // If already fetching, return the same promise
    if (this.isFetching && this.fetchPromise) {
      return this.fetchPromise;
    }

    // Start new fetch
    this.isFetching = true;
    this.fetchPromise = this.fetchTokenFromServer();

    try {
      const token = await this.fetchPromise;
      this.token = token;
      return token;
    } finally {
      this.isFetching = false;
      this.fetchPromise = null;
    }
  }

  /**
   * Fetch CSRF token from the backend API
   */
  private async fetchTokenFromServer(): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/csrf-token`, {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
      }

      const data: CsrfTokenResponse = await response.json();

      if (!data.token) {
        throw new Error('CSRF token not found in response');
      }

      return data.token;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }

  /**
   * Invalidate cached token (e.g., after logout or token expiration)
   */
  invalidate(): void {
    this.token = null;
  }

  /**
   * Check if token is cached
   */
  hasToken(): boolean {
    return this.token !== null;
  }
}

// Export singleton instance
export const csrfService = new CsrfService();
