import { toProfileTargetFields, type MacroTargets } from '@/src/lib/macros';
import { supabase } from '@/src/lib/supabase';
import type { Profile } from '@/src/types/database';

export async function updateProfileTargets(
  userId: string,
  targets: Pick<
    MacroTargets,
    'targetProteinG' | 'targetFiberG' | 'targetCarbsG' | 'targetFatG' | 'targetCalories'
  >,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(toProfileTargetFields({ ...targets, bmr: 0, tdee: 0 }))
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
