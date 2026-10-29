import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { healthRoute } from './routes/health'
import { authRoutes } from './routes/auth'
import { destinationsRoutes } from './routes/destinations'
import { preferencesRoutes } from './routes/preferences'
import { tripsRoutes } from './routes/trips'
import { authMiddleware, optionalAuthMiddleware, corsMiddleware, rateLimitMiddleware } from './middleware'
import { env } from './utils/env'

const app = new Hono()

// Global middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', corsMiddleware)
app.use('*', rateLimitMiddleware)

// Health check (no auth)
app.route('/health', healthRoute)

// Auth routes (public)
app.route('/auth', authRoutes)

// Public destinations (with optional auth for personalization)
app.use('/destinations*', optionalAuthMiddleware)
app.route('/destinations', destinationsRoutes)

// Protected routes
app.use('/preferences*', authMiddleware)
app.route('/preferences', preferencesRoutes)

app.use('/trips*', authMiddleware)
app.route('/trips', tripsRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500)
})

// Start server
const port = env.API_PORT

console.log(`Starting API server on port ${port}...`)

export default {
  fetch: app.fetch,
  port,
}