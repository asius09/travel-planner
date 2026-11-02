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
         * Semantic color tokens - clean luxury editorial travel palette.
         * Mood-specific overrides are applied at runtime via theme store.
         */
        background: '#FAF8F5',      // ivory-50 (luminous porcelain)
        foreground: '#1A1F21',      // ink-900 (obsidian ink)

        surface: '#FFFFFF',         // white-0
        'surface-elevated': '#FFFFFF',
        'surface-muted': '#EEF4F6', // mist-100 (clean seafoam wash)

        // Approved editorial theme defaults: deep ink, fresh mist, and vibrant azure ocean
        primary: '#1A1F21',         // ink-900
        'primary-foreground': '#FFFFFF',

        secondary: '#EEF4F6',       // mist-100
        'secondary-foreground': '#1A1F21',

        accent: '#3586A9',          // ocean-500 (Riviera azure)
        'accent-foreground': '#1A1F21',

        muted: '#EBE7DF',           // stone-200 (warm platinum sand)
        'muted-foreground': '#50575B', // ink-700 (clean graphite)

        card: '#FFFFFF',
        'card-foreground': '#1A1F21',

        popover: '#FFFFFF',
        'popover-foreground': '#1A1F21',

        border: '#EBE7DF',          // stone-200
        input: '#EBE7DF',
        ring: '#21627E',            // ocean-700 (deep marine)

        success: '#1C6946',
        'success-foreground': '#FFFFFF',
        warning: '#8A5800',
        'warning-foreground': '#FFFFFF',
        destructive: '#B8241B',
        'destructive-foreground': '#FFFFFF',

        'navigation-background': '#FFFFFF',
        'navigation-foreground': '#50575B',
        'navigation-active': '#21627E',

        skeleton: '#EBE7DF',
        'focus-ring': '#21627E',

        overlay: '#1A1F2180',
        'image-overlay': '#1A1F2199',
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