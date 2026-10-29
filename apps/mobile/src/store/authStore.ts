import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { EXPO_PUBLIC_API_URL } from '@env'

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

async function fetchAuth(endpoint: string, body: any, method: 'POST' = 'POST') {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error ?? 'Authentication failed')
  }
  
  return data
}

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
          const data = await fetchAuth('/auth/signup', { email, password })
          
          set({
            user: data.user,
            session: data.session,
            loading: false,
          })
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign up failed'
          set({ loading: false, error: message })
          return false
        }
      },
      
      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const data = await fetchAuth('/auth/signin', { email, password })
          
          set({
            user: data.user,
            session: data.session,
            loading: false,
          })
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Sign in failed'
          set({ loading: false, error: message })
          return false
        }
      },
      
      signOut: async () => {
        const { session } = get()
        if (session) {
          try {
            await fetch(`${API_URL}/auth/signout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.token}`,
              },
            })
          } catch (error) {
            console.error('Signout error:', error)
          }
        }
        set({ user: null, session: null })
      },
      
      restoreSession: async () => {
        // In a real app, this would validate the stored session with the server
        // For now, we just check if we have stored session data
        const { session } = get()
        if (session) {
          // Could validate with /auth/session endpoint
          // For MVP, we'll trust the stored session
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