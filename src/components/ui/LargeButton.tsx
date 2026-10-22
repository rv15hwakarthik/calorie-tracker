import { useMemo, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import type { AppThemeColors } from '@/src/theme/colors';

type LargeButtonProps = PressableProps & {
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'google';
  loading?: boolean;
};

export function LargeButton({
  label,
  icon,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: LargeButtonProps) {
  const { colors, colorScheme } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, colorScheme), [colors, colorScheme]);
  const isDisabled = disabled || loading;

  const spinnerColor =
    variant === 'primary'
      ? colorScheme === 'dark'
        ? colors.background
        : '#FFFFFF'
      : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <Text style={[styles.label, styles[`${variant}Label` as const]]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(colors: AppThemeColors, colorScheme: 'light' | 'dark') {
  const primaryBackground = colorScheme === 'dark' ? colors.brand : colors.brandDark;
  const primaryLabelColor = colorScheme === 'dark' ? colors.background : '#FFFFFF';

  return StyleSheet.create({
    base: {
      minHeight: 56,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    primary: {
      backgroundColor: primaryBackground,
    },
    secondary: {
      backgroundColor: colors.brandMutedBg,
      borderWidth: 1,
      borderColor: colors.brandBorder,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    google: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pressed: {
      opacity: 0.85,
    },
    disabled: {
      opacity: 0.5,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    iconWrap: {
      width: 20,
      alignItems: 'center',
    },
    label: {
      fontSize: 20,
      fontWeight: '700',
    },
    primaryLabel: {
      color: primaryLabelColor,
    },
    secondaryLabel: {
      color: colors.brandDark,
    },
    ghostLabel: {
      color: colors.brandDark,
    },
    googleLabel: {
      color: colors.text,
    },
  });
}
