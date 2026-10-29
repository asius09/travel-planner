import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type TravelMood = 'nature' | 'city' | 'beach' | 'adventure'

export interface ThemeTokens {
  primary: string
  accent: string
  soft: string
  heroImage: string
}

const moodThemes: Record<TravelMood, ThemeTokens> = {
  nature: {
    primary: '#263F35',
    accent: '#D7E58A',
    soft: '#E8EBDD',
    heroImage: 'nature-hero.jpg',
  },
  city: {
    primary: '#963F32',
    accent: '#D8A66A',
    soft: '#F1E6D5',
    heroImage: 'city-hero.jpg',
  },
  beach: {
    primary: '#176C70',
    accent: '#E3C77A',
    soft: '#DCEEF0',
    heroImage: 'beach-hero.jpg',
  },
  adventure: {
    primary: '#344B5B',
    accent: '#CB7049',
    soft: '#E8DCC8',
    heroImage: 'adventure-hero.jpg',
  },
}

interface ThemeState {
  theme: TravelMood
  tokens: ThemeTokens
  setTheme: (theme: TravelMood) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'nature',
      tokens: moodThemes.nature,
      setTheme: (theme: TravelMood) => set({ theme, tokens: moodThemes[theme] }),
    }),
    {
      name: 'travel-planner-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

// Helper to get theme tokens
export const getThemeTokens = (theme: TravelMood): ThemeTokens => moodThemes[theme]
export const moodThemesList = Object.keys(moodThemes) as TravelMood[]