import { router, type Href } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/features/auth/AuthProvider';
import { getFirstName } from '@/src/features/auth/getFirstName';
import { seedOnboardingFromProfile } from '@/src/features/onboarding/seedOnboardingFromProfile';
import { formatMacroValue } from '@/src/features/dashboard/macroStats';

function ProfileMenuRow({
  label,
  description,
  destructive = false,
  onPress,
}: {
  label: string;
  description?: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, destructive ? styles.menuRowDestructive : null, pressed ? styles.menuRowPressed : null]}
    >
      <Text style={[styles.menuLabel, destructive ? styles.menuLabelDestructive : null]}>{label}</Text>
      {description ? <Text style={styles.menuDescription}>{description}</Text> : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuth();
  const firstName = getFirstName(session, profile);
  const displayName = profile?.full_name ?? firstName ?? 'Your profile';
  const email = session?.user.email;

  const handleEditTargets = () => {
    router.push('/(tabs)/edit-targets' as Href);
  };

  const handleRestartOnboarding = () => {
    if (!profile) return;

    Alert.alert(
      'Restart onboarding?',
      'You will walk through your profile and targets again. Your current targets stay until you save new ones.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          onPress: () => {
            seedOnboardingFromProfile(profile);
            router.push('/(onboarding)/age-gender' as Href);
          },
        },
      ],
    );
  };

  const handleSignOut = () => {
    Alert.alert('Log out?', 'You can sign back in anytime with Google.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          void signOut().then(() => {
            router.replace('/(auth)/login' as Href);
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.screenLabel}>Profile</Text>
          <Text style={styles.title}>{displayName}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
        </View>

        {profile?.target_calories != null ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Daily calorie target</Text>
            <Text style={styles.summaryValue}>{formatMacroValue(profile.target_calories)} kcal</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            <ProfileMenuRow
              label="Edit targets"
              description="Update your daily macro and calorie goals"
              onPress={handleEditTargets}
            />
            <ProfileMenuRow
              label="Restart onboarding"
              description="Re-enter age, activity, and targets"
              onPress={handleRestartOnboarding}
            />
            <ProfileMenuRow label="Log out" destructive onPress={handleSignOut} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
    alignItems: 'stretch',
  },
  header: {
    gap: 6,
    alignItems: 'flex-start',
  },
  screenLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'left',
  },
  email: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'left',
  },
  summaryCard: {
    backgroundColor: '#F1F8E9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    padding: 16,
    gap: 4,
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'left',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B5E20',
    textAlign: 'left',
  },
  section: {
    gap: 12,
    alignSelf: 'stretch',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'left',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  menuRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    gap: 4,
    alignItems: 'flex-start',
  },
  menuRowDestructive: {
    borderBottomWidth: 0,
  },
  menuRowPressed: {
    backgroundColor: '#F5F5F5',
  },
  menuLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  menuLabelDestructive: {
    color: '#B00020',
  },
  menuDescription: {
    fontSize: 15,
    lineHeight: 21,
    color: '#666666',
  },
});
