import { Platform } from 'react-native';

import { NOTIFICATION_CHANNEL_ID } from './constants';
import { loadNotificationsModule } from './notificationsModule';

let configurePromise: Promise<void> | null = null;

async function runConfigureNotifications(): Promise<void> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Meal reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/** One-time notification setup. Safe to call multiple times; returns the same promise. */
export function configureNotifications(): Promise<void> {
  configurePromise ??= runConfigureNotifications().catch((error) => {
    configurePromise = null;
    throw error;
  });

  return configurePromise;
}
