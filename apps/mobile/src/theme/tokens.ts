/**
 * Outta Design Tokens
 * Central source of truth for design tokens.
 * 
 * COLOR SYSTEM:
 * - Primitive tokens are defined in global.css (--color-*)
 * - Semantic tokens are defined in global.css (--background, --foreground, --primary, etc.)
 * - Components MUST use semantic tokens via NativeWind utilities (bg-background, text-foreground, bg-primary, etc.)
 * - Hardcoded hex values are PROHIBITED in component code.
 * 
 * This file now only contains non-color tokens: radii, typography, spacing, and mood gradients.
 */

export const radii = {
  none: 0,
  sm: 8,
  md: 14,
  lg: 18,
  card: 20,
  cardLg: 28,
  hero: 32,
  pill: 9999,
} as const

export const typography = {
  fontFamily: {
    regular: 'Geist_Regular',
    medium: 'Geist_Medium',
    semiBold: 'Geist_SemiBold',
    display: 'Geist',
  },
  fontSize: {
    hero: 32,
    screenTitle: 28,
    sectionTitle: 22,
    cardTitle: 18,
    body: 15,
    bodySm: 14,
    metadata: 13,
    caption: 12,
  },
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

/**
 * Mood-specific avatar gradients.
 * These use the approved mood palette from DESIGN.md:
 * - Nature: lime/sage tones
 * - City: warm ochre/terracotta tones
 * - Beach: teal/sand tones
 * - Adventure: warm canyon/stone tones
 */
export const avatarGradients: Record<string, readonly [string, string, string]> = {
  nature: ['#D4F638', '#2D5B48', '#14261F'],
  city: ['#F59E0B', '#B45309', '#451A03'],
  beach: ['#38BDF8', '#0284C7', '#083344'],
  adventure: ['#FB923C', '#C2410C', '#1E293B'],
} as const