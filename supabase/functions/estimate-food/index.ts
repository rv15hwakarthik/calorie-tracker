import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type FoodEstimate = {
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

const responseSchema = {
  type: 'object',
  properties: {
    item_name: { type: 'string' },
    quantity_grams: { type: 'number' },
    protein_g: { type: 'number' },
    fiber_g: { type: 'number' },
    carbs_g: { type: 'number' },
    fat_g: { type: 'number' },
    calories: { type: 'number' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    notes: { type: 'string' },
  },
  required: [
    'item_name',
    'quantity_grams',
    'protein_g',
    'fiber_g',
    'carbs_g',
    'fat_g',
    'calories',
    'confidence',
    'notes',
  ],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return jsonResponse({ error: 'Food estimation is not configured yet.' }, 503);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await req.json();
    const foodDescription = typeof body?.foodDescription === 'string' ? body.foodDescription.trim() : '';

    if (!foodDescription) {
      return jsonResponse({ error: 'Describe what you ate, e.g. {1 plate} {chicken rice}.' }, 400);
    }

    const estimate = await estimateWithGemini(geminiApiKey, foodDescription);
    return jsonResponse({ estimate }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not estimate nutrition.';
    return jsonResponse({ error: message }, 500);
  }
});

async function estimateWithGemini(apiKey: string, foodDescription: string): Promise<FoodEstimate> {
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const prompt = [
    'You estimate nutrition for a calorie tracking mobile app.',
    'The user describes food as {amount} {food name}, for example:',
    '- {1 plate} {chicken rice}',
    '- {2 pieces} {plain dosa}',
    '- {150g} {paneer tikka}',
    '- {1 bowl} {dal tadka}',
    'Estimate the TOTAL nutrition for what they actually ate.',
    'Convert portions to a reasonable quantity_grams when the amount is not already in grams.',
    'Use realistic values for typical home or restaurant portions, especially Indian foods.',
    'All macro values must be non-negative numbers. Round to one decimal at most.',
    'Set confidence to low if the portion or dish is ambiguous, medium for typical cases, high when amount and food are clear.',
    'In notes, briefly explain your portion assumption in one short sentence.',
    `User input: ${foodDescription}`,
  ].join('\n');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
  });

  if (!response.ok) {
    let details = await response.text();

    try {
      const parsed = JSON.parse(details) as { error?: { message?: string } };
      if (parsed.error?.message) {
        details = parsed.error.message;
      }
    } catch {
      // keep raw details
    }

    throw new Error(`Gemini request failed: ${details.slice(0, 300)}`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== 'string') {
    throw new Error('Gemini returned an empty response.');
  }

  const parsed = JSON.parse(text) as FoodEstimate;
  return normalizeEstimate(parsed);
}

function normalizeEstimate(raw: FoodEstimate): FoodEstimate {
  return {
    item_name: raw.item_name.trim(),
    quantity_grams: clampNumber(raw.quantity_grams, 0, 5000),
    protein_g: clampNumber(raw.protein_g, 0, 500),
    fiber_g: clampNumber(raw.fiber_g, 0, 200),
    carbs_g: clampNumber(raw.carbs_g, 0, 1000),
    fat_g: clampNumber(raw.fat_g, 0, 500),
    calories: clampNumber(raw.calories, 0, 5000),
    confidence: raw.confidence ?? 'medium',
    notes: raw.notes?.trim() ?? '',
  };
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
