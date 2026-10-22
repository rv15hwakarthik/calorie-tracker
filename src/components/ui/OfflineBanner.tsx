import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useNetworkStatus } from '@/src/features/network/NetworkProvider';
import { useAppTheme } from '@/src/features/theme/ThemeProvider';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const { colors } = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        banner: {
          backgroundColor: colors.banner,
          minHeight: 40,
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
        },
        text: {
          color: colors.bannerText,
          fontSize: 14,
          fontWeight: '600',
          lineHeight: 20,
          textAlign: 'center',
        },
      }),
    [colors.banner, colors.bannerText],
  );

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={styles.text}>You're offline. Some actions are unavailable until you reconnect.</Text>
    </View>
  );
}
