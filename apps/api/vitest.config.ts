import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Unit tests only. API coverage lives in *.integration.test.ts, which needs a
    // live database and runs via `pnpm test:integration`.
    passWithNoTests: true,
    exclude: ['src/**/*.integration.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})