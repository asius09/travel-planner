import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { createApp } from '../src/index'
import { db } from '../src/db'
import * as schema from '../src/db/schema'
import { eq } from 'drizzle-orm'

// Test app setup
const app = createApp()

describe('Health Endpoint', () => {
  it('should return ok status', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('ok')
    expect(data.database).toBe(true)
  })
})

describe('Auth Routes', () => {
  beforeEach(async () => {
    // Clean up any test users
    try {
      await db.delete(schema.users).where(eq(schema.users.email, 'test@example.com'))
    } catch {
      // Ignore if table doesn't exist yet
    }
  })

  it('should reject signup with invalid email', async () => {
    const res = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'password123' }),
    })
    expect(res.status).toBe(400)
  })

  it('should reject signup with short password', async () => {
    const res = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'short' }),
    })
    expect(res.status).toBe(400)
  })

  it('should reject signin with invalid credentials', async () => {
    const res = await app.request('/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'password123' }),
    })
    expect(res.status).toBe(401)
  })
})

describe('Destinations Endpoint', () => {
  it('should return list of destinations', async () => {
    const res = await app.request('/destinations')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.total).toBeGreaterThan(0)
  })

  it('should filter by mood', async () => {
    const res = await app.request('/destinations/mood/nature')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toBeInstanceOf(Array)
    data.forEach((d: any) => {
      expect(d.moodTags).toContain('nature')
    })
  })

  it('should return 404 for unknown destination', async () => {
    const res = await app.request('/destinations/00000000-0000-0000-0000-000000000000')
    expect(res.status).toBe(404)
  })
})

describe('Trip Routes', () => {
  it('should return unauthorized without auth', async () => {
    const res = await app.request('/trips')
    expect(res.status).toBe(401)
  })

  it('should return unauthorized for trip items without auth', async () => {
    const res = await app.request('/trips/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationId: '00000000-0000-0000-0000-000000000000' }),
    })
    expect(res.status).toBe(401)
  })
})