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
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  static async put<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  static async delete(url: string): Promise<void> {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Request failed');
    }
  }
}
