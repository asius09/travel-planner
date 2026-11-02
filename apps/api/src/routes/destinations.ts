import { createRoute, z } from '@hono/zod-openapi';
import { OpenAPIHono } from '@hono/zod-openapi';
import type { AppEnv } from '../types';
import { db } from '../db';
import { destinations, destinationImages, insertDestinationSchema } from '../db/schema';
import { eq, and, ilike, or, inArray, desc, asc, sql } from 'drizzle-orm';
import {
  searchParamsSchema,
  travelMoodSchema,
  destinationImageSchema,
} from '@travel-planner/shared';

const destinationResponseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  country: z.string(),
  region: z.string().nullable(),
  shortDescription: z.string(),
  description: z.string(),
  moodTags: z.array(z.string()),
  categoryTags: z.array(z.string()),
  estimatedCostMinor: z.number(),
  costCurrency: z.string(),
  suggestedDaysMin: z.number(),
  suggestedDaysMax: z.number(),
  highlights: z.array(z.string()),
  heroImage: z.string(),
  imageCredit: z.string().nullable(),
  isPublished: z.boolean(),
  popularity: z.number(),
  images: z.array(destinationImageSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

type DestinationRow = typeof destinations.$inferSelect;

/**
 * Attaches the ordered image collection to destination rows. One batched query
 * per response keeps list endpoints cheap; positions are unique per
 * destination so the order is stable.
 */
async function withImages(rows: DestinationRow[]) {
  if (rows.length === 0) return [];

  const ids = rows.map(row => row.id);
  const images = await db
    .select({
      id: destinationImages.id,
      destinationId: destinationImages.destinationId,
      url: destinationImages.url,
      alt: destinationImages.alt,
      position: destinationImages.position,
    })
    .from(destinationImages)
    .where(inArray(destinationImages.destinationId, ids))
    .orderBy(asc(destinationImages.destinationId), asc(destinationImages.position));

  const imagesByDestination = new Map<string, typeof images>();
  for (const image of images) {
    const list = imagesByDestination.get(image.destinationId) ?? [];
    list.push(image);
    imagesByDestination.set(image.destinationId, list);
  }

  return rows.map(row => ({
    ...row,
    region: row.region ?? null,
    imageCredit: row.imageCredit ?? null,
    images: (imagesByDestination.get(row.id) ?? []).map(image => ({
      id: image.id,
      url: image.url,
      alt: image.alt ?? null,
      position: image.position,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

const destinationsListResponseSchema = z.object({
  data: z.array(destinationResponseSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  hasMore: z.boolean(),
});

const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
});

export const destinationsRoutes = new OpenAPIHono<AppEnv>();

destinationsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/destinations',
    summary: 'List destinations with search and filters',
    request: {
      query: searchParamsSchema,
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
        description: 'Paginated list of destinations',
        content: {
          'application/json': {
            schema: destinationsListResponseSchema,
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
    },
    tags: ['Destinations'],
  }),
  async c => {
    const params = c.req.valid('query');
    const { query, mood, page = 1, pageSize = 20 } = params;
    const offset = (page - 1) * pageSize;

    try {
      const conditions = [eq(destinations.isPublished, true)];

      if (query) {
        conditions.push(
          or(
            ilike(destinations.name, `%${query}%`),
            ilike(destinations.country, `%${query}%`),
            ilike(destinations.region, `%${query}%`),
            sql`${query} = ANY(${destinations.categoryTags})`
          )!
        );
      }

      if (mood) {
        conditions.push(sql`${mood} = ANY(${destinations.moodTags})`);
      }

      const whereClause = and(...conditions);

      const [items, [{ count }]] = await Promise.all([
        db
          .select()
          .from(destinations)
          .where(whereClause)
          .orderBy(desc(destinations.popularity))
          .limit(pageSize)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(destinations)
          .where(whereClause),
      ]);

      const data = await withImages(items);

      return c.json(
        {
          data,
          total: Number(count),
          page,
          pageSize,
          hasMore: offset + items.length < Number(count),
        },
        200
      );
    } catch (error) {
      console.error('Destinations list error:', error);
      return c.json({ error: 'Failed to fetch destinations', code: 'FETCH_FAILED' }, 500);
    }
  }
);

destinationsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/destinations/{id}',
    summary: 'Get destination by ID',
    request: {
      params: z.object({
        id: z.string().uuid(),
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
        description: 'Destination details',
        content: {
          'application/json': {
            schema: destinationResponseSchema,
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
    },
    tags: ['Destinations'],
  }),
  async c => {
    const { id } = c.req.valid('param');

    try {
      const destination = await db.query.destinations.findFirst({
        where: and(eq(destinations.id, id), eq(destinations.isPublished, true)),
      });

      if (!destination) {
        return c.json({ error: 'Destination not found', code: 'NOT_FOUND' }, 404);
      }

      const [withImageData] = await withImages([destination]);

      return c.json(withImageData, 200);
    } catch (error) {
      console.error('Destination fetch error:', error);
      return c.json({ error: 'Failed to fetch destination', code: 'FETCH_FAILED' }, 500);
    }
  }
);

// Get destinations by mood
destinationsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/destinations/mood/{mood}',
    summary: 'Get destinations filtered by mood',
    request: {
      params: z.object({
        mood: travelMoodSchema,
      }),
      query: z.object({
        limit: z.coerce.number().int().positive().max(50).default(10),
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
        description: 'Destinations for mood',
        content: {
          'application/json': {
            schema: z.array(destinationResponseSchema),
          },
        },
      },
    },
    tags: ['Destinations'],
  }),
  async c => {
    const { mood } = c.req.valid('param');
    const { limit = 10 } = c.req.valid('query');

    try {
      const items = await db.query.destinations.findMany({
        where: and(
          eq(destinations.isPublished, true),
          sql`${mood} = ANY(${destinations.moodTags})`
        ),
        orderBy: desc(destinations.popularity),
        limit,
      });

      const data = await withImages(items);

      return c.json(data, 200);
    } catch (error) {
      console.error('Mood destinations error:', error);
      return c.json({ error: 'Failed to fetch destinations', code: 'FETCH_FAILED' }, 500);
    }
  }
);
