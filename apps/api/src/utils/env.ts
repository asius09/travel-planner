// Environment validation - in production, use a proper validation library
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

// Load .env from the project root (two levels up from apps/api/src/utils/)
dotenvConfig({ path: resolve(__dirname, '../../.env') })

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? '',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL ?? '',
  NEON_AUTH_JWKS_URL: process.env.NEON_AUTH_JWKS_URL ?? '',
  API_PORT: parseInt(process.env.API_PORT ?? '3000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) ?? [],
}

// Validate required env vars
function validateEnv() {
  const required = ['DATABASE_URL', 'BETTER_AUTH_SECRET']
  const missing = required.filter(key => !env[key as keyof typeof env])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Run validation on import
if (process.env.NODE_ENV !== 'test') {
  validateEnv()
}