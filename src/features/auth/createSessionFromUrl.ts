import * as QueryParams from 'expo-auth-session/build/QueryParams';

import { supabase } from '@/src/lib/supabase';

export async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  if (params.error) {
    throw new Error(params.error_description ?? params.error);
  }

  const { access_token, refresh_token } = params;

  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) {
      throw error;
    }
    return data.session;
  }

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) {
      throw error;
    }
    return data.session;
  }

  throw new Error('Auth callback did not include a session.');
}
