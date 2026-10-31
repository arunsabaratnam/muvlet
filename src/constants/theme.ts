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

/** The bottom bar: the tint behind the open tab, and the raised Form check button. */
export const tabColors = {
  active: 'rgba(63, 109, 243, 0.12)',
  formCheck: '#FF9254',
} as const;
