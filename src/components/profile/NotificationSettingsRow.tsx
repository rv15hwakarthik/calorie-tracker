import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, StyleSheet, Switch, Text, View } from 'react-native';

import { areLocalNotificationsSupported } from '@/src/features/notifications/notificationsModule';
import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import {
  getNotificationPermissionStatus,
  openNotificationSettings,
  requestNotificationPermission,
  type NotificationPermissionStatus,
} from '@/src/features/notifications/permissions';

function getDescription(status: NotificationPermissionStatus): string {
  switch (status) {
    case 'granted':
      return 'Meal reminders and summaries';
    case 'denied':
      return 'Turn on in system settings to receive reminders and summaries';
    default:
      return 'Enable reminders for meals and summaries';
  }
}

export function NotificationSettingsRow() {
  const { colors } = useAppTheme();
  const [status, setStatus] = useState<NotificationPermissionStatus>('undetermined');
  const [isUpdating, setIsUpdating] = useState(false);

  const refreshStatus = useCallback(() => {
    void getNotificationPermissionStatus().then(setStatus);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [refreshStatus]),
  );

  if (!areLocalNotificationsSupported()) {
    return (
      <View style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: colors.text }]}>Notifications</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Reminders need a development or store build
          </Text>
        </View>
      </View>
    );
  }

  const isOn = status === 'granted';

  const handleToggle = async (nextValue: boolean) => {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);
    try {
      if (nextValue) {
        const granted = await requestNotificationPermission();
        if (!granted && status === 'denied') {
          Alert.alert(
            'Notifications are off',
            'Enable notifications for kcalBud in your device settings',
            [
              { text: 'Not now', style: 'cancel' },
              { text: 'Open settings', onPress: openNotificationSettings },
            ],
          );
        }
      } else {
        Alert.alert(
          'Turn off notifications?',
          Platform.OS === 'ios'
            ? 'Turn off notifications for kcalBud in Settings. Already scheduled reminders will not be delivered while notifications are disabled.'
            : 'Turn off notifications for kcalBud in app settings. Already scheduled reminders will not be delivered while notifications are disabled.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open settings', onPress: openNotificationSettings },
          ],
        );
      }
    } finally {
      setIsUpdating(false);
      refreshStatus();
    }
  };

  return (
    <View style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text }]}>Notifications</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{getDescription(status)}</Text>
      </View>
      <Switch
        accessibilityLabel="Notifications"
        value={isOn}
        disabled={isUpdating}
        onValueChange={(value) => {
          void handleToggle(value);
        }}
        trackColor={{ false: colors.border, true: colors.brandBorder }}
        thumbColor={isOn ? colors.brandDark : colors.surface}
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
