import type { Session } from '@supabase/supabase-js';

import type { Profile } from '@/src/types/database';

export function getFirstName(session: Session | null, profile: Profile | null): string | null {
  const fullName =
    profile?.full_name ??
    (session?.user.user_metadata?.full_name as string | undefined) ??
    (session?.user.user_metadata?.name as string | undefined);

  if (!fullName?.trim()) {
    return null;
  }

  return fullName.trim().split(/\s+/)[0] ?? null;
}
