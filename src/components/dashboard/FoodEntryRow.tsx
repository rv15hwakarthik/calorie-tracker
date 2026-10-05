import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FoodEntry } from '@/src/types/database';

type FoodEntryRowProps = {
  entry: FoodEntry;
  onDelete: (entryId: string) => void;
  isDeleting?: boolean;
};

export function FoodEntryRow({ entry, onDelete, isDeleting = false }: FoodEntryRowProps) {
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

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    color: '#111111',
  },
  macros: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
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
    color: '#B00020',
  },
});
