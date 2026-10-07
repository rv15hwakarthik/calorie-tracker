import type { FoodEntry } from '@/src/types/database';

import {
  BREAKFAST_REMINDER_HOUR,
  DINNER_REMINDER_HOUR,
  LUNCH_REMINDER_HOUR,
} from './constants';

export function getEntryHour(entry: FoodEntry): number {
  return new Date(entry.created_at).getHours();
}

export function isBreakfastLogged(entries: FoodEntry[]): boolean {
  return entries.some((entry) => getEntryHour(entry) < BREAKFAST_REMINDER_HOUR);
}

export function isLunchLogged(entries: FoodEntry[]): boolean {
  return entries.some((entry) => {
    const hour = getEntryHour(entry);
    return hour > BREAKFAST_REMINDER_HOUR && hour < LUNCH_REMINDER_HOUR;
  });
}

export function isDinnerLogged(entries: FoodEntry[]): boolean {
  return entries.some((entry) => {
    const hour = getEntryHour(entry);
    return hour > LUNCH_REMINDER_HOUR && hour < DINNER_REMINDER_HOUR;
  });
}

export function isMealSlotSatisfied(
  slotId: string,
  entries: FoodEntry[],
): boolean {
  switch (slotId) {
    case 'calorie-meal-breakfast':
      return isBreakfastLogged(entries);
    case 'calorie-meal-lunch':
      return isLunchLogged(entries);
    case 'calorie-meal-dinner':
      return isDinnerLogged(entries);
    default:
      return false;
  }
}
