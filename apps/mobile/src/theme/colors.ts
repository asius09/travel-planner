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
  ivory50: '#F6F4EF',
  white: '#FFFFFF',

  // Ink Scale
  ink900: '#252B2D',
  ink700: '#454B4D',

  // Ocean Scale
  ocean700: '#456779',
  ocean500: '#64869A',

  // Muted / Surface
  mist100: '#DCE5E7',
  stone200: '#E7E3DB',
  muted500: '#777D7D',

  // Status
  success700: '#286749',
  warning800: '#795000',
  danger700: '#B42318',
} as const

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

  primary: primitiveColors.ink900,
  primaryForeground: primitiveColors.white,

  secondary: primitiveColors.mist100,
  secondaryForeground: primitiveColors.ink900,

  accent: primitiveColors.ocean500,
  accentForeground: primitiveColors.ink900,

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

  overlay: '#252B2D80',
  imageOverlay: '#252B2D99',

  // Direct primitive access for convenience
  white: primitiveColors.white,
  ink900: primitiveColors.ink900,
  ink700: primitiveColors.ink700,
} as const

/**
 * Mood-specific semantic color overrides.
 * Used by the theme store to provide mood-specific values.
 */
export const moodColors = {
  nature: {
    primary: '#263F35',
    primaryForeground: '#FFFFFF',
    accent: '#D7E58A',
    accentForeground: '#252B2D',
    soft: '#E8EBDD',
  },
  city: {
    primary: '#963F32',
    primaryForeground: '#FFFFFF',
    accent: '#D8A66A',
    accentForeground: '#252B2D',
    soft: '#F1E6D5',
  },
  beach: {
    primary: '#176C70',
    primaryForeground: '#FFFFFF',
    accent: '#E3C77A',
    accentForeground: '#252B2D',
    soft: '#DCEEF0',
  },
  adventure: {
    primary: '#344B5B',
    primaryForeground: '#FFFFFF',
    accent: '#CB7049',
    accentForeground: '#252B2D',
    soft: '#E8DCC8',
  },
} as const

export type MoodName = keyof typeof moodColors