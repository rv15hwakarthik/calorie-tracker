import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { BootstrapErrorScreen } from '@/src/components/branding/BootstrapErrorScreen';
import { StartupScreen } from '@/src/components/branding/StartupScreen';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { useNetworkStatus } from '@/src/features/network/NetworkProvider';

const STARTUP_MIN_MS = 1400;

export default function Index() {
  const {
    session,
    profile,
    isLoading,
    isRefreshingProfile,
    profileLoadError,
    retryProfileLoad,
  } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), STARTUP_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  const isBootstrapping = !minTimeElapsed || isLoading;

  if (isBootstrapping) {
    return <StartupScreen />;
  }

  if (!session) {
    return <Redirect href={'/(auth)/login' as Href} />;
  }

  if (!profile && !isOnline) {
    return (
      <BootstrapErrorScreen
        title="You are offline"
        message="Please check your internet connection and try again."
        onRetry={() => {
          void retryProfileLoad();
        }}
        retrying={isRefreshingProfile}
      />
    );
  }

  if (profileLoadError) {
    return (
      <BootstrapErrorScreen
        title="Couldn't load your account"
        message={profileLoadError}
        onRetry={() => {
          void retryProfileLoad();
        }}
        retrying={isRefreshingProfile}
      />
    );
  }

  if (!profile?.onboarding_complete) {
    return <Redirect href={'/(onboarding)/age-gender' as Href} />;
  }

  return <Redirect href="/(tabs)" />;
}
