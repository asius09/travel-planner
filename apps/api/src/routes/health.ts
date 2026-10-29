import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'

const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  timestamp: z.string().datetime(),
  version: z.string(),
  database: z.boolean(),
})

export const healthRoute = new OpenAPIHono()

healthRoute.openapi(
  createRoute({
    method: 'get',
    path: '/health',
    summary: 'Health check endpoint',
    responses: {
      200: {
        description: 'Service health status',
        content: {
          'application/json': {
            schema: healthResponseSchema,
          },
        },
      },
    },
    tags: ['Health'],
  }),
  async (c) => {
    const { checkDatabaseConnection } = await import('../db')
    const dbHealthy = await checkDatabaseConnection()
    
    return c.json({
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.0.0',
      database: dbHealthy,
    })
  }
)