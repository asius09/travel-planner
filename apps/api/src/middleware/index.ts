import { createMiddleware } from 'hono/factory'
import { auth } from '../utils/auth'
import { env } from '../utils/env'
import { createRemoteJWKSet, jwtVerify } from 'jose'

// Create JWKS client for Neon Auth token verification
const jwks = createRemoteJWKSet(new URL(`${env.NEON_AUTH_JWKS_URL}`))

// Custom auth middleware that extracts session from cookie/header
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  const cookieHeader = c.req.header('Cookie')
  
  let session = null
  let user = null
  
  // Try JWT token verification first (for Neon Auth tokens)
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    
    // Try JWT verification first (for Neon Auth tokens)
    try {
      const { payload } = await jwtVerify(token, jwks)
      if (payload.sub) {
        // Token is valid, fetch user from database
        // For now, we'll use better-auth's session API as fallback
        const result = await auth.api.getSession({ headers: { authorization: `Bearer ${token}` } })
        session = result?.session
        user = result?.user
      }
    } catch {
      // JWT verification failed, try better-auth session API
      const result = await auth.api.getSession({ headers: { authorization: `Bearer ${token}` } })
      session = result?.session
      user = result?.user
    }
  } else if (cookieHeader) {
    const result = await auth.api.getSession({ headers: { cookie: cookieHeader } })
    session = result?.session
    user = result?.user
  }
  
  if (!session || !user) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }
  
  // Attach user and session to context
  c.set('user', user)
  c.set('session', session)
  
  await next()
})

// Optional auth - doesn't require auth but attaches if present
export const optionalAuthMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  const cookieHeader = c.req.header('Cookie')
  
  if (authHeader?.startsWith('Bearer ') || cookieHeader) {
    let session = null
    let user = null
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      try {
        const { payload } = await jwtVerify(token, jwks)
        if (payload.sub) {
          const result = await auth.api.getSession({ headers: { authorization: `Bearer ${token}` } })
          session = result?.session
          user = result?.user
        }
      } catch {
        const result = await auth.api.getSession({ headers: { authorization: `Bearer ${token}` } })
        session = result?.session
        user = result?.user
      }
    } else if (cookieHeader) {
      const result = await auth.api.getSession({ headers: { cookie: cookieHeader } })
      session = result?.session
      user = result?.user
    }
    
    if (session && user) {
      c.set('user', user)
      c.set('session', session)
    }
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