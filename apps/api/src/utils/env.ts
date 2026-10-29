// Environment validation - in production, use a proper validation library
export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? '',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
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