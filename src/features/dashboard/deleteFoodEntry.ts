import { supabase } from '@/src/lib/supabase';

export async function deleteFoodEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('food_entries').delete().eq('id', entryId);

  if (error) {
    throw error;
  }
}
