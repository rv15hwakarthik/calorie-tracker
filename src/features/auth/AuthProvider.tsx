import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/src/lib/supabase';
import type { Profile } from '@/src/types/database';

import { useOnboardingStore } from '@/src/stores/onboardingStore';

import { getDeviceTimeZone } from '@/src/lib/dates';
import { syncProfileTimezone } from '@/src/features/profile/syncProfileTimezone';

import { fetchProfile } from './fetchProfile';
import { signInWithGoogle as startGoogleSignIn } from './signInWithGoogle';
import { validateAndRefreshSession } from './validateSession';

async function ensureProfileTimezone(userId: string, profile: Profile): Promise<Profile> {
  const deviceTimezone = getDeviceTimeZone();
  if ((profile.timezone ?? 'UTC') === deviceTimezone) {
    return profile;
  }

  try {
    await syncProfileTimezone(userId, deviceTimezone);
    return { ...profile, timezone: deviceTimezone };
  } catch {
    return profile;
  }
}

function getProfileLoadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong loading your account. Please try again.';
}

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isRefreshingProfile: boolean;
  profileLoadError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  retryProfileLoad: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) {
      setProfile(null);
      return null;
    }

    setIsRefreshingProfile(true);
    try {
      const nextProfile = await fetchProfile(session.user.id);
      if (!nextProfile) {
        setProfile(null);
        return null;
      }

      const syncedProfile = await ensureProfileTimezone(session.user.id, nextProfile);
      setProfile(syncedProfile);
      return syncedProfile;
    } finally {
      setIsRefreshingProfile(false);
    }
  }, [session?.user.id]);

  const retryProfileLoad = useCallback(async () => {
    if (!session?.user.id) {
      return;
    }

    setProfileLoadError(null);
    setIsRefreshingProfile(true);

    try {
      const nextProfile = await fetchProfile(session.user.id);
      if (!nextProfile) {
        setProfile(null);
        return;
      }

      const syncedProfile = await ensureProfileTimezone(session.user.id, nextProfile);
      setProfile(syncedProfile);
    } catch (error) {
      setProfileLoadError(getProfileLoadErrorMessage(error));
      setProfile(null);
    } finally {
      setIsRefreshingProfile(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const {
        data: { session: localSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!localSession) {
        setSession(null);
        setProfile(null);
        setProfileLoadError(null);
        setIsLoading(false);
        return;
      }

      const validatedSession = await validateAndRefreshSession();
      if (!isMounted) return;

      if (!validatedSession) {
        setSession(null);
        setProfile(null);
        setProfileLoadError(null);
        setIsLoading(false);
        return;
      }

      setSession(validatedSession);
    }

    bootstrapAuth().catch(() => {
      if (!isMounted) return;
      setSession(null);
      setProfile(null);
      setProfileLoadError(null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession) {
        setProfile(null);
        setProfileLoadError(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      setProfile(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setProfileLoadError(null);

    refreshProfile()
      .catch((error) => {
        if (isMounted) {
          setProfile(null);
          setProfileLoadError(getProfileLoadErrorMessage(error));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session?.user.id, refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isLoading,
      isRefreshingProfile,
      profileLoadError,
      signInWithGoogle: async () => {
        await startGoogleSignIn();
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setSession(null);
        setProfile(null);
        setProfileLoadError(null);
        useOnboardingStore.getState().reset();
      },
      refreshProfile,
      retryProfileLoad,
    }),
    [session, profile, isLoading, isRefreshingProfile, profileLoadError, refreshProfile, retryProfileLoad],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
