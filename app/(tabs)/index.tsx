import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddFoodModal } from '@/src/components/dashboard/AddFoodModal';
import { DateNavigator } from '@/src/components/dashboard/DateNavigator';
import { FoodEntryRow } from '@/src/components/dashboard/FoodEntryRow';
import { MacroProgressCard } from '@/src/components/dashboard/MacroProgressCard';
import { LargeButton } from '@/src/components/ui/LargeButton';
import {
  dailyLogQueryOptions,
  useAddFoodEntry,
  useDailyLog,
  useDeleteFoodEntry,
  useEnsureDailyLog,
  useFoodEntries,
} from '@/src/features/dashboard/hooks';
import { buildMacroStats, formatMacroValue } from '@/src/features/dashboard/macroStats';
import { formatLogDateLabel, getTodayLogDate, isTodayLogDate, isYesterdayLogDate } from '@/src/lib/dates';

export default function TodayScreen() {
  const queryClient = useQueryClient();
  const [selectedLogDate, setSelectedLogDate] = useState(() => getTodayLogDate());
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [activeDailyLogId, setActiveDailyLogId] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const dailyLogQuery = useDailyLog(selectedLogDate);
  const dailyLog =
    dailyLogQuery.data?.log_date === selectedLogDate ? dailyLogQuery.data : undefined;
  const isDayLoading = !dailyLog && dailyLogQuery.isFetching;
  const foodEntriesQuery = useFoodEntries(dailyLog?.isPersisted ? dailyLog.id : undefined);
  const addFoodEntry = useAddFoodEntry(selectedLogDate);
  const deleteFoodEntry = useDeleteFoodEntry(selectedLogDate);
  const ensureDailyLog = useEnsureDailyLog();

  const isRefreshing =
    (dailyLogQuery.isFetching && Boolean(dailyLog)) || foodEntriesQuery.isRefetching;
  const isViewingToday = isTodayLogDate(selectedLogDate);

  const handleDateChange = useCallback(
    (logDate: string) => {
      setSelectedLogDate(logDate);
      void queryClient.prefetchQuery(dailyLogQueryOptions(logDate));
    },
    [queryClient],
  );

  const handleRefresh = () => {
    void dailyLogQuery.refetch();
    if (dailyLog?.isPersisted) {
      void foodEntriesQuery.refetch();
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!dailyLog?.isPersisted) return;

    setDeletingEntryId(entryId);
    try {
      await deleteFoodEntry.mutateAsync({ entryId, dailyLogId: dailyLog.id });
    } finally {
      setDeletingEntryId(null);
    }
  };

  const handleOpenAddFood = async () => {
    if (!dailyLog) return;

    try {
      const log = dailyLog.isPersisted ? dailyLog : await ensureDailyLog.mutateAsync(selectedLogDate);
      setActiveDailyLogId(log.id);
      setIsAddModalVisible(true);
    } catch {
      // ensureDailyLog surfaces via mutation state if needed
    }
  };

  const macroStats = dailyLog ? buildMacroStats(dailyLog) : [];
  const foodEntries = foodEntriesQuery.data ?? [];
  const isFoodLoading = Boolean(dailyLog?.isPersisted) && foodEntriesQuery.isLoading;
  const emptyTitle = isViewingToday ? 'Nothing logged yet' : 'Nothing logged on this day';
  const emptyText = isViewingToday
    ? 'Add your first meal or snack to start tracking today'
    : 'Add food to backfill this day, or pick another date';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          dailyLog ? (
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          ) : undefined
        }
      >
        <DateNavigator logDate={selectedLogDate} onChange={handleDateChange} />

        {dailyLogQuery.isError && !dailyLog ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Could not load this day</Text>
            <Text style={styles.errorText}>
              {dailyLogQuery.error instanceof Error ? dailyLogQuery.error.message : 'Try again.'}
            </Text>
            <LargeButton label="Retry" onPress={() => void dailyLogQuery.refetch()} />
          </View>
        ) : isDayLoading ? (
          <DayContentSkeleton />
        ) : dailyLog ? (
          <>
            <View style={styles.header}>
              {!isViewingToday && !isYesterdayLogDate(selectedLogDate) ? (
                <Text style={styles.dateSubLabel}>{formatLogDateLabel(selectedLogDate)}</Text>
              ) : null}
              <Text style={styles.summaryTitle}>Daily progress</Text>
              <Text style={styles.summaryValue}>
                {formatMacroValue(dailyLog.total_calories)} / {formatMacroValue(dailyLog.target_calories)}{' '}
                kcal
              </Text>
            </View>

            <View style={styles.section}>
              {macroStats.map((stat) => (
                <MacroProgressCard key={stat.key} stat={stat} />
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Food log</Text>
                <Text style={styles.sectionMeta}>
                  {isFoodLoading ? 'Loading…' : `${foodEntries.length} items`}
                </Text>
              </View>

              {isFoodLoading ? (
                <View style={styles.inlineLoader}>
                  <ActivityIndicator color="#1B5E20" />
                </View>
              ) : foodEntries.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                  <Text style={styles.emptyText}>{emptyText}</Text>
                </View>
              ) : (
                foodEntries.map((entry) => (
                  <FoodEntryRow
                    key={entry.id}
                    entry={entry}
                    isDeleting={deletingEntryId === entry.id}
                    onDelete={handleDeleteEntry}
                  />
                ))
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <LargeButton
          label="Add food"
          disabled={!dailyLog || isDayLoading}
          loading={ensureDailyLog.isPending}
          onPress={() => void handleOpenAddFood()}
        />
      </View>

      {activeDailyLogId ? (
        <AddFoodModal
          visible={isAddModalVisible}
          dailyLogId={activeDailyLogId}
          loading={addFoodEntry.isPending}
          onClose={() => {
            setIsAddModalVisible(false);
            setActiveDailyLogId(null);
          }}
          onSubmit={async (input) => {
            await addFoodEntry.mutateAsync(input);
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function DayContentSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
        <View style={[styles.skeletonBlock, styles.skeletonSubtitle]} />
      </View>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={[styles.skeletonBlock, styles.skeletonCard]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
    paddingBottom: 120,
  },
  header: {
    gap: 6,
  },
  dateSubLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#444444',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
  },
  sectionMeta: {
    fontSize: 16,
    color: '#666666',
  },
  inlineLoader: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  emptyText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666666',
  },
  errorCard: {
    gap: 16,
    paddingVertical: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666666',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  skeletonContainer: {
    gap: 24,
  },
  skeletonHeader: {
    gap: 10,
  },
  skeletonBlock: {
    backgroundColor: '#ECECEC',
    borderRadius: 16,
  },
  skeletonTitle: {
    height: 28,
    width: '55%',
  },
  skeletonSubtitle: {
    height: 20,
    width: '35%',
  },
  skeletonCard: {
    height: 72,
  },
});
