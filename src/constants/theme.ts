/**
 * Design tokens. Use these instead of hard-coded colours, fonts or sizes.
 * Light theme only for now (app.json sets userInterfaceStyle: "light").
 */

export const colors = {
  primary: '#3F6DF3',
  primaryPressed: '#2E55C9',
  onPrimary: '#FFFFFF',
  accent: '#FFB020',
  background: '#F3F6FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F7',
  text: '#1E2A3A',
  textMuted: '#667487',
  textFaint: '#AEB5C3',
  border: '#E0E6EE',
  disabled: '#E5E8EF',
  disabledEdge: '#D5DAE4',
  success: '#2FAE6B',
  warning: '#F2BF3A',
  danger: '#E5484D',
} as const;

/**
 * Each coach's colours: `wash` is the splash background and the tint behind picked answers,
 * `ink` its text and buttons, `shade` the darker edge under its buttons.
 */
export const coachColors = {
  rex: { wash: '#E4ECFF', ink: '#3F6FF0', shade: '#2C54C9' },
  axel: { wash: '#FFE9DA', ink: '#EE6A14', shade: '#C9560C' },
  sage: { wash: '#D8F5EC', ink: '#16A383', shade: '#0F8269' },
  luna: { wash: '#ECE6FF', ink: '#7A5CE6', shade: '#5E42C7' },
} as const;

/** The level card's badge and progress bar; `glass` is the badge and bar on the purple card. */
export const levelColors = {
  fill: '#7A5CE6',
  shade: '#5E42C7',
  track: 'rgba(122, 92, 230, 0.16)',
  glass: 'rgba(255, 255, 255, 0.25)',
} as const;

/**
 * The sky at the top of Today, one set per time of day: `sky`, `far` and `near` hills, the
 * sun (or moon), and `ink` / `inkSoft` for the greeting written on it.
 */
export const skyColors = {
  morning: {
    sky: '#DCEFFF',
    far: '#B9E4C6',
    near: '#93D5AB',
    sun: '#FFC94D',
    ink: '#234E7D',
    inkSoft: '#4F77A3',
  },
  day: {
    sky: '#CFE7FF',
    far: '#AEDFBD',
    near: '#82CC9C',
    sun: '#FFC23D',
    ink: '#234E7D',
    inkSoft: '#4F77A3',
  },
  sunset: {
    sky: '#FFE4D4',
    far: '#D7DDB0',
    near: '#AFCF9C',
    sun: '#FF9F68',
    ink: '#7A3E2C',
    inkSoft: '#9E604C',
  },
  night: {
    sky: '#2B3668',
    far: '#38497F',
    near: '#283A66',
    sun: '#FFE7A3',
    ink: '#FFFFFF',
    inkSoft: 'rgba(255, 255, 255, 0.74)',
  },
} as const;

/**
 * Each weight is its own font family: Android ignores `fontWeight` for custom fonts.
 * Names must match the fonts loaded in src/app/_layout.tsx.
 */
export const fonts = {
  heading: 'BricolageGrotesque_700Bold',
  headingHeavy: 'BricolageGrotesque_800ExtraBold',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemiBold: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  bodyExtraBold: 'Figtree_800ExtraBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  button: 18,
  pill: 999,
} as const;
