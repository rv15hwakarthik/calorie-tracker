import { StyleSheet, Text, View } from 'react-native';

import {
  formatMacroValue,
  getMacroProgressState,
  getMacroStatusLabel,
  getProgress,
  getTargetPercentage,
  type MacroProgressState,
  type MacroStat,
} from '@/src/features/dashboard/macroStats';

type MacroProgressCardProps = {
  stat: MacroStat;
};

export function MacroProgressCard({ stat }: MacroProgressCardProps) {
  const progress = getProgress(stat.consumed, stat.target);
  const progressState = getMacroProgressState(stat.consumed, stat.target);
  const statusLabel = getMacroStatusLabel(progressState);
  const targetPercentage = getTargetPercentage(stat.consumed, stat.target);
  const hasTarget = stat.target != null && stat.target > 0;
  const colors = getProgressColors(progressState, stat.emphasized);

  return (
    <View style={[styles.card, stat.emphasized ? styles.emphasizedCard : null]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, stat.emphasized ? styles.emphasizedLabel : null]}>{stat.label}</Text>
        <Text style={styles.value}>
          {formatMacroValue(stat.consumed)}
          {hasTarget ? ` / ${formatMacroValue(stat.target)} ${stat.unit}` : ` ${stat.unit}`}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(progress * 100)}%`, backgroundColor: colors.fillColor },
          ]}
        />
      </View>
      {statusLabel ? (
        <Text style={[styles.statusLabel, { color: colors.statusColor }]}>
          {statusLabel}
          {targetPercentage != null ? ` · ${targetPercentage}%` : null}
        </Text>
      ) : null}
    </View>
  );
}

function getProgressColors(state: MacroProgressState, emphasized?: boolean) {
  if (state === 'over' || state === 'wellOver') {
    return {
      fillColor: '#E65100',
      statusColor: '#E65100',
    };
  }

  return {
    fillColor: emphasized ? '#1B5E20' : '#66BB6A',
    statusColor: '#666666',
  };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emphasizedCard: {
    borderColor: '#A5D6A7',
    backgroundColor: '#F1F8E9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  emphasizedLabel: {
    color: '#1B5E20',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555555',
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E8E8E8',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
