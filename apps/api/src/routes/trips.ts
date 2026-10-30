import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'
import { authSecurity, type AppEnv } from '../types'
import { db } from '../db'
import { trips, tripItems, destinations, insertTripSchema, insertTripItemSchema } from '../db/schema'
import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { authMiddleware } from '../middleware'
import { addToTripSchema, createTripItemSchema, reorderTripItemsSchema } from '@travel-planner/shared'

const tripItemWithDestinationSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  destinationId: z.string().uuid(),
  position: z.number(),
  addedAt: z.string().datetime(),
  destination: z.object({
    id: z.string().uuid(),
    slug: z.string(),
    name: z.string(),
    country: z.string(),
    region: z.string().nullable(),
    shortDescription: z.string(),
    estimatedCostMinor: z.number(),
    costCurrency: z.string(),
    suggestedDaysMin: z.number(),
    suggestedDaysMax: z.number(),
    heroImage: z.string(),
  }).nullable(),
})

const tripWithItemsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  items: z.array(tripItemWithDestinationSchema),
})

const tripResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
})

export const tripsRoutes = new OpenAPIHono<AppEnv>()

// Get current user's trip (create if not exists)
tripsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/trips',
    summary: 'Get current user trip with items',
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
        description: 'User trip with destinations',
        content: {
          'application/json': {
            schema: tripWithItemsSchema.nullable(),
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
    tags: ['Trips'],
  }),
  async (c) => {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
    }
    
    try {
      let trip = await db.query.trips.findFirst({
        where: eq(trips.userId, user.id),
      })
      
      if (!trip) {
        // Create a default trip for the user
        [trip] = await db
          .insert(trips)
          .values({
            userId: user.id,
            title: 'My Trip',
          })
          .returning()
      }
      
      const items = await db.query.tripItems.findMany({
        where: eq(tripItems.tripId, trip.id),
        orderBy: asc(tripItems.position),
        with: {
          destination: true,
        },
      })
      
      return c.json({
        ...trip,
        title: trip.title ?? null,
        createdAt: trip.createdAt.toISOString(),
        updatedAt: trip.updatedAt.toISOString(),
        items: items.map(item => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
          destination: item.destination ? {
            ...item.destination,
            region: item.destination.region ?? null,
          } : null,
        })),
      }, 200)
    } catch (error) {
      console.error('Trip fetch error:', error)
      return c.json({ error: 'Failed to fetch trip', code: 'FETCH_FAILED' }, 500)
    }
  }
)

// Add destination to trip
tripsRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/trips/items',
    summary: 'Add destination to trip',
    security: authSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: addToTripSchema,
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
        description: 'Destination already in trip',
        content: {
          'application/json': {
            schema: tripItemWithDestinationSchema,
          },
        },
      },
      201: {
        description: 'Destination added to trip',
        content: {
          'application/json': {
            schema: tripItemWithDestinationSchema,
          },
        },
      },
      400: {
        description: 'Validation error or already in trip',
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
      404: {
        description: 'Destination not found',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
      409: {
        description: 'Destination already in trip',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
    tags: ['Trips'],
  }),
  async (c) => {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
    }
    
    const { destinationId } = c.req.valid('json')
    
    try {
      // Get or create user's trip
      let trip = await db.query.trips.findFirst({
        where: eq(trips.userId, user.id),
      })
      
      if (!trip) {
        [trip] = await db
          .insert(trips)
          .values({
            userId: user.id,
            title: 'My Trip',
          })
          .returning()
      }
      
      // Check if destination exists
      const destination = await db.query.destinations.findFirst({
        where: eq(destinations.id, destinationId),
      })
      
      if (!destination) {
        return c.json({ error: 'Destination not found', code: 'NOT_FOUND' }, 404)
      }
      
      // Check if already in trip
      const existing = await db.query.tripItems.findFirst({
        where: and(eq(tripItems.tripId, trip.id), eq(tripItems.destinationId, destinationId)),
      })
      
      if (existing) {
        // Return existing item with destination
        return c.json({
          ...existing,
          addedAt: existing.addedAt.toISOString(),
          destination: {
            ...destination,
            region: destination.region ?? null,
          },
        }, 200)
      }
      
      // Get next position
      const maxPosition = await db
        .select({ max: sql<number>`max(${tripItems.position})` })
        .from(tripItems)
        .where(eq(tripItems.tripId, trip.id))
      
      const nextPosition = (maxPosition[0]?.max ?? -1) + 1
      
      // Add to trip
      const [newItem] = await db
        .insert(tripItems)
        .values({
          tripId: trip.id,
          destinationId,
          position: nextPosition,
        })
        .returning()
      
      // Update trip updatedAt
      await db
        .update(trips)
        .set({ updatedAt: new Date() })
        .where(eq(trips.id, trip.id))
      
      return c.json({
        ...newItem,
        addedAt: newItem.addedAt.toISOString(),
        destination: {
          ...destination,
          region: destination.region ?? null,
        },
      }, 201)
    } catch (error) {
      console.error('Add to trip error:', error)
      if (error instanceof Error && error.message.includes('unique')) {
        return c.json({ error: 'Destination already in trip', code: 'ALREADY_IN_TRIP' }, 409)
      }
      return c.json({ error: 'Failed to add to trip', code: 'ADD_FAILED' }, 500)
    }
  }
)

// Remove destination from trip
tripsRoutes.openapi(
  createRoute({
    method: 'delete',
    path: '/trips/items/{destinationId}',
    summary: 'Remove destination from trip',
    security: authSecurity,
    request: {
      params: z.object({
        destinationId: z.string().uuid(),
      }),
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
        description: 'Destination removed from trip',
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
      404: {
        description: 'Trip item not found',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
    tags: ['Trips'],
  }),
  async (c) => {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
    }
    
    const { destinationId } = c.req.valid('param')
    
    try {
      const trip = await db.query.trips.findFirst({
        where: eq(trips.userId, user.id),
      })
      
      if (!trip) {
        return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
      }
      
      const result = await db
        .delete(tripItems)
        .where(and(eq(tripItems.tripId, trip.id), eq(tripItems.destinationId, destinationId)))
        .returning()
      
      if (result.length === 0) {
        return c.json({ error: 'Destination not in trip', code: 'NOT_IN_TRIP' }, 404)
      }
      
      // Reorder remaining items
      const remainingItems = await db.query.tripItems.findMany({
        where: eq(tripItems.tripId, trip.id),
        orderBy: asc(tripItems.position),
      })
      
      for (let i = 0; i < remainingItems.length; i++) {
        if (remainingItems[i].position !== i) {
          await db
            .update(tripItems)
            .set({ position: i })
            .where(eq(tripItems.id, remainingItems[i].id))
        }
      }
      
      // Update trip updatedAt
      await db
        .update(trips)
        .set({ updatedAt: new Date() })
        .where(eq(trips.id, trip.id))
      
      return c.json({ success: true }, 200)
    } catch (error) {
      console.error('Remove from trip error:', error)
      return c.json({ error: 'Failed to remove from trip', code: 'REMOVE_FAILED' }, 500)
    }
  }
)

// Reorder trip items
tripsRoutes.openapi(
  createRoute({
    method: 'patch',
    path: '/trips/reorder',
    summary: 'Reorder trip destinations',
    security: authSecurity,
    request: {
      body: {
        content: {
          'application/json': {
            schema: reorderTripItemsSchema,
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
        description: 'Trip reordered successfully',
        content: {
          'application/json': {
            schema: z.object({ success: z.boolean() }),
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
      404: {
        description: 'Trip not found',
        content: {
          'application/json': {
            schema: errorResponseSchema,
          },
        },
      },
    },
    tags: ['Trips'],
  }),
  async (c) => {
    const user = c.get('user')
    
    if (!user) {
      return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
    }
    
    const { tripId, items } = c.req.valid('json')
    
    // Verify trip ownership
    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.userId, user.id)),
    })
    
    if (!trip) {
      return c.json({ error: 'Trip not found', code: 'NOT_FOUND' }, 404)
    }
    
    try {
      // Use transaction for atomic reorder
      await db.transaction(async (tx) => {
        // Positions are unique per trip, so a direct swap (0 <-> 1) would
        // collide mid-transaction. Shift every row out of the target range
        // first, then write the final positions.
        await tx
          .update(tripItems)
          .set({ position: sql`${tripItems.position} + 100000` })
          .where(eq(tripItems.tripId, tripId))

        for (const item of items) {
          await tx
            .update(tripItems)
            .set({ position: item.position })
            .where(and(eq(tripItems.tripId, tripId), eq(tripItems.destinationId, item.destinationId)))
        }
        
        await tx
          .update(trips)
          .set({ updatedAt: new Date() })
          .where(eq(trips.id, tripId))
      })
      
      return c.json({ success: true }, 200)
    } catch (error) {
      console.error('Reorder trip error:', error)
      return c.json({ error: 'Failed to reorder trip', code: 'REORDER_FAILED' }, 500)
    }
  }
)