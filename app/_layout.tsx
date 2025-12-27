import { useEffect } from 'react';
import { Alert } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Spinner, YStack } from 'tamagui';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import config from '../tamagui.config';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { api } from '@/lib/api/client';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading, refreshAuth } = useAuth();
  const router = useRouter();

  // Handle deep links for password reset and auth callback
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;

      // Supabase sends tokens in the URL fragment (after #)
      // URL format: wardrobe-designer://reset-password#access_token=xxx&refresh_token=xxx&type=recovery
      // Or: wardrobe-designer://auth/callback#access_token=xxx&refresh_token=xxx&type=signup

      if (url.includes('access_token')) {
        // Extract fragment (everything after #)
        const fragment = url.split('#')[1];
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          if (accessToken && type === 'recovery') {
            // Password reset flow - set session and navigate
            if (!supabase) {
              Alert.alert('Error', 'Password reset not available');
              return;
            }

            try {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });

              if (error) {
                Alert.alert('Error', 'Reset link expired or invalid. Please request a new one.');
                return;
              }

              // Prompt for new password
              Alert.prompt(
                'Reset Password',
                'Enter your new password (min 6 characters)',
                async (newPassword) => {
                  if (!newPassword || newPassword.length < 6) {
                    Alert.alert('Error', 'Password must be at least 6 characters');
                    return;
                  }

                  if (!supabase) return;

                  try {
                    const { error: updateError } = await supabase.auth.updateUser({
                      password: newPassword,
                    });

                    if (updateError) {
                      Alert.alert('Error', updateError.message);
                    } else {
                      await supabase.auth.signOut();
                      Alert.alert('Success', 'Password reset! Please sign in with your new password.');
                    }
                  } catch (err) {
                    Alert.alert('Error', 'Failed to reset password');
                  }
                },
                'secure-text'
              );
            } catch (err) {
              Alert.alert('Error', 'Failed to process reset link');
            }
          } else if (accessToken && (type === 'signup' || type === 'magiclink' || type === 'email')) {
            // Email verification - handle directly here
            if (!supabase) {
              Alert.alert('Error', 'Authentication not available');
              return;
            }

            try {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });

              if (error) {
                Alert.alert('Verification Failed', 'Link may have expired. Please try again.');
                router.replace('/(auth)/sign-in');
                return;
              }

              if (data.session) {
                // Store tokens and set up auth
                await tokenStorage.setTokens({
                  accessToken: data.session.access_token,
                  refreshToken: data.session.refresh_token,
                });
                api.setAuthToken(data.session.access_token);

                // Refresh AuthContext to update user state
                await refreshAuth();

                Alert.alert('Success', 'Email verified! You are now logged in.');
              }
            } catch (err) {
              console.error('Auth callback error:', err);
              Alert.alert('Error', 'Something went wrong. Please try again.');
              router.replace('/(auth)/sign-in');
            }
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [router, refreshAuth]);

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner size="large" color="$accent" />
      </YStack>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
    InterMedium: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterSemiBold: require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme="light">
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
