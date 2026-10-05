import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/src/lib/supabase';
import type { Profile } from '@/src/types/database';

import { useOnboardingStore } from '@/src/stores/onboardingStore';

import { fetchProfile } from './fetchProfile';
import { signInWithGoogle as startGoogleSignIn } from './signInWithGoogle';
import { validateAndRefreshSession } from './validateSession';

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isRefreshingProfile: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) {
      setProfile(null);
      return null;
    }

    setIsRefreshingProfile(true);
    try {
      const nextProfile = await fetchProfile(session.user.id);
      setProfile(nextProfile);
      return nextProfile;
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

      setSession(localSession);
      setIsLoading(false);

      if (!localSession) {
        return;
      }

      const validatedSession = await validateAndRefreshSession();
      if (!isMounted) return;
      setSession(validatedSession);
    }

    bootstrapAuth().catch(() => {
      if (!isMounted) return;
      setSession(null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
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

    refreshProfile().catch(() => {
      setProfile(null);
    });
  }, [session?.user.id, refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isLoading,
      isRefreshingProfile,
      signInWithGoogle: async () => {
        await startGoogleSignIn();
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setSession(null);
        setProfile(null);
        useOnboardingStore.getState().reset();
      },
      refreshProfile,
    }),
    [session, profile, isLoading, isRefreshingProfile, refreshProfile],
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
