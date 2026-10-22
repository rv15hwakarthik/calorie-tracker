import { useMemo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import type { AppThemeColors } from '@/src/theme/colors';

type ChoiceCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  selected: boolean;
  onPress: () => void;
};

function CheckBadge({ colors, colorScheme }: { colors: AppThemeColors; colorScheme: 'light' | 'dark' }) {
  const badgeColor = colorScheme === 'dark' ? colors.brand : colors.brandDark;

  return (
    <View
      style={[checkBadgeBase, { backgroundColor: badgeColor }]}
      accessibilityLabel="Selected"
    >
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 6 9 17l-5-5"
          stroke="#FFFFFF"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function ChoiceCard({
  title,
  description = '',
  icon,
  selected,
  onPress,
}: ChoiceCardProps) {
  const { colors, colorScheme } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.card, selected ? styles.selected : null]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {selected ? <CheckBadge colors={colors} colorScheme={colorScheme} /> : null}
    </Pressable>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 18,
      gap: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    selected: {
      borderColor: colors.brandDark,
      backgroundColor: colors.brandMutedBg,
    },
    iconWrap: {
      width: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    description: {
      fontSize: 17,
      lineHeight: 24,
      color: colors.textMuted,
    },
  });
}

const checkBadgeBase = {
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
