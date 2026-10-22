import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppearanceSettingsRow } from '@/src/components/profile/AppearanceSettingsRow';
import { NotificationSettingsRow } from '@/src/components/profile/NotificationSettingsRow';
import { OfflineBanner } from '@/src/components/ui/OfflineBanner';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { getFirstName } from '@/src/features/auth/getFirstName';
import { seedOnboardingFromProfile } from '@/src/features/onboarding/seedOnboardingFromProfile';
import { formatMacroValue } from '@/src/features/dashboard/macroStats';
import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import type { AppThemeColors } from '@/src/theme/colors';

function ProfileMenuRow({
  label,
  description,
  destructive = false,
  colors,
  onPress,
}: {
  label: string;
  description?: string;
  destructive?: boolean;
  colors: AppThemeColors;
  onPress: () => void;
}) {
  const styles = useMemo(() => createMenuRowStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        destructive ? styles.menuRowDestructive : null,
        pressed ? styles.menuRowPressed : null,
      ]}
    >
      <Text style={[styles.menuLabel, destructive ? styles.menuLabelDestructive : null]}>{label}</Text>
      {description ? <Text style={styles.menuDescription}>{description}</Text> : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      <OfflineBanner />
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
            <AppearanceSettingsRow />
            <NotificationSettingsRow />
            <ProfileMenuRow
              label="Edit targets"
              description="Update your daily macro and calorie goals"
              colors={colors}
              onPress={handleEditTargets}
            />
            <ProfileMenuRow
              label="Restart onboarding"
              description="Re-enter age, activity, and targets"
              colors={colors}
              onPress={handleRestartOnboarding}
            />
            <ProfileMenuRow label="Log out" destructive colors={colors} onPress={handleSignOut} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.brand,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'left',
    },
    email: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'left',
    },
    summaryCard: {
      backgroundColor: colors.brandMutedBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.brandBorder,
      padding: 16,
      gap: 4,
      alignItems: 'flex-start',
    },
    summaryLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.brand,
      textAlign: 'left',
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.brandDark,
      textAlign: 'left',
    },
    section: {
      gap: 12,
      alignSelf: 'stretch',
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'left',
    },
    menuCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      alignSelf: 'stretch',
    },
  });
}

function createMenuRowStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    menuRow: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
      gap: 4,
      alignItems: 'flex-start',
    },
    menuRowDestructive: {
      borderBottomWidth: 0,
    },
    menuRowPressed: {
      backgroundColor: colors.pressed,
    },
    menuLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    menuLabelDestructive: {
      color: colors.destructive,
    },
    menuDescription: {
      fontSize: 15,
      lineHeight: 21,
      color: colors.textMuted,
    },
  });
}
