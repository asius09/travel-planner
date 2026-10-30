import { createMiddleware } from 'hono/factory'
import { eq } from 'drizzle-orm'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { auth } from '../utils/auth'
import { env } from '../utils/env'
import { db } from '../db'
import { users } from '../db/schema'
import type { AuthSession, AuthUser } from '../types'

// JWKS client used to verify Neon Auth access tokens
const jwks = createRemoteJWKSet(new URL(`${env.NEON_AUTH_JWKS_URL}`))

interface Identity {
  user: AuthUser
  session: AuthSession
}

/**
 * The mobile app authenticates through Neon Auth, which issues JWTs. Local
 * tables (trips, preferences) reference a local `users` row, so a verified Neon
 * identity is mapped onto one - created on first sight, then reused.
 */
async function findOrCreateUser(
  email: string,
  claims: Record<string, unknown>,
): Promise<AuthUser | null> {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      emailVerified: existing.emailVerified,
      createdAt: existing.createdAt,
    }
  }

  const name = typeof claims.name === 'string' ? claims.name : null
  const [created] = await db
    .insert(users)
    .values({
      email,
      name,
      emailVerified: claims.email_verified === true,
    })
    .returning()

  return created
    ? {
        id: created.id,
        email: created.email,
        name: created.name,
        emailVerified: created.emailVerified,
        createdAt: created.createdAt,
      }
    : null
}

async function resolveIdentity(authorization?: string, cookie?: string): Promise<Identity | null> {
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice(7)

    // 1. Neon Auth access token (JWT signed by the managed auth service)
    try {
      const { payload } = await jwtVerify(token, jwks)
      const email = typeof payload.email === 'string' ? payload.email : null
      if (email) {
        const user = await findOrCreateUser(email, payload as Record<string, unknown>)
        if (user) {
          return {
            user,
            session: { id: user.id, token, expiresAt: new Date(payload.exp ? payload.exp * 1000 : Date.now()) },
          }
        }
      }
    } catch {
      // Not a Neon token - fall through to a local Better Auth session.
    }

    // 2. Local email/password session token
    const result = await auth.api.getSession({ headers: { authorization: `Bearer ${token}` } })
    if (result?.session && result.user) {
      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name ?? null,
          emailVerified: result.user.emailVerified,
          createdAt: new Date(result.user.createdAt),
        },
        session: {
          id: result.session.id,
          token: result.session.token,
          expiresAt: new Date(result.session.expiresAt),
        },
      }
    }
  }

  if (cookie) {
    const result = await auth.api.getSession({ headers: { cookie } })
    if (result?.session && result.user) {
      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name ?? null,
          emailVerified: result.user.emailVerified,
          createdAt: new Date(result.user.createdAt),
        },
        session: {
          id: result.session.id,
          token: result.session.token,
          expiresAt: new Date(result.session.expiresAt),
        },
      }
    }
  }

  return null
}

// Require a valid identity (Neon Auth JWT or local session)
export const authMiddleware = createMiddleware(async (c, next) => {
  const identity = await resolveIdentity(c.req.header('Authorization'), c.req.header('Cookie'))

  if (!identity) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }

  c.set('user', identity.user)
  c.set('session', identity.session)

  await next()
})

// Attach an identity when present, but never block the request
export const optionalAuthMiddleware = createMiddleware(async (c, next) => {
  const identity = await resolveIdentity(c.req.header('Authorization'), c.req.header('Cookie'))

  if (identity) {
    c.set('user', identity.user)
    c.set('session', identity.session)
  }

  await next()
})

// Rate limiting middleware (simple in-memory for MVP)
const requestCounts = new Map<string, { count: number; resetAt: number }>()

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const ip = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'unknown'
  const key = `${ip}:${c.req.path}`
  const now = Date.now()

  const record = requestCounts.get(key)
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100

  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs })
  } else if (record.count >= maxRequests) {
    return c.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, 429)
  } else {
    record.count++
  }

  await next()
})

// CORS middleware
export const corsMiddleware = createMiddleware(async (c, next) => {
  const origin = c.req.header('Origin')
  const allowedOrigins = env.CORS_ORIGINS

  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    c.header('Access-Control-Allow-Origin', origin)
    c.header('Access-Control-Allow-Credentials', 'true')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
  }

  if (c.req.method === 'OPTIONS') {
    return c.newResponse(null, 204)
  }

  await next()
})
