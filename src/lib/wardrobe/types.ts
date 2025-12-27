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

// Wardrobe item from API (now includes signed_url)
export interface WardrobeItem {
  id: string;
  name: string;
  category: ItemCategory;
  color: string | null;
  image_url: string;
  signed_url: string | null;
  created_at: string;
  updated_at: string;
  last_used: string | null;
}

// Alias for backwards compatibility
export interface WardrobeItemWithUrl extends WardrobeItem {
  signedUrl: string | null;
}

// Create item request (only image required - AI generates name/category/color)
export interface CreateItemRequest {
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

// ============================================
// Schedule Types
// ============================================

// Weather forecast for a single day
export interface WeatherForecast {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  precipitation_chance: number;
  humidity: number;
  wind_speed: number;
}

// Outfit item in schedule (includes signed URL)
export interface ScheduleOutfitItem {
  id: string;
  name: string;
  category: ItemCategory;
  color: string | null;
  image_url: string;
  signed_url: string | null;
  subcategory: string | null;
  dominant_color: string | null;
  tags: string[] | null;
}

// Event attached to a scheduled day
export interface ScheduleEvent {
  id: string;
  event_name: string;
  dress_code: DressCode;
  notes: string | null;
}

// Single day in the weekly schedule
export interface DailySchedule {
  date: string;
  day_name: string;
  weather: WeatherForecast;
  event: ScheduleEvent | null;
  top: ScheduleOutfitItem | null;
  bottom: ScheduleOutfitItem | null;
  shoes: ScheduleOutfitItem | null;
  outer_layer: ScheduleOutfitItem | null;
  accessories: ScheduleOutfitItem[];
  ai_reasoning: string;
}

// Full weekly schedule response
export interface WeeklyScheduleResponse {
  generated_at: string;
  location: string;
  schedule: DailySchedule[];
}

// Request to generate weekly schedule
export interface GenerateScheduleRequest {
  city?: string;
  country?: string;
  start_date?: string;
  style_preferences?: string;
}

// Request to regenerate a single day's outfit
export interface RegenerateOutfitRequest {
  feedback?: string;
  locked_slots?: string[];
  city?: string;
  country?: string;
  style_preferences?: string;
}

// ============================================
// Events Types
// ============================================

export type DressCode =
  | 'casual'
  | 'smart-casual'
  | 'business-casual'
  | 'business'
  | 'formal'
  | 'black-tie'
  | 'beach'
  | 'sporty'
  | 'cocktail'
  | 'semi-formal'
  | 'date-night'
  | 'wedding-guest'
  | 'outdoor'
  | 'costume';

export const DRESS_CODES: { key: DressCode; label: string }[] = [
  { key: 'casual', label: 'Casual' },
  { key: 'smart-casual', label: 'Smart Casual' },
  { key: 'business-casual', label: 'Business Casual' },
  { key: 'business', label: 'Business' },
  { key: 'formal', label: 'Formal' },
  { key: 'black-tie', label: 'Black Tie' },
  { key: 'semi-formal', label: 'Semi-Formal' },
  { key: 'cocktail', label: 'Cocktail' },
  { key: 'date-night', label: 'Date Night' },
  { key: 'wedding-guest', label: 'Wedding Guest' },
  { key: 'beach', label: 'Beach' },
  { key: 'sporty', label: 'Sporty' },
  { key: 'outdoor', label: 'Outdoor' },
  { key: 'costume', label: 'Costume' },
];

export interface Event {
  id: string;
  user_id: string;
  event_name: string;
  event_date: string;
  dress_code: DressCode;
  notes: string | null;
  created_at: string;
}

export interface CreateEventRequest {
  event_name: string;
  event_date: string;
  dress_code: DressCode;
  notes?: string;
}

export interface UpdateEventRequest {
  event_name?: string;
  event_date?: string;
  dress_code?: DressCode;
  notes?: string;
}

// ============================================
// Profile Types
// ============================================

export interface UserProfile {
  id: string;
  user_id: string;
  default_city: string | null;
  default_country: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface UpdateProfileRequest {
  default_city?: string;
  default_country?: string;
}
