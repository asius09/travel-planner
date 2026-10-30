import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'
import { authSecurity, type AppEnv } from '../types'
import { eq } from 'drizzle-orm'
import { auth } from '../utils/auth'
import { db } from '../db'
import { sessions } from '../db/schema'
import { signUpSchema, signInSchema } from '@travel-planner/shared'

const authResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
    emailVerified: z.boolean(),
    createdAt: z.string().datetime(),
  }),
  session: z
    .object({
      id: z.string().uuid(),
      token: z.string(),
      expiresAt: z.string().datetime(),
    })
    .nullable(),
})

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
})

/**
 * Better Auth returns an opaque session token; look up the persisted session row
 * so API clients receive the same id/expiry the database holds.
 */
async function loadSession(token: string | null | undefined) {
  if (!token) return null

  const [row] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1)
  if (!row) return null

  return { id: row.id, token: row.token, expiresAt: row.expiresAt }
}

export const authRoutes = new OpenAPIHono<AppEnv>()

// Sign up
authRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/auth/signup',
    summary: 'Create a new account',
    request: {
      body: {
        content: {
          'application/json': {
            schema: signUpSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Account created successfully',
        content: {
          'application/json': {
            schema: authResponseSchema,
          },
        },
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
      409: {
        description: 'Email already exists',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: 'Could not create the account',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
    tags: ['Auth'],
  }),
  async (c) => {
    const body = c.req.valid('json')

    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: body.email,
          password: body.password,
          // Better Auth requires a display name; fall back to the email local part.
          name: body.name ?? body.email.split('@')[0],
        },
      })

      if (!result) {
        return c.json({ error: 'Failed to create account', code: 'SIGNUP_FAILED' }, 400)
      }

      const session = await loadSession(result.token)

      return c.json(
        {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            emailVerified: result.user.emailVerified,
            createdAt: new Date(result.user.createdAt).toISOString(),
          },
          session,
        },
        201,
      )
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return c.json({ error: 'Email already registered', code: 'EMAIL_EXISTS' }, 409)
      }
      console.error('Signup error:', error)
      return c.json({ error: 'Failed to create account', code: 'SIGNUP_FAILED' }, 500)
    }
  },
)

// Sign in
authRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/auth/signin',
    summary: 'Sign in to existing account',
    request: {
      body: {
        content: {
          'application/json': {
            schema: signInSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Signed in successfully',
        content: {
          'application/json': {
            schema: authResponseSchema,
          },
        },
      },
      400: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
      401: {
        description: 'Invalid credentials',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: 'Could not sign in',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
    tags: ['Auth'],
  }),
  async (c) => {
    const body = c.req.valid('json')

    try {
      const result = await auth.api.signInEmail({
        body: {
          email: body.email,
          password: body.password,
        },
      })

      if (!result) {
        return c.json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401)
      }

      const session = await loadSession(result.token)

      return c.json(
        {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            emailVerified: result.user.emailVerified,
            createdAt: new Date(result.user.createdAt).toISOString(),
          },
          session,
        },
        200,
      )
    } catch (error) {
      console.error('Signin error:', error)
      return c.json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401)
    }
  },
)

// Sign out
authRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/auth/signout',
    summary: 'Sign out current session',
    security: authSecurity,
    responses: {
      200: {
        description: 'Signed out successfully',
        content: {
          'application/json': {
            schema: z.object({ success: z.boolean() }),
          },
        },
      },
      401: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: 'Could not sign out',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
    tags: ['Auth'],
  }),
  async (c) => {
    const session = c.get('session')

    if (!session) {
      return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
    }

    try {
      await auth.api.signOut({ headers: c.req.raw.headers })
      return c.json({ success: true }, 200)
    } catch (error) {
      console.error('Signout error:', error)
      return c.json({ error: 'Failed to sign out', code: 'SIGNOUT_FAILED' }, 500)
    }
  },
)

// Get current session
authRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/auth/session',
    summary: 'Get current session',
    security: authSecurity,
    responses: {
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
            200: {
        description: 'Current session',
        content: {
          'application/json': {
            schema: z.object({
              user: z
                .object({
                  id: z.string().uuid(),
                  email: z.string().email(),
                  name: z.string().nullable(),
                  emailVerified: z.boolean(),
                  createdAt: z.string().datetime(),
                })
                .nullable(),
              session: z
                .object({
                  id: z.string().uuid(),
                  expiresAt: z.string().datetime(),
                })
                .nullable(),
            }),
          },
        },
      },
      401: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
    tags: ['Auth'],
  }),
  async (c) => {
    const user = c.get('user')
    const session = c.get('session')

    if (!user || !session) {
      return c.json({ user: null, session: null }, 200)
    }

    return c.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified ?? false,
          createdAt: new Date(user.createdAt).toISOString(),
        },
        session: {
          id: session.id,
          expiresAt: new Date(session.expiresAt).toISOString(),
        },
      },
      200,
    )
  },
)
