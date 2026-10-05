import { supabase } from '@/src/lib/supabase';
import type { FoodEntry } from '@/src/types/database';

export async function fetchFoodEntries(dailyLogId: string): Promise<FoodEntry[]> {
  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('daily_log_id', dailyLogId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
