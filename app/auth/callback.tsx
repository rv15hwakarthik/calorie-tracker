import { Redirect, type Href } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalorieLogo } from '@/src/components/branding/CalorieLogo';
import { createSessionFromUrl } from '@/src/features/auth/createSessionFromUrl';
import { authParamsInUrl } from '@/src/features/auth/validateSession';

const TIMEOUT_MS = 15000;

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let finished = false;

    const succeed = () => {
      if (!isMounted || finished) return;
      finished = true;
      setStatus('success');
    };

    const fail = (message: string) => {
      if (!isMounted || finished) return;
      finished = true;
      setStatus('error');
      setErrorMessage(message);
    };

    async function completeAuth() {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && authParamsInUrl(initialUrl)) {
          await createSessionFromUrl(initialUrl);
          succeed();
          return;
        }

        fail('This redirect URL is outdated. Use the URI shown on the login screen in Supabase.');
      } catch (error) {
        fail(error instanceof Error ? error.message : 'Could not complete sign-in.');
      }
    }

    const timeout = setTimeout(() => {
      fail('Sign-in timed out. Try again.');
    }, TIMEOUT_MS);

    void completeAuth().finally(() => clearTimeout(timeout));

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  if (status === 'success') {
    return <Redirect href={'/' as Href} />;
  }

  if (status === 'error') {
    return <Redirect href={'/(auth)/login' as Href} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CalorieLogo size={96} outline faceColor="#FFFFFF" />
      <Text style={styles.title}>Calorie Tracker</Text>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
      <Text style={styles.text}>Finishing sign-in…</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  spinner: {
    marginTop: 8,
  },
  text: {
    fontSize: 18,
    color: '#E8F5E9',
    textAlign: 'center',
  },
  error: {
    fontSize: 16,
    color: '#FFCDD2',
    textAlign: 'center',
    marginTop: 8,
  },
});
