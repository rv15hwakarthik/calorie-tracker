import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { CalorieLogo } from '@/src/components/branding/CalorieLogo';

export function StartupScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CalorieLogo size={168} outline faceColor="#FFFFFF" />
      <Text style={styles.title}>Calorie Tracker</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B5E20',
    gap: 20,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
