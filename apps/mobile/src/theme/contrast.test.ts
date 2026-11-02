import { describe, it, expect } from 'vitest'
import { primitiveColors, semanticColors, moodColors } from './colors'

interface RGBA {
  r: number
  g: number
  b: number
  a: number
}

/**
 * Parse hex string (#RGB, #RRGGBB, #RRGGBBAA) or rgba string to normalized RGBA (0-1).
 */
export function parseColor(color: string): RGBA {
  const c = color.trim()
  if (c.startsWith('#')) {
    const hex = c.slice(1)
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16) / 255,
        g: parseInt(hex[1] + hex[1], 16) / 255,
        b: parseInt(hex[2] + hex[2], 16) / 255,
        a: 1,
      }
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16) / 255,
        g: parseInt(hex.slice(2, 4), 16) / 255,
        b: parseInt(hex.slice(4, 6), 16) / 255,
        a: 1,
      }
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16) / 255,
        g: parseInt(hex.slice(2, 4), 16) / 255,
        b: parseInt(hex.slice(4, 6), 16) / 255,
        a: parseInt(hex.slice(6, 8), 16) / 255,
      }
    }
  }

  const rgbaMatch = c.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/)
  if (rgbaMatch) {
    return {
      r: parseFloat(rgbaMatch[1]) / 255,
      g: parseFloat(rgbaMatch[2]) / 255,
      b: parseFloat(rgbaMatch[3]) / 255,
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    }
  }

  throw new Error(`Unsupported color format: ${color}`)
}

/**
 * Composite a translucent color over an opaque background using alpha blending.
 */
export function compositeColor(fg: RGBA, bg: RGBA): RGBA {
  const a = fg.a + bg.a * (1 - fg.a)
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
    a,
  }
}

/**
 * WCAG 2.2 Relative Luminance Calculation
 * For each channel c:
 *   if c <= 0.04045 => c / 12.92
 *   else => ((c + 0.055) / 1.055) ^ 2.4
 * L = 0.2126R + 0.7152G + 0.0722B
 */
export function relativeLuminance(rgba: RGBA): number {
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const r = toLinear(rgba.r)
  const g = toLinear(rgba.g)
  const b = toLinear(rgba.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * WCAG 2.2 Contrast Ratio Calculation
 * (L1 + 0.05) / (L2 + 0.05) where L1 is lighter and L2 is darker.
 */
export function calculateContrastRatio(fgColor: string, bgColor: string, underlyingSurface?: string): number {
  const fg = parseColor(fgColor)
  let bg = parseColor(bgColor)

  if (bg.a < 1 && underlyingSurface) {
    const under = parseColor(underlyingSurface)
    bg = compositeColor(bg, under)
  }

  let finalFg = fg
  if (fg.a < 1) {
    finalFg = compositeColor(fg, bg)
  }

  const l1 = relativeLuminance(finalFg)
  const l2 = relativeLuminance(bg)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

describe('WCAG 2.2 Contrast Audit Matrix', () => {
  interface ContrastCheck {
    name: string
    fg: string
    bg: string
    underlying?: string
    threshold: number
    type: 'normal-text' | 'large-text' | 'ui-component' | 'focus-indicator'
  }

  const checks: ContrastCheck[] = [
    // 1. foreground on background
    {
      name: 'foreground on background',
      fg: semanticColors.foreground,
      bg: semanticColors.background,
      threshold: 4.5,
      type: 'normal-text',
    },
    // 2. foreground on surface
    {
      name: 'foreground on surface',
      fg: semanticColors.foreground,
      bg: semanticColors.surface,
      threshold: 4.5,
      type: 'normal-text',
    },
    // 3. card-foreground on card
    {
      name: 'card-foreground on card',
      fg: semanticColors.cardForeground,
      bg: semanticColors.card,
      threshold: 4.5,
      type: 'normal-text',
    },
    // 4. primary-foreground on primary
    {
      name: 'primary-foreground on primary',
      fg: semanticColors.primaryForeground,
      bg: semanticColors.primary,
      threshold: 4.5,
      type: 'normal-text',
    },
    // 5. secondary-foreground on secondary
    {
      name: 'secondary-foreground on secondary',
      fg: semanticColors.secondaryForeground,
      bg: semanticColors.secondary,
      threshold: 4.5,
      type: 'normal-text',
    },
    // 6. accent-foreground on accent (for large text / indicators as specified)
    {
      name: 'accent-foreground on accent',
      fg: semanticColors.accentForeground,
      bg: semanticColors.accent,
      threshold: 3.0,
      type: 'large-text',
    },
    // 7. muted-foreground on background, surface, and surface-muted
    {
      name: 'muted-foreground on background',
      fg: semanticColors.mutedForeground,
      bg: semanticColors.background,
      threshold: 4.5,
      type: 'normal-text',
    },
    {
      name: 'muted-foreground on surface',
      fg: semanticColors.mutedForeground,
      bg: semanticColors.surface,
      threshold: 4.5,
      type: 'normal-text',
    },
    {
      name: 'muted-foreground on surface-muted',
      fg: semanticColors.mutedForeground,
      bg: semanticColors.surfaceMuted,
      threshold: 4.5,
      type: 'normal-text',
    },
    // 8. Navigation foreground and active state against navigation backgrounds
    {
      name: 'navigation-foreground on navigation-background',
      fg: semanticColors.navigationForeground,
      bg: semanticColors.navigationBackground,
      threshold: 4.5,
      type: 'normal-text',
    },
    {
      name: 'navigation-active on navigation-background',
      fg: semanticColors.navigationActive,
      bg: semanticColors.navigationBackground,
      threshold: 4.5,
      type: 'normal-text',
    },
    // 9. Destructive, success, and warning text against their actual component surfaces
    {
      name: 'destructive on surface',
      fg: semanticColors.destructive,
      bg: semanticColors.surface,
      threshold: 4.5,
      type: 'normal-text',
    },
    {
      name: 'destructive-foreground on destructive',
      fg: semanticColors.destructiveForeground,
      bg: semanticColors.destructive,
      threshold: 4.5,
      type: 'normal-text',
    },
    {
      name: 'success on surface',
      fg: semanticColors.success,
      bg: semanticColors.surface,
      threshold: 4.5,
      type: 'normal-text',
    },
    {
      name: 'success-foreground on success',
      fg: semanticColors.successForeground,
      bg: semanticColors.success,
      threshold: 4.5,
      type: 'normal-text',
    },
    {
      name: 'warning on surface',
      fg: semanticColors.warning,
      bg: semanticColors.surface,
      threshold: 4.5,
      type: 'normal-text',
    },
    {
      name: 'warning-foreground on warning',
      fg: semanticColors.warningForeground,
      bg: semanticColors.warning,
      threshold: 4.5,
      type: 'normal-text',
    },
    // 10. Input text, placeholder text, borders, selected indicators, and focus rings
    {
      name: 'input text (foreground) on input surface',
      fg: semanticColors.foreground,
      bg: semanticColors.surface,
      threshold: 4.5,
      type: 'normal-text',
    },
    {
      name: 'placeholder text (muted-foreground) on input surface',
      fg: semanticColors.mutedForeground,
      bg: semanticColors.surface,
      threshold: 4.5,
      type: 'normal-text',
    },
    {
      name: 'focus-ring on surface',
      fg: semanticColors.focusRing,
      bg: semanticColors.surface,
      threshold: 3.0,
      type: 'focus-indicator',
    },
    {
      name: 'focus-ring on background',
      fg: semanticColors.focusRing,
      bg: semanticColors.background,
      threshold: 3.0,
      type: 'focus-indicator',
    },
    // 11. Text and controls over destination image overlays
    {
      name: 'white text on image overlay (composited over white photo)',
      fg: semanticColors.white,
      bg: semanticColors.imageOverlay,
      underlying: '#FFFFFF',
      threshold: 3.0,
      type: 'large-text',
    },
    {
      name: 'white text on deep dark overlay (0.85 opacity over dark photo)',
      fg: semanticColors.white,
      bg: 'rgba(26, 29, 30, 0.85)',
      underlying: primitiveColors.ink900,
      threshold: 4.5,
      type: 'normal-text',
    },
  ]

  for (const check of checks) {
    it(`verifies ${check.name} meets ${check.threshold}:1 (${check.type})`, () => {
      const ratio = calculateContrastRatio(check.fg, check.bg, check.underlying)
      const ratioRounded = Math.round(ratio * 100) / 100
      expect(
        ratio,
        `FAILED CONTRAST CHECK: "${check.name}" (type: ${check.type})
Actual ratio: ${ratioRounded}:1
Required threshold: ${check.threshold}:1
Foreground: ${check.fg}
Background: ${check.bg}`
      ).toBeGreaterThanOrEqual(check.threshold)
    })
  }

  describe('Mood Theme Accents Contrast', () => {
    const moods = Object.entries(moodColors)
    for (const [moodName, tokens] of moods) {
      it(`verifies ${moodName} primaryForeground on primary meets 4.5:1`, () => {
        const ratio = calculateContrastRatio(tokens.primaryForeground, tokens.primary)
        expect(ratio).toBeGreaterThanOrEqual(4.5)
      })

      it(`verifies ${moodName} accentForeground on accent meets 3.0:1`, () => {
        const ratio = calculateContrastRatio(tokens.accentForeground, tokens.accent)
        expect(ratio).toBeGreaterThanOrEqual(3.0)
      })
    }
  })
})
