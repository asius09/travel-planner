/**
 * Outta Design Tokens
 * Central source of truth for colors, typography, spacing, radii, and shadows.
 * Adheres to DESIGN.md and AGENTS.md requirements.
 */

export const colors = {
  // Canvas & Surfaces
  canvas: '#F7F6F0',
  surface: '#FFFFFF',
  surfaceTranslucent: 'rgba(255, 255, 255, 0.85)',
  surfaceMuted: '#F0EFEA',

  // Foreground & Typography
  text: '#202822',
  textSecondary: '#4A554D',
  muted: '#777F78',
  mutedLight: '#A3AAA4',

  // Dividers & Borders
  border: '#E5E7DF',
  borderSubtle: '#EDEFE8',
  borderTranslucent: 'rgba(255, 255, 255, 0.3)',

  // Primary Brand & Mood Defaults (Nature)
  primary: '#263F35',
  primaryDark: '#1B2D26',
  accent: '#D7E58A',
  accentVivid: '#D4F638', // Vivid lime accent
  soft: '#E8EBDD',

  // Dark & Floating Surfaces (for floating dock and image overlays)
  charcoal: '#141A16',
  charcoalSurface: '#1C2420',
  charcoalDock: 'rgba(20, 26, 22, 0.92)',
  charcoalBorder: 'rgba(255, 255, 255, 0.1)',
  lime: '#D4F638',
  limeDark: '#121614',

  // Status & Feedback
  statusError: '#D9534F',
  statusErrorSoft: '#FDF0ED',
  statusSuccess: '#2E7D32',

  // Overlays
  overlayDark: 'rgba(32, 40, 34, 0.45)',
  overlayGradientStart: 'transparent',
  overlayGradientEnd: 'rgba(18, 24, 20, 0.85)',
} as const

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

export const avatarGradients: Record<string, readonly [string, string, string]> = {
  nature: ['#D4F638', '#2D5B48', '#14261F'],
  city: ['#F59E0B', '#B45309', '#451A03'],
  beach: ['#38BDF8', '#0284C7', '#083344'],
  adventure: ['#FB923C', '#C2410C', '#1E293B'],
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
