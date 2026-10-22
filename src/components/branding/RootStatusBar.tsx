import { StatusBar } from 'expo-status-bar';

import { useAppTheme } from '@/src/features/theme/ThemeProvider';

type RootStatusBarProps = {
  /** Green startup / splash screens */
  variant?: 'startup' | 'app';
};

export function RootStatusBar({ variant = 'app' }: RootStatusBarProps) {
  const { colorScheme } = useAppTheme();

  if (variant === 'startup') {
    return <StatusBar style="light" />;
  }

  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
}
