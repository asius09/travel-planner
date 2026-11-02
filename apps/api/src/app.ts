import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { healthRoute } from './routes/health';
import { authRoutes } from './routes/auth';
import { destinationsRoutes } from './routes/destinations';
import { preferencesRoutes } from './routes/preferences';
import { tripsRoutes } from './routes/trips';
import {
  authMiddleware,
  optionalAuthMiddleware,
  corsMiddleware,
  rateLimitMiddleware,
} from './middleware';
import type { AppEnv } from './types';

/**
 * Builds the Hono application. Kept separate from the server entrypoint so tests
 * can call `app.request()` without binding a port.
 */
export function createApp() {
  const app = new Hono<AppEnv>();

  app.use('*', logger());
  app.use('*', prettyJSON());
  app.use('*', corsMiddleware);
  app.use('*', rateLimitMiddleware);

  app.route('/', healthRoute);

  app.use('/auth/session', optionalAuthMiddleware);
  app.route('/', authRoutes);

  app.use('/destinations*', optionalAuthMiddleware);
  app.route('/', destinationsRoutes);

  app.use('/preferences*', authMiddleware);
  app.route('/', preferencesRoutes);

  app.use('/trips*', authMiddleware);
  app.route('/', tripsRoutes);

  app.notFound(c => {
    return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404);
  });

  app.onError((err, c) => {
    console.error('Unhandled error:', err);
    return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500);
  });

  return app;
}
