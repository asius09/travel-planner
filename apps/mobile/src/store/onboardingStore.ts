import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '@/services/api'
import { useAuthStore } from './authStore'
import type { UserPreferences, TravelMood, Duration, Budget, TravelParty } from '@travel-planner/shared'

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
  /** True while a debounced server save has not been confirmed yet. */
  hasPendingServerSave: boolean
  setInitialized: (initialized: boolean) => void
  setMood: (mood: TravelMood) => void
  setDuration: (duration: Duration) => void
  setBudget: (budget: Budget) => void
  setTravelParty: (party: TravelParty) => void
  completeOnboarding: () => Promise<void>
  resetOnboarding: () => void
  isComplete: () => boolean
  /** Merges server-side preferences into the local draft; server completion wins. */
  applyServerState: (prefs: UserPreferences | null) => void
}

/**
 * Onboarding routes the guard redirects to, as literal paths. A literal union
 * (rather than `string`) is checked by Expo Router's typed routes and still
 * satisfies the store tests, which compare against these same strings.
 */
export type OnboardingResumeStep =
  | '/onboarding/mood'
  | '/onboarding/duration'
  | '/onboarding/budget'
  | '/onboarding/travel-party'
  | '/onboarding/location'

export function getResumeStep(data: OnboardingData): OnboardingResumeStep {
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

/** Milliseconds to batch rapid answers before they are written to the server. */
const SAVE_DEBOUNCE_MS = 600

// Module-level save scheduler: at most one in-flight request, the latest
// answers always win, and a dirty flag retries anything not yet persisted
// with the next queued save (never in a tight loop).
let saveTimer: ReturnType<typeof setTimeout> | null = null
let saveInFlight = false
let saveDirty = false

function currentAnswers(data: OnboardingData) {
  return {
    ...(data.mood ? { travelMood: data.mood } : {}),
    ...(data.duration ? { duration: data.duration } : {}),
    ...(data.budget ? { budget: data.budget } : {}),
    ...(data.travelParty ? { travelParty: data.travelParty } : {}),
  }
}

async function flushServerSave(
  get: () => OnboardingState,
  set: (partial: Partial<OnboardingState>) => void
): Promise<void> {
  if (saveInFlight) {
    saveDirty = true
    return
  }
  if (!useAuthStore.getState().user) return

  const answers = currentAnswers(get().data)
  if (Object.keys(answers).length === 0) return

  saveInFlight = true
  set({ hasPendingServerSave: true })
  let lastSaveFailed = false
  try {
    do {
      saveDirty = false
      try {
        // Intermediate progress is non-critical: a failed save stays local and
        // is retried by the next queued save or on completion.
        await api.saveOnboardingStep(currentAnswers(get().data))
      } catch {
        lastSaveFailed = true
      }
    } while (saveDirty && !lastSaveFailed)
  } finally {
    saveInFlight = false
  }
  set({ hasPendingServerSave: lastSaveFailed || saveDirty })
}

function scheduleServerSave(get: () => OnboardingState, set: (partial: Partial<OnboardingState>) => void) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    void flushServerSave(get, set)
  }, SAVE_DEBOUNCE_MS)
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      data: initialData,
      isInitialized: false,
      hasPendingServerSave: false,
      setInitialized: (isInitialized: boolean) => set({ isInitialized }),

      setMood: (mood: TravelMood) => {
        set((state) => ({ data: { ...state.data, mood } }))
        scheduleServerSave(get, set)
      },
      setDuration: (duration: Duration) => {
        set((state) => ({ data: { ...state.data, duration } }))
        scheduleServerSave(get, set)
      },
      setBudget: (budget: Budget) => {
        set((state) => ({ data: { ...state.data, budget } }))
        scheduleServerSave(get, set)
      },
      setTravelParty: (travelParty: TravelParty) => {
        set((state) => ({ data: { ...state.data, travelParty } }))
        scheduleServerSave(get, set)
      },

      completeOnboarding: async () => {
        const { data } = get()
        if (!data.mood || !data.duration || !data.budget || !data.travelParty) {
          throw new Error('Onboarding is incomplete')
        }

        if (useAuthStore.getState().user) {
          // The flow may only be marked complete after the server confirms the
          // saved answers, so a failed save never falsely completes onboarding.
          const answers = {
            travelMood: data.mood,
            duration: data.duration,
            budget: data.budget,
            travelParty: data.travelParty,
          }
          await api.saveOnboardingStep(answers)
          await api.completeOnboarding()
        }

        if (saveTimer) {
          clearTimeout(saveTimer)
          saveTimer = null
        }
        saveDirty = false
        set((state) => ({ data: { ...state.data, completed: true }, hasPendingServerSave: false }))
      },

      resetOnboarding: () => {
        if (saveTimer) {
          clearTimeout(saveTimer)
          saveTimer = null
        }
        saveDirty = false
        set({ data: { ...initialData, completed: false }, hasPendingServerSave: false })
      },

      isComplete: () => get().data.completed,

      applyServerState: (prefs) => {
        if (!prefs) return
        set((state) => ({
          data: {
            // Server answers fill gaps; locally newer answers are preserved and
            // pushed by the queued save. Server completion is authoritative.
            mood: prefs.travelMood ?? state.data.mood,
            duration: prefs.duration ?? state.data.duration,
            budget: prefs.budget ?? state.data.budget,
            travelParty: prefs.travelParty ?? state.data.travelParty,
            completed: prefs.onboardingCompleted,
          },
        }))
      },
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
