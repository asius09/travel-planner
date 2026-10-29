import { defineConfig } from 'vitest/config'

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
  }
})