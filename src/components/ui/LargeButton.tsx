import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

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
  const isDisabled = disabled || loading;

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
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#3C4043'} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <Text style={[styles.label, styles[`${variant}Label` as const]]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: '#1B5E20',
  },
  secondary: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  google: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
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
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#1B5E20',
  },
  ghostLabel: {
    color: '#1B5E20',
  },
  googleLabel: {
    color: '#3C4043',
  },
});
