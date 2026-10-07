import { getTargetPercentage, OVER_TARGET_THRESHOLD } from '@/src/features/dashboard/macroStats';

type SummaryInput = {
  totalCalories: number;
  targetCalories: number | null;
  entryCount: number;
};

// TODO: Make this more protein and fiber focused. 
export function buildSummaryBody({ totalCalories, targetCalories, entryCount }: SummaryInput): string {
  if (entryCount === 0) {
    return 'Logging even one meal builds awareness and keeps you on track. Start tomorrow, you’ve got this!';
  }

  const percentage = getTargetPercentage(totalCalories, targetCalories);

  if (!targetCalories || targetCalories <= 0 || percentage == null) {
    return `You logged ${entryCount} item${entryCount === 1 ? '' : 's'} today (${totalCalories.toLocaleString()} kcal).`;
  }

  const ratio = totalCalories / targetCalories;

  if (ratio >= OVER_TARGET_THRESHOLD) {
    return `You went ${percentage - 100}% over target. Smaller portions tomorrow will help you get back on track.`;
  }

  if (percentage >= 80 && percentage <= 110) {
    return 'You met your targets today. Stay consistent and keep hitting them tomorrow.';
  }

  if (percentage < 80) {
    return `You met just ${percentage}% of your target. Room to fuel up. Aim for a stronger day tomorrow.`;
  }

  return `You went ${percentage - 100}% over target. A little over today. Fresh start tomorrow.`;
}
