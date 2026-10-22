import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import type { AppThemeColors } from '@/src/theme/colors';

type TargetFieldProps = {
  label: string;
  value: string;
  suffix: string;
  onChangeText: (value: string) => void;
};

export function TargetField({ label, value, suffix, onChangeText }: TargetFieldProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          keyboardType="numeric"
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholderTextColor={colors.textDisabled}
        />
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: {
      gap: 8,
    },
    label: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      minHeight: 56,
    },
    input: {
      flex: 1,
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    suffix: {
      fontSize: 18,
      color: colors.textMuted,
      marginLeft: 8,
    },
  });
}
