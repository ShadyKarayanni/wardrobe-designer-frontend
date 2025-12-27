import { api } from '../api/client';
import { UserProfile, UpdateProfileRequest } from '../wardrobe/types';

const PROFILE_ENDPOINT = '/profile';

export const profileService = {
  /**
   * Get the current user's profile
   * Creates a default profile if one doesn't exist
   */
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<UserProfile>(PROFILE_ENDPOINT);
    return response.data;
  },

  /**
   * Update the user's profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await api.put<UserProfile>(PROFILE_ENDPOINT, data);
    return response.data;
  },
};
