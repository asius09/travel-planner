/**
 * Validates that every seeded destination image URL is publicly reachable and
 * actually serves an image.
 *
 * Checks `destination_images.url` and `destinations.hero_image` with a HEAD
 * request and verifies the response content type. Exits non-zero when any URL
 * is unreachable, non-image, or a redirect target fails, so CI and pre-deploy
 * checks can catch removed or expired photos before users do.
 *
 * Usage: pnpm db:validate-images
 */
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { Pool } from 'pg'

loadEnv({ path: resolve(__dirname, '../../../.env') })

const TIMEOUT_MS = 15000

interface Row {
  label: string
  url: string
}

async function checkUrl(url: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const contentType = (res.headers.get('content-type') ?? '').split(';')[0]
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` }
    if (!contentType.startsWith('image/')) {
      return { ok: false, detail: `unexpected content-type "${contentType}"` }
    }
    return { ok: true, detail: contentType }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, detail: message.slice(0, 80) }
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Add it to the repository root .env file.')
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 1 })
  let failures = 0

  try {
    const gallery = await pool.query<Row>(
      `SELECT di.url, d.name || ' (image #' || di.position + 1 || ')' AS label
       FROM destination_images di JOIN destinations d ON d.id = di.destination_id
       ORDER BY d.slug, di.position`
    )
    const heroes = await pool.query<Row>(
      `SELECT hero_image AS url, name || ' (hero_image)' AS label FROM destinations ORDER BY slug`
    )
    const rows = [...gallery.rows, ...heroes.rows]
    console.log(`Validating ${rows.length} destination image URLs...`)

    const results = await Promise.all(
      rows.map(async (row) => ({ row, result: await checkUrl(row.url) }))
    )

    for (const { row, result } of results) {
      if (result.ok) {
        console.log(`ok    ${row.label}`)
      } else {
        failures++
        console.error(`FAIL  ${row.label} — ${result.detail} — ${row.url}`)
      }
    }

    if (failures > 0) {
      console.error(`\n${failures} image URL(s) failed. Replace them with verified photos of the same destination.`)
    } else {
      console.log('\nAll destination image URLs are reachable and serve images.')
    }
  } finally {
    await pool.end()
  }

  if (failures > 0) process.exit(1)
}

main().catch((error) => {
  console.error('Image validation failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
