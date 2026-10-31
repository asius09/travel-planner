import { createRoute, z } from '@hono/zod-openapi'
import type { Context } from 'hono'
import { OpenAPIHono } from '@hono/zod-openapi'
import { authSecurity, type AppEnv } from '../types'
import { db } from '../db'
import { userPreferences, insertUserPreferencesSchema } from '../db/schema'
import { eq } from 'drizzle-orm'
import { authMiddleware } from '../middleware'
import { userPreferencesSchema } from '@travel-planner/shared'

const preferencesResponseSchema = z.object({
  userId: z.string().uuid(),
  travelMood: z.string(),
  duration: z.string(),
  budget: z.string(),
  travelParty: z.string(),
  currency: z.string(),
  regionCode: z.string().nullable(),
  updatedAt: z.string().datetime(),
})

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
})

export const preferencesRoutes = new OpenAPIHono<AppEnv>()

// Get current user preferences
preferencesRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/preferences',
    summary: 'Get current user preferences',
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
        description: 'User preferences',
        content: {
          'application/json': {
            schema: preferencesResponseSchema.nullable(),
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
    tags: ['Preferences'],
  }),
  async (c) => {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
    }
    
    try {
      const prefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, user.id),
      })
      
      if (!prefs) {
        return c.json(null, 200)
      }
      
      return c.json({
        ...prefs,
        regionCode: prefs.regionCode ?? null,
        updatedAt: prefs.updatedAt.toISOString(),
      }, 200)
    } catch (error) {
      console.error('Preferences fetch error:', error)
      return c.json({ error: 'Failed to fetch preferences', code: 'FETCH_FAILED' }, 500)
    }
  }
)

// Create or update preferences (supports both PUT and POST)

/** Body accepted by the update routes (server-managed columns excluded). */
const preferencesUpdateBodySchema = userPreferencesSchema.omit({
  userId: true,
  updatedAt: true,
})

type PreferencesUpdateBody = z.infer<typeof preferencesUpdateBodySchema>

/**
 * Persists the caller's preferences, creating or updating the row as needed.
 * Kept separate from the HTTP layer so the PUT and POST routes share it.
 */
async function persistPreferences(userId: string, body: PreferencesUpdateBody) {
  const existing = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  })

  if (existing) {
    const [updated] = await db
      .update(userPreferences)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning()
    return updated
  }

  const [created] = await db
    .insert(userPreferences)
    .values({ userId, ...body })
    .returning()
  return created
}

const updatePreferencesHandler = async (c: Context<AppEnv>) => {
  const user = c.get('user')

  if (!user) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }

  // `openapi` validates against the route schema before this handler runs, so
  // parsing here is a no-op at runtime but keeps the body statically typed.
  const body = preferencesUpdateBodySchema.parse(await c.req.json())

  try {
    const prefs = await persistPreferences(user.id, body)

    return c.json(
      {
        ...prefs,
        regionCode: prefs.regionCode ?? null,
        updatedAt: prefs.updatedAt.toISOString(),
      },
      200,
    )
  } catch (error) {
    console.error('Preferences update error:', error)
    return c.json({ error: 'Failed to update preferences', code: 'UPDATE_FAILED' }, 500)
  }
}

preferencesRoutes.openapi(
  createRoute({
    method: 'put',
    path: '/preferences',
    summary: 'Create or update user preferences',
    security: authSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: preferencesUpdateBodySchema,
          },
        },
      },
    },
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
        description: 'Preferences updated',
        content: {
          'application/json': {
            schema: preferencesResponseSchema,
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
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
    tags: ['Preferences'],
  }),
  updatePreferencesHandler
)

preferencesRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/preferences',
    summary: 'Create user preferences',
    security: authSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: preferencesUpdateBodySchema,
          },
        },
      },
    },
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
        description: 'Preferences updated',
        content: {
          'application/json': {
            schema: preferencesResponseSchema,
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
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
    tags: ['Preferences'],
  }),
  updatePreferencesHandler
)