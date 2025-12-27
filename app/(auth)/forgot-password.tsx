import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, Text, XStack } from 'tamagui';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { PageContainer } from '@/components/layout/PageContainer';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAuth } from '@/lib/auth/AuthContext';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { requestPasswordReset } = useAuth();
  const router = useRouter();

  const handleResetRequest = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      // Check for rate limiting (429 Too Many Requests)
      if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
        Alert.alert(
          'Too Many Requests',
          'You have requested too many password resets. Please wait a few minutes before trying again.'
        );
      } else {
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'An error occurred'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <PageContainer>
        <YStack flex={1} justifyContent="center" padding="$6" gap="$4">
          <YStack gap="$2" marginBottom="$6">
            <Text
              fontSize={28}
              fontWeight="700"
              color="$text"
              fontFamily="$heading"
            >
              Check your email
            </Text>
            <Text fontSize={16} color="$textSecondary" fontFamily="$body">
              We've sent a password reset link to {email}
            </Text>
          </YStack>

          <Text fontSize={14} color="$textMuted" textAlign="center">
            Didn't receive the email? Check your spam folder or try again.
          </Text>

          <AuthButton onPress={() => setSent(false)}>
            <Text color="$background" fontSize={16} fontWeight="600">
              Try Again
            </Text>
          </AuthButton>

          <XStack justifyContent="center" marginTop="$4">
            <Pressable onPress={() => router.back()}>
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

  return (
    <PageContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <YStack flex={1} justifyContent="center" padding="$6" gap="$4">
            <YStack gap="$2" marginBottom="$6">
              <Text
                fontSize={28}
                fontWeight="700"
                color="$text"
                fontFamily="$heading"
              >
                Reset password
              </Text>
              <Text fontSize={16} color="$textSecondary" fontFamily="$body">
                Enter your email to receive a reset link
              </Text>
            </YStack>

            <YStack gap="$4">
              <AuthInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
              />

              <AuthButton onPress={handleResetRequest} loading={loading}>
                <Text color="$background" fontSize={16} fontWeight="600">
                  Send Reset Link
                </Text>
              </AuthButton>
            </YStack>

            <XStack justifyContent="center" marginTop="$4">
              <Pressable onPress={() => router.back()}>
                <XStack alignItems="center" gap="$2">
                  <ArrowLeft size={16} color="#4A4A4A" />
                  <Text color="$textSecondary" fontSize={14}>
                    Back to Sign In
                  </Text>
                </XStack>
              </Pressable>
            </XStack>
          </YStack>
      </KeyboardAvoidingView>
    </PageContainer>
  );
}
