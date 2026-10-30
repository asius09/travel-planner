/**
 * Applies generated Drizzle SQL migrations to the database.
 *
 * `drizzle-kit push` introspects the live database, which can hang on some
 * managed Postgres providers (including Neon's pooler). This script applies the
 * SQL produced by `drizzle-kit generate` directly, which needs no introspection.
 *
 * Usage: pnpm db:migrate
 */
import { config as loadEnv } from 'dotenv'
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Pool } from 'pg'

loadEnv({ path: resolve(__dirname, '../../../.env') })

const MIGRATIONS_DIR = resolve(__dirname, '../drizzle')
const MIGRATIONS_TABLE = '__app_migrations'

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Add it to the repository root .env file.')
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 15000,
    statement_timeout: 60000,
  })

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}" (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `)

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((file) => file.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      console.log('No migration files found in', MIGRATIONS_DIR)
      return
    }

    const applied = new Set(
      (await pool.query<{ name: string }>(`SELECT name FROM "${MIGRATIONS_TABLE}"`)).rows.map(
        (row) => row.name,
      ),
    )

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip  ${file} (already applied)`)
        continue
      }

      const sql = await readFile(resolve(MIGRATIONS_DIR, file), 'utf8')
      const statements = sql
        .split('--> statement-breakpoint')
        .map((statement) => statement.trim())
        .filter(Boolean)

      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        for (const statement of statements) {
          await client.query(statement)
        }
        await client.query(`INSERT INTO "${MIGRATIONS_TABLE}" (name) VALUES ($1)`, [file])
        await client.query('COMMIT')
        console.log(`apply ${file} (${statements.length} statements)`)
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    }

    console.log('Migrations complete.')
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error('Migration failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
