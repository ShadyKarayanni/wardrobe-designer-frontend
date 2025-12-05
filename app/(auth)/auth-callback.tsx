import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, Text, Spinner } from 'tamagui';
import { PageContainer } from '@/components/layout/PageContainer';
import { AuthButton } from '@/components/auth/AuthButton';
import { supabase } from '@/lib/supabase/client';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { api } from '@/lib/api/client';

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState('Verifying your email...');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    type?: string;
  }>();

  useEffect(() => {
    handleAuthCallback();
  }, [params]);

  const handleAuthCallback = async () => {
    if (!supabase) {
      setError('Authentication is not available');
      return;
    }

    const { access_token, refresh_token, type } = params;

    if (!access_token) {
      setError('Invalid verification link');
      setTimeout(() => router.replace('/(auth)/sign-in'), 2000);
      return;
    }

    try {
      // Set the Supabase session with the tokens
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || '',
      });

      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Verification failed. Link may have expired.');
        setTimeout(() => router.replace('/(auth)/sign-in'), 2000);
        return;
      }

      if (data.session) {
        // Store tokens for our app's auth system
        await tokenStorage.setTokens({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        });
        api.setAuthToken(data.session.access_token);

        setStatus('Email verified! Logging you in...');

        // Navigate to main app
        setTimeout(() => router.replace('/(app)'), 1500);
      } else {
        setError('Verification failed. Please try again.');
        setTimeout(() => router.replace('/(auth)/sign-in'), 2000);
      }
    } catch (err) {
      console.error('Auth callback error:', err);
      setError('Something went wrong. Please try again.');
      setTimeout(() => router.replace('/(auth)/sign-in'), 2000);
    }
  };

  if (error) {
    return (
      <PageContainer>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6" gap="$6">
          <Text fontSize={18} color="$error" textAlign="center">
            {error}
          </Text>
          <AuthButton onPress={() => router.replace('/(auth)/sign-in')}>
            <Text color="$background" fontSize={16} fontWeight="600">
              Go to Sign In
            </Text>
          </AuthButton>
        </YStack>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
        <Spinner size="large" color="$accent" />
        <Text fontSize={16} color="$textSecondary" textAlign="center">
          {status}
        </Text>
      </YStack>
    </PageContainer>
  );
}
