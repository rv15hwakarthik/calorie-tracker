import { useOnboardingStore } from '@/src/stores/onboardingStore';
import type { ActivityLevel, Gender, Profile } from '@/src/types/database';

export function seedOnboardingFromProfile(profile: Profile) {
  const store = useOnboardingStore.getState();
  store.reset();

  if (profile.age != null) {
    store.setAge(profile.age);
  }

  if (profile.gender) {
    store.setGender(profile.gender as Gender);
  }

  if (profile.height_cm != null) {
    store.setHeightCm(Number(profile.height_cm));
  }

  if (profile.weight_kg != null) {
    store.setWeightKg(Number(profile.weight_kg));
  }

  if (profile.activity_level) {
    store.setActivityLevel(profile.activity_level as ActivityLevel);
  }
}
