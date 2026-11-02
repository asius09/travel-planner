import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api } from './services/api'
import { getDestinationGallery, hasCompleteGallery } from './services/destinationImages'
import type { Destination } from '@travel-planner/shared'

const VALID_PREFS = {
  userId: '11111111-2222-3333-4444-555555555555',
  travelMood: 'nature',
  duration: 'weekend',
  budget: 'balanced',
  travelParty: 'solo',
  currency: 'USD',
  regionCode: null,
  onboardingCompleted: false,
  onboardingFlowVersion: 1,
  updatedAt: new Date().toISOString(),
}

function makeDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    id: '11111111-2222-3333-4444-555555555555',
    slug: 'test-island',
    name: 'Test Island',
    country: 'Test Country',
    shortDescription: 'A test island.',
    description: 'A longer description of the test island.',
    moodTags: ['beach'],
    categoryTags: ['beach'],
    estimatedCostMinor: 100000,
    costCurrency: 'USD',
    suggestedDaysMin: 2,
    suggestedDaysMax: 4,
    highlights: ['Beach'],
    heroImage: 'https://images.example.test/hero.jpg',
    isPublished: true,
    popularity: 10,
    ...overrides,
  }
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as unknown as Response
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('API client failure handling', () => {
  it('surfaces server errors instead of silently substituting fixture data', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Database unavailable' }, false, 500))
    await expect(api.getDestinations({})).rejects.toThrow('Database unavailable')
  })

  it('rejects malformed destination payloads at the boundary', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: [{ id: 'nope' }], total: 1, page: 1, pageSize: 20, hasMore: false })
    )
    await expect(api.getDestinations({})).rejects.toThrow('Received an invalid destination')
  })

  it('maps a missing destination to NOT_FOUND', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Destination not found' }, false, 404))
    await expect(api.getDestination('11111111-2222-3333-4444-555555555555')).rejects.toThrow(
      'NOT_FOUND'
    )
  })

  it('rejects an invalid single destination payload', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'broken' }))
    await expect(api.getDestination('11111111-2222-3333-4444-555555555555')).rejects.toThrow(
      'invalid destination'
    )
  })

  it('parses a valid destination list from the API', async () => {
    const destination = makeDestination()
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: [destination], total: 1, page: 1, pageSize: 20, hasMore: false })
    )
    const result = await api.getDestinations({})
    expect(result.total).toBe(1)
    expect(result.data[0].slug).toBe('test-island')
  })

  it('reports network failures with an actionable message', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network request failed'))
    await expect(api.getDestinations({})).rejects.toThrow(
      'Unable to connect to the server'
    )
  })
})

describe('Onboarding persistence client', () => {
  it('saves a single onboarding answer as a partial update', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ...VALID_PREFS, travelMood: 'beach' }))
    const prefs = await api.saveOnboardingStep({ travelMood: 'beach' })
    expect(prefs.travelMood).toBe('beach')

    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body)).toEqual({ travelMood: 'beach' })
  })

  it('completes onboarding through the dedicated endpoint', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ ...VALID_PREFS, onboardingCompleted: true })
    )
    const prefs = await api.completeOnboarding()
    expect(prefs.onboardingCompleted).toBe(true)

    const [url] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/preferences/complete')
  })

  it('propagates completion failures instead of pretending success', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: 'Onboarding answers are incomplete' }, false, 409)
    )
    await expect(api.completeOnboarding()).rejects.toThrow('Onboarding answers are incomplete')
  })

  it('returns null preferences when the profile has none yet', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null))
    await expect(api.getPreferences()).resolves.toBeNull()
  })
})

describe('Destination gallery resolution', () => {
  it('uses the ordered API image collection', () => {
    const destination = makeDestination({
      images: [
        { id: '2', url: 'https://images.example.test/second.jpg', alt: null, position: 1 },
        { id: '1', url: 'https://images.example.test/first.jpg', alt: null, position: 0 },
      ],
    })
    expect(getDestinationGallery(destination)).toEqual([
      'https://images.example.test/first.jpg',
      'https://images.example.test/second.jpg',
    ])
  })

  it('never fabricates images for incomplete records', () => {
    const destination = makeDestination({
      images: [
        { id: '1', url: 'https://images.example.test/only.jpg', alt: null, position: 0 },
      ],
    })
    const gallery = getDestinationGallery(destination)
    expect(gallery).toHaveLength(1)
    expect(gallery[0]).toBe('https://images.example.test/only.jpg')
    expect(hasCompleteGallery(destination)).toBe(false)
  })

  it('de-duplicates repeated image urls within a destination', () => {
    const destination = makeDestination({
      images: [
        { id: '1', url: 'https://images.example.test/a.jpg', alt: null, position: 0 },
        { id: '2', url: 'https://images.example.test/a.jpg', alt: null, position: 1 },
      ],
    })
    expect(getDestinationGallery(destination)).toHaveLength(1)
  })

  it('falls back to the hero image when no collection exists', () => {
    const destination = makeDestination()
    expect(getDestinationGallery(destination)).toEqual([destination.heroImage])
  })
})
