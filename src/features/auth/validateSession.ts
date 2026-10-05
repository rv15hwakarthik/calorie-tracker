import type { AuthError } from '@supabase/supabase-js';

import { supabase } from '@/src/lib/supabase';

export function authParamsInUrl(url: string) {
  return (
    url.includes('access_token=') ||
    url.includes('refresh_token=') ||
    url.includes('code=')
  );
}

function isInvalidSessionError(error: AuthError) {
  const message = error.message.toLowerCase();

  return (
    error.status === 401 ||
    error.status === 403 ||
    message.includes('invalid') ||
    message.includes('expired') ||
    message.includes('does not exist') ||
    message.includes('not authenticated') ||
    message.includes('user not found')
  );
}

export async function clearLocalSession() {
  await supabase.auth.signOut({ scope: 'local' });
}

export async function validateAndRefreshSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isInvalidSessionError(error)) {
      await supabase.auth.signOut({ scope: 'local' });
      return null;
    }

    return session;
  }

  if (!user) {
    await supabase.auth.signOut({ scope: 'local' });
    return null;
  }

  return session;
}
