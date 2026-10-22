import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import {
  clampLogDateToToday,
  compareLogDates,
  formatLogDateHeader,
  getTodayLogDate,
  isTodayLogDate,
  shiftLogDate,
} from '@/src/lib/dates';
import type { AppThemeColors } from '@/src/theme/colors';

type DateNavigatorProps = {
  logDate: string;
  onChange: (logDate: string) => void;
};

export function DateNavigator({ logDate, onChange }: DateNavigatorProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const today = getTodayLogDate();
  const isToday = isTodayLogDate(logDate);
  const canGoForward = compareLogDates(logDate, today) < 0;

  const goBackOneDay = () => onChange(shiftLogDate(logDate, -1));
  const goForwardOneDay = () => onChange(clampLogDateToToday(shiftLogDate(logDate, 1)));
  const goBackOneWeek = () => onChange(shiftLogDate(logDate, -7));
  const goForwardOneWeek = () => onChange(clampLogDateToToday(shiftLogDate(logDate, 7)));
  const goToToday = () => onChange(today);

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <NavButton accessibilityLabel="Go back one week" onPress={goBackOneWeek} styles={styles}>
          «
        </NavButton>
        <NavButton accessibilityLabel="Go back one day" onPress={goBackOneDay} styles={styles}>
          ‹
        </NavButton>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isToday ? 'Today' : `Selected date ${formatLogDateHeader(logDate)}`}
        disabled={isToday}
        onPress={goToToday}
        style={({ pressed }) => [styles.dateButton, pressed && !isToday ? styles.datePressed : null]}
      >
        <Text style={styles.dateLabel}>{formatLogDateHeader(logDate)}</Text>
        {!isToday ? <Text style={styles.todayHint}>Tap for today</Text> : null}
      </Pressable>

      <View style={styles.controls}>
        <NavButton
          accessibilityLabel="Go forward one day"
          disabled={!canGoForward}
          onPress={goForwardOneDay}
          styles={styles}
        >
          ›
        </NavButton>
        <NavButton
          accessibilityLabel="Go forward one week"
          disabled={!canGoForward}
          onPress={goForwardOneWeek}
          styles={styles}
        >
          »
        </NavButton>
      </View>
    </View>
  );
}

type NavButtonProps = {
  accessibilityLabel: string;
  children: string;
  disabled?: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
};

function NavButton({ accessibilityLabel, children, disabled = false, onPress, styles }: NavButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        disabled ? styles.navButtonDisabled : null,
        pressed && !disabled ? styles.navButtonPressed : null,
      ]}
    >
      <Text style={[styles.navButtonLabel, disabled ? styles.navButtonLabelDisabled : null]}>{children}</Text>
    </Pressable>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    navButton: {
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    navButtonPressed: {
      opacity: 0.45,
    },
    navButtonDisabled: {
      opacity: 0.25,
    },
    navButtonLabel: {
      fontSize: 30,
      fontWeight: '600',
      color: colors.brandDark,
      lineHeight: 32,
    },
    navButtonLabelDisabled: {
      color: colors.textDisabled,
    },
    dateButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 2,
    },
    datePressed: {
      opacity: 0.7,
    },
    dateLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.brandDark,
      textAlign: 'center',
    },
    todayHint: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.brand,
    },
  });
}
