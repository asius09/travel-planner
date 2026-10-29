import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAuthClient } from '@neondatabase/auth/client'
import { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_NEON_AUTH_BASE_URL } from '@env'

interface User {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  createdAt: string
}

interface Session {
  id: string
  token: string
  expiresAt: string
}

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  restoreSession: () => Promise<void>
  clearError: () => void
}

const API_URL = EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'
const NEON_AUTH_BASE_URL = EXPO_PUBLIC_NEON_AUTH_BASE_URL ?? 'https://api.example.com'

// Create Neon Auth client
const neonAuth = createAuthClient({
  baseURL: NEON_AUTH_BASE_URL,
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      error: null,
      
      signUp: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          // Use Neon Auth client for sign up
          const result = await neonAuth.signUp.email({
            email,
            password,
          })
          
          if (result.error) {
            throw new Error(result.error.message)
          }
          
          // Get session after sign up
          const sessionResult = await neonAuth.getSession()
          
          if (sessionResult.data?.session) {
            const session = sessionResult.data.session
            const user = sessionResult.data.user
            
            set({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
              },
              session: {
                id: session.id,
                token: session.token,
                expiresAt: session.expiresAt,
              },
              loading: false,
            })
            return true
          }
          
          throw new Error('Failed to get session after sign up')
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign up failed'
          set({ loading: false, error: message })
          return false
        }
      },
      
      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          // Use Neon Auth client for sign in
          const result = await neonAuth.signIn.email({
            email,
            password,
          })
          
          if (result.error) {
            throw new Error(result.error.message)
          }
          
          // Get session after sign in
          const sessionResult = await neonAuth.getSession()
          
          if (sessionResult.data?.session) {
            const session = sessionResult.data.session
            const user = sessionResult.data.user
            
            set({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
              },
              session: {
                id: session.id,
                token: session.token,
                expiresAt: session.expiresAt,
              },
              loading: false,
            })
            return true
          }
          
          throw new Error('Failed to get session after sign in')
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign in failed'
          set({ loading: false, error: message })
          return false
        }
      },
      
      signOut: async () => {
        try {
          await neonAuth.signOut()
        } catch (error) {
          console.error('Signout error:', error)
        }
        set({ user: null, session: null })
      },
      
      restoreSession: async () => {
        try {
          const sessionResult = await neonAuth.getSession()
          
          if (sessionResult.data?.session) {
            const session = sessionResult.data.session
            const user = sessionResult.data.user
            
            set({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
              },
              session: {
                id: session.id,
                token: session.token,
                expiresAt: session.expiresAt,
              },
            })
          } else {
            set({ user: null, session: null })
          }
        } catch (error) {
          console.error('Restore session error:', error)
          set({ user: null, session: null })
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'travel-planner-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
)