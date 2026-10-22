import { Linking } from 'react-native';

import { configureNotifications } from './configureNotifications';
import { loadNotificationsModule } from './notificationsModule';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  await configureNotifications();

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return 'denied';
  }

  const settings = await Notifications.getPermissionsAsync();
  if (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return 'granted';
  }

  if (settings.status === 'denied' || settings.ios?.status === Notifications.IosAuthorizationStatus.DENIED) {
    return 'denied';
  }

  return 'undetermined';
}

export async function hasNotificationPermission(): Promise<boolean> {
  return (await getNotificationPermissionStatus()) === 'granted';
}

export function openNotificationSettings(): void {
  void Linking.openSettings();
}

export async function requestNotificationPermission(): Promise<boolean> {
  await configureNotifications();

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return false;
  }

  const settings = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}
