import { getDeviceTimeZone } from '@/src/lib/dates';
import { supabase } from '@/src/lib/supabase';

export async function syncProfileTimezone(userId: string, timezone = getDeviceTimeZone()): Promise<void> {
  const { error } = await supabase.from('profiles').update({ timezone }).eq('id', userId);

  if (error) {
    throw error;
  }
}
