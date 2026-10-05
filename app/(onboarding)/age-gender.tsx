import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FemaleIcon, MaleIcon, OtherIcon } from '@/src/components/icons/GenderIcons';
import { ChoiceCard } from '@/src/components/ui/ChoiceCard';
import { LargeButton } from '@/src/components/ui/LargeButton';
import { NumberWheelPicker } from '@/src/components/ui/NumberWheelPicker';
import { StepScreen } from '@/src/components/ui/StepScreen';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { getFirstName } from '@/src/features/auth/getFirstName';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import type { Gender } from '@/src/types/database';

const GENDER_ICONS = {
  male: MaleIcon,
  female: FemaleIcon,
  other: OtherIcon,
} as const;

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function AgeGenderScreen() {
  const { session, profile } = useAuth();
  const { age, gender, setAge, setGender } = useOnboardingStore();
  const firstName = getFirstName(session, profile);
  const subtitle = firstName
    ? `Hi ${firstName}, tell us your age and gender so we can estimate your daily targets`
    : 'Tell us your age and gender so we can estimate your daily targets';

  return (
    <StepScreen
      stepLabel="Step 1 of 4"
      title="About you"
      subtitle={subtitle}
      footer={
        <LargeButton
          label="Continue"
          disabled={!gender}
          onPress={() => router.push('/(onboarding)/body-metrics' as Href)}
        />
      }
    >
      <NumberWheelPicker label="Age" value={age} min={18} max={100} onChange={setAge} />
      <View style={styles.genderList}>
        <Text style={styles.label}>Gender</Text>
        {GENDERS.map((option) => {
          const Icon = GENDER_ICONS[option.value];
          const iconColor = gender === option.value ? '#1B5E20' : '#666666';

          return (
            <ChoiceCard
              key={option.value}
              title={option.label}
              icon={<Icon color={iconColor} />}
              selected={gender === option.value}
              onPress={() => setGender(option.value)}
            />
          );
        })}
      </View>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  genderList: {
    gap: 12,
  },
});
