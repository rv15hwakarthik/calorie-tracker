import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ACTIVITY_ICONS } from '@/src/components/icons/ActivityIcons';
import { ChoiceCard } from '@/src/components/ui/ChoiceCard';
import { LargeButton } from '@/src/components/ui/LargeButton';
import { StepScreen } from '@/src/components/ui/StepScreen';
import { ACTIVITY_OPTIONS } from '@/src/features/onboarding/activityOptions';
import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function ActivityScreen() {
  const { colors } = useAppTheme();
  const { activityLevel, setActivityLevel } = useOnboardingStore();

  return (
    <StepScreen
      scrollBody
      stepLabel="Step 3 of 4"
      title="Activity level"
      subtitle="Pick the option that best matches a typical day"
      footer={
        <>
          <LargeButton label="Back" variant="secondary" onPress={() => router.back()} />
          <LargeButton
            label="Continue"
            disabled={!activityLevel}
            onPress={() => router.push('/(onboarding)/review-targets' as Href)}
          />
        </>
      }
    >
      <View style={styles.list}>
        {ACTIVITY_OPTIONS.map((option) => {
          const Icon = ACTIVITY_ICONS[option.value];
          const iconColor = activityLevel === option.value ? colors.brandDark : colors.textMuted;

          return (
            <ChoiceCard
              key={option.value}
              title={option.title}
              description={option.description}
              icon={<Icon color={iconColor} />}
              selected={activityLevel === option.value}
              onPress={() => setActivityLevel(option.value)}
            />
          );
        })}
      </View>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});
