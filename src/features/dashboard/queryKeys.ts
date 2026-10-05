export const dashboardKeys = {
  all: ['dashboard'] as const,
  dailyLog: (logDate: string) => [...dashboardKeys.all, 'daily-log', logDate] as const,
  foodEntries: (dailyLogId: string) => [...dashboardKeys.all, 'food-entries', dailyLogId] as const,
};
