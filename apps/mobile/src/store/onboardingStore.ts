import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/services/api'
import { useAuthStore } from './authStore'

export type TravelMood = 'nature' | 'city' | 'beach' | 'adventure'
export type Duration = 'weekend' | '3-5-days' | 'week-plus' | 'flexible'
export type Budget = 'budget-friendly' | 'balanced' | 'premium' | 'not-sure'
export type TravelParty = 'solo' | 'couple' | 'friends' | 'family'

export interface OnboardingData {
  mood?: TravelMood
  duration?: Duration
  budget?: Budget
  travelParty?: TravelParty
  completed: boolean
}

interface OnboardingState {
  data: OnboardingData
  isInitialized: boolean
  setInitialized: (initialized: boolean) => void
  setMood: (mood: TravelMood) => void
  setDuration: (duration: Duration) => void
  setBudget: (budget: Budget) => void
  setTravelParty: (party: TravelParty) => void
  completeOnboarding: () => Promise<void>
  resetOnboarding: () => void
  isComplete: () => boolean
}

export function getResumeStep(data: OnboardingData): string {
  if (!data.mood) return '/onboarding/mood'
  if (!data.duration) return '/onboarding/duration'
  if (!data.budget) return '/onboarding/budget'
  if (!data.travelParty) return '/onboarding/travel-party'
  return '/onboarding/location'
}

const initialData: OnboardingData = {
  mood: undefined,
  duration: undefined,
  budget: undefined,
  travelParty: undefined,
  completed: false,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      data: initialData,
      isInitialized: false,
      setInitialized: (isInitialized: boolean) => set({ isInitialized }),
      setMood: (mood: TravelMood) => set((state) => ({ data: { ...state.data, mood } })),
      setDuration: (duration: Duration) => set((state) => ({ data: { ...state.data, duration } })),
      setBudget: (budget: Budget) => set((state) => ({ data: { ...state.data, budget } })),
      setTravelParty: (travelParty: TravelParty) => set((state) => ({ data: { ...state.data, travelParty } })),
      completeOnboarding: async () => {
        set((state) => ({ data: { ...state.data, completed: true } }))
        // Sync to server if authenticated
        const authUser = useAuthStore.getState().user
        const { data } = get()
        if (authUser && data.mood && data.duration && data.budget && data.travelParty) {
          try {
            await api.savePreferences({
              travelMood: data.mood,
              duration: data.duration,
              budget: data.budget,
              travelParty: data.travelParty,
            })
          } catch {
            // Keep local state on sync failure
          }
        }
      },
      resetOnboarding: () => set({ data: { ...initialData, completed: false } }),
      isComplete: () => get().data.completed,
    }),
    {
      name: 'travel-planner-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setInitialized(true)
      },
    }
  )
)
