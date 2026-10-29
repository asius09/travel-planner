import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'
import { auth } from '../utils/auth'
import { signUpSchema, signInSchema } from '@travel-planner/shared'

const authResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
    emailVerified: z.boolean(),
    createdAt: z.string().datetime(),
  }),
  session: z.object({
    id: z.string().uuid(),
    token: z.string(),
    expiresAt: z.string().datetime(),
  }).nullable(),
})

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
})

export const authRoutes = new OpenAPIHono()

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
        },
      })
      
      if (!result) {
        return c.json({ error: 'Failed to create account', code: 'SIGNUP_FAILED' }, 400)
      }
      
      return c.json({
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          emailVerified: result.user.emailVerified,
          createdAt: result.user.createdAt.toISOString(),
        },
        session: result.session ? {
          id: result.session.id,
          token: result.session.token,
          expiresAt: result.session.expiresAt.toISOString(),
        } : null,
      }, 201)
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return c.json({ error: 'Email already registered', code: 'EMAIL_EXISTS' }, 409)
      }
      console.error('Signup error:', error)
      return c.json({ error: 'Failed to create account', code: 'SIGNUP_FAILED' }, 500)
    }
  }
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
      
      return c.json({
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          emailVerified: result.user.emailVerified,
          createdAt: result.user.createdAt.toISOString(),
        },
        session: result.session ? {
          id: result.session.id,
          token: result.session.token,
          expiresAt: result.session.expiresAt.toISOString(),
        } : null,
      })
    } catch (error) {
      console.error('Signin error:', error)
      return c.json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }, 401)
    }
  }
)

// Sign out
authRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/auth/signout',
    summary: 'Sign out current session',
    security: [{ Bearer: [] }, { Cookie: [] }],
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
      return c.json({ success: true })
    } catch (error) {
      console.error('Signout error:', error)
      return c.json({ error: 'Failed to sign out', code: 'SIGNOUT_FAILED' }, 500)
    }
  }
)

// Get current session
authRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/auth/session',
    summary: 'Get current session',
    security: [{ Bearer: [] }, { Cookie: [] }],
    responses: {
      200: {
        description: 'Current session',
        content: {
          'application/json': {
            schema: z.object({
              user: z.object({
                id: z.string().uuid(),
                email: z.string().email(),
                name: z.string().nullable(),
                emailVerified: z.boolean(),
                createdAt: z.string().datetime(),
              }).nullable(),
              session: z.object({
                id: z.string().uuid(),
                expiresAt: z.string().datetime(),
              }).nullable(),
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
      return c.json({ user: null, session: null })
    }
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt.toISOString(),
      },
    })
  }
)