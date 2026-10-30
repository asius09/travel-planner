import { useAuthStore } from '@/store/authStore'
import { FALLBACK_DESTINATIONS } from '@/constants/destinations'
import type { Destination, UserPreferences, TravelMood, Duration, Budget, TravelParty } from '@travel-planner/shared'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

function getHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const authToken = token ?? useAuthStore.getState().session?.token
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
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

export const api = {
  // Auth
  async signUp(body: { email: string; password: string; name?: string }) {
    const res = await fetch(`${API_URL}/auth/signup`, {
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
    const res = await fetch(`${API_URL}/auth/signin`, {
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
      await fetch(`${API_URL}/auth/signout`, {
        method: 'POST',
        headers: getHeaders(),
      })
    } catch {
      // Ignore network errors on signout
    }
  },

  async getSession() {
    const res = await fetch(`${API_URL}/auth/session`, {
      headers: getHeaders(),
    })
    if (!res.ok) return null
    return res.json()
  },

  // Destinations
  async getDestinations(params: {
    query?: string
    mood?: string
    page?: number
    pageSize?: number
  }): Promise<DestinationsResponse> {
    try {
      const query = new URLSearchParams()
      if (params.query) query.set('query', params.query)
      if (params.mood && params.mood !== 'all') query.set('mood', params.mood)
      query.set('page', (params.page ?? 1).toString())
      query.set('pageSize', (params.pageSize ?? 20).toString())

      const res = await fetch(`${API_URL}/destinations?${query.toString()}`)
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // Fall through to offline mock data
    }

    // Offline / fallback data filter
    let list = [...FALLBACK_DESTINATIONS]
    if (params.mood && params.mood !== 'all') {
      list = list.filter((d) => d.moodTags.includes(params.mood as any))
    }
    if (params.query) {
      const q = params.query.toLowerCase()
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.categoryTags.some((t) => t.toLowerCase().includes(q))
      )
    }
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const start = (page - 1) * pageSize
    const paginated = list.slice(start, start + pageSize)

    return {
      data: paginated,
      total: list.length,
      page,
      pageSize,
      hasMore: start + pageSize < list.length,
    }
  },

  async getDestination(id: string): Promise<Destination> {
    try {
      const res = await fetch(`${API_URL}/destinations/${id}`)
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // Fall through
    }

    const fallback = FALLBACK_DESTINATIONS.find((d) => d.id === id || d.slug === id)
    if (fallback) return fallback
    throw new Error('NOT_FOUND')
  },

  // Trips
  async getTrip(): Promise<TripWithItems> {
    const res = await fetch(`${API_URL}/trips`, {
      headers: getHeaders(),
    })
    if (!res.ok) {
      throw new Error('Failed to fetch trip')
    }
    return res.json()
  },

  async addTripItem(destinationId: string): Promise<TripItemWithDestination> {
    const res = await fetch(`${API_URL}/trips/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ destinationId }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Failed to add to trip')
    }
    return res.json()
  },

  async removeTripItem(destinationId: string): Promise<void> {
    const res = await fetch(`${API_URL}/trips/items/${destinationId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!res.ok) {
      throw new Error('Failed to remove from trip')
    }
  },

  async reorderTrip(items: { destinationId: string; position: number }[]): Promise<void> {
    const res = await fetch(`${API_URL}/trips/reorder`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ items }),
    })
    if (!res.ok) {
      throw new Error('Failed to reorder trip items')
    }
  },

  // Preferences
  async getPreferences(): Promise<UserPreferences | null> {
    const res = await fetch(`${API_URL}/preferences`, {
      headers: getHeaders(),
    })
    if (!res.ok) return null
    return res.json()
  },

  async savePreferences(preferences: {
    travelMood: TravelMood
    duration: Duration
    budget: Budget
    travelParty: TravelParty
    currency?: string
  }): Promise<UserPreferences> {
    const res = await fetch(`${API_URL}/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        currency: 'USD',
        ...preferences,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Failed to save preferences')
    }
    return res.json()
  },
}
