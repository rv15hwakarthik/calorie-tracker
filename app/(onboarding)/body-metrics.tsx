import { router, type Href } from 'expo-router';

import { LargeButton } from '@/src/components/ui/LargeButton';
import { NumberWheelPicker } from '@/src/components/ui/NumberWheelPicker';
import { StepScreen } from '@/src/components/ui/StepScreen';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

export default function BodyMetricsScreen() {
  const { heightCm, weightKg, setHeightCm, setWeightKg } = useOnboardingStore();

  return (
    <StepScreen
      stepLabel="Step 2 of 4"
      title="Height and weight"
      subtitle="Use centimeters and kilograms"
      footer={
        <>
          <LargeButton label="Back" variant="secondary" onPress={() => router.back()} />
          <LargeButton label="Continue" onPress={() => router.push('/(onboarding)/activity' as Href)} />
        </>
      }
    >
      <NumberWheelPicker label="Height" value={heightCm} suffix="cm" min={120} max={220} onChange={setHeightCm} />
      <NumberWheelPicker label="Weight" value={weightKg} suffix="kg" min={30} max={200} onChange={setWeightKg} />
    </StepScreen>
  );
}
