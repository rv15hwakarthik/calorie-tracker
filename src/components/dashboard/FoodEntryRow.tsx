import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import type { FoodEntry } from '@/src/types/database';
import type { AppThemeColors } from '@/src/theme/colors';

type FoodEntryRowProps = {
  entry: FoodEntry;
  onDelete: (entryId: string) => void;
  isDeleting?: boolean;
};

export function FoodEntryRow({ entry, onDelete, isDeleting = false }: FoodEntryRowProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.content}>
        <Text style={styles.name}>
          {entry.item_name}
          {entry.quantity_grams != null ? ` · ${formatGrams(entry.quantity_grams)} g` : ''}
        </Text>
        <Text style={styles.macros}>
          {Math.round(entry.calories)} kcal · P {formatGrams(entry.protein_g)} · F{' '}
          {formatGrams(entry.fiber_g)} · C {formatGrams(entry.carbs_g)} · Fat{' '}
          {formatGrams(entry.fat_g)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${entry.item_name}`}
        disabled={isDeleting}
        onPress={() => onDelete(entry.id)}
        style={({ pressed }) => [styles.deleteButton, pressed ? styles.deletePressed : null]}
      >
        <Text style={styles.deleteLabel}>{isDeleting ? '…' : 'Remove'}</Text>
      </Pressable>
    </View>
  );
}

function formatGrams(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    row: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    content: {
      flex: 1,
      gap: 4,
    },
    name: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    macros: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textMuted,
    },
    deleteButton: {
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    deletePressed: {
      opacity: 0.6,
    },
    deleteLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.destructive,
    },
  });
}
