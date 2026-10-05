import { useState } from 'react';
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
import { FoodEntryRow } from '@/src/components/dashboard/FoodEntryRow';
import { MacroProgressCard } from '@/src/components/dashboard/MacroProgressCard';
import { LargeButton } from '@/src/components/ui/LargeButton';
import {
  useAddFoodEntry,
  useDeleteFoodEntry,
  useFoodEntries,
  useTodayDailyLog,
} from '@/src/features/dashboard/hooks';
import { buildMacroStats, formatMacroValue } from '@/src/features/dashboard/macroStats';
import { formatLogDateLabel, getTodayLogDate } from '@/src/lib/dates';

export default function TodayScreen() {
  const logDate = getTodayLogDate();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const dailyLogQuery = useTodayDailyLog(logDate);
  const dailyLog = dailyLogQuery.data;
  const foodEntriesQuery = useFoodEntries(dailyLog?.id);
  const addFoodEntry = useAddFoodEntry(logDate);
  const deleteFoodEntry = useDeleteFoodEntry(logDate);

  const isLoading = dailyLogQuery.isLoading || foodEntriesQuery.isLoading;
  const isRefreshing = dailyLogQuery.isRefetching || foodEntriesQuery.isRefetching;

  const handleRefresh = () => {
    void dailyLogQuery.refetch();
    void foodEntriesQuery.refetch();
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!dailyLog) return;

    setDeletingEntryId(entryId);
    try {
      await deleteFoodEntry.mutateAsync({ entryId, dailyLogId: dailyLog.id });
    } finally {
      setDeletingEntryId(null);
    }
  };

  if (isLoading && !dailyLog) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    );
  }

  if (dailyLogQuery.isError || !dailyLog) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not load today&apos;s log</Text>
        <Text style={styles.errorText}>
          {dailyLogQuery.error instanceof Error ? dailyLogQuery.error.message : 'Try again.'}
        </Text>
        <LargeButton label="Retry" onPress={() => void dailyLogQuery.refetch()} />
      </View>
    );
  }

  const macroStats = buildMacroStats(dailyLog);
  const foodEntries = foodEntriesQuery.data ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.dateLabel}>{formatLogDateLabel(logDate)}</Text>
          <Text style={styles.summaryTitle}>Daily progress</Text>
          <Text style={styles.summaryValue}>
            {formatMacroValue(dailyLog.total_calories)} / {formatMacroValue(dailyLog.target_calories)} kcal
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
            <Text style={styles.sectionMeta}>{foodEntries.length} items</Text>
          </View>

          {foodEntries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing logged yet</Text>
              <Text style={styles.emptyText}>Add your first meal or snack to start tracking today.</Text>
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
      </ScrollView>

      <View style={styles.footer}>
        <LargeButton label="Add food" onPress={() => setIsAddModalVisible(true)} />
      </View>

      <AddFoodModal
        visible={isAddModalVisible}
        dailyLogId={dailyLog.id}
        loading={addFoodEntry.isPending}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={async (input) => {
          await addFoodEntry.mutateAsync(input);
        }}
      />
    </SafeAreaView>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#FAFAFA',
  },
  header: {
    gap: 6,
  },
  dateLabel: {
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
});
