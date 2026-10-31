import '@/polyfills'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAuthClient } from '@neondatabase/auth'
import type {
  TravelMood,
  Duration,
  Budget,
  TravelParty,
} from '@travel-planner/shared'
import { travelMoodSchema, durationSchema, budgetSchema, travelPartySchema } from '@travel-planner/shared'
import { api, registerAuthTokenProvider } from '@/services/api'

const NEON_AUTH_BASE_URL: string =
  (process.env['EXPO_PUBLIC_NEON_AUTH_BASE_URL'] as string) ||
  'https://ep-lucky-bird-a1q00z7m.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth'

export interface User {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  createdAt: string
}

export interface Session {
  id: string
  token: string
  expiresAt: string
}

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  isInitialized: boolean
  setInitialized: (initialized: boolean) => void
  setUser: (user: User | null, session: Session | null) => void
  signUp: (email: string, password: string, name?: string) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  restoreSession: () => Promise<void>
  clearError: () => void
}

// Create Neon Auth client safely
let neonAuth: ReturnType<typeof createAuthClient> | null = null
if (NEON_AUTH_BASE_URL && !NEON_AUTH_BASE_URL.includes('example.com')) {
  try {
    neonAuth = createAuthClient(NEON_AUTH_BASE_URL)
  } catch {
    // Graceful fallback if neon auth client fails initialization
    neonAuth = null
  }
}

/** Safely serialize a Date (or string) to an ISO string. */
function toISOString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

/**
 * The API stores preferences as plain strings; narrow them to the union types the
 * stores expect. Values outside the known set fall back to the current store
 * value rather than silently widening the type with a cast.
 */
function narrow<T extends string | undefined, S>(
  schema: { safeParse: (v: T) => { success: true; data: S } | { success: false } },
  value: T,
  fallback: S,
): S {
  const result = schema.safeParse(value)
  return result.success ? result.data : fallback
}

/** Extracts a message from an unknown thrown value without assuming its shape. */
function errorMessage(value: unknown): string {
  if (value instanceof Error) return value.message
  if (typeof value === 'object' && value !== null && 'message' in value) {
    const message = (value as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return String(value)
}

async function syncUserPreferences() {
  try {
    const prefs = await api.getPreferences()
    if (prefs?.travelMood) {
      const { useOnboardingStore } = await import('./onboardingStore')
      const { useThemeStore } = await import('./themeStore')
      const ob = useOnboardingStore.getState()
      const mood = narrow(travelMoodSchema, prefs.travelMood, ob.data.mood as TravelMood)
      const duration = narrow(durationSchema, prefs.duration, ob.data.duration as Duration)
      const budget = narrow(budgetSchema, prefs.budget, ob.data.budget as Budget)
      const travelParty = narrow(
        travelPartySchema,
        prefs.travelParty,
        ob.data.travelParty as TravelParty,
      )

      if (mood !== undefined) ob.setMood(mood)
      if (duration !== undefined) ob.setDuration(duration)
      if (budget !== undefined) ob.setBudget(budget)
      if (travelParty !== undefined) ob.setTravelParty(travelParty)

      useOnboardingStore.setState((s) => ({ data: { ...s.data, completed: true } }))
      useThemeStore.getState().setTheme(mood)
    }
  } catch {
    // Ignore network errors
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      error: null,
      isInitialized: false,

      setInitialized: (isInitialized: boolean) => set({ isInitialized }),

      setUser: (user, session) => set({ user, session }),

      signUp: async (email: string, password: string, name?: string) => {
        set({ loading: true, error: null })
        const displayName = name?.trim() || email.split('@')[0]

        // Reset onboarding state so newly registered user always starts onboarding fresh
        try {
          const { useOnboardingStore } = await import('./onboardingStore')
          useOnboardingStore.getState().resetOnboarding()
        } catch {
          // Ignore
        }

        // 1. Try API signup first (or Neon Auth if configured)
        try {
          // Try backend Hono API route first
          try {
            const result = await api.signUp({ email, password, name: displayName })
            if (result?.user) {
              set({
                user: {
                  id: result.user.id,
                  email: result.user.email,
                  name: result.user.name ?? displayName,
                  emailVerified: !!result.user.emailVerified,
                  createdAt: toISOString(result.user.createdAt || new Date()),
                },
                session: result.session
                  ? {
                      id: result.session.id,
                      token: result.session.token,
                      expiresAt: toISOString(result.session.expiresAt),
                    }
                  : {
                      id: crypto.randomUUID(),
                      token: 'local-token-' + Date.now(),
                      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
                    },
                loading: false,
              })
              return true
            }
          } catch (apiErr: unknown) {
            // If email already exists, immediately throw that error
            const apiMsg = errorMessage(apiErr)
            if (apiMsg.includes('already registered') || apiMsg.includes('already exists')) {
              throw apiErr
            }
            // Otherwise, try Neon Auth client if available
            if (neonAuth) {
              const neonResult = await neonAuth.signUp.email({
                email,
                password,
                name: displayName,
              })

              if (neonResult?.error) {
                throw new Error(neonResult.error.message)
              }

              const sessionResult = await neonAuth.getSession()
              if (sessionResult?.data?.session && sessionResult?.data?.user) {
                const s = sessionResult.data.session
                const u = sessionResult.data.user
                set({
                  user: {
                    id: u.id,
                    email: u.email,
                    name: u.name ?? displayName,
                    emailVerified: !!u.emailVerified,
                    createdAt: toISOString(u.createdAt),
                  },
                  session: {
                    id: s.id,
                    token: s.token,
                    expiresAt: toISOString(s.expiresAt),
                  },
                  loading: false,
                })
                return true
              }
            }
            throw apiErr
          }

          throw new Error('Could not create account. Please try again.')
        } catch (error: unknown) {
          let message = error instanceof Error ? error.message : 'Sign up failed'
          if (
            message.includes('fetch failed') ||
            message.includes('Network request failed') ||
            message.includes('hostname could not be found') ||
            message.includes('Failed to fetch')
          ) {
            message = 'Unable to connect to the server. Please verify your connection.'
          }
          set({ loading: false, error: message })
          return false
        }
      },

      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          // Try backend Hono API route first
          try {
            const result = await api.signIn({ email, password })
            if (result?.user) {
              set({
                user: {
                  id: result.user.id,
                  email: result.user.email,
                  name: result.user.name ?? null,
                  emailVerified: !!result.user.emailVerified,
                  createdAt: toISOString(result.user.createdAt || new Date()),
                },
                session: result.session
                  ? {
                      id: result.session.id,
                      token: result.session.token,
                      expiresAt: toISOString(result.session.expiresAt),
                    }
                  : {
                      id: crypto.randomUUID(),
                      token: 'local-token-' + Date.now(),
                      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
                    },
                loading: false,
              })
              return true
            }
          } catch (apiErr: unknown) {
            const apiMsg = errorMessage(apiErr)
            if (apiMsg.includes('Invalid email or password') || apiMsg.includes('INVALID_CREDENTIALS')) {
              throw apiErr
            }
            // Try Neon Auth client if available
            if (neonAuth) {
              const neonResult = await neonAuth.signIn.email({
                email,
                password,
              })

              if (neonResult?.error) {
                throw new Error(neonResult.error.message)
              }

              const sessionResult = await neonAuth.getSession()
              if (sessionResult?.data?.session && sessionResult?.data?.user) {
                const s = sessionResult.data.session
                const u = sessionResult.data.user
                set({
                  user: {
                    id: u.id,
                    email: u.email,
                    name: u.name ?? null,
                    emailVerified: !!u.emailVerified,
                    createdAt: toISOString(u.createdAt),
                  },
                  session: {
                    id: s.id,
                    token: s.token,
                    expiresAt: toISOString(s.expiresAt),
                  },
                  loading: false,
                })
                await syncUserPreferences()
                return true
              }
            }
            throw apiErr
          }

          throw new Error('Sign in failed')
        } catch (error: unknown) {
          let message = error instanceof Error ? error.message : 'Sign in failed'
          if (
            message.includes('fetch failed') ||
            message.includes('Network request failed') ||
            message.includes('hostname could not be found') ||
            message.includes('Failed to fetch')
          ) {
            message = 'Unable to connect to the server. Please verify your connection.'
          }
          set({ loading: false, error: message })
          return false
        }
      },

      signOut: async () => {
        try {
          await api.signOut()
          if (neonAuth) {
            await neonAuth.signOut().catch(() => {})
          }
        } catch (error) {
          console.error('Signout error:', error)
        }
        set({ user: null, session: null, error: null })
        try {
          const { useOnboardingStore } = await import('./onboardingStore')
          const { useTripStore } = await import('./tripStore')
          useOnboardingStore.getState().resetOnboarding()
          useTripStore.getState().clearTrip()
        } catch {
          // Ignore
        }
      },

      restoreSession: async () => {
        // Immediately mark initialized so app launch is never blocked by network calls
        set({ isInitialized: true })

        const { user, session } = get()
        if (!user || !session) {
          return
        }

        try {
          // Verify session in background
          const remoteSession = await api.getSession().catch(() => null)
          if (remoteSession?.user) {
            set({
              user: {
                id: remoteSession.user.id,
                email: remoteSession.user.email,
                name: remoteSession.user.name ?? user.name,
                emailVerified: remoteSession.user.emailVerified,
                createdAt: toISOString(remoteSession.user.createdAt),
              },
              session: remoteSession.session
                ? {
                    id: remoteSession.session.id,
                    token: session.token,
                    expiresAt: toISOString(remoteSession.session.expiresAt),
                  }
                : session,
            })
            await syncUserPreferences()
          }
        } catch {
          // Keep cached session on network failure
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'travel-planner-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.setInitialized(true)
      },
    },
  ),
)

// Break require cycle between api.ts and authStore.ts
registerAuthTokenProvider(() => useAuthStore.getState().session?.token)