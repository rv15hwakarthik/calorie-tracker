import { getDeviceTimeZone } from '@/src/lib/dates';
import { supabase } from '@/src/lib/supabase';
import { toProfileTargetFields, type MacroTargets } from '@/src/lib/macros';
import type { ActivityLevel, Gender, Profile } from '@/src/types/database';

export type OnboardingSubmission = {
  userId: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  targets: MacroTargets;
};

export async function submitOnboarding(input: OnboardingSubmission): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      age: input.age,
      gender: input.gender,
      height_cm: input.heightCm,
      weight_kg: input.weightKg,
      activity_level: input.activityLevel,
      ...toProfileTargetFields(input.targets),
      timezone: getDeviceTimeZone(),
      onboarding_complete: true,
    })
    .eq('id', input.userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
