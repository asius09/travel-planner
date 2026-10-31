import type { Config } from 'tailwindcss'
import { hairlineWidth } from 'nativewind/theme'
import nativewind from 'nativewind/preset'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './global.css',
  ],
  presets: [nativewind],
  theme: {
    extend: {
      colors: {
        /* 
         * Semantic color tokens - base values matching Nature mood (default).
         * Mood-specific overrides are applied at runtime via theme store.
         */
        background: '#F6F4EF',      // ivory-50
        foreground: '#252B2D',      // ink-900

        surface: '#FFFFFF',         // white-0
        'surface-elevated': '#FFFFFF',
        'surface-muted': '#DCE5E7', // mist-100

        // Nature mood defaults (default theme)
        primary: '#263F35',         // nature primary - deep forest
        'primary-foreground': '#FFFFFF',

        secondary: '#E8EBDD',       // nature soft - moss wash
        'secondary-foreground': '#252B2D',

        accent: '#D7E58A',          // nature accent - vivid lime/sage
        'accent-foreground': '#252B2D',

        muted: '#E7E3DB',           // stone-200
        'muted-foreground': '#454B4D', // ink-700

        card: '#FFFFFF',
        'card-foreground': '#252B2D',

        popover: '#FFFFFF',
        'popover-foreground': '#252B2D',

        border: '#E7E3DB',          // stone-200
        input: '#E7E3DB',
        ring: '#456779',            // ocean-700

        success: '#286749',
        'success-foreground': '#FFFFFF',
        warning: '#795000',
        'warning-foreground': '#FFFFFF',
        destructive: '#B42318',
        'destructive-foreground': '#FFFFFF',

        'navigation-background': '#FFFFFF',
        'navigation-foreground': '#454B4D',
        'navigation-active': '#456779',

        skeleton: '#E7E3DB',
        'focus-ring': '#456779',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'card': '1.125rem', // 18px
        'input': '1rem', // 16px
      },
      fontSize: {
        'hero': ['1.875rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // 30px
        'screen-title': ['1.625rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 26px
        'card-title': ['1rem', { lineHeight: '1.3' }], // 16px
        'body': ['0.9375rem', { lineHeight: '1.5' }], // 15px
        'metadata': ['0.8125rem', { lineHeight: '1.4' }], // 13px
      },
    },
  },
  plugins: [],
}

export default config