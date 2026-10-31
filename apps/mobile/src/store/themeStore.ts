import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type TravelMood = 'nature' | 'city' | 'beach' | 'adventure'

/**
 * Mood-specific semantic token overrides.
 * These override specific semantic tokens when a mood is active.
 * All other semantic tokens inherit from the base theme in global.css.
 */
export interface MoodThemeOverrides {
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  soft: string
  heroImage: string
}

/**
 * Mood theme definitions using the approved palette from DESIGN.md.
 * Each mood defines its primary, accent, and soft tokens.
 * These map to the semantic tokens: --primary, --accent, --secondary (soft).
 */
const moodThemes: Record<TravelMood, MoodThemeOverrides> = {
  nature: {
    primary: '#263F35',       // Deep forest - maps to --primary
    primaryForeground: '#FFFFFF',
    accent: '#D7E58A',        // Vivid lime/sage - maps to --accent
    accentForeground: '#252B2D',
    soft: '#E8EBDD',          // Soft moss wash - maps to --secondary (mood.soft)
    heroImage: 'nature-hero.jpg',
  },
  city: {
    primary: '#963F32',       // Terracotta/brick
    primaryForeground: '#FFFFFF',
    accent: '#D8A66A',        // Warm ochre
    accentForeground: '#252B2D',
    soft: '#F1E6D5',          // Soft sand wash
    heroImage: 'city-hero.jpg',
  },
  beach: {
    primary: '#176C70',       // Deep maritime teal
    primaryForeground: '#FFFFFF',
    accent: '#E3C77A',        // Sunny sand
    accentForeground: '#252B2D',
    soft: '#DCEEF0',          // Soft seafoam wash
    heroImage: 'beach-hero.jpg',
  },
  adventure: {
    primary: '#344B5B',       // Slate granite
    primaryForeground: '#FFFFFF',
    accent: '#CB7049',        // Warm canyon
    accentForeground: '#252B2D',
    soft: '#E8DCC8',          // Soft stone wash
    heroImage: 'adventure-hero.jpg',
  },
}

interface ThemeState {
  theme: TravelMood
  tokens: MoodThemeOverrides
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

export const getThemeTokens = (theme: TravelMood): MoodThemeOverrides => moodThemes[theme]
export const moodThemesList = Object.keys(moodThemes) as TravelMood[]