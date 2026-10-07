import type { DailyLogView } from '@/src/features/dashboard/loadDailyLogView';
import type { FoodEntry } from '@/src/types/database';

import { configureNotifications } from './configureNotifications';
import { MEAL_SLOTS, NOTIFICATION_CHANNEL_ID, NOTIFICATION_IDS, SUMMARY_SLOT } from './constants';
import { isMealSlotSatisfied } from './mealLogWindows';
import { buildSummaryBody } from './messages';
import { loadNotificationsModule } from './notificationsModule';
import { hasNotificationPermission } from './permissions';

export type ScheduleRemindersInput = {
  dailyLog: DailyLogView;
  foodEntries: FoodEntry[];
  now?: Date;
};

type PlannedNotification = {
  id: string;
  title: string;
  body: string;
  triggerAt: number;
};

let lastScheduleKey: string | null = null;

function getTriggerDateForToday(hour: number, minute: number, now: Date): Date | null {
  const triggerDate = new Date(now);
  triggerDate.setHours(hour, minute, 0, 0);

  if (triggerDate <= now) {
    return null;
  }

  return triggerDate;
}

function buildPlannedNotifications({
  dailyLog,
  foodEntries,
  now,
}: ScheduleRemindersInput & { now: Date }): PlannedNotification[] {
  const planned: PlannedNotification[] = [];

  for (const slot of MEAL_SLOTS) {
    const triggerDate = getTriggerDateForToday(slot.hour, slot.minute, now);
    if (!triggerDate || isMealSlotSatisfied(slot.id, foodEntries)) {
      continue;
    }

    planned.push({
      id: slot.id,
      title: slot.title,
      body: slot.body,
      triggerAt: triggerDate.getTime(),
    });
  }

  const summaryTriggerDate = getTriggerDateForToday(SUMMARY_SLOT.hour, SUMMARY_SLOT.minute, now);
  if (summaryTriggerDate) {
    planned.push({
      id: SUMMARY_SLOT.id,
      title: SUMMARY_SLOT.title,
      body: buildSummaryBody({
        totalCalories: dailyLog.total_calories,
        targetCalories: dailyLog.target_calories,
        entryCount: foodEntries.length,
      }),
      triggerAt: summaryTriggerDate.getTime(),
    });
  }

  return planned;
}

function buildScheduleKey(input: ScheduleRemindersInput & { now: Date }): string {
  return JSON.stringify(buildPlannedNotifications(input));
}

export async function scheduleReminders({
  dailyLog,
  foodEntries,
  now = new Date(),
}: ScheduleRemindersInput): Promise<void> {
  await configureNotifications();

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return;
  }

  const canNotify = await hasNotificationPermission();
  if (!canNotify) {
    return;
  }

  const scheduleInput = { dailyLog, foodEntries, now };
  const scheduleKey = buildScheduleKey(scheduleInput);
  if (scheduleKey === lastScheduleKey) {
    return;
  }

  const planned = buildPlannedNotifications(scheduleInput);

  await Promise.all(
    Object.values(NOTIFICATION_IDS).map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined),
    ),
  );

  for (const notification of planned) {
    await Notifications.scheduleNotificationAsync({
      identifier: notification.id,
      content: {
        title: notification.title,
        body: notification.body,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(notification.triggerAt),
        channelId: NOTIFICATION_CHANNEL_ID,
      },
    });
  }

  lastScheduleKey = scheduleKey;
}
