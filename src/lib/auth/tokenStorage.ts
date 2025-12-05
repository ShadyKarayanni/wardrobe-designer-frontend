import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens } from './types';

const ACCESS_TOKEN_KEY = '@wardrobe_access_token';
const REFRESH_TOKEN_KEY = '@wardrobe_refresh_token';

export const tokenStorage = {
  async getTokens(): Promise<AuthTokens | null> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      ]);
      if (!accessToken) return null;
      return { accessToken, refreshToken: refreshToken || undefined };
    } catch (error) {
      console.error('Error reading tokens:', error);
      return null;
    }
  },

  async setTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
        tokens.refreshToken
          ? AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
          : Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  },
};
