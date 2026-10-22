import { Redirect, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalorieLogo } from '@/src/components/branding/CalorieLogo';
import { GoogleIcon } from '@/src/components/icons/GoogleIcon';
import { LargeButton } from '@/src/components/ui/LargeButton';
import { APP_NAME } from '@/src/constants/branding';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { getAuthRedirectUri } from '@/src/features/auth/signInWithGoogle';
import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import { getSupabaseProjectRef } from '@/src/lib/supabaseProjectRef';
import type { AppThemeColors } from '@/src/theme/colors';

/** Brand green boot screen — matches native splash / StartupScreen (not theme-dependent). */
const BRAND_BOOT_GREEN = '#1B5E20';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const themedStyles = useMemo(() => createThemedStyles(colors), [colors]);
  const { session, isLoading, signInWithGoogle } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={bootStyles.bootSafeArea} edges={['top', 'bottom']}>
        <View style={bootStyles.bootContainer}>
          <CalorieLogo size={96} outline faceColor="#FFFFFF" />
          <Text style={bootStyles.bootTitle}>{APP_NAME}</Text>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (session) {
    return <Redirect href={'/' as Href} />;
  }

  const supabaseProjectRef = __DEV__ ? getSupabaseProjectRef() : null;

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
    <SafeAreaView style={themedStyles.safeArea} edges={['top', 'bottom']}>
      <View style={themedStyles.container}>
        <View style={themedStyles.titleRow}>
          <CalorieLogo size={56} />
          <Text style={themedStyles.title}>{APP_NAME}</Text>
        </View>
        <Text style={themedStyles.subtitle}>A simple AI-powered calorie tracker</Text>
        <Text style={themedStyles.description}>
          Track protein, fiber, calories, carbs, and fat with a simple daily view
        </Text>
        <LargeButton
          label="Sign in with Google"
          icon={<GoogleIcon />}
          loading={isSubmitting}
          onPress={handleSignIn}
        />
        {errorMessage ? <Text style={themedStyles.error}>{errorMessage}</Text> : null}
        {supabaseProjectRef ? (
          <Text style={themedStyles.devBackend}>Dev backend: {supabaseProjectRef}</Text>
        ) : null}
        {supabaseProjectRef ? (
          <Text style={themedStyles.helper}>
            Redirect URI for Supabase setup:{'\n'}
            {getAuthRedirectUri()}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function createThemedStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
      flexShrink: 1,
    },
    subtitle: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '700',
      color: colors.brandDark,
    },
    description: {
      fontSize: 18,
      lineHeight: 26,
      color: colors.textMuted,
    },
    error: {
      fontSize: 16,
      color: colors.destructive,
      lineHeight: 22,
    },
    devBackend: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.brand,
      textAlign: 'center',
    },
    helper: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.textMuted,
      marginTop: 12,
    },
  });
}

const bootStyles = StyleSheet.create({
  bootSafeArea: {
    flex: 1,
    backgroundColor: BRAND_BOOT_GREEN,
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
