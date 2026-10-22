import { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LargeButton } from '@/src/components/ui/LargeButton';
import type { AddFoodEntryInput } from '@/src/features/dashboard/addFoodEntry';
import type { FoodEstimate } from '@/src/features/dashboard/estimateFoodNutrition';
import { useEstimateFoodNutrition } from '@/src/features/dashboard/hooks';
import { useNetworkStatus } from '@/src/features/network/NetworkProvider';
import { useAppTheme } from '@/src/features/theme/ThemeProvider';
import type { AppThemeColors } from '@/src/theme/colors';

type AddFoodModalProps = {
  visible: boolean;
  dailyLogId: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: AddFoodEntryInput) => Promise<void>;
};

type Step = 'describe' | 'review';

type ExampleSegment = { text: string; emphasis?: boolean };

const FOOD_EXAMPLES: ExampleSegment[][] = [
  [{ text: '2 pieces ' }, { text: 'masala', emphasis: true }, { text: ' dosa' }],
  [{ text: '5 rotis ' }, { text: 'with ghee', emphasis: true }],
  [{ text: '200g ' }, { text: 'grilled', emphasis: true }, { text: ' chicken' }],
];

const FOOD_DESCRIPTION_MAX_LENGTH = 100;

const EMPTY_FORM = {
  itemName: '',
  quantityGrams: '',
  proteinG: '',
  fiberG: '',
  carbsG: '',
  fatG: '',
  calories: '',
};

export function AddFoodModal({
  visible,
  dailyLogId,
  loading = false,
  onClose,
  onSubmit,
}: AddFoodModalProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [step, setStep] = useState<Step>('describe');
  const [foodDescription, setFoodDescription] = useState('');
  const [estimateMeta, setEstimateMeta] = useState<Pick<FoodEstimate, 'confidence' | 'notes'> | null>(
    null,
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [entrySource, setEntrySource] = useState<'ai' | 'manual'>('manual');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const { isOnline } = useNetworkStatus();
  const estimateFood = useEstimateFoodNutrition();

  useEffect(() => {
    if (!visible) return;

    estimateFood.reset();
    setStep('describe');
    setFoodDescription('');
    setEstimateMeta(null);
    setForm(EMPTY_FORM);
    setEntrySource('manual');
    setErrorMessage(null);
  }, [visible]);

  const canEstimate = foodDescription.trim().length > 0;
  const canSubmit = form.itemName.trim().length > 0;
  const isBusy = loading || estimateFood.isPending;
  const showManualEntry = step === 'describe' && estimateFood.isError;

  const confidenceLabel = useMemo(() => {
    if (!estimateMeta) return null;

    if (estimateMeta.confidence === 'high') return 'High confidence estimate';
    if (estimateMeta.confidence === 'low') return 'Low confidence — please review carefully';
    return 'Medium confidence estimate';
  }, [estimateMeta]);

  const resetAndClose = () => {
    if (isBusy) return;
    estimateFood.reset();
    onClose();
  };

  const handleEstimate = async () => {
    setErrorMessage(null);
    estimateFood.reset();
    Keyboard.dismiss();

    if (!canEstimate) {
      setErrorMessage('Describe what you ate using the {amount} {food} format.');
      return;
    }

    try {
      const estimate = await estimateFood.mutateAsync(foodDescription.trim());
      setEntrySource('ai');
      setEstimateMeta({ confidence: estimate.confidence, notes: estimate.notes });
      setForm({
        itemName: estimate.item_name,
        quantityGrams: formatOptionalNumber(estimate.quantity_grams),
        proteinG: formatNumber(estimate.protein_g),
        fiberG: formatNumber(estimate.fiber_g),
        carbsG: formatNumber(estimate.carbs_g),
        fatG: formatNumber(estimate.fat_g),
        calories: formatNumber(estimate.calories),
      });
      setStep('review');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not estimate nutrition.');
    }
  };

  const handleManualEntry = () => {
    setErrorMessage(null);
    Keyboard.dismiss();
    setEntrySource('manual');
    setEstimateMeta(null);
    setForm({
      ...EMPTY_FORM,
      itemName: foodDescription.trim(),
    });
    setStep('review');
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    Keyboard.dismiss();

    if (!canSubmit) {
      setErrorMessage('Enter a food name.');
      return;
    }

    try {
      await onSubmit({
        dailyLogId,
        itemName: form.itemName,
        quantityGrams: parseOptionalNumber(form.quantityGrams),
        proteinG: parseNumber(form.proteinG),
        fiberG: parseNumber(form.fiberG),
        carbsG: parseNumber(form.carbsG),
        fatG: parseNumber(form.fatG),
        calories: parseNumber(form.calories),
        source: entrySource,
      });
      estimateFood.reset();
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save food entry.');
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={resetAndClose}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
          style={styles.flex}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            {step === 'describe' ? (
              <>
                <Text style={styles.stepLabel}>Step 1 of 2</Text>
                <Text style={styles.title}>What did you eat?</Text>
                <Text style={styles.subtitle}>
                  Enter the food name and amount eaten in the following format to get the nutrition estimate -{' '}
                  <Text style={styles.examplesTitle}>{"{quantity} {foodName}"}</Text>
                </Text>

                <View style={styles.examplesCard}>
                  <Text style={styles.examplesTitle}>Examples</Text>
                  {FOOD_EXAMPLES.map((segments, index) => (
                    <Text key={index} style={styles.exampleLine}>
                      {segments.map((segment, segmentIndex) => (
                        <Text
                          key={segmentIndex}
                          style={segment.emphasis ? styles.exampleEmphasis : undefined}
                        >
                          {segment.text}
                        </Text>
                      ))}
                    </Text>
                  ))}
                </View>

                <FormField
                  styles={styles}
                  colors={colors}
                  label="Your food"
                  value={foodDescription}
                  onChangeText={(text) => {
                    setFoodDescription(text);
                    if (estimateFood.isError) {
                      estimateFood.reset();
                      setErrorMessage(null);
                    }
                  }}
                  keyboardType="default"
                  placeholder="1 plate chicken rice"
                  multiline
                  maxLength={FOOD_DESCRIPTION_MAX_LENGTH}
                />
              </>
            ) : (
              <>
                <Text style={styles.stepLabel}>Step 2 of 2</Text>
                <Text style={styles.title}>{entrySource === 'ai' ? 'Review estimate' : 'Enter nutrition'}</Text>
                <Text style={styles.subtitle}>
                  {entrySource === 'ai'
                    ? `AI-generated nutrition for: ${foodDescription}`
                    : 'Fill in the nutrition values for this food.'}
                </Text>

                {estimateMeta ? (
                  <View style={styles.estimateCard}>
                    <Text style={styles.estimateTitle}>{confidenceLabel}</Text>
                    {estimateMeta.notes ? (
                      <Text style={styles.estimateNotes}>{estimateMeta.notes}</Text>
                    ) : null}
                  </View>
                ) : null}

                <FormField
                  styles={styles}
                  colors={colors}
                  label="Food name"
                  value={form.itemName}
                  onChangeText={(itemName) => setForm((current) => ({ ...current, itemName }))}
                  keyboardType="default"
                />
                <FormField
                  styles={styles}
                  colors={colors}
                  label="Amount eaten"
                  suffix="g"
                  value={form.quantityGrams}
                  onChangeText={(quantityGrams) =>
                    setForm((current) => ({ ...current, quantityGrams }))
                  }
                />
                <FormField
                  styles={styles}
                  colors={colors}
                  label="Calories"
                  suffix="kcal"
                  value={form.calories}
                  onChangeText={(calories) => setForm((current) => ({ ...current, calories }))}
                />
                <FormField
                  styles={styles}
                  colors={colors}
                  label="Protein"
                  suffix="g"
                  value={form.proteinG}
                  onChangeText={(proteinG) => setForm((current) => ({ ...current, proteinG }))}
                />
                <FormField
                  styles={styles}
                  colors={colors}
                  label="Fiber"
                  suffix="g"
                  value={form.fiberG}
                  onChangeText={(fiberG) => setForm((current) => ({ ...current, fiberG }))}
                />
                <FormField
                  styles={styles}
                  colors={colors}
                  label="Carbs"
                  suffix="g"
                  value={form.carbsG}
                  onChangeText={(carbsG) => setForm((current) => ({ ...current, carbsG }))}
                />
                <FormField
                  styles={styles}
                  colors={colors}
                  label="Fat"
                  suffix="g"
                  value={form.fatG}
                  onChangeText={(fatG) => setForm((current) => ({ ...current, fatG }))}
                />
              </>
            )}

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            {step === 'describe' ? (
              <>
                <LargeButton
                  label="Estimate"
                  loading={estimateFood.isPending}
                  disabled={!canEstimate || !isOnline}
                  onPress={handleEstimate}
                />
                {showManualEntry ? (
                  <LargeButton
                    label="Enter manually"
                    variant="secondary"
                    disabled={isBusy}
                    onPress={handleManualEntry}
                  />
                ) : null}
                <LargeButton
                  label="Cancel"
                  variant="ghost"
                  disabled={isBusy}
                  onPress={resetAndClose}
                />
              </>
            ) : (
              <>
                <LargeButton
                  label="Save food"
                  loading={loading}
                  disabled={!canSubmit || estimateFood.isPending || !isOnline}
                  onPress={handleSubmit}
                />
                <LargeButton
                  label="Back"
                  variant="secondary"
                  disabled={isBusy}
                  onPress={() => {
                    setErrorMessage(null);
                    setStep('describe');
                  }}
                />
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

type FormFieldStyles = {
  field: ViewStyle;
  fieldLabel: TextStyle;
  inputRow: ViewStyle;
  inputRowMultiline: ViewStyle;
  input: TextStyle;
  inputMultiline: TextStyle;
  suffix: TextStyle;
};

type FormFieldProps = {
  styles: FormFieldStyles;
  colors: AppThemeColors;
  label: string;
  value: string;
  suffix?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
  maxLength?: number;
  onChangeText: (value: string) => void;
};

function FormField({
  styles,
  colors,
  label,
  value,
  suffix,
  placeholder,
  keyboardType = 'numeric',
  multiline = false,
  maxLength,
  onChangeText,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputRow, multiline ? styles.inputRowMultiline : null]}>
        <TextInput
          keyboardType={keyboardType}
          multiline={multiline}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          style={[styles.input, multiline ? styles.inputMultiline : null]}
          placeholder={placeholder ?? (keyboardType === 'default' ? 'Food name' : '0')}
          placeholderTextColor={colors.textDisabled}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatOptionalNumber(value: number) {
  return value > 0 ? formatNumber(value) : '';
}

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 24,
      gap: 16,
    },
    stepLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.brand,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 18,
      lineHeight: 26,
      color: colors.textMuted,
    },
    examplesCard: {
      backgroundColor: colors.brandMutedBg,
      borderRadius: 16,
      padding: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.brandBorder,
    },
    examplesTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.brandDark,
    },
    exampleLine: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.brand,
    },
    exampleEmphasis: {
      fontWeight: '700',
    },
    estimateCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    estimateTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.brandDark,
    },
    estimateNotes: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textMuted,
    },
    field: {
      gap: 8,
    },
    fieldLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      minHeight: 56,
    },
    inputRowMultiline: {
      alignItems: 'flex-start',
      paddingVertical: 12,
    },
    input: {
      flex: 1,
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    inputMultiline: {
      minHeight: 72,
      textAlignVertical: 'top',
    },
    suffix: {
      fontSize: 18,
      color: colors.textMuted,
      marginLeft: 8,
    },
    error: {
      fontSize: 16,
      color: colors.destructive,
      lineHeight: 22,
    },
    footer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      backgroundColor: colors.background,
    },
  });
}
