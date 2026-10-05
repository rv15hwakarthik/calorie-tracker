import { supabase } from '@/src/lib/supabase';
import type { FoodEntry, FoodEntryInsert } from '@/src/types/database';

export type AddFoodEntryInput = {
  dailyLogId: string;
  itemName: string;
  proteinG: number;
  fiberG: number;
  carbsG: number;
  fatG: number;
  calories: number;
  quantityGrams?: number | null;
  source?: 'manual' | 'ai';
};

export async function addFoodEntry(input: AddFoodEntryInput): Promise<FoodEntry> {
  const row: FoodEntryInsert = {
    daily_log_id: input.dailyLogId,
    item_name: input.itemName.trim(),
    protein_g: input.proteinG,
    fiber_g: input.fiberG,
    carbs_g: input.carbsG,
    fat_g: input.fatG,
    calories: input.calories,
    quantity_grams: input.quantityGrams ?? null,
    source: input.source ?? 'manual',
  };

  const { data, error } = await supabase.from('food_entries').insert(row).select().single();

  if (error) {
    throw error;
  }

  return data;
}
