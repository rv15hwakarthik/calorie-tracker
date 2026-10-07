import { addDays, format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/** IANA timezone from the device (e.g. Asia/Kolkata, America/New_York). */
export function getDeviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function getTodayLogDate(timeZone = getDeviceTimeZone()): string {
  return formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd');
}

export function isTodayLogDate(logDate: string): boolean {
  return logDate === getTodayLogDate();
}

export function isYesterdayLogDate(logDate: string): boolean {
  return logDate === shiftLogDate(getTodayLogDate(), -1);
}

export function compareLogDates(left: string, right: string): number {
  return left.localeCompare(right);
}

export function shiftLogDate(logDate: string, days: number): string {
  const date = parseISO(logDate);
  return format(addDays(date, days), 'yyyy-MM-dd');
}

export function clampLogDateToToday(logDate: string): string {
  const today = getTodayLogDate();
  return compareLogDates(logDate, today) > 0 ? today : logDate;
}

export function formatLogDateLabel(logDate: string): string {
  const date = parseISO(logDate);

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatLogDateHeader(logDate: string): string {
  if (isTodayLogDate(logDate)) {
    return 'Today';
  }

  if (isYesterdayLogDate(logDate)) {
    return 'Yesterday';
  }

  return formatLogDateLabel(logDate);
}
