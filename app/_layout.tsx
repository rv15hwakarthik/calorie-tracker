import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { StartupScreen } from '@/src/components/branding/StartupScreen';
import { AuthProvider } from '@/src/features/auth/AuthProvider';
import { queryClient } from '@/src/lib/queryClient';

export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded) return;

    SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  if (!loaded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <StartupScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/callback" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal', headerShown: true, title: 'Info' }}
            />
          </Stack>
        </QueryClientProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
