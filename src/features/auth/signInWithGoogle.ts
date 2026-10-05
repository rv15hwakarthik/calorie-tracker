import { router } from 'expo-router';
import Constants from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/src/lib/supabase';

import { createSessionFromUrl } from './createSessionFromUrl';
import { clearLocalSession } from './validateSession';

WebBrowser.maybeCompleteAuthSession();

export function getAuthRedirectUri() {
  const isExpoGo = Constants.appOwnership === 'expo';

  if (isExpoGo) {
    // Do not route through auth/callback — Expo Router strips the OAuth hash tokens.
    return makeRedirectUri();
  }

  return makeRedirectUri({
    scheme: 'calorie-tracker',
  });
}

export async function signInWithGoogle() {
  await clearLocalSession();

  const redirectTo = getAuthRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error('Could not start Google sign-in.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
  });

  if (result.type !== 'success') {
    throw new Error('Google sign-in was cancelled.');
  }

  const session = await createSessionFromUrl(result.url);
  if (!session) {
    throw new Error('Sign-in completed but no session was created.');
  }

  router.replace('/');
}
