import { createRoute, z } from '@hono/zod-openapi'
import type { Context } from 'hono'
import { OpenAPIHono } from '@hono/zod-openapi'
import { authSecurity, type AppEnv } from '../types'
import { db } from '../db'
import { userPreferences } from '../db/schema'
import { eq } from 'drizzle-orm'
import { userPreferencesUpdateSchema } from '@travel-planner/shared'

const preferencesResponseSchema = z.object({
  userId: z.string().uuid(),
  travelMood: z.string().nullable(),
  duration: z.string().nullable(),
  budget: z.string().nullable(),
  travelParty: z.string().nullable(),
  currency: z.string(),
  regionCode: z.string().nullable(),
  onboardingCompleted: z.boolean(),
  onboardingFlowVersion: z.number(),
  updatedAt: z.string().datetime(),
})

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
})

export const preferencesRoutes = new OpenAPIHono<AppEnv>()

function serializePreferences(prefs: typeof userPreferences.$inferSelect) {
  return {
    userId: prefs.userId,
    travelMood: prefs.travelMood ?? null,
    duration: prefs.duration ?? null,
    budget: prefs.budget ?? null,
    travelParty: prefs.travelParty ?? null,
    currency: prefs.currency,
    regionCode: prefs.regionCode ?? null,
    onboardingCompleted: prefs.onboardingCompleted,
    onboardingFlowVersion: prefs.onboardingFlowVersion,
    updatedAt: prefs.updatedAt.toISOString(),
  }
}

// Get current user preferences
preferencesRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/preferences',
    summary: 'Get current user preferences and onboarding status',
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
        description: 'User preferences, or null when the user has no saved answers yet',
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

      return c.json(serializePreferences(prefs), 200)
    } catch (error) {
      console.error('Preferences fetch error:', error)
      return c.json({ error: 'Failed to fetch preferences', code: 'FETCH_FAILED' }, 500)
    }
  }
)

/**
 * Persists the caller's partial answers. Only the provided fields are written,
 * so each onboarding step can save its own answer without overwriting others.
 * The upsert on the primary key keeps concurrent saves race-free.
 */
async function persistPreferences(userId: string, body: Partial<typeof userPreferences.$inferInsert>) {
  const [prefs] = await db
    .insert(userPreferences)
    .values({ userId, ...body })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        ...(body.travelMood !== undefined ? { travelMood: body.travelMood } : {}),
        ...(body.duration !== undefined ? { duration: body.duration } : {}),
        ...(body.budget !== undefined ? { budget: body.budget } : {}),
        ...(body.travelParty !== undefined ? { travelParty: body.travelParty } : {}),
        ...(body.currency !== undefined ? { currency: body.currency } : {}),
        ...(body.regionCode !== undefined ? { regionCode: body.regionCode } : {}),
        updatedAt: new Date(),
      },
    })
    .returning()
  return prefs
}

const updatePreferencesHandler = async (c: Context<AppEnv>) => {
  const user = c.get('user')

  if (!user) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }

  // `openapi` validates against the route schema before this handler runs, so
  // parsing here is a no-op at runtime but keeps the body statically typed.
  const body = userPreferencesUpdateSchema.parse(await c.req.json())

  try {
    const prefs = await persistPreferences(user.id, body)
    return c.json(serializePreferences(prefs), 200)
  } catch (error) {
    console.error('Preferences update error:', error)
    return c.json({ error: 'Failed to update preferences', code: 'UPDATE_FAILED' }, 500)
  }
}

const updateRouteConfig = {
  summary: 'Save onboarding answers (partial update)',
  security: authSecurity,
  request: {
    body: {
      content: {
        'application/json': {
          schema: userPreferencesUpdateSchema,
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
      description: 'Preferences saved',
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
}

preferencesRoutes.openapi(
  createRoute({
    ...updateRouteConfig,
    method: 'put',
    path: '/preferences',
  }),
  updatePreferencesHandler
)

preferencesRoutes.openapi(
  createRoute({
    ...updateRouteConfig,
    method: 'post',
    path: '/preferences',
  }),
  updatePreferencesHandler
)

// Reset preferences (deletes the saved onboarding answers)
preferencesRoutes.openapi(
  createRoute({
    method: 'delete',
    path: '/preferences',
    summary: "Delete the user's saved onboarding answers and completion state",
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
        description: 'Preferences deleted',
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
    tags: ['Preferences'],
  }),
  async (c) => {
    const user = c.get('user')

    if (!user) {
      return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
    }

    try {
      await db.delete(userPreferences).where(eq(userPreferences.userId, user.id))
      return c.json({ success: true }, 200)
    } catch (error) {
      console.error('Preferences reset error:', error)
      return c.json({ error: 'Failed to reset preferences', code: 'RESET_FAILED' }, 500)
    }
  }
)

// Complete onboarding
preferencesRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/preferences/complete',
    summary: 'Mark onboarding as completed on the server',
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
        description: 'Onboarding marked as completed',
        content: {
          'application/json': {
            schema: preferencesResponseSchema,
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
      409: {
        description: 'Onboarding answers are incomplete',
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
      const existing = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, user.id),
      })

      if (
        !existing?.travelMood ||
        !existing.duration ||
        !existing.budget ||
        !existing.travelParty
      ) {
        return c.json(
          {
            error: 'Onboarding answers are incomplete',
            code: 'ONBOARDING_INCOMPLETE',
          },
          409
        )
      }

      const [prefs] = await db
        .update(userPreferences)
        .set({ onboardingCompleted: true, updatedAt: new Date() })
        .where(eq(userPreferences.userId, user.id))
        .returning()

      return c.json(serializePreferences(prefs), 200)
    } catch (error) {
      console.error('Onboarding completion error:', error)
      return c.json({ error: 'Failed to complete onboarding', code: 'COMPLETE_FAILED' }, 500)
    }
  }
)
