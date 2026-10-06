export function formatMacroValue(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '0';
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Ratio at which we show an over-target alert (120%). */
export const OVER_TARGET_THRESHOLD = 1.2;

export type MacroProgressState = 'none' | 'under' | 'alert';

export function getMacroProgressState(
  consumed: number,
  target: number | null | undefined,
): MacroProgressState {
  if (!target || target <= 0) {
    return 'none';
  }

  if (consumed / target >= OVER_TARGET_THRESHOLD) {
    return 'alert';
  }

  return 'under';
}

export function getTargetPercentage(
  consumed: number,
  target: number | null | undefined,
): number | null {
  if (!target || target <= 0) {
    return null;
  }

  return Math.round((consumed / target) * 100);
}

export function getMacroAlertMessage(
  consumed: number,
  target: number | null | undefined,
): string | null {
  if (getMacroProgressState(consumed, target) !== 'alert') {
    return null;
  }

  const targetPercentage = getTargetPercentage(consumed, target);
  return targetPercentage != null ? `Over target · ${targetPercentage}%` : 'Over target';
}

export function getProgress(consumed: number, target: number | null | undefined): number {
  if (!target || target <= 0) {
    return 0;
  }

  return Math.min(consumed / target, 1);
}

export type MacroStat = {
  key: string;
  label: string;
  consumed: number;
  target: number | null;
  unit: string;
  emphasized?: boolean;
};

export function buildMacroStats(dailyLog: {
  total_protein_g: number;
  total_fiber_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_calories: number;
  target_protein_g: number | null;
  target_fiber_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
  target_calories: number | null;
}): MacroStat[] {
  return [
    {
      key: 'protein',
      label: 'Protein',
      consumed: dailyLog.total_protein_g,
      target: dailyLog.target_protein_g,
      unit: 'g',
      emphasized: true,
    },
    {
      key: 'fiber',
      label: 'Fiber',
      consumed: dailyLog.total_fiber_g,
      target: dailyLog.target_fiber_g,
      unit: 'g',
      emphasized: true,
    },
    {
      key: 'calories',
      label: 'Calories',
      consumed: dailyLog.total_calories,
      target: dailyLog.target_calories,
      unit: 'kcal',
    },
    {
      key: 'carbs',
      label: 'Carbs',
      consumed: dailyLog.total_carbs_g,
      target: dailyLog.target_carbs_g,
      unit: 'g',
    },
    {
      key: 'fat',
      label: 'Fat',
      consumed: dailyLog.total_fat_g,
      target: dailyLog.target_fat_g,
      unit: 'g',
    },
  ];
}
