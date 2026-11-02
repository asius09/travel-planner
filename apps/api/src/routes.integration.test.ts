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
describe('Partial Onboarding Persistence & Completion', () => {
  let authToken = ''

  beforeAll(async () => {
    const res = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'onboarding-flow-user@example.com',
        password: 'password123',
        name: 'Onboarding Flow User',
      }),
    })
    const data = (await res.json()) as any
    authToken = data.session?.token
    expect(authToken).toBeTruthy()
  })

  afterAll(async () => {
    try {
      await db.delete(schema.users).where(eq(schema.users.email, 'onboarding-flow-user@example.com'))
    } catch {
      // Ignore
    }
  })

  it('should persist each onboarding answer independently', async () => {
    // Step 1: mood only
    const moodRes = await app.request('/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ travelMood: 'beach' }),
    })
    expect(moodRes.status).toBe(200)
    const afterMood = (await moodRes.json()) as any
    expect(afterMood.travelMood).toBe('beach')
    expect(afterMood.duration).toBeNull()
    expect(afterMood.onboardingCompleted).toBe(false)

    // Step 2: duration only — must not overwrite the saved mood
    const durationRes = await app.request('/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ duration: 'week-plus' }),
    })
    expect(durationRes.status).toBe(200)
    const afterDuration = (await durationRes.json()) as any
    expect(afterDuration.travelMood).toBe('beach')
    expect(afterDuration.duration).toBe('week-plus')
    expect(afterDuration.budget).toBeNull()
  })

  it('should reject an empty partial update', async () => {
    const res = await app.request('/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
  })

  it('should refuse to complete onboarding until every answer exists', async () => {
    // Only mood + duration are saved at this point
    const incomplete = await app.request('/preferences/complete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(incomplete.status).toBe(409)
    const body = (await incomplete.json()) as any
    expect(body.code).toBe('ONBOARDING_INCOMPLETE')
  })

  it('should complete onboarding server-side only after all answers are saved', async () => {
    const fillRes = await app.request('/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ budget: 'balanced', travelParty: 'solo' }),
    })
    expect(fillRes.status).toBe(200)

    const completeRes = await app.request('/preferences/complete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(completeRes.status).toBe(200)
    const completed = (await completeRes.json()) as any
    expect(completed.onboardingCompleted).toBe(true)
    expect(completed.travelMood).toBe('beach')
    expect(completed.onboardingFlowVersion).toBe(1)
  })

  it('should reject invalid answer values', async () => {
    const res = await app.request('/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ travelMood: 'not-a-mood' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('Destination Image Collections', () => {
  it('should include an ordered, distinct image collection in the list response', async () => {
    const res = await app.request('/destinations?pageSize=5')
    expect(res.status).toBe(200)
    const data = (await res.json()) as any
    expect(data.data.length).toBeGreaterThan(0)

    for (const destination of data.data) {
      expect(Array.isArray(destination.images)).toBe(true)
      expect(destination.images.length).toBeGreaterThanOrEqual(1)
      const positions = destination.images.map((img: any) => img.position)
      // Positions are ordered starting at 0 with no gaps
      expect(positions).toEqual(positions.map((_: number, i: number) => i))
      const urls = destination.images.map((img: any) => img.url)
      expect(new Set(urls).size).toBe(urls.length)
      // The hero image matches the first ordered image
      expect(destination.heroImage).toBe(destination.images[0].url)
    }
  })

  it('should include the full ordered collection in the detail response', async () => {
    const listRes = await app.request('/destinations?pageSize=1')
    const list = (await listRes.json()) as any
    const id = list.data[0].id

    const res = await app.request(`/destinations/${id}`)
    expect(res.status).toBe(200)
    const detail = (await res.json()) as any
    expect(detail.images.length).toBe(5)
    for (let i = 0; i < detail.images.length; i++) {
      expect(detail.images[i].position).toBe(i)
      expect(detail.images[i].url).toMatch(/^https:\/\//)
      expect(detail.images[i].id).toBeTruthy()
    }
    const urls = detail.images.map((img: any) => img.url)
    expect(new Set(urls).size).toBe(urls.length)
  })
})

describe('Trip Ownership', () => {
  const ownerEmail = 'trip-owner@example.com'
  const intruderEmail = 'trip-intruder@example.com'
  let ownerToken = ''
  let intruderToken = ''
  let destinationId = ''

  beforeAll(async () => {
    const destRes = await app.request('/destinations?pageSize=1')
    const destData = (await destRes.json()) as any
    destinationId = destData.data[0].id

    for (const email of [ownerEmail, intruderEmail]) {
      const res = await app.request('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123', name: 'Trip User' }),
      })
      const data = (await res.json()) as any
      if (email === ownerEmail) ownerToken = data.session?.token
      else intruderToken = data.session?.token
    }
    expect(ownerToken).toBeTruthy()
    expect(intruderToken).toBeTruthy()
  })

  afterAll(async () => {
    try {
      await db.delete(schema.users).where(eq(schema.users.email, ownerEmail))
      await db.delete(schema.users).where(eq(schema.users.email, intruderEmail))
    } catch {
      // Ignore
    }
  })

  it('should not let another user read or modify someone else\'s trip', async () => {
    // Owner adds a destination
    const addRes = await app.request('/trips/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ destinationId }),
    })
    expect([200, 201]).toContain(addRes.status)

    // Owner's trip has one item
    const ownerTrip = await app.request('/trips', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    })
    const ownerData = (await ownerTrip.json()) as any
    expect(ownerData.items).toHaveLength(1)

    // Intruder's trip is separate and empty
    const intruderTrip = await app.request('/trips', {
      headers: { Authorization: `Bearer ${intruderToken}` },
    })
    const intruderData = (await intruderTrip.json()) as any
    expect(intruderData.items).toHaveLength(0)

    // Intruder cannot remove the owner's item
    const removeRes = await app.request(`/trips/items/${destinationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${intruderToken}` },
    })
    expect(removeRes.status).toBe(404)

    // The owner's item survives
    const ownerTripAfter = await app.request('/trips', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    })
    const ownerDataAfter = (await ownerTripAfter.json()) as any
    expect(ownerDataAfter.items).toHaveLength(1)
  })
})

describe('Preferences Reset', () => {
  let authToken = ''

  beforeAll(async () => {
    const res = await app.request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'reset-user@example.com',
        password: 'password123',
        name: 'Reset User',
      }),
    })
    const data = (await res.json()) as any
    authToken = data.session?.token
  })

  afterAll(async () => {
    try {
      await db.delete(schema.users).where(eq(schema.users.email, 'reset-user@example.com'))
    } catch {
      // Ignore
    }
  })

  it('should delete saved answers and completion state', async () => {
    await app.request('/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ travelMood: 'city', duration: 'weekend', budget: 'balanced', travelParty: 'solo' }),
    })
    await app.request('/preferences/complete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    })

    const resetRes = await app.request('/preferences', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(resetRes.status).toBe(200)

    const getRes = await app.request('/preferences', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(getRes.status).toBe(200)
    expect((await getRes.json())).toBeNull()

    // Completion is no longer possible until answers are saved again
    const completeRes = await app.request('/preferences/complete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    })
    expect(completeRes.status).toBe(409)
  })

  it('should require authentication to reset', async () => {
    const res = await app.request('/preferences', { method: 'DELETE' })
    expect(res.status).toBe(401)
  })
})
