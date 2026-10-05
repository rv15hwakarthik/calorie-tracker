import Svg, { Circle, Line, Path } from 'react-native-svg';

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

export function MaleIcon({ color = '#555555', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="10" cy="14" r="6" {...stroke(color)} />
      <Path d="M16 3h5v5" {...stroke(color)} />
      <Path d="M21 3l-6.75 6.75" {...stroke(color)} />
    </Svg>
  );
}

export function FemaleIcon({ color = '#555555', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="9" r="6" {...stroke(color)} />
      <Line x1="12" y1="15" x2="12" y2="22" {...stroke(color)} />
      <Line x1="9" y1="19" x2="15" y2="19" {...stroke(color)} />
    </Svg>
  );
}

export function OtherIcon({ color = '#555555', size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" {...stroke(color)} />
      <Path
        d="M5 21c2.5-4 4.5-5.5 7-5.5s4.5 1.5 7 5.5"
        {...stroke(color)}
      />
    </Svg>
  );
}
