import Svg, { Circle, Path, Rect } from 'react-native-svg';

/* The answer icons from the mockup, drawn on a 24-unit grid in one colour. */

type IconProps = { color: string; size?: number };

export function DumbbellIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={9} width={4} height={6} rx={1.5} fill={color} />
      <Rect x={18} y={9} width={4} height={6} rx={1.5} fill={color} />
      <Rect x={5} y={6} width={3} height={12} rx={1.5} fill={color} />
      <Rect x={16} y={6} width={3} height={12} rx={1.5} fill={color} />
      <Rect x={8} y={11} width={8} height={2} fill={color} />
    </Svg>
  );
}

export function FlameIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"
        fill={color}
      />
    </Svg>
  );
}

export function HeartIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"
        fill={color}
      />
    </Svg>
  );
}

export function StarIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z" fill={color} />
    </Svg>
  );
}

export function SeedIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 21v-8" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Path
        d="M12 13c0-5 3-8 8-8 0 5-3 8-8 8zM12 15c0-4-2.5-6-6.5-6 0 4 2.5 6 6.5 6z"
        fill={color}
      />
    </Svg>
  );
}

export function SproutIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 21v-9" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M12 12c0-6 4-9 9-9 0 6-4 9-9 9zM12 14c0-5-3-7-8-7 0 5 3 7 8 7z" fill={color} />
      <Circle cx={12} cy={21} r={1.5} fill={color} />
    </Svg>
  );
}

export function TreeIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 22v-6" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx={12} cy={9} r={7} fill={color} />
    </Svg>
  );
}

export function BackIcon({ color, size = 27 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 5l-7 7 7 7"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
