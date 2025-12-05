import { api } from '../api/client';
import {
  WardrobeItem,
  CreateItemRequest,
  UpdateItemRequest,
  SignedUrlsResponse,
  PaginatedItemsResponse,
  ItemCategory,
  SortOption,
} from './types';

const ITEMS_ENDPOINT = '/items';

export const wardrobeService = {
  /**
   * Get paginated list of items
   */
  async getItems(params: {
    page?: number;
    limit?: number;
    category?: ItemCategory | 'all';
    search?: string;
    sort?: SortOption;
  }): Promise<PaginatedItemsResponse> {
    const queryParams: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };

    // Backend filters by category if provided (skip 'all')
    if (params.category && params.category !== 'all') {
      queryParams.category = params.category;
    }
    if (params.search) {
      queryParams.search = params.search;
    }
    if (params.sort) {
      queryParams.sort = params.sort;
    }

    const response = await api.get<PaginatedItemsResponse>(ITEMS_ENDPOINT, {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Get a single item by ID
   */
  async getItem(itemId: string): Promise<WardrobeItem> {
    const response = await api.get<WardrobeItem>(`${ITEMS_ENDPOINT}/${itemId}`);
    return response.data;
  },

  /**
   * Create a new item (multipart/form-data)
   */
  async createItem(data: CreateItemRequest): Promise<WardrobeItem> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    if (data.color) {
      formData.append('color', data.color);
    }
    formData.append('image', {
      uri: data.image.uri,
      type: data.image.type,
      name: data.image.name,
    } as unknown as Blob);

    const response = await fetch(`${api.getBaseUrl()}${ITEMS_ENDPOINT}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${api.getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create item' }));
      throw new Error(error.detail || error.message || 'Failed to create item');
    }

    return response.json();
  },

  /**
   * Update an existing item (multipart/form-data)
   */
  async updateItem(itemId: string, data: UpdateItemRequest): Promise<WardrobeItem> {
    const formData = new FormData();

    if (data.name) formData.append('name', data.name);
    if (data.category) formData.append('category', data.category);
    if (data.color !== undefined) formData.append('color', data.color || '');
    if (data.image) {
      formData.append('image', {
        uri: data.image.uri,
        type: data.image.type,
        name: data.image.name,
      } as unknown as Blob);
    }

    const response = await fetch(`${api.getBaseUrl()}${ITEMS_ENDPOINT}/${itemId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${api.getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update item' }));
      throw new Error(error.detail || error.message || 'Failed to update item');
    }

    return response.json();
  },

  /**
   * Delete an item
   */
  async deleteItem(itemId: string): Promise<void> {
    await api.delete(`${ITEMS_ENDPOINT}/${itemId}`);
  },

  /**
   * Get signed URLs for item images
   */
  async getSignedUrls(itemIds: string[], expiresIn: number = 3600): Promise<SignedUrlsResponse> {
    const response = await api.post<SignedUrlsResponse>(`${ITEMS_ENDPOINT}/signed-urls`, {
      item_ids: itemIds,
      expires_in: expiresIn,
    });
    return response.data;
  },
};
