import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, Text, XStack } from 'tamagui';
import { PageContainer } from '@/components/layout/PageContainer';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAuth } from '@/lib/auth/AuthContext';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
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

    if (loading) return; // Prevent double submission

    setLoading(true);
    try {
      await signUp({ email: trimmedEmail, password: trimmedPassword });
    } catch (error: unknown) {
      let message = 'An error occurred';
      if (error && typeof error === 'object') {
        const err = error as { message?: string; details?: { detail?: string } };
        message = err.details?.detail || err.message || message;
      }
      Alert.alert('Sign Up Failed', message);
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
        <YStack flex={1} justifyContent="center" padding="$6" gap="$4">
            <YStack gap="$2" marginBottom="$6">
              <Text
                fontSize={28}
                fontWeight="700"
                color="$text"
                fontFamily="$heading"
              >
                Create account
              </Text>
              <Text fontSize={16} color="$textSecondary" fontFamily="$body">
                Sign up to get started
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
                autoComplete="new-password"
              />

              <AuthInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
              />

              <AuthButton onPress={handleSignUp} loading={loading}>
                <Text color="$background" fontSize={16} fontWeight="600">
                  Sign Up
                </Text>
              </AuthButton>
            </YStack>

            <XStack justifyContent="center" gap="$2" marginTop="$6">
              <Text color="$textSecondary" fontSize={14}>
                Already have an account?
              </Text>
              <Pressable onPress={() => router.back()}>
                <Text color="$accent" fontSize={14} fontWeight="600">
                  Sign in
                </Text>
              </Pressable>
            </XStack>
          </YStack>
      </KeyboardAvoidingView>
    </PageContainer>
  );
}
