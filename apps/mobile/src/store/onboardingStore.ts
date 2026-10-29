import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
  setMood: (mood: TravelMood) => void
  setDuration: (duration: Duration) => void
  setBudget: (budget: Budget) => void
  setTravelParty: (party: TravelParty) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  isComplete: () => boolean
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
      setMood: (mood: TravelMood) => set((state) => ({ data: { ...state.data, mood } })),
      setDuration: (duration: Duration) => set((state) => ({ data: { ...state.data, duration } })),
      setBudget: (budget: Budget) => set((state) => ({ data: { ...state.data, budget } })),
      setTravelParty: (travelParty: TravelParty) => set((state) => ({ data: { ...state.data, travelParty } })),
      completeOnboarding: () => set((state) => ({ data: { ...state.data, completed: true } })),
      resetOnboarding: () => set({ data: initialData }),
      isComplete: () => get().data.completed,
    }),
    {
      name: 'travel-planner-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)