import { Redirect, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalorieLogo } from '@/src/components/branding/CalorieLogo';
import { GoogleIcon } from '@/src/components/icons/GoogleIcon';
import { LargeButton } from '@/src/components/ui/LargeButton';
import { APP_NAME } from '@/src/constants/branding';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { getAuthRedirectUri } from '@/src/features/auth/signInWithGoogle';

export default function LoginScreen() {
  const { session, isLoading, signInWithGoogle } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.bootSafeArea} edges={['top', 'bottom']}>
        <View style={styles.bootContainer}>
          <CalorieLogo size={96} outline faceColor="#FFFFFF" />
          <Text style={styles.bootTitle}>{APP_NAME}</Text>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (session) {
    return <Redirect href={'/' as Href} />;
  }

  const handleSignIn = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not sign in with Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <CalorieLogo size={56} />
          <Text style={styles.title}>{APP_NAME}</Text>
        </View>
        <Text style={styles.subtitle}>A simple AI-powered calorie tracker</Text>
        <Text style={styles.description}>
          Track protein, fiber, calories, carbs, and fat with a simple daily view
        </Text>
        <LargeButton
          label="Sign in with Google"
          icon={<GoogleIcon />}
          loading={isSubmitting}
          onPress={handleSignIn}
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Text style={styles.helper}>Redirect URI for Supabase setup:{'\n'}{getAuthRedirectUri()}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111111',
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: '#1B5E20',
  },
  description: {
    fontSize: 18,
    lineHeight: 26,
    color: '#444444',
  },
  error: {
    fontSize: 16,
    color: '#B00020',
    lineHeight: 22,
  },
  helper: {
    fontSize: 12,
    lineHeight: 18,
    color: '#777777',
    marginTop: 12,
  },
  bootSafeArea: {
    flex: 1,
    backgroundColor: '#1B5E20',
  },
  bootContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  bootTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
