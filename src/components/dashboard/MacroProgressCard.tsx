import { StyleSheet, Text, View } from 'react-native';

import {
  formatMacroValue,
  getMacroAlertMessage,
  getMacroProgressState,
  getProgress,
  type MacroStat,
} from '@/src/features/dashboard/macroStats';

type MacroProgressCardProps = {
  stat: MacroStat;
};

export function MacroProgressCard({ stat }: MacroProgressCardProps) {
  const progress = getProgress(stat.consumed, stat.target);
  const progressState = getMacroProgressState(stat.consumed, stat.target);
  const alertMessage = getMacroAlertMessage(stat.consumed, stat.target);
  const hasTarget = stat.target != null && stat.target > 0;
  const fillColor = progressState === 'alert' ? '#E65100' : stat.emphasized ? '#1B5E20' : '#66BB6A';

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
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: fillColor }]} />
      </View>
      {alertMessage ? (
        <Text style={styles.statusLabel} accessibilityRole="alert">
          {alertMessage}
        </Text>
      ) : null}
    </View>
  );
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
    color: '#E65100',
  },
});
