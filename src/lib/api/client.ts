/**
 * API client for the Wardrobe Designer app
 * Base URL: https://wardrobe-designer-production.up.railway.app
 */

import { ApiError, ApiResponse, HttpMethod, RequestOptions } from './types';

const BASE_URL = 'https://wardrobe-designer-production.up.railway.app';

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;
  private onUnauthorized?: () => void;
  private skipUnauthorizedEndpoints = ['/auth/signin', '/auth/signup', '/auth/signout'];

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set callback for 401 unauthorized responses
  setOnUnauthorized(callback: () => void): void {
    this.onUnauthorized = callback;
  }

  // Set auth token for authenticated requests
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  // Get current auth token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Get base URL for multipart form uploads
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Build URL with query params
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  // Build headers with auth
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.params);
    const headers = this.buildHeaders(options?.headers);

    const config: RequestInit = {
      method,
      headers,
      signal: options?.signal,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        if (!response.ok) {
          throw this.createError('Non-JSON error response', response.status);
        }
        return {
          data: null as T,
          success: true,
        };
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - session expired (but not for auth endpoints)
        const shouldHandleUnauthorized =
          response.status === 401 &&
          this.onUnauthorized &&
          !this.skipUnauthorizedEndpoints.some((ep) => endpoint.includes(ep));

        if (shouldHandleUnauthorized && this.onUnauthorized) {
          this.onUnauthorized();
        }
        throw this.createError(data.message || data.detail || 'Request failed', response.status, data);
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError('Request was cancelled', 0);
      }

      if (this.isApiError(error)) {
        throw error;
      }

      throw this.createError(error instanceof Error ? error.message : 'Unknown error occurred', 0);
    }
  }

  // Create API error
  private createError(
    message: string,
    status?: number,
    details?: Record<string, unknown>
  ): ApiError {
    return {
      message,
      status,
      details,
    };
  }

  // Type guard for API error
  private isApiError(error: unknown): error is ApiError {
    return typeof error === 'object' && error !== null && 'message' in error;
  }

  // HTTP methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body, options);
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };
