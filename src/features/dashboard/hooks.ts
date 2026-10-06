import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getTodayLogDate } from '@/src/lib/dates';

import { addFoodEntry, type AddFoodEntryInput } from './addFoodEntry';
import { deleteFoodEntry } from './deleteFoodEntry';
import { estimateFoodNutrition } from './estimateFoodNutrition';
import { fetchFoodEntries } from './fetchFoodEntries';
import { getOrCreateDailyLog } from './getOrCreateDailyLog';
import { queryDailyLog } from './loadDailyLogView';
import { dashboardKeys } from './queryKeys';

const DASHBOARD_STALE_TIME_MS = 5 * 60 * 1000;

export function dailyLogQueryOptions(logDate: string) {
  return {
    queryKey: dashboardKeys.dailyLog(logDate),
    queryFn: () => queryDailyLog(logDate),
    staleTime: DASHBOARD_STALE_TIME_MS,
    placeholderData: keepPreviousData,
  };
}

export function useDailyLog(logDate: string) {
  return useQuery(dailyLogQueryOptions(logDate));
}

/** @deprecated Use useDailyLog instead. */
export function useTodayDailyLog(logDate = getTodayLogDate()) {
  return useDailyLog(logDate);
}

export function useEnsureDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logDate: string) => getOrCreateDailyLog(logDate),
    onSuccess: (data, logDate) => {
      queryClient.setQueryData(dashboardKeys.dailyLog(logDate), { ...data, isPersisted: true });
    },
  });
}

export function useFoodEntries(dailyLogId: string | undefined) {
  return useQuery({
    queryKey: dashboardKeys.foodEntries(dailyLogId ?? ''),
    queryFn: () => fetchFoodEntries(dailyLogId!),
    enabled: Boolean(dailyLogId),
    staleTime: DASHBOARD_STALE_TIME_MS,
  });
}

export function useAddFoodEntry(logDate = getTodayLogDate()) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddFoodEntryInput) => addFoodEntry(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.dailyLog(logDate) });
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.foodEntries(variables.dailyLogId),
      });
    },
  });
}

export function useDeleteFoodEntry(logDate = getTodayLogDate()) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId }: { entryId: string; dailyLogId: string }) => deleteFoodEntry(entryId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.dailyLog(logDate) });
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.foodEntries(variables.dailyLogId),
      });
    },
  });
}

export function useEstimateFoodNutrition() {
  return useMutation({
    mutationFn: (foodDescription: string) => estimateFoodNutrition(foodDescription),
  });
}
