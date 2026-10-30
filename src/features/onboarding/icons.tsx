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

export function GymIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2 9.5L12 3l10 6.5z" fill={color} />
      <Rect x={3.5} y={10.5} width={17} height={10.5} rx={1.5} fill={color} />
      <Rect x={6.5} y={14} width={2} height={4} rx={1} fill={colors.surface} />
      <Rect x={15.5} y={14} width={2} height={4} rx={1} fill={colors.surface} />
      <Rect x={8.5} y={15.25} width={7} height={1.5} fill={colors.surface} />
    </Svg>
  );
}

export function HomeIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2.5l9.5 8V21H15v-6.5H9V21H2.5V10.5z" fill={color} />
    </Svg>
  );
}

/** A house beside a tall gym building. */
export function BothIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 7.5l5.5 4.5V21H1.5v-9z" fill={color} />
      <Rect x={14} y={4} width={8.5} height={17} rx={1.5} fill={color} />
      {[7, 10.5, 14].map((y) =>
        [16, 19].map((x) => (
          <Rect
            key={`${x},${y}`}
            x={x}
            y={y}
            width={1.6}
            height={1.6}
            rx={0.5}
            fill={colors.surface}
          />
        )),
      )}
    </Svg>
  );
}

export function BodyweightIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={4.5} r={2.5} fill={color} />
      <Path d="M4 8.5h16v2.6l-5 1.2V21h-2.6v-5.2h-.8V21H9V12.3l-5-1.2z" fill={color} />
    </Svg>
  );
}

export function BandsIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={4} width={4.5} height={16} rx={2.25} fill={color} />
      <Rect x={17.5} y={4} width={4.5} height={16} rx={2.25} fill={color} />
      <Path
        d="M6.5 7.5c3.7-2.4 7.3-2.4 11 0v2.6c-3.7-2.4-7.3-2.4-11 0zM6.5 13.9c3.7 2.4 7.3 2.4 11 0v2.6c-3.7 2.4-7.3 2.4-11 0z"
        fill={color}
      />
    </Svg>
  );
}

export function KettlebellIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" fill="none" stroke={color} strokeWidth={2.5} />
      <Path d="M12 9a7 7 0 0 1 7 7c0 2.2-.9 4-2 5H7c-1.1-1-2-2.8-2-5a7 7 0 0 1 7-7z" fill={color} />
    </Svg>
  );
}

export function BenchIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={8.5} width={20} height={4.5} rx={2.25} fill={color} />
      <Rect x={5} y={13} width={2.6} height={8} rx={1.2} fill={color} />
      <Rect x={16.4} y={13} width={2.6} height={8} rx={1.2} fill={color} />
    </Svg>
  );
}

export function PullUpBarIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={2.5} width={20} height={3} rx={1.5} fill={color} />
      <Circle cx={12} cy={11} r={2.4} fill={color} />
      <Path
        d="M6.6 5.5h2.6l2 3.6h1.6l2-3.6h2.6l-3 5.4v4.1l1.8 6h-2.6L12 16.4 10.4 21H7.8l1.8-6v-4.1z"
        fill={color}
      />
    </Svg>
  );
}

export function BarbellIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={1} y={11} width={22} height={2} rx={1} fill={color} />
      <Rect x={4} y={5.5} width={3.2} height={13} rx={1.6} fill={color} />
      <Rect x={16.8} y={5.5} width={3.2} height={13} rx={1.6} fill={color} />
      <Rect x={7.2} y={8} width={2} height={8} rx={1} fill={color} />
      <Rect x={14.8} y={8} width={2} height={8} rx={1} fill={color} />
    </Svg>
  );
}

export function SquatRackIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={4} y={2.5} width={2.6} height={17} rx={1} fill={color} />
      <Rect x={17.4} y={2.5} width={2.6} height={17} rx={1} fill={color} />
      <Rect x={1} y={8.5} width={22} height={2} rx={1} fill={color} />
      <Rect x={1.5} y={6.5} width={2} height={6} rx={1} fill={color} />
      <Rect x={20.5} y={6.5} width={2} height={6} rx={1} fill={color} />
      <Rect x={2} y={19} width={20} height={2.5} rx={1.25} fill={color} />
    </Svg>
  );
}

export function CardioIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={6} cy={16.5} r={4} stroke={color} strokeWidth={2.6} />
      <Circle cx={18} cy={16.5} r={4} stroke={color} strokeWidth={2.6} />
      <Path
        d="M6 16.5l4-7h5.5l2.5 7M8.5 5.5h3.5"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CableMachineIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={2} width={3} height={20} rx={1} fill={color} />
      <Rect x={18} y={2} width={3} height={20} rx={1} fill={color} />
      <Rect x={3} y={2} width={18} height={2.6} rx={1} fill={color} />
      <Path d="M12 4.5v9" stroke={color} strokeWidth={2} />
      <Rect x={8.5} y={13.5} width={7} height={3} rx={1.5} fill={color} />
    </Svg>
  );
}

export function MedicineBallIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill={color} />
      <Path
        d="M4 9.5c5 2 11 2 16 0M4 14.5c5-2 11-2 16 0"
        fill="none"
        stroke={colors.surface}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

export function StrapsIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={10.5} y={1.5} width={3} height={4.5} rx={1} fill={color} />
      <Path d="M11 6L6 17.5M13 6l5 11.5" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <Rect x={3} y={17} width={6} height={4.5} rx={1.5} fill={color} />
      <Rect x={15} y={17} width={6} height={4.5} rx={1.5} fill={color} />
    </Svg>
  );
}

export function BoxIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 8l9-4 9 4v10l-9 4-9-4z" fill={color} />
      <Path d="M3 8l9 4 9-4M12 12v10" fill="none" stroke={colors.surface} strokeWidth={1.6} />
    </Svg>
  );
}

export function AbWheelIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={6.5} fill={color} />
      <Rect x={2} y={11} width={20} height={2} rx={1} fill={color} />
      <Circle cx={12} cy={12} r={2} fill={colors.surface} />
    </Svg>
  );
}

export function PlateIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill={color} />
      <Circle cx={12} cy={12} r={2.5} fill={colors.surface} />
    </Svg>
  );
}

export function EzBarIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={7} width={3.2} height={10} rx={1.6} fill={color} />
      <Rect x={18.8} y={7} width={3.2} height={10} rx={1.6} fill={color} />
      <Path
        d="M5 12h2l2-2 2 4 2-4 2 4 2-2h2"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SandbagIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M8 8V6.5a1.5 1.5 0 0 1 3 0V8M13 8V6.5a1.5 1.5 0 0 1 3 0V8"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <Rect x={3} y={8} width={18} height={12} rx={5} fill={color} />
    </Svg>
  );
}

export function DipStationIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={4} y={8} width={2.6} height={13} rx={1} fill={color} />
      <Rect x={17.4} y={8} width={2.6} height={13} rx={1} fill={color} />
      <Rect x={2} y={7} width={8} height={2.6} rx={1.3} fill={color} />
      <Rect x={14} y={7} width={8} height={2.6} rx={1.3} fill={color} />
      <Rect x={2} y={19} width={20} height={2.4} rx={1.2} fill={color} />
    </Svg>
  );
}

export function RingsIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 2v8M16 2v8" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={8} cy={15} r={4.5} fill="none" stroke={color} strokeWidth={2.6} />
      <Circle cx={16} cy={15} r={4.5} fill="none" stroke={color} strokeWidth={2.6} />
    </Svg>
  );
}

export function ParallettesIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={9} width={8} height={2.6} rx={1.3} fill={color} />
      <Rect x={14} y={9} width={8} height={2.6} rx={1.3} fill={color} />
      <Path
        d="M3.5 11.5L2.5 18M8.5 11.5l1 6.5M15.5 11.5l-1 6.5M20.5 11.5l1 6.5"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SmithMachineIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={2.5} width={2.6} height={17} rx={1} fill={color} />
      <Rect x={18.4} y={2.5} width={2.6} height={17} rx={1} fill={color} />
      <Rect x={1} y={10} width={22} height={2} rx={1} fill={color} />
      <Rect x={6.6} y={7.5} width={2.4} height={7} rx={1.2} fill={color} />
      <Rect x={15} y={7.5} width={2.4} height={7} rx={1.2} fill={color} />
      <Rect x={1.5} y={19} width={21} height={2.5} rx={1.25} fill={color} />
    </Svg>
  );
}

export function LegPressIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={19} width={20} height={2.5} rx={1.25} fill={color} />
      <Path d="M5 18L17 5" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M13.5 3.5l6.5 6-2 2.2-6.5-6z" fill={color} />
      <Rect x={3} y={13} width={7} height={3} rx={1.5} fill={color} />
    </Svg>
  );
}

export function TreadmillIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2.5 18.5h14l4.5-4M16.5 18.5V6.5h3"
        fill="none"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={2} y={19.5} width={15} height={2} rx={1} fill={color} />
    </Svg>
  );
}

export function RowerIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={17} width={20} height={2.6} rx={1.3} fill={color} />
      <Circle cx={18} cy={11} r={4.5} fill={color} />
      <Rect x={5} y={13.5} width={6} height={3} rx={1.5} fill={color} />
      <Path d="M8 13.5L13 9" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function FoamRollerIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={7} width={20} height={10} rx={5} fill={color} />
      <Path d="M8 7v10M12 7v10M16 7v10" stroke={colors.surface} strokeWidth={1.4} />
    </Svg>
  );
}

export function YogaMatIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={9} width={14} height={8} rx={2} fill={color} />
      <Circle cx={17} cy={13} r={5} fill={color} />
      <Circle cx={17} cy={13} r={2} fill={colors.surface} />
    </Svg>
  );
}

export function JumpRopeIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={3} width={3.4} height={8} rx={1.7} fill={color} />
      <Rect x={18.6} y={3} width={3.4} height={8} rx={1.7} fill={color} />
      <Path
        d="M3.7 11c0 9 16.6 9 16.6 0"
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CloseIcon({ color, size = 10 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
    </Svg>
  );
}

export function PlusIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

export function SearchIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={2.6} />
      <Path d="M16 16l4.5 4.5" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

/** A clock face filled in for `minutes` of the hour. */
export function DialIcon({ color, minutes, size = 28 }: IconProps & { minutes: number }) {
  const turn = Math.min(minutes / 60, 1) * 2 * Math.PI;
  const x = 12 + 10 * Math.sin(turn);
  const y = 12 - 10 * Math.cos(turn);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle
        cx={12}
        cy={12}
        r={10}
        fill={minutes >= 60 ? color : colors.surface}
        stroke={color}
        strokeWidth={2}
      />
      {minutes < 60 ? (
        <Path d={`M12 12V2A10 10 0 ${turn > Math.PI ? 1 : 0} 1 ${x} ${y}Z`} fill={color} />
      ) : null}
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
