import Svg, { Path } from 'react-native-svg';

type IconProps = { size: number; color: string };

/** A weight that went up since last time. */
export function UpArrow({ size, color }: IconProps) {
  return <Stroke d="M12 19V5M6 11l6-6 6 6" size={size} color={color} />;
}

/** On a link that opens something. */
export function Chevron({ size, color }: IconProps) {
  return <Stroke d="M9 6l6 6-6 6" size={size} color={color} />;
}

export function Play({ size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 4.5v15l13-7.5z" fill={color} />
    </Svg>
  );
}

function Stroke({ d, size, color }: IconProps & { d: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={d}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
