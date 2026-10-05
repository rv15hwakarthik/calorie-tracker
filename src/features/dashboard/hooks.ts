import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getTodayLogDate } from '@/src/lib/dates';

import { addFoodEntry, type AddFoodEntryInput } from './addFoodEntry';
import { deleteFoodEntry } from './deleteFoodEntry';
import { estimateFoodNutrition } from './estimateFoodNutrition';
import { fetchFoodEntries } from './fetchFoodEntries';
import { getOrCreateDailyLog } from './getOrCreateDailyLog';
import { dashboardKeys } from './queryKeys';

export function useTodayDailyLog(logDate = getTodayLogDate()) {
  return useQuery({
    queryKey: dashboardKeys.dailyLog(logDate),
    queryFn: () => getOrCreateDailyLog(logDate),
  });
}

export function useFoodEntries(dailyLogId: string | undefined) {
  return useQuery({
    queryKey: dashboardKeys.foodEntries(dailyLogId ?? ''),
    queryFn: () => fetchFoodEntries(dailyLogId!),
    enabled: Boolean(dailyLogId),
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
