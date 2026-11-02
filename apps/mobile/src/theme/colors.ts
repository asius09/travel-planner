/**
 * Primitive color values for use in inline styles and component props
 * where Tailwind utility classes cannot be used (e.g., LinearGradient colors,
 * Ionicons color props, StyleSheet.create values, etc.).
 *
 * These match the tokens defined in global.css and tailwind.config.ts.
 * Keep in sync with global.css primitive tokens.
 */

export const primitiveColors = {
  // Base
  ivory50: '#FAF9F6',
  white: '#FFFFFF',

  ink900: '#1A1D1E',
  ink700: '#555E62',

  ocean700: '#026AA7',
  ocean500: '#0284C7',

  mist100: '#EBF5FB',
  stone200: '#E4E7E9',
  muted500: '#6C757D',

  success700: '#19633F',
  warning800: '#875200',
  danger700: '#B32118',
} as const;

/**
 * Semantic color aliases referencing primitives.
 * Use these for inline styles where Tailwind classes don't apply.
 */
export const semanticColors = {
  background: primitiveColors.ivory50,
  foreground: primitiveColors.ink900,

  surface: primitiveColors.white,
  surfaceElevated: primitiveColors.white,
  surfaceMuted: primitiveColors.mist100,

  primary: primitiveColors.ocean700,
  primaryForeground: primitiveColors.white,

  secondary: primitiveColors.mist100,
  secondaryForeground: primitiveColors.ink900,

  accent: primitiveColors.ocean500,
  accentForeground: primitiveColors.white,

  muted: primitiveColors.stone200,
  mutedForeground: primitiveColors.ink700,

  card: primitiveColors.white,
  cardForeground: primitiveColors.ink900,

  popover: primitiveColors.white,
  popoverForeground: primitiveColors.ink900,

  border: primitiveColors.stone200,
  input: primitiveColors.stone200,
  ring: primitiveColors.ocean700,

  success: primitiveColors.success700,
  successForeground: primitiveColors.white,
  warning: primitiveColors.warning800,
  warningForeground: primitiveColors.white,
  destructive: primitiveColors.danger700,
  destructiveForeground: primitiveColors.white,

  navigationBackground: primitiveColors.white,
  navigationForeground: primitiveColors.ink700,
  navigationActive: primitiveColors.ocean700,

  skeleton: primitiveColors.stone200,
  focusRing: primitiveColors.ocean700,

  overlay: '#1A1D1E80',
  imageOverlay: '#1A1D1E99',

  white: primitiveColors.white,
  ink900: primitiveColors.ink900,
  ink700: primitiveColors.ink700,
} as const;

/**
 * Mood color definitions. All moods resolve to the cohesive brand palette.
 */
const BRAND_MOOD = {
  primary: primitiveColors.ocean700,
  primaryForeground: primitiveColors.white,
  accent: primitiveColors.ocean500,
  accentForeground: primitiveColors.white,
  soft: primitiveColors.mist100,
} as const;

export const moodColors = {
  nature: BRAND_MOOD,
  city: BRAND_MOOD,
  beach: BRAND_MOOD,
  adventure: BRAND_MOOD,
} as const;

export type MoodName = keyof typeof moodColors;
