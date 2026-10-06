import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { LargeButton } from '@/src/components/ui/LargeButton';
import { TargetField } from '@/src/components/ui/TargetField';
import { useAuth } from '@/src/features/auth/AuthProvider';
import { dashboardKeys } from '@/src/features/dashboard/queryKeys';
import { updateProfileTargets } from '@/src/features/profile/updateProfileTargets';

function toFormState(profile: {
  target_protein_g: number | null;
  target_fiber_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
  target_calories: number | null;
}) {
  return {
    targetProteinG: String(profile.target_protein_g ?? 0),
    targetFiberG: String(profile.target_fiber_g ?? 0),
    targetCarbsG: String(profile.target_carbs_g ?? 0),
    targetFatG: String(profile.target_fat_g ?? 0),
    targetCalories: String(profile.target_calories ?? 0),
  };
}

export default function EditTargetsScreen() {
  const queryClient = useQueryClient();
  const { session, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState(() =>
    profile
      ? toFormState(profile)
      : toFormState({
          target_protein_g: null,
          target_fiber_g: null,
          target_carbs_g: null,
          target_fat_g: null,
          target_calories: null,
        }),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm(toFormState(profile));
    }
  }, [profile]);

  const canSave = useMemo(() => Boolean(session?.user.id && profile), [session?.user.id, profile]);

  const handleSave = async () => {
    if (!session?.user.id || !profile) {
      setErrorMessage('Profile not loaded yet.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      await updateProfileTargets(session.user.id, {
        targetProteinG: Number(form.targetProteinG) || 0,
        targetFiberG: Number(form.targetFiberG) || 0,
        targetCarbsG: Number(form.targetCarbsG) || 0,
        targetFatG: Number(form.targetFatG) || 0,
        targetCalories: Number(form.targetCalories) || 0,
      });

      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      router.back();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save targets.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>These targets apply to today and future days you log.</Text>

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
      </ScrollView>

      <View style={styles.footer}>
        <LargeButton label="Save targets" loading={isSaving} disabled={!canSave} onPress={handleSave} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666666',
  },
  error: {
    fontSize: 16,
    color: '#B00020',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
