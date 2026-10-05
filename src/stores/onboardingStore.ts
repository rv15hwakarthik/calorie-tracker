import { create } from 'zustand';

import type { MacroTargets } from '@/src/lib/macros';
import type { ActivityLevel, Gender } from '@/src/types/database';

type OnboardingState = {
  age: number;
  gender: Gender | null;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel | null;
  targets: MacroTargets | null;
  setAge: (age: number) => void;
  setGender: (gender: Gender) => void;
  setHeightCm: (heightCm: number) => void;
  setWeightKg: (weightKg: number) => void;
  setActivityLevel: (activityLevel: ActivityLevel) => void;
  setTargets: (targets: MacroTargets) => void;
  reset: () => void;
};

const initialState = {
  age: 30,
  gender: null as Gender | null,
  heightCm: 170,
  weightKg: 70,
  activityLevel: null as ActivityLevel | null,
  targets: null as MacroTargets | null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setAge: (age) => set({ age }),
  setGender: (gender) => set({ gender }),
  setHeightCm: (heightCm) => set({ heightCm }),
  setWeightKg: (weightKg) => set({ weightKg }),
  setActivityLevel: (activityLevel) => set({ activityLevel }),
  setTargets: (targets) => set({ targets }),
  reset: () => set(initialState),
}));
