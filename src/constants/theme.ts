/**
 * Design tokens. Use these instead of hard-coded colours, fonts or sizes.
 * Light theme only for now (app.json sets userInterfaceStyle: "light").
 */

export const colors = {
  primary: '#16803C',
  primaryPressed: '#11672F',
  onPrimary: '#FFFFFF',
  accent: '#FFB020',
  background: '#F7F6F2',
  surface: '#FFFFFF',
  text: '#14161A',
  textMuted: '#5F6368',
  border: '#E6E3DC',
  success: '#1E9E57',
  danger: '#D93F3F',
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
  pill: 999,
} as const;
