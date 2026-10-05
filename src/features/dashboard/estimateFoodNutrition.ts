import { FunctionsHttpError } from '@supabase/supabase-js';

import { supabase } from '@/src/lib/supabase';

export type FoodEstimate = {
  item_name: string;
  quantity_grams: number;
  protein_g: number;
  fiber_g: number;
  carbs_g: number;
  fat_g: number;
  calories: number;
  confidence: 'low' | 'medium' | 'high';
  notes: string;
};

async function getFunctionErrorMessage(error: unknown): Promise<string | null> {
  const isHttpError =
    error instanceof FunctionsHttpError ||
    (error instanceof Error && error.name === 'FunctionsHttpError');

  if (!isHttpError || !('context' in error)) {
    return null;
  }

  const response = (error as FunctionsHttpError).context;

  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? null;
  } catch {
    try {
      const text = await response.text();
      return text.trim() || null;
    } catch {
      return null;
    }
  }
}

export async function estimateFoodNutrition(foodDescription: string): Promise<FoodEstimate> {
  const { data, error } = await supabase.functions.invoke('estimate-food', {
    body: { foodDescription: foodDescription.trim() },
  });

  if (error) {
    const detailedMessage = await getFunctionErrorMessage(error);
    throw new Error(detailedMessage ?? error.message ?? 'Could not estimate nutrition.');
  }

  if (data?.error) {
    throw new Error(String(data.error));
  }

  if (!data?.estimate) {
    throw new Error('No estimate was returned.');
  }

  return data.estimate as FoodEstimate;
}
