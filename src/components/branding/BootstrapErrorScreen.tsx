import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { CalorieLogo } from '@/src/components/branding/CalorieLogo';
import { LargeButton } from '@/src/components/ui/LargeButton';

type BootstrapErrorScreenProps = {
  message: string;
  onRetry: () => void;
  onSignOut?: () => void;
  retrying?: boolean;
};

export function BootstrapErrorScreen({
  message,
  onRetry,
  onSignOut,
  retrying = false,
}: BootstrapErrorScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <CalorieLogo size={72} outline faceColor="#FFFFFF" />
        <Text style={styles.title}>Couldn&apos;t load your account</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <LargeButton label="Try again" onPress={onRetry} loading={retrying} variant="secondary" />
          {onSignOut ? (
            <Pressable
              accessibilityRole="button"
              disabled={retrying}
              onPress={onSignOut}
              style={({ pressed }) => [styles.signOutButton, pressed && !retrying ? styles.signOutPressed : null]}
            >
              <Text style={styles.signOutLabel}>Log out</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: '#E8F5E9',
    textAlign: 'center',
    marginBottom: 8,
  },
  actions: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  signOutButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutPressed: {
    opacity: 0.75,
  },
  signOutLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8F5E9',
  },
});
