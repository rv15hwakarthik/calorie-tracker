import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import type * as ExpoNotifications from 'expo-notifications';

let notificationsModule: typeof ExpoNotifications | null | undefined;

/** Local notifications are unavailable in Expo Go on Android (SDK 53+). */
export function areLocalNotificationsSupported(): boolean {
  return !(isRunningInExpoGo() && Platform.OS === 'android');
}

export async function loadNotificationsModule(): Promise<typeof ExpoNotifications | null> {
  if (!areLocalNotificationsSupported()) {
    return null;
  }

  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  notificationsModule = await import('expo-notifications');
  return notificationsModule;
}
