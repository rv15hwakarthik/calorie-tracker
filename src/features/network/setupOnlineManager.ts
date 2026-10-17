import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

import { getIsOnlineFromNetInfo } from './networkStatus';

let isConfigured = false;

/** Keeps React Query paused while offline; safe to call more than once. */
export function setupReactQueryOnlineManager(): void {
  if (isConfigured) {
    return;
  }

  isConfigured = true;

  onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(getIsOnlineFromNetInfo(state));
    });
  });
}
