import { formatInTimeZone } from 'date-fns-tz';

/** Matches the timezone used in Supabase target-sync triggers. */
export const APP_TIMEZONE = 'Asia/Kolkata';

export function getTodayLogDate(): string {
  return formatInTimeZone(new Date(), APP_TIMEZONE, 'yyyy-MM-dd');
}

export function formatLogDateLabel(logDate: string): string {
  const [year, month, day] = logDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
