import { supabase } from '@/src/lib/supabase';
import type { DailyLog } from '@/src/types/database';

export async function fetchDailyLog(logDate: string): Promise<DailyLog | null> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('log_date', logDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
