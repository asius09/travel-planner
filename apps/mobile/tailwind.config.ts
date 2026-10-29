import type { Config } from 'tailwindcss'
import { hairlineWidth } from 'nativewind/theme'
import nativewind from 'nativewind/preset'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [nativewind],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F6F0',
        surface: '#FFFFFF',
        text: '#202822',
        muted: '#777F78',
        border: '#E5E7DF',
        // Nature (default) mood tokens
        primary: '#263F35',
        accent: '#D7E58A',
        soft: '#E8EBDD',
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