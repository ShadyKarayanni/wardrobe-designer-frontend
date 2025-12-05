import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { YStack, Text, XStack, ScrollView } from 'tamagui';
import { PageContainer } from '@/components/layout/PageContainer';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAuth } from '@/lib/auth/AuthContext';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (loading) return; // Prevent double submission

    setLoading(true);
    try {
      await signIn({ email: trimmedEmail, password: trimmedPassword });
    } catch (error: unknown) {
      let message = 'An error occurred';
      if (error && typeof error === 'object') {
        const err = error as { message?: string; details?: { detail?: string } };
        message = err.details?.detail || err.message || message;
      }
      Alert.alert('Sign In Failed', message);
    } finally {
      setLoading(false);
    }
  };

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
                Welcome back
              </Text>
              <Text fontSize={16} color="$textSecondary" fontFamily="$body">
                Sign in to your account
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

              <AuthInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />

              <AuthButton onPress={handleSignIn} loading={loading}>
                <Text color="$background" fontSize={16} fontWeight="600">
                  Sign In
                </Text>
              </AuthButton>
            </YStack>

            <XStack justifyContent="center" marginTop="$4">
              <Link href="/(auth)/forgot-password" asChild>
                <Text color="$textSecondary" fontSize={14}>
                  Forgot password?
                </Text>
              </Link>
            </XStack>

            <XStack justifyContent="center" gap="$2" marginTop="$6">
              <Text color="$textSecondary" fontSize={14}>
                Don't have an account?
              </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Text color="$accent" fontSize={14} fontWeight="600">
                  Sign up
                </Text>
              </Link>
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </PageContainer>
  );
}
