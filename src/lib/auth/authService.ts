import { api } from '../api/client';
import { AuthResponse, SignInRequest, SignUpRequest } from './types';

export const authService = {
  async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signin', credentials);
    return response.data;
  },

  async signUp(credentials: SignUpRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', credentials);
    return response.data;
  },

  async signOut(): Promise<void> {
    await api.post('/auth/signout');
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/reset-password', { email });
  },

  async verifySession(): Promise<boolean> {
    try {
      await api.get('/protected');
      return true;
    } catch {
      return false;
    }
  },
};
