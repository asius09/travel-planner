import '@/polyfills'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAuthClient } from '@neondatabase/auth'
import { api } from '@/services/api'

const NEON_AUTH_BASE_URL: string =
  (process.env['EXPO_PUBLIC_NEON_AUTH_BASE_URL'] as string) ?? 'https://api.example.com'

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
try {
  neonAuth = createAuthClient(NEON_AUTH_BASE_URL)
} catch {
  // Graceful fallback if neon auth client fails initialization
}

/** Safely serialize a Date (or string) to an ISO string. */
function toISOString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value
}

async function syncUserPreferences() {
  try {
    const prefs = await api.getPreferences()
    if (prefs?.travelMood) {
      const { useOnboardingStore } = await import('./onboardingStore')
      const { useThemeStore } = await import('./themeStore')
      const ob = useOnboardingStore.getState()
      ob.setMood(prefs.travelMood as any)
      ob.setDuration(prefs.duration as any)
      ob.setBudget(prefs.budget as any)
      ob.setTravelParty(prefs.travelParty as any)
      useOnboardingStore.setState((s) => ({ data: { ...s.data, completed: true } }))
      useThemeStore.getState().setTheme(prefs.travelMood as any)
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
              await syncUserPreferences()
              return true
            }
          } catch (apiErr: any) {
            // If email already exists, immediately throw that error
            if (apiErr?.message?.includes('already registered') || apiErr?.message?.includes('already exists')) {
              throw apiErr
            }
            // Otherwise, try Neon Auth client if available
            if (neonAuth) {
              const neonClient = neonAuth as any
              const neonResult = await neonClient.signUp.email({
                email,
                password,
                name: displayName,
              })

              if (neonResult?.error) {
                throw new Error(neonResult.error.message)
              }

              const sessionResult = await neonClient.getSession()
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
        } catch (error: any) {
          const message = error instanceof Error ? error.message : 'Sign up failed'
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
              await syncUserPreferences()
              return true
            }
          } catch (apiErr: any) {
            if (apiErr?.message?.includes('Invalid email or password') || apiErr?.message?.includes('INVALID_CREDENTIALS')) {
              throw apiErr
            }
            // Try Neon Auth client if available
            if (neonAuth) {
              const neonClient = neonAuth as any
              const neonResult = await neonClient.signIn.email({
                email,
                password,
              })

              if (neonResult?.error) {
                throw new Error(neonResult.error.message)
              }

              const sessionResult = await neonClient.getSession()
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
        } catch (error: any) {
          const message = error instanceof Error ? error.message : 'Sign in failed'
          set({ loading: false, error: message })
          return false
        }
      },

      signOut: async () => {
        try {
          await api.signOut()
          if (neonAuth) {
            await (neonAuth as any).signOut().catch(() => {})
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
        const { user, session } = get()
        if (!user || !session) {
          set({ isInitialized: true })
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
              isInitialized: true,
            })
            await syncUserPreferences()
          } else {
            // Keep local cached session if network fails (offline support)
            set({ isInitialized: true })
          }
        } catch {
          // Keep cached session on network failure
          set({ isInitialized: true })
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