import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { RootStatusBar } from '@/src/components/branding/RootStatusBar';
import { StartupScreen } from '@/src/components/branding/StartupScreen';
import { AuthProvider } from '@/src/features/auth/AuthProvider';
import { ThemeProvider } from '@/src/features/theme/ThemeProvider';
import { NetworkProvider } from '@/src/features/network/NetworkProvider';
import { configureNotifications } from '@/src/features/notifications/configureNotifications';
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

  useEffect(() => {
    void configureNotifications();
  }, []);

  if (!loaded) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <RootStatusBar variant="startup" />
          <StartupScreen />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootStatusBar />
        <NetworkProvider>
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
        </NetworkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
