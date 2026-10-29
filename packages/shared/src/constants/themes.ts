import type { TravelMood } from '../types'

export interface MoodThemeTokens {
  primary: string
  accent: string
  soft: string
  heroImage: string
}

export const MOOD_THEMES: Record<TravelMood, MoodThemeTokens> = {
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

export const MOOD_LABELS: Record<TravelMood, string> = {
  nature: 'Nature',
  city: 'City & culture',
  beach: 'Beach',
  adventure: 'Adventure',
}

export const MOOD_DESCRIPTIONS: Record<TravelMood, string> = {
  nature: 'Forests, mountains, lakes',
  city: 'Architecture, streets, markets',
  beach: 'Coastlines, islands, turquoise water',
  adventure: 'Trails, rugged peaks, outdoor activity',
}

export const DURATION_OPTIONS = [
  { value: 'weekend', label: 'Weekend', description: '1-2 days' },
  { value: '3-5-days', label: '3–5 days', description: 'Short getaway' },
  { value: 'week-plus', label: 'A week or more', description: '7+ days' },
  { value: 'flexible', label: 'Not sure yet', description: 'Flexible dates' },
] as const

export const BUDGET_OPTIONS = [
  { value: 'budget-friendly', label: 'Budget-friendly', description: 'Keep costs low' },
  { value: 'balanced', label: 'Balanced', description: 'Good value for money' },
  { value: 'premium', label: 'Premium', description: 'Comfort and quality' },
  { value: 'not-sure', label: 'Not sure yet', description: 'Open to options' },
] as const

export const TRAVEL_PARTY_OPTIONS = [
  { value: 'solo', label: 'Solo', description: 'Just me' },
  { value: 'couple', label: 'Couple', description: 'Two people' },
  { value: 'friends', label: 'Friends', description: 'Group of friends' },
  { value: 'family', label: 'Family', description: 'With children' },
] as const

export const CATEGORY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'nature', label: 'Nature' },
  { value: 'city', label: 'City' },
  { value: 'beach', label: 'Beach' },
  { value: 'adventure', label: 'Adventure' },
] as const

export const BASE_COLORS = {
  canvas: '#F7F6F0',
  surface: '#FFFFFF',
  text: '#202822',
  muted: '#777F78',
  border: '#E5E7DF',
}