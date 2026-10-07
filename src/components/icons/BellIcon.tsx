import Svg, { Path } from 'react-native-svg';

type BellIconProps = {
  color?: string;
  size?: number;
};

const stroke = (color: string) => ({
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function BellIcon({ color = '#1B5E20', size = 64 }: BellIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"
        {...stroke(color)}
      />
      <Path d="M13.73 21a2 2 0 01-3.46 0" {...stroke(color)} />
    </Svg>
  );
}
