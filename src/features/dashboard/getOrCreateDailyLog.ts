import { supabase } from '@/src/lib/supabase';
import type { DailyLog } from '@/src/types/database';

export async function getOrCreateDailyLog(logDate: string): Promise<DailyLog> {
  const { data, error } = await supabase.rpc('get_or_create_daily_log', {
    p_log_date: logDate,
  });

  if (error) {
    throw error;
  }

  return data;
}
