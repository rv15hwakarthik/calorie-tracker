import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, type ColorSchemeName } from 'react-native';

const STORAGE_KEY = 'theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

export async function loadThemePreference(): Promise<ThemePreference> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return 'system';
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, preference);
}

export function applyThemePreference(preference: ThemePreference): void {
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}

export function resolveColorScheme(
  preference: ThemePreference,
  systemScheme: ColorSchemeName,
): 'light' | 'dark' {
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}
