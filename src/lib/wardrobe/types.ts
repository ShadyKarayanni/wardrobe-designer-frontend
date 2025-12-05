// Item categories
export type ItemCategory = 'tops' | 'bottoms' | 'shoes' | 'accessories';

export const CATEGORIES: { key: ItemCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'accessories', label: 'Accessories' },
];

// Sort options
export type SortOption = 'newest' | 'name' | 'last_used';

export const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'name', label: 'Name' },
  { key: 'last_used', label: 'Last Used' },
];

// Wardrobe item from API
export interface WardrobeItem {
  id: string;
  name: string;
  category: ItemCategory;
  color: string | null;
  image_url: string;
  created_at: string;
  updated_at: string;
  last_used: string | null;
}

// Item with resolved signed URL
export interface WardrobeItemWithUrl extends WardrobeItem {
  signedUrl: string | null;
}

// Create item request
export interface CreateItemRequest {
  name: string;
  category: ItemCategory;
  color?: string;
  image: {
    uri: string;
    type: string;
    name: string;
  };
}

// Update item request
export interface UpdateItemRequest {
  name?: string;
  category?: ItemCategory;
  color?: string;
  image?: {
    uri: string;
    type: string;
    name: string;
  };
}

// Signed URL response from API
export interface SignedUrlItem {
  item_id: string;
  signed_url: string;
  expires_in: number;
}

export interface SignedUrlsResponse {
  urls: SignedUrlItem[];
}

// Paginated items response
export interface PaginatedItemsResponse {
  items: WardrobeItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Filter/search state
export interface WardrobeFilters {
  category: ItemCategory | 'all';
  search: string;
  sort: SortOption;
}
