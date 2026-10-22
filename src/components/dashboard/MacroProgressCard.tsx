import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  formatMacroValue,
  getMacroAlertMessage,
  getMacroProgressState,
  getProgress,
  type MacroStat,
} from '@/src/features/dashboard/macroStats';
import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import type { AppThemeColors } from '@/src/theme/colors';

type MacroProgressCardProps = {
  stat: MacroStat;
};

export function MacroProgressCard({ stat }: MacroProgressCardProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const progress = getProgress(stat.consumed, stat.target);
  const progressState = getMacroProgressState(stat.consumed, stat.target);
  const alertMessage = getMacroAlertMessage(stat.consumed, stat.target);
  const hasTarget = stat.target != null && stat.target > 0;
  const fillColor =
    progressState === 'alert' ? colors.warning : stat.emphasized ? colors.brandDark : colors.progressFill;

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

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emphasizedCard: {
      borderColor: colors.brandBorder,
      backgroundColor: colors.brandMutedBg,
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
      color: colors.text,
    },
    emphasizedLabel: {
      color: colors.brandDark,
    },
    value: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textMuted,
    },
    track: {
      height: 10,
      borderRadius: 999,
      backgroundColor: colors.progressTrack,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
    },
    statusLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.warning,
    },
  });
}
