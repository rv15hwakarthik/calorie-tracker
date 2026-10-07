import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BellIcon } from '@/src/components/icons/BellIcon';
import { LargeButton } from '@/src/components/ui/LargeButton';
import { StepScreen } from '@/src/components/ui/StepScreen';
import { requestNotificationPermission } from '@/src/features/notifications/permissions';

export default function EnableNotificationsScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToDashboard = () => {
    router.replace('/(tabs)' as Href);
  };

  const handleEnable = async () => {
    setIsSubmitting(true);

    try {
      await requestNotificationPermission();
    } finally {
      setIsSubmitting(false);
      goToDashboard();
    }
  };

  return (
    <StepScreen
      stepLabel="One last thing"
      title="Stay on track with reminders"
      subtitle="Enable notifications for timely reminders and end of the day summary"
      footer={
        <>
          <LargeButton
            label="Enable notifications"
            loading={isSubmitting}
            onPress={() => void handleEnable()}
          />
          <LargeButton
            label="Not now"
            variant="secondary"
            disabled={isSubmitting}
            onPress={goToDashboard}
          />
        </>
      }
    >
      <View style={styles.card}>
        <BellIcon size={64} />
        <Text style={styles.cardTitle}>Gentle meal nudges</Text>
        <Text style={styles.cardText}>
          We&apos;ll remind you around breakfast, lunch, and dinner if you have not logged yet
        </Text>
        <Text style={styles.cardText}>
          At the end of the day, you&apos;ll get a short summary of how you did
        </Text>
      </View>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#A5D6A7',
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B5E20',
    textAlign: 'center',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2E7D32',
    textAlign: 'center',
  },
});
