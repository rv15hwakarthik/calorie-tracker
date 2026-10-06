import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { LargeButton } from '@/src/components/ui/LargeButton';
import { StepScreen } from '@/src/components/ui/StepScreen';
import { TargetField } from '@/src/components/ui/TargetField';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { dashboardKeys } from '@/src/features/dashboard/queryKeys';
import { submitOnboarding } from '@/src/features/onboarding/submitOnboarding';
import { calculateTargets, type MacroTargets } from '@/src/lib/macros';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

function targetsToFormState(targets: MacroTargets) {
  return {
    targetProteinG: String(targets.targetProteinG),
    targetFiberG: String(targets.targetFiberG),
    targetCarbsG: String(targets.targetCarbsG),
    targetFatG: String(targets.targetFatG),
    targetCalories: String(targets.targetCalories),
  };
}

function parseTargets(form: ReturnType<typeof targetsToFormState>, fallback: MacroTargets): MacroTargets {
  return {
    ...fallback,
    targetProteinG: Number(form.targetProteinG) || fallback.targetProteinG,
    targetFiberG: Number(form.targetFiberG) || fallback.targetFiberG,
    targetCarbsG: Number(form.targetCarbsG) || fallback.targetCarbsG,
    targetFatG: Number(form.targetFatG) || fallback.targetFatG,
    targetCalories: Number(form.targetCalories) || fallback.targetCalories,
  };
}

export default function ReviewTargetsScreen() {
  const queryClient = useQueryClient();
  const { session, refreshProfile } = useAuth();
  const { age, gender, heightCm, weightKg, activityLevel, setTargets } = useOnboardingStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatedTargets = useMemo(() => {
    if (!gender || !activityLevel) {
      return null;
    }

    return calculateTargets({
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
    });
  }, [age, gender, heightCm, weightKg, activityLevel]);

  const [form, setForm] = useState(() =>
    calculatedTargets ? targetsToFormState(calculatedTargets) : targetsToFormState({
      bmr: 0,
      tdee: 0,
      targetProteinG: 0,
      targetFiberG: 28,
      targetCarbsG: 0,
      targetFatG: 0,
      targetCalories: 0,
    }),
  );

  useEffect(() => {
    if (calculatedTargets) {
      setForm(targetsToFormState(calculatedTargets));
    }
  }, [calculatedTargets]);

  const handleSave = async () => {
    if (!session?.user.id || !gender || !activityLevel || !calculatedTargets) {
      setErrorMessage('Please complete the earlier onboarding steps first.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const finalTargets = parseTargets(form, calculatedTargets);
      setTargets(finalTargets);

      await submitOnboarding({
        userId: session.user.id,
        age,
        gender,
        heightCm,
        weightKg,
        activityLevel,
        targets: finalTargets,
      });

      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      router.replace('/(tabs)' as Href);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepScreen
      scrollBody
      stepLabel="Step 4 of 4"
      title="Your estimated daily targets"
      subtitle="Personalized targets to help you eat well — adjust anything before saving"
      footer={
        <>
          <LargeButton label="Back" variant="secondary" onPress={() => router.back()} />
          <LargeButton label="Save and start" loading={isSubmitting} onPress={handleSave} />
        </>
      }
    >
      {calculatedTargets ? (
        <View style={styles.maintenanceCard}>
          <Text style={styles.maintenanceLabel}>Your daily nutrition target</Text>
          <Text style={styles.maintenanceValue}>{calculatedTargets.tdee.toLocaleString()}</Text>
          <Text style={styles.maintenanceUnit}>kcal / day</Text>
        </View>
      ) : null}

      <TargetField
        label="Protein"
        suffix="g"
        value={form.targetProteinG}
        onChangeText={(value) => setForm((current) => ({ ...current, targetProteinG: value }))}
      />
      <TargetField
        label="Fiber"
        suffix="g"
        value={form.targetFiberG}
        onChangeText={(value) => setForm((current) => ({ ...current, targetFiberG: value }))}
      />
      <TargetField
        label="Carbs"
        suffix="g"
        value={form.targetCarbsG}
        onChangeText={(value) => setForm((current) => ({ ...current, targetCarbsG: value }))}
      />
      <TargetField
        label="Fat"
        suffix="g"
        value={form.targetFatG}
        onChangeText={(value) => setForm((current) => ({ ...current, targetFatG: value }))}
      />
      <TargetField
        label="Calories"
        suffix="kcal"
        value={form.targetCalories}
        onChangeText={(value) => setForm((current) => ({ ...current, targetCalories: value }))}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  maintenanceCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#A5D6A7',
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  maintenanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  maintenanceValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1B5E20',
    lineHeight: 52,
  },
  maintenanceUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#388E3C',
    marginBottom: 8,
  },
  error: {
    fontSize: 16,
    color: '#B00020',
    lineHeight: 22,
  },
});
