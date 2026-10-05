import type { ComponentType } from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { ActivityLevel } from '@/src/types/database';

type IconProps = {
  color?: string;
  size?: number;
};

const stroke = (color: string) => ({
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function SedentaryIcon({ color = '#555555', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" {...stroke(color)} />
      <Path
        d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"
        {...stroke(color)}
      />
      <Line x1="5" y1="18" x2="5" y2="20" {...stroke(color)} />
      <Line x1="19" y1="18" x2="19" y2="20" {...stroke(color)} />
    </Svg>
  );
}

export function LightActivityIcon({ color = '#555555', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"
        {...stroke(color)}
      />
      <Path
        d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"
        {...stroke(color)}
      />
      <Line x1="16" y1="17" x2="20" y2="17" {...stroke(color)} />
      <Line x1="4" y1="13" x2="8" y2="13" {...stroke(color)} />
    </Svg>
  );
}

export function ModerateActivityIcon({ color = '#555555', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="5" r="1.5" {...stroke(color)} />
      <Path d="m9 20 3-6 3 6" {...stroke(color)} />
      <Path d="m6 8 6 2 6-2" {...stroke(color)} />
      <Line x1="12" y1="10" x2="12" y2="14" {...stroke(color)} />
    </Svg>
  );
}

export function ActiveIcon({ color = '#555555', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="12" x2="20" y2="12" {...stroke(color)} />
      <Circle cx="6" cy="12" r="3" {...stroke(color)} />
      <Circle cx="18" cy="12" r="3" {...stroke(color)} />
    </Svg>
  );
}

export function VeryActiveIcon({ color = '#555555', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"
        {...stroke(color)}
      />
    </Svg>
  );
}

export const ACTIVITY_ICONS: Record<ActivityLevel, ComponentType<IconProps>> = {
  sedentary: SedentaryIcon,
  light: LightActivityIcon,
  moderate: ModerateActivityIcon,
  active: ActiveIcon,
  very_active: VeryActiveIcon,
};
