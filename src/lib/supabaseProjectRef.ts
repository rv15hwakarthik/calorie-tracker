/** Supabase project ref from EXPO_PUBLIC_SUPABASE_URL (e.g. `abcdefghijklmnop`). */
export function getSupabaseProjectRef(): string | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!url) {
    return null;
  }

  try {
    const hostname = new URL(url).hostname;
    const ref = hostname.split('.')[0];
    return ref || null;
  } catch {
    return null;
  }
}
