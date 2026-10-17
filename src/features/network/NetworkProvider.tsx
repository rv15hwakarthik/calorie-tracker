import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setupReactQueryOnlineManager } from './setupOnlineManager';

type NetworkContextValue = {
  isOnline: boolean;
  netInfo: NetInfoState | null;
};

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  netInfo: null,
});

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [netInfo, setNetInfo] = useState<NetInfoState | null>(null);

  useEffect(() => {
    setupReactQueryOnlineManager();
  }, []);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setNetInfo(state);
    });
  }, []);

  // const isOnline = netInfo ? getIsOnlineFromNetInfo(netInfo) : true;
  const isOnline = false;

  const value = useMemo(() => ({ isOnline, netInfo }), [isOnline, netInfo]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetworkStatus() {
  return useContext(NetworkContext);
}
