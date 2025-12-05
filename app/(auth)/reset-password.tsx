import { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, Text, ScrollView, Spinner, XStack } from 'tamagui';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { supabase } from '@/lib/supabase/client';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
  }>();

  // Set up Supabase session from the tokens
  useEffect(() => {
    async function setupSession() {
      if (!supabase) {
        setError('Password reset is not available');
        return;
      }

      const { access_token, refresh_token } = params;

      if (!access_token) {
        setError('No reset link detected. Please request a new password reset.');
        return;
      }

      try {
        // Set the Supabase session with recovery tokens
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || '',
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Reset link expired or invalid. Please request a new one.');
        } else {
          setSessionReady(true);
        }
      } catch (err) {
        console.error('Failed to set up session:', err);
        setError('Failed to process reset link. Please try again.');
      }
    }

    setupSession();
  }, [params]);

  const handleResetPassword = async () => {
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!supabase) {
      Alert.alert('Error', 'Password reset is not available');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: trimmedPassword,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        // Sign out after password reset to clear the recovery session
        await supabase.auth.signOut();
        Alert.alert('Success', 'Your password has been reset. Please sign in with your new password.', [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/sign-in'),
          },
        ]);
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  // Error state
  if (error) {
    return (
      <PageContainer>
        <YStack flex={1} justifyContent="center" padding="$6" gap="$6">
          <YStack gap="$2">
            <Text
              fontSize={28}
              fontWeight="700"
              color="$text"
              fontFamily="$heading"
            >
              Reset Password
            </Text>
            <Text fontSize={16} color="$error" fontFamily="$body">
              {error}
            </Text>
          </YStack>

          <AuthButton onPress={() => router.replace('/(auth)/forgot-password')}>
            <Text color="$background" fontSize={16} fontWeight="600">
              Request New Reset Link
            </Text>
          </AuthButton>

          <XStack justifyContent="center" marginTop="$4">
            <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
              <XStack alignItems="center" gap="$2">
                <ArrowLeft size={16} color="#4A4A4A" />
                <Text color="$textSecondary" fontSize={14}>
                  Back to Sign In
                </Text>
              </XStack>
            </Pressable>
          </XStack>
        </YStack>
      </PageContainer>
    );
  }

  // Loading state while setting up session
  if (!sessionReady) {
    return (
      <PageContainer>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Spinner size="large" color="$accent" />
          <Text fontSize={16} color="$textSecondary">
            Processing reset link...
          </Text>
        </YStack>
      </PageContainer>
    );
  }

  // Password reset form
  return (
    <PageContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack flex={1} justifyContent="center" padding="$6" gap="$4">
            <YStack gap="$2" marginBottom="$6">
              <Text
                fontSize={28}
                fontWeight="700"
                color="$text"
                fontFamily="$heading"
              >
                Set new password
              </Text>
              <Text fontSize={16} color="$textSecondary" fontFamily="$body">
                Enter your new password below
              </Text>
            </YStack>

            <YStack gap="$4">
              <AuthInput
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />

              <AuthInput
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
              />

              <AuthButton onPress={handleResetPassword} loading={loading}>
                <Text color="$background" fontSize={16} fontWeight="600">
                  Reset Password
                </Text>
              </AuthButton>
            </YStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageContainer>
  );
}
