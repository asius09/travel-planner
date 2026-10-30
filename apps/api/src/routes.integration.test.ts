import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createApp } from './app'
import { db } from '../src/db'
import * as schema from '../src/db/schema'
import { eq } from 'drizzle-orm'

// Test app setup
const app = createApp()

describe('Health Endpoint', () => {
  it('should return ok status', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const data = (await res.json()) as { status: string; database: boolean }
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

  it('should sign up without email verification and return immediately authenticated session', async () => {
    const res = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test Explorer',
      }),
    })
    expect(res.status).toBe(201)
    const data = (await res.json()) as any
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe('test@example.com')
    expect(data.user.name).toBe('Test Explorer')
    expect(data.session).toBeDefined()
    expect(data.session.token).toBeTruthy()

    // Verify the returned token immediately authenticates protected endpoints (no second sign in needed)
    const protectedRes = await app.request('/trips', {
      headers: {
        Authorization: `Bearer ${data.session.token}`,
      },
    })
    expect(protectedRes.status).toBe(200)
  })
})

describe('Destinations Endpoint', () => {
  it('should return list of destinations', async () => {
    const res = await app.request('/destinations')
    expect(res.status).toBe(200)
    const data = (await res.json()) as { data: unknown[]; total: number }
    expect(data.data).toBeInstanceOf(Array)
    expect(data.total).toBeGreaterThan(0)
  })

  it('should filter by mood', async () => {
    const res = await app.request('/destinations/mood/nature')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toBeInstanceOf(Array)
    for (const destination of data as Array<{ moodTags: string[] }>) {
      expect(destination.moodTags).toContain('nature')
    }
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

describe('Post-Onboarding Preferences & Trip Persistence', () => {
  let authToken = ''

  beforeAll(async () => {
    // Create an authenticated session via signup (no email verification needed)
    const res = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'journey-user@example.com',
        password: 'password123',
        name: 'Journey User',
      }),
    })
    const data = (await res.json()) as any
    authToken = data.session?.token
  })

  afterAll(async () => {
    try {
      await db.delete(schema.users).where(eq(schema.users.email, 'journey-user@example.com'))
    } catch {
      // Ignore
    }
  })

  it('should reject unauthenticated access to /preferences', async () => {
    const res = await app.request('/preferences')
    expect(res.status).toBe(401)
  })

  it('should return null preferences for newly signed up user before onboarding', async () => {
    const res = await app.request('/preferences', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data).toBeNull()
  })

  it('should persist preferences upon onboarding completion and return them', async () => {
    const saveRes = await app.request('/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        travelMood: 'nature',
        duration: 'weekend',
        budget: 'balanced',
        travelParty: 'couple',
        currency: 'USD',
      }),
    })
    expect(saveRes.status).toBe(200)
    const savedData = (await saveRes.json()) as any
    expect(savedData.travelMood).toBe('nature')
    expect(savedData.duration).toBe('weekend')
    expect(savedData.budget).toBe('balanced')
    expect(savedData.travelParty).toBe('couple')

    // Verify GET /preferences now returns the persisted preferences
    const getRes = await app.request('/preferences', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(getRes.status).toBe(200)
    const fetched = (await getRes.json()) as any
    expect(fetched.travelMood).toBe('nature')
    expect(fetched.duration).toBe('weekend')
  })

  it('should update preferences later without altering trip items', async () => {
    // 1. Get destination to add to trip
    const destRes = await app.request('/destinations')
    const destData = (await destRes.json()) as any
    const firstDest = destData.data[0]

    // 2. Add destination to trip
    const addRes = await app.request('/trips/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ destinationId: firstDest.id }),
    })
    expect(addRes.status).toBe(201)

    // 3. Edit preferences (e.g. change mood to beach, budget to premium)
    const updatePrefRes = await app.request('/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        travelMood: 'beach',
        duration: 'week-plus',
        budget: 'premium',
        travelParty: 'friends',
        currency: 'USD',
      }),
    })
    expect(updatePrefRes.status).toBe(200)

    // 4. Verify trip still contains the destination intact
    const tripRes = await app.request('/trips', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(tripRes.status).toBe(200)
    const tripData = (await tripRes.json()) as any
    expect(tripData.items).toHaveLength(1)
    expect(tripData.items[0].destinationId).toBe(firstDest.id)
  })
})