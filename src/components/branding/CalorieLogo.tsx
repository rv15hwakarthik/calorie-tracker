import Svg, { Circle, G, Path } from 'react-native-svg';

type CalorieLogoProps = {
  size?: number;
  /** White edge — helps on the green startup screen */
  outline?: boolean;
  /** Face color — green on light backgrounds, white on the green startup screen */
  faceColor?: string;
};

/** Lucide "flame" — reads clearly as fire at any size */
const FLAME =
  'M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4';

const THEME_GREEN = '#1B5E20';

export function CalorieLogo({
  size = 96,
  outline = false,
  faceColor = THEME_GREEN,
}: CalorieLogoProps) {
  const stroke = outline
    ? { stroke: '#FFFFFF', strokeWidth: 1.2, strokeLinejoin: 'round' as const }
    : {};

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <G transform="translate(14 -5) scale(2.05)">
        <Path d={FLAME} fill={THEME_GREEN} {...stroke} />
      </G>
      <G transform="translate(2 8) scale(1.15)">
        <Path d={FLAME} fill={THEME_GREEN} {...stroke} />
      </G>
      <Circle cx="20" cy="46" r="2.5" fill={faceColor} />
      <Circle cx="33" cy="46" r="2.5" fill={faceColor} />
      <Path
        d="M21 53Q26 58 31 53"
        stroke={faceColor}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
