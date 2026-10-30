import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig(async () => {
  const react = await import('@vitejs/plugin-react')
  return {
    plugins: [react.default()],
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./vitest.setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react-native': path.resolve(__dirname, './src/test/mocks/react-native.ts'),
        'expo-crypto': path.resolve(__dirname, './src/test/mocks/expo-crypto.ts'),
      },
    },
  }
})