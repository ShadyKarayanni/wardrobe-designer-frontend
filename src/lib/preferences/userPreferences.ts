import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_KEY = '@user_preferences';

export interface UserPreferences {
  stylePreferences: string;
}

const defaultPreferences: UserPreferences = {
  stylePreferences: '',
};

// In-memory cache for quick access
let cachedPreferences: UserPreferences | null = null;

export const userPreferences = {
  async get(): Promise<UserPreferences> {
    if (cachedPreferences) {
      return cachedPreferences;
    }

    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        cachedPreferences = JSON.parse(stored);
        return cachedPreferences!;
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }

    return defaultPreferences;
  },

  async set(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.get();
    const updated = { ...current, ...preferences };

    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
      cachedPreferences = updated;
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }

    return updated;
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFERENCES_KEY);
      cachedPreferences = null;
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  },

  // Get cached preferences synchronously (for initial state)
  getCached(): UserPreferences {
    return cachedPreferences || defaultPreferences;
  },
};
