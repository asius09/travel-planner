import { serve } from '@hono/node-server'
import { createApp } from './app'
import { env } from './utils/env'

const app = createApp()

serve(
  {
    fetch: app.fetch,
    port: env.API_PORT,
  },
  (info) => {
    console.log(`API listening on http://localhost:${info.port}`)
  },
)
