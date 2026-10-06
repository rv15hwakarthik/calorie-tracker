import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  clampLogDateToToday,
  compareLogDates,
  formatLogDateHeader,
  getTodayLogDate,
  isTodayLogDate,
  shiftLogDate,
} from '@/src/lib/dates';

type DateNavigatorProps = {
  logDate: string;
  onChange: (logDate: string) => void;
};

export function DateNavigator({ logDate, onChange }: DateNavigatorProps) {
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
        <NavButton accessibilityLabel="Go back one week" onPress={goBackOneWeek}>
          «
        </NavButton>
        <NavButton accessibilityLabel="Go back one day" onPress={goBackOneDay}>
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
        <NavButton accessibilityLabel="Go forward one day" disabled={!canGoForward} onPress={goForwardOneDay}>
          ›
        </NavButton>
        <NavButton
          accessibilityLabel="Go forward one week"
          disabled={!canGoForward}
          onPress={goForwardOneWeek}
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
};

function NavButton({ accessibilityLabel, children, disabled = false, onPress }: NavButtonProps) {
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

const styles = StyleSheet.create({
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
    color: '#1B5E20',
    lineHeight: 32,
  },
  navButtonLabelDisabled: {
    color: '#999999',
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
    color: '#1B5E20',
    textAlign: 'center',
  },
  todayHint: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
});
