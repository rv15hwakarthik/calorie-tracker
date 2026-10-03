import type { ActivityLevel, Gender } from '@/src/types/database';

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Midpoint of 1.0–1.2 g/kg range */
export const PROTEIN_G_PER_KG = 1.1;

/** Midpoint of 25–30 g daily fiber target */
export const DEFAULT_FIBER_G = 28;

/**
 * Share of calories *after protein* allocated to fat (not 30% of total TDEE).
 * We lock protein first (g/kg), then split what's left: ~30% fat, ~70% carbs.
 * Using 30% of total TDEE instead would ignore protein already "spent" and skew the split.
 */
export const FAT_CALORIE_SHARE = 0.3;

/** Atwater factors: kcal per gram (used to convert calories ↔ grams) */
const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARB = 4;
const KCAL_PER_G_FAT = 9;

export type MacroTargets = {
  bmr: number;
  tdee: number;
  targetProteinG: number;
  targetFiberG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetCalories: number;
};

export type TargetCalculationInput = {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
};

function round(value: number): number {
  return Math.round(value);
}

export function calculateBMR(input: Pick<TargetCalculationInput, 'age' | 'gender' | 'heightCm' | 'weightKg'>): number {
  const { age, gender, heightCm, weightKg } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (gender === 'male') {
    return base + 5;
  }

  if (gender === 'female') {
    return base - 161;
  }

  // MVP simplification for "other"
  return (base + 5 + (base - 161)) / 2;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activityLevel];
}

export function calculateTargets(input: TargetCalculationInput): MacroTargets {
  const bmr = calculateBMR(input);
  const tdee = calculateTDEE(bmr, input.activityLevel);

  // Step 1: protein from body weight (priority macro for this app)
  const targetProteinG = round(input.weightKg * PROTEIN_G_PER_KG);
  const targetFiberG = DEFAULT_FIBER_G;
  const proteinCalories = targetProteinG * KCAL_PER_G_PROTEIN;

  // Step 2: whatever TDEE is left after protein
  const remainingCalories = Math.max(tdee - proteinCalories, 0);

  // Step 3: split remainder ~30% fat / ~70% carbs (carbs fill the rest)
  const fatCalories = remainingCalories * FAT_CALORIE_SHARE;
  const carbCalories = remainingCalories - fatCalories;

  // Step 4: calories → grams via Atwater factors (fat ≈ 9 kcal/g, carbs ≈ 4 kcal/g)
  const targetFatG = round(fatCalories / KCAL_PER_G_FAT);
  const targetCarbsG = round(carbCalories / KCAL_PER_G_CARB);
  const targetCalories = round(tdee);

  return {
    bmr: round(bmr),
    tdee: round(tdee),
    targetProteinG,
    targetFiberG,
    targetCarbsG,
    targetFatG,
    targetCalories,
  };
}

/** Map app-level targets to profiles / daily_logs column names */
export function toProfileTargetFields(targets: MacroTargets) {
  return {
    target_protein_g: targets.targetProteinG,
    target_fiber_g: targets.targetFiberG,
    target_carbs_g: targets.targetCarbsG,
    target_fat_g: targets.targetFatG,
    target_calories: targets.targetCalories,
  };
}
