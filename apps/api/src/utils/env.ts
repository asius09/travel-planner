import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as dotenvConfig } from 'dotenv';

const envCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
  resolve(__dirname, '../../../.env'),
  resolve(__dirname, '../../.env'),
];

for (const path of envCandidates) {
  if (!existsSync(path)) continue;
  dotenvConfig({ path });
  if (process.env.DATABASE_URL) break;
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? '',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL ?? '',
  NEON_AUTH_JWKS_URL: process.env.NEON_AUTH_JWKS_URL ?? '',
  API_PORT: parseInt(process.env.API_PORT ?? '3001', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) ?? [],
};

function validateEnv() {
  const required = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'NEON_AUTH_JWKS_URL'] as const;
  const missing = required.filter(key => !env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy .env.example to .env at the repository root and fill in the values.'
    );
  }
}

if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}
