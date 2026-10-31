import {
  destinationSchema,
  userPreferencesSchema,
  type Destination,
  type UserPreferences,
  type TravelMood,
  type Duration,
  type Budget,
  type TravelParty,
} from '@travel-planner/shared'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

let _authTokenProvider: (() => string | undefined) | null = null
let _unauthorizedHandler: (() => void) | null = null

export function registerAuthTokenProvider(provider: () => string | undefined) {
  _authTokenProvider = provider
}

/**
 * Called whenever the server rejects the current session with 401 so the auth
 * store can clear stale local credentials and the navigation guard can route
 * the user back to login without a redirect loop.
 */
export function registerUnauthorizedHandler(handler: (() => void) | null) {
  _unauthorizedHandler = handler
}

function getSessionToken(): string | undefined {
  if (_authTokenProvider) return _authTokenProvider()
  try {
    // Lazy require prevents circular module evaluation between authStore and api
    const { useAuthStore } = require('@/store/authStore')
    return useAuthStore?.getState?.()?.session?.token
  } catch {
    return undefined
  }
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl
  }

  // In Expo Go or Dev Client, extract host machine IP from the active Metro connection
  const hostUri = Constants.expoConfig?.hostUri
  if (hostUri) {
    const host = hostUri.split(':')[0]
    if (host) {
      return `http://${host}:3001`
    }
  }

  // Android emulator loopback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001'
  }

  return envUrl || 'http://localhost:3001'
}

const API_URL = getApiBaseUrl()

async function safeFetch(pathOrUrl: string, init?: RequestInit): Promise<Response> {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${getApiBaseUrl()}${pathOrUrl}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, {
      ...init,
      signal: init?.signal ?? controller.signal,
    })
    clearTimeout(timeoutId)
    return res
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    const rawMsg = err instanceof Error ? err.message : ''
    const errName = err instanceof Error ? err.name : ''
    if (
      errName === 'AbortError' ||
      rawMsg.includes('aborted') ||
      rawMsg.includes('Network request failed') ||
      rawMsg.includes('fetch failed') ||
      rawMsg.includes('hostname could not be found') ||
      rawMsg.includes('Failed to fetch')
    ) {
      throw new Error(
        'Unable to connect to the server. Please ensure the backend is running and your device is on the same network.'
      )
    }
    throw err
  }
}

function getHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const authToken = token ?? getSessionToken()
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

/** Extracts the server error message from a failed JSON response. */
async function toApiError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = (await res.json()) as { error?: string }
    return new Error(data.error ?? fallback)
  } catch {
    return new Error(fallback)
  }
}

/**
 * Handles non-success responses uniformly: 401 triggers the registered
 * unauthorized handler (session invalidation), everything else throws a
 * descriptive error for the loading/error states to present.
 */
async function assertOk(res: Response, fallback: string): Promise<void> {
  if (res.ok) return
  if (res.status === 401) {
    _unauthorizedHandler?.()
    throw new Error('Your session has expired. Please sign in again.')
  }
  throw await toApiError(res, fallback)
}

export interface DestinationsResponse {
  data: Destination[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface TripItemWithDestination {
  id: string
  tripId: string
  destinationId: string
  position: number
  addedAt: string
  destination: Destination | null
}

export interface TripWithItems {
  id: string
  userId: string
  title: string | null
  createdAt: string
  updatedAt: string
  items: TripItemWithDestination[]
}

/** Validates a destination payload at the API boundary before it reaches the UI. */
function parseDestination(payload: unknown): Destination {
  const result = destinationSchema.safeParse(payload)
  if (!result.success) {
    throw new Error('Received an invalid destination from the server.')
  }
  return result.data
}

export const api = {
  // Auth
  async signUp(body: { email: string; password: string; name?: string }) {
    const res = await safeFetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error ?? 'Failed to sign up')
    }
    return data
  },

  async signIn(body: { email: string; password: string }) {
    const res = await safeFetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error ?? 'Failed to sign in')
    }
    return data
  },

  async signOut() {
    try {
      await safeFetch(`${API_URL}/auth/signout`, {
        method: 'POST',
        headers: getHeaders(),
      })
    } catch {
      // Ignore network errors on signout
    }
  },

  async getSession() {
    const res = await safeFetch(`${API_URL}/auth/session`, {
      headers: getHeaders(),
    })
    if (res.status === 401) {
      // The server explicitly rejected the stored session.
      _unauthorizedHandler?.()
      return { user: null, session: null }
    }
    if (!res.ok) {
      // Network or server trouble: signal "unknown" so callers can keep the
      // cached session instead of treating it as invalid.
      return null
    }
    return res.json()
  },

  // Destinations
  async getDestinations(params: {
    query?: string
    mood?: TravelMood | 'all'
    page?: number
    pageSize?: number
  }): Promise<DestinationsResponse> {
    const query = new URLSearchParams()
    if (params.query) query.set('query', params.query)
    if (params.mood && params.mood !== 'all') query.set('mood', params.mood)
    query.set('page', (params.page ?? 1).toString())
    query.set('pageSize', (params.pageSize ?? 20).toString())

    const res = await safeFetch(`${API_URL}/destinations?${query.toString()}`)
    await assertOk(res, 'Failed to fetch destinations')

    const payload = (await res.json()) as { data?: unknown[]; total?: number; page?: number; pageSize?: number; hasMore?: boolean }
    if (!payload || !Array.isArray(payload.data)) {
      throw new Error('Received an invalid destinations list from the server.')
    }

    return {
      data: payload.data.map((item) => parseDestination(item)),
      total: payload.total ?? payload.data.length,
      page: payload.page ?? params.page ?? 1,
      pageSize: payload.pageSize ?? params.pageSize ?? 20,
      hasMore: payload.hasMore ?? false,
    }
  },

  async getDestination(id: string): Promise<Destination> {
    const res = await safeFetch(`${API_URL}/destinations/${id}`)
    if (res.status === 404) {
      throw new Error('NOT_FOUND')
    }
    await assertOk(res, 'Failed to fetch destination')
    return parseDestination(await res.json())
  },

  // Trips
  async getTrip(): Promise<TripWithItems> {
    const res = await safeFetch(`${API_URL}/trips`, {
      headers: getHeaders(),
    })
    await assertOk(res, 'Failed to fetch trip')
    return res.json()
  },

  async addTripItem(destinationId: string): Promise<TripItemWithDestination> {
    const res = await safeFetch(`${API_URL}/trips/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ destinationId }),
    })
    await assertOk(res, 'Failed to add to trip')
    return res.json()
  },

  async removeTripItem(destinationId: string): Promise<void> {
    const res = await safeFetch(`${API_URL}/trips/items/${destinationId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    await assertOk(res, 'Failed to remove from trip')
  },

  async reorderTrip(items: { destinationId: string; position: number }[]): Promise<void> {
    const res = await safeFetch(`${API_URL}/trips/reorder`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ items }),
    })
    await assertOk(res, 'Failed to reorder trip items')
  },

  // Preferences & onboarding
  async getPreferences(): Promise<UserPreferences | null> {
    const res = await safeFetch(`${API_URL}/preferences`, {
      headers: getHeaders(),
    })
    await assertOk(res, 'Failed to fetch preferences')
    const payload = await res.json()
    if (payload === null || payload === undefined) return null
    const result = userPreferencesSchema.safeParse(payload)
    if (!result.success) {
      throw new Error('Received invalid preferences from the server.')
    }
    return result.data
  },

  /**
   * Persists one onboarding step's answer (or a full set). The server merges
   * partial payloads, so each step saves independently.
   */
  async saveOnboardingStep(answers: {
    travelMood?: TravelMood
    duration?: Duration
    budget?: Budget
    travelParty?: TravelParty
  }): Promise<UserPreferences> {
    const res = await safeFetch(`${API_URL}/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(answers),
    })
    await assertOk(res, 'Failed to save your answer')
    const result = userPreferencesSchema.safeParse(await res.json())
    if (!result.success) {
      throw new Error('Received invalid preferences from the server.')
    }
    return result.data
  },

  /** Marks onboarding complete on the server. Throws when answers are missing. */
  async completeOnboarding(): Promise<UserPreferences> {
    const res = await safeFetch(`${API_URL}/preferences/complete`, {
      method: 'POST',
      headers: getHeaders(),
    })
    await assertOk(res, 'Failed to complete onboarding')
    const result = userPreferencesSchema.safeParse(await res.json())
    if (!result.success) {
      throw new Error('Received invalid preferences from the server.')
    }
    return result.data
  },
}
