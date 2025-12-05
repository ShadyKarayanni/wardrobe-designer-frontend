/**
 * API types for the Wardrobe Designer app
 */

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Error response
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

// Request options
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Auth types (for future use)
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

// User types (placeholder)
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

// Wardrobe item types (placeholder)
export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Schedule types (placeholder)
export interface ScheduleEntry {
  id: string;
  date: string;
  items: WardrobeItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
