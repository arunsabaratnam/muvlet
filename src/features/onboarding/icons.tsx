import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';

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

/** A filled circle with a tick cut out of it, for "all good". */
export function CheckCircleIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill={color} />
      <Path
        d="M7.5 12.5l3 3 6-6.5"
        fill="none"
        stroke={colors.surface}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DotsIcon({ color, size = 28 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5} cy={12} r={2.6} fill={color} />
      <Circle cx={12} cy={12} r={2.6} fill={color} />
      <Circle cx={19} cy={12} r={2.6} fill={color} />
    </Svg>
  );
}

export type BodyArea =
  'Knees' | 'Lower back' | 'Shoulders' | 'Wrists' | 'Neck' | 'Hips' | 'Elbows' | 'Ankles';

// Where each area sits on the figure, on its 200 by 300 grid. Lower back is a bar instead.
const AREA_SPOTS: Record<Exclude<BodyArea, 'Lower back'>, { x: number; y: number; r: number }[]> = {
  Knees: [
    { x: 84, y: 236, r: 28 },
    { x: 116, y: 236, r: 28 },
  ],
  Shoulders: [
    { x: 66, y: 78, r: 28 },
    { x: 134, y: 78, r: 28 },
  ],
  Wrists: [
    { x: 50, y: 200, r: 26 },
    { x: 150, y: 200, r: 26 },
  ],
  Neck: [{ x: 100, y: 54, r: 26 }],
  Hips: [
    { x: 82, y: 180, r: 26 },
    { x: 118, y: 180, r: 26 },
  ],
  Elbows: [
    { x: 54, y: 150, r: 26 },
    { x: 146, y: 150, r: 26 },
  ],
  Ankles: [
    { x: 84, y: 282, r: 26 },
    { x: 116, y: 282, r: 26 },
  ],
};

/** A simple figure in `body` with one area marked in `color`. */
export function BodyIcon({ area, color, body }: { area: BodyArea; color: string; body: string }) {
  return (
    <Svg width={28} height={42} viewBox="0 0 200 300">
      <Path
        d="M66 78L54 150L50 200M134 78L146 150L150 200M86 176L84 236L84 284M114 176L116 236L116 284"
        fill="none"
        stroke={body}
        strokeWidth={26}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={64} y={56} width={72} height={126} rx={30} fill={body} />
      <Circle cx={100} cy={28} r={23} fill={body} />
      {area === 'Lower back' ? (
        <Rect x={72} y={132} width={56} height={40} rx={20} fill={color} />
      ) : (
        AREA_SPOTS[area].map((spot) => (
          <Circle key={spot.x} cx={spot.x} cy={spot.y} r={spot.r} fill={color} />
        ))
      )}
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

export function ChevronIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 5l7 7-7 7"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TickIcon({ color, size = 17 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke={color}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EyeIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function EyeOffIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7c1.7 0 3.2-.5 4.5-1.2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MailIcon({ color, size = 21 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={14} rx={3} stroke={color} strokeWidth={2.2} />
      <Path
        d="M4 7l8 6 8-6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AppleIcon({ color, size = 21 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={{ marginTop: -2 }}>
      <Path
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
        fill={color}
      />
    </Svg>
  );
}

/** Google's "G" in its own four colours. */
export function GoogleIcon({ size = 21 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <Path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </Svg>
  );
}
