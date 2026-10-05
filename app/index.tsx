import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { StartupScreen } from '@/src/components/branding/StartupScreen';
import { useAuth } from '@/src/features/auth/AuthProvider';

const STARTUP_MIN_MS = 1400;

export default function Index() {
  const { session, profile, isLoading } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

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

  if (!profile?.onboarding_complete) {
    return <Redirect href={'/(onboarding)/age-gender' as Href} />;
  }

  return <Redirect href="/(tabs)" />;
}
