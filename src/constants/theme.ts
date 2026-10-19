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
  text: '#1E2A3A',
  textMuted: '#667487',
  border: '#E0E6EE',
  success: '#2FAE6B',
  danger: '#E5484D',
} as const;

/** Each coach's colours: `wash` is the splash background, `ink` its text and buttons. */
export const coachColors = {
  rex: { wash: '#E4ECFF', ink: '#3F6FF0' },
  axel: { wash: '#FFE9DA', ink: '#EE6A14' },
  sage: { wash: '#D8F5EC', ink: '#16A383' },
  luna: { wash: '#ECE6FF', ink: '#7A5CE6' },
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
