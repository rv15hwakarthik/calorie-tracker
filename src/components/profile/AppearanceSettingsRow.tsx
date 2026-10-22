import { StyleSheet, Switch, Text, View } from 'react-native';

import { useAppTheme } from '@/src/features/theme/ThemeProvider';

export function AppearanceSettingsRow() {
  const { colors, colorScheme, setPreference } = useAppTheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text }]}>Dark mode</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          Use a dark appearance across the app
        </Text>
      </View>
      <Switch
        accessibilityLabel="Dark mode"
        value={isDark}
        onValueChange={(enabled) => {
          void setPreference(enabled ? 'dark' : 'light');
        }}
        trackColor={{ false: colors.border, true: colors.brandBorder }}
        thumbColor={isDark ? colors.brandDark : colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
  },
});
