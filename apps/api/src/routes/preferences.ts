import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'
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

export const preferencesRoutes = new OpenAPIHono()

// Get current user preferences
preferencesRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/preferences',
    summary: 'Get current user preferences',
    security: [{ Bearer: [] }, { Cookie: [] }],
    responses: {
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
        return c.json(null)
      }
      
      return c.json({
        ...prefs,
        regionCode: prefs.regionCode ?? null,
        updatedAt: prefs.updatedAt.toISOString(),
      })
    } catch (error) {
      console.error('Preferences fetch error:', error)
      return c.json({ error: 'Failed to fetch preferences', code: 'FETCH_FAILED' }, 500)
    }
  }
)

// Create or update preferences
preferencesRoutes.openapi(
  createRoute({
    method: 'put',
    path: '/preferences',
    summary: 'Create or update user preferences',
    security: [{ Bearer: [] }, { Cookie: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: userPreferencesSchema.omit({ userId: true, updatedAt: true }),
          },
        },
      },
    },
    responses: {
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
  async (c) => {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
    }
    
    const body = c.req.valid('json')
    
    try {
      const existing = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, user.id),
      })
      
      let prefs
      if (existing) {
        [prefs] = await db
          .update(userPreferences)
          .set({
            ...body,
            updatedAt: new Date(),
          })
          .where(eq(userPreferences.userId, user.id))
          .returning()
      } else {
        [prefs] = await db
          .insert(userPreferences)
          .values({
            userId: user.id,
            ...body,
          })
          .returning()
      }
      
      return c.json({
        ...prefs,
        regionCode: prefs.regionCode ?? null,
        updatedAt: prefs.updatedAt.toISOString(),
      })
    } catch (error) {
      console.error('Preferences update error:', error)
      return c.json({ error: 'Failed to update preferences', code: 'UPDATE_FAILED' }, 500)
    }
  }
)