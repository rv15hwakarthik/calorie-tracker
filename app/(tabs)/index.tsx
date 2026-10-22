import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { OfflineBanner } from '@/src/components/ui/OfflineBanner';
import {
  dailyLogQueryOptions,
  useAddFoodEntry,
  useDailyLog,
  useDeleteFoodEntry,
  useEnsureDailyLog,
  useFoodEntries,
} from '@/src/features/dashboard/hooks';
import { buildMacroStats, formatMacroValue } from '@/src/features/dashboard/macroStats';
import { useNetworkStatus } from '@/src/features/network/NetworkProvider';
import { scheduleReminders } from '@/src/features/notifications/scheduleReminders';
import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import { getTodayLogDate, isTodayLogDate } from '@/src/lib/dates';
import type { AppThemeColors } from '@/src/theme/colors';

export default function TodayScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isOnline } = useNetworkStatus();
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

  useEffect(() => {
    if (!isViewingToday || !dailyLog || isFoodLoading) {
      return;
    }

    void scheduleReminders({
      dailyLog,
      foodEntries,
    }).catch(() => undefined);
  }, [dailyLog, foodEntries, isFoodLoading, isViewingToday]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <OfflineBanner />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          dailyLog ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brandDark}
            />
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
          <DayContentSkeleton colors={colors} />
        ) : dailyLog ? (
          <>
            <View style={styles.header}>
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
                  <ActivityIndicator color={colors.brandDark} />
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
          disabled={!dailyLog || isDayLoading || !isOnline}
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

function DayContentSkeleton({ colors }: { colors: AppThemeColors }) {
  const styles = useMemo(() => createSkeletonStyles(colors), [colors]);

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

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
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
    summaryTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textMuted,
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
      color: colors.text,
    },
    sectionMeta: {
      fontSize: 16,
      color: colors.textMuted,
    },
    inlineLoader: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    emptyText: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.textMuted,
    },
    errorCard: {
      gap: 16,
      paddingVertical: 24,
    },
    errorTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.textMuted,
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
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
    },
  });
}

function createSkeletonStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    skeletonContainer: {
      gap: 24,
    },
    skeletonHeader: {
      gap: 10,
    },
    skeletonBlock: {
      backgroundColor: colors.skeleton,
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
}
