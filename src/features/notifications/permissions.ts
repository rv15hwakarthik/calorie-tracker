import { configureNotifications } from './configureNotifications';
import { loadNotificationsModule } from './notificationsModule';

export async function hasNotificationPermission(): Promise<boolean> {
  await configureNotifications();

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return false;
  }

  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
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
