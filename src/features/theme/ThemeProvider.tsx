import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type AppThemeColors } from '@/src/theme/colors';

import {
  applyThemePreference,
  loadThemePreference,
  resolveColorScheme,
  saveThemePreference,
  type ThemePreference,
} from './themePreferenceStorage';

type ThemeContextValue = {
  preference: ThemePreference;
  colorScheme: 'light' | 'dark';
  colors: AppThemeColors;
  isReady: boolean;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void loadThemePreference().then((stored) => {
      setPreferenceState(stored);
      applyThemePreference(stored);
      setIsReady(true);
    });
  }, []);

  const colorScheme = resolveColorScheme(preference, systemScheme);

  const setPreference = useCallback(async (next: ThemePreference) => {
    setPreferenceState(next);
    applyThemePreference(next);
    await saveThemePreference(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      colorScheme,
      colors: colorScheme === 'dark' ? darkColors : lightColors,
      isReady,
      setPreference,
    }),
    [preference, colorScheme, isReady, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }

  return context;
}
