export const NOTIFICATION_CHANNEL_ID = 'meal-reminders';

export const NOTIFICATION_IDS = {
  breakfast: 'calorie-meal-breakfast',
  lunch: 'calorie-meal-lunch',
  dinner: 'calorie-meal-dinner',
  summary: 'calorie-daily-summary',
} as const;

export const BREAKFAST_REMINDER_HOUR = 11;
export const LUNCH_REMINDER_HOUR = 15;
export const DINNER_REMINDER_HOUR = 21;

export const MEAL_SLOTS = [
  {
    id: NOTIFICATION_IDS.breakfast,
    hour: BREAKFAST_REMINDER_HOUR,
    minute: 0,
    title: 'Log your breakfast',
    body: 'A quick log now keeps your day on track',
  },
  {
    id: NOTIFICATION_IDS.lunch,
    hour: LUNCH_REMINDER_HOUR,
    minute: 0,
    title: 'Log your lunch',
    body: 'Take a moment to add what you ate',
  },
  {
    id: NOTIFICATION_IDS.dinner,
    hour: DINNER_REMINDER_HOUR,
    minute: 0,
    title: 'Log your dinner',
    body: 'Don’t forget to log before the day ends',
  },
] as const;

export const SUMMARY_SLOT = {
  id: NOTIFICATION_IDS.summary,
  hour: 22,
  minute: 0,
  title: 'Your day in review',
};
