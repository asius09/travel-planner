'use client'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import { env } from '../utils/env'

// For Neon Managed Better Auth, we use the standard better-auth but configure it
// to work with Neon's managed auth. The actual auth is handled by Neon's managed
// auth service at NEON_AUTH_BASE_URL, but we still need better-auth for API routes
// that create sessions, etc.

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disabled per product decision
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.CORS_ORIGINS,
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  // Neon Managed Better Auth handles social providers, email OTP, magic links
  // through the Neon Auth service. We don't configure plugins here as Neon manages them.
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User