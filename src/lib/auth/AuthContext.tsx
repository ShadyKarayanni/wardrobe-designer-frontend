import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { tokenStorage } from './tokenStorage';
import { authService } from './authService';
import { supabase } from '../supabase/client';
import { api } from '../api/client';
import { AuthContextType, AuthUser, SignInRequest, SignUpRequest } from './types';

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const handleInvalidSession = useCallback(async () => {
    await tokenStorage.clearTokens();
    api.setAuthToken(null);
    setUser(null);
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please sign in again.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
    );
  }, [router]);

  // Initialize auth state from storage
  useEffect(() => {
    async function loadAuth() {
      try {
        const tokens = await tokenStorage.getTokens();
        if (tokens?.accessToken) {
          api.setAuthToken(tokens.accessToken);
          const isValid = await authService.verifySession();
          if (isValid) {
            // Token is valid - set a placeholder user
            // In a real app, you might fetch user profile here
            setUser({ id: 'authenticated', email: '' });
          } else {
            await tokenStorage.clearTokens();
            api.setAuthToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // Set up 401 handler
    api.setOnUnauthorized(handleInvalidSession);

    loadAuth();
  }, [handleInvalidSession]);

  // Listen for Supabase auth state changes (token refresh)
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && session) {
          // Update stored tokens and API client with refreshed token
          await tokenStorage.setTokens({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
          });
          api.setAuthToken(session.access_token);
        } else if (event === 'SIGNED_OUT') {
          await tokenStorage.clearTokens();
          api.setAuthToken(null);
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Navigation guard
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Not authenticated, redirect to sign in
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // Authenticated, redirect to app
      router.replace('/(app)');
    }
  }, [user, segments, isLoading, router]);

  const signIn = useCallback(async (credentials: SignInRequest) => {
    const response = await authService.signIn(credentials);

    if (!response.session) {
      throw new Error('Please verify your email address before signing in.');
    }

    await tokenStorage.setTokens({
      accessToken: response.session.access_token,
      refreshToken: response.session.refresh_token,
    });
    api.setAuthToken(response.session.access_token);
    setUser({
      id: response.user.id,
      email: response.user.email,
    });
  }, []);

  const signUp = useCallback(async (credentials: SignUpRequest) => {
    const response = await authService.signUp(credentials);

    // If session is null, email confirmation is required
    if (!response.session) {
      Alert.alert(
        'Check Your Email',
        'We sent a confirmation link to your email. Please verify your email address, then sign in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
      );
      return;
    }

    await tokenStorage.setTokens({
      accessToken: response.session.access_token,
      refreshToken: response.session.refresh_token,
    });
    api.setAuthToken(response.session.access_token);
    setUser({
      id: response.user.id,
      email: response.user.email,
    });
  }, [router]);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } finally {
      await tokenStorage.clearTokens();
      api.setAuthToken(null);
      setUser(null);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await authService.requestPasswordReset(email);
  }, []);

  const resetPassword = useCallback(async (newPassword: string) => {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

  // Refresh auth state from stored tokens
  const refreshAuth = useCallback(async () => {
    try {
      const tokens = await tokenStorage.getTokens();
      if (tokens?.accessToken) {
        api.setAuthToken(tokens.accessToken);
        setUser({ id: 'authenticated', email: '' });
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        resetPassword,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
