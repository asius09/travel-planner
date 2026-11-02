import '@/polyfills'
import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { createAuthClient } from '@neondatabase/auth'
import type {
  TravelMood,
  Duration,
  Budget,
  TravelParty,
  UserPreferences,
} from '@travel-planner/shared'
import { travelMoodSchema, durationSchema, budgetSchema, travelPartySchema } from '@travel-planner/shared'
import { api, registerAuthTokenProvider, registerUnauthorizedHandler } from '@/services/api'

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
  clearInvalidSession: () => void
  clearError: () => void
  applyServerPreferences: (prefs: UserPreferences | null) => void
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

/**
 * Session material must never live in ordinary AsyncStorage. The whole auth
 * record (user + session token) is persisted through the platform secure
 * storage (iOS Keychain / Android Keystore) instead.
 */
const secureStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return (await SecureStore.getItemAsync(name)) ?? null
    } catch {
      return null
    }
  },
  setItem: async (name, value) => {
    try {
      await SecureStore.setItemAsync(name, value)
    } catch {
      // Persistence failure keeps the in-memory session; the user simply
      // signs in again after a restart instead of failing silently.
    }
  },
  removeItem: async (name) => {
    try {
      await SecureStore.deleteItemAsync(name)
    } catch {
      // Ignore removal failures
    }
  },
}

/** Safely serialize a Date (or string) to an ISO string. */
function toISOString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

/**
 * The API stores preferences as plain strings; narrow them to the union types the
 * stores expect. Values outside the known set are ignored rather than silently
 * widening the type with a cast.
 */
function narrow<T extends string | null | undefined, S>(
  schema: { safeParse: (v: T) => { success: true; data: S } | { success: false } },
  value: T,
): S | undefined {
  if (value === null || value === undefined) return undefined
  const result = schema.safeParse(value)
  return result.success ? result.data : undefined
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

function toNetworkErrorMessage(message: string): string {
  if (
    message.includes('fetch failed') ||
    message.includes('Network request failed') ||
    message.includes('hostname could not be found') ||
    message.includes('Failed to fetch') ||
    message.includes('Unable to connect')
  ) {
    return 'Unable to connect to the server. Please verify your connection.'
  }
  return message
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

      applyServerPreferences: (prefs) => {
        // Reconcile onboarding progress with the server profile.
        void (async () => {
          try {
            const { useOnboardingStore } = await import('./onboardingStore')
            useOnboardingStore.getState().applyServerState(prefs)
          } catch {
            // Ignore dynamic import failures
          }
        })()
      },

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

        try {
          // Primary path: the backend Hono API (local Better Auth session).
          try {
            const result = await api.signUp({ email, password, name: displayName })
            if (!result?.user || !result?.session) {
              throw new Error('Account created but the session could not be established. Please sign in.')
            }
            set({
              user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name ?? displayName,
                emailVerified: !!result.user.emailVerified,
                createdAt: toISOString(result.user.createdAt || new Date()),
              },
              session: {
                id: result.session.id,
                token: result.session.token,
                expiresAt: toISOString(result.session.expiresAt),
              },
              loading: false,
            })
            return true
          } catch (apiErr: unknown) {
            const apiMsg = errorMessage(apiErr)
            if (apiMsg.includes('already registered') || apiMsg.includes('already exists')) {
              throw apiErr
            }
            // Fallback: the managed Neon Auth service, when configured.
            if (neonAuth) {
              const neonResult = await neonAuth.signUp.email({ email, password, name: displayName })
              if (neonResult?.error) {
                throw new Error(neonResult.error.message)
              }

              const sessionResult = await neonAuth.getSession()
              if (!sessionResult?.data?.session || !sessionResult?.data?.user) {
                throw new Error('Account created but the session could not be established. Please sign in.')
              }
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
            throw apiErr
          }
        } catch (error: unknown) {
          set({ loading: false, error: toNetworkErrorMessage(errorMessage(error)) })
          return false
        }
      },

      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          // Primary path: the backend Hono API (local Better Auth session).
          try {
            const result = await api.signIn({ email, password })
            if (!result?.user || !result?.session) {
              throw new Error('Invalid email or password')
            }
            set({
              user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name ?? null,
                emailVerified: !!result.user.emailVerified,
                createdAt: toISOString(result.user.createdAt || new Date()),
              },
              session: {
                id: result.session.id,
                token: result.session.token,
                expiresAt: toISOString(result.session.expiresAt),
              },
              loading: false,
            })
            // Reconcile onboarding progress from the server before routing so
            // an existing user resumes (or skips) onboarding correctly.
            const prefs = await api.getPreferences().catch(() => null)
            get().applyServerPreferences(prefs)
            return true
          } catch (apiErr: unknown) {
            const apiMsg = errorMessage(apiErr)
            if (apiMsg.includes('Invalid email or password') || apiMsg.includes('INVALID_CREDENTIALS')) {
              throw apiErr
            }
            // Fallback: the managed Neon Auth service, when configured.
            if (neonAuth) {
              const neonResult = await neonAuth.signIn.email({ email, password })
              if (neonResult?.error) {
                throw new Error(neonResult.error.message)
              }

              const sessionResult = await neonAuth.getSession()
              if (!sessionResult?.data?.session || !sessionResult?.data?.user) {
                throw new Error('Invalid email or password')
              }
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
              // Reconcile onboarding progress from the server before routing.
              const prefs = await api.getPreferences().catch(() => null)
              get().applyServerPreferences(prefs)
              return true
            }
            throw apiErr
          }
        } catch (error: unknown) {
          set({ loading: false, error: toNetworkErrorMessage(errorMessage(error)) })
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

      /** Clears credentials the server has rejected so the guard routes to login. */
      clearInvalidSession: () => {
        if (!get().user && !get().session) return
        set({ user: null, session: null, error: null })
      },

      restoreSession: async () => {
        // Immediately mark initialized so app launch is never blocked by network calls
        set({ isInitialized: true })

        const { user, session } = get()
        if (!user || !session) {
          return
        }

        try {
          // Verify the cached session in the background.
          // - a resolved response with user: session is still valid
          // - a resolved response without user: the server rejected it -> clear
          // - a thrown error (network): keep the cached session for offline use
          const remoteSession = await api.getSession()
          if (remoteSession === null) return

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
            const prefs = await api.getPreferences().catch(() => null)
            get().applyServerPreferences(prefs)
          } else {
            get().clearInvalidSession()
          }
        } catch {
          // Keep cached session on network failure
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'travel-planner-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ user: state.user, session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.setInitialized(true)
      },
    },
  ),
)

// Break require cycle between api.ts and authStore.ts
registerAuthTokenProvider(() => useAuthStore.getState().session?.token)

// Expired sessions detected anywhere in the API client clear local credentials
// so the navigation guard can route the user to login without a loop.
registerUnauthorizedHandler(() => useAuthStore.getState().clearInvalidSession())
