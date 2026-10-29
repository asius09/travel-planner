import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { env } from '../utils/env'

// Create connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err)
})

export const db = drizzle(pool, { schema })

// Health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

export { pool }