import { csrfService } from '../../services/csrfService';

export interface ApiError {
  error: string;
  errors?: Record<string, string[]>;
}

export class HttpClient {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('monetaris_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private static async getAuthHeadersWithCsrf(): Promise<HeadersInit> {
    const token = localStorage.getItem('monetaris_token');
    const csrfToken = await csrfService.getToken();

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      'X-CSRF-TOKEN': csrfToken,
    };
  }

  static async get<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  static async post<T>(url: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeadersWithCsrf();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies for CSRF
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  static async put<T>(url: string, data: any): Promise<T> {
    const headers = await this.getAuthHeadersWithCsrf();
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      credentials: 'include', // Include cookies for CSRF
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  static async delete(url: string): Promise<void> {
    const headers = await this.getAuthHeadersWithCsrf();
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include', // Include cookies for CSRF
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Request failed');
    }
  }
}
