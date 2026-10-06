import { fetchProfile } from '@/src/features/auth/fetchProfile';
import { supabase } from '@/src/lib/supabase';
import type { DailyLog } from '@/src/types/database';

import { isTodayLogDate } from '@/src/lib/dates';

import { fetchDailyLog } from './fetchDailyLog';
import { getOrCreateDailyLog } from './getOrCreateDailyLog';

export type DailyLogView = DailyLog & {
  isPersisted: boolean;
};

export async function loadDailyLogView(logDate: string): Promise<DailyLogView> {
  const existing = await fetchDailyLog(logDate);

  if (existing) {
    return { ...existing, isPersisted: true };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  const profile = await fetchProfile(user.id);

  if (!profile) {
    throw new Error('Profile not found');
  }

  return {
    id: '',
    user_id: user.id,
    log_date: logDate,
    total_protein_g: 0,
    total_fiber_g: 0,
    total_carbs_g: 0,
    total_fat_g: 0,
    total_calories: 0,
    target_protein_g: profile.target_protein_g,
    target_fiber_g: profile.target_fiber_g,
    target_carbs_g: profile.target_carbs_g,
    target_fat_g: profile.target_fat_g,
    target_calories: profile.target_calories,
    created_at: '',
    updated_at: '',
    isPersisted: false,
  };
}

export async function queryDailyLog(logDate: string): Promise<DailyLogView> {
  if (isTodayLogDate(logDate)) {
    const log = await getOrCreateDailyLog(logDate);
    return { ...log, isPersisted: true };
  }

  return loadDailyLogView(logDate);
}
