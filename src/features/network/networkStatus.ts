import type { NetInfoState } from '@react-native-community/netinfo';

/** Device has no usable internet (conservative: unknown reachability ≠ offline). */
export function getIsOnlineFromNetInfo(state: NetInfoState): boolean {
  if (state.isConnected === false) {
    return false;
  }

  if (state.isInternetReachable === false) {
    return false;
  }

  return true;
}
