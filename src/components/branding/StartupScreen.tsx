import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { CalorieLogo } from '@/src/components/branding/CalorieLogo';
import { APP_NAME } from '@/src/constants/branding';

export function StartupScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.titleRow}>
        <CalorieLogo size={56} outline faceColor="#FFFFFF" />
        <Text style={styles.title}>{APP_NAME}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 1,
  },
});
