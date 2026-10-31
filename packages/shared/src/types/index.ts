export type TravelMood = 'nature' | 'city' | 'beach' | 'adventure'
export type Duration = 'weekend' | '3-5-days' | 'week-plus' | 'flexible'
export type Budget = 'budget-friendly' | 'balanced' | 'premium' | 'not-sure'
export type TravelParty = 'solo' | 'couple' | 'friends' | 'family'

export interface UserPreferences {
  userId: string
  travelMood: TravelMood
  duration: Duration
  budget: Budget
  travelParty: TravelParty
  currency: string
  regionCode?: string
  updatedAt: string
}

export interface Destination {
  id: string
  slug: string
  name: string
  country: string
  region?: string
  shortDescription: string
  description: string
  moodTags: TravelMood[]
  categoryTags: string[]
  estimatedCostMinor: number
  costCurrency: string
  suggestedDaysMin: number
  suggestedDaysMax: number
  highlights: string[]
  heroImage: string
  galleryImages?: string[]
  imageCredit?: string
  isPublished: boolean
  popularity: number
}

export interface Trip {
  id: string
  userId: string
  title?: string
  createdAt: string
  updatedAt: string
}

export interface TripItem {
  id: string
  tripId: string
  destinationId: string
  position: number
  addedAt: string
}

export interface TripWithDestinations extends Trip {
  destinations: (Destination & { position: number })[]
}

export interface RecommendationInput {
  mood?: TravelMood
  duration?: Duration
  budget?: Budget
  travelParty?: TravelParty
}

export interface RecommendationScore {
  destinationId: string
  score: number
  moodMatch: number
  durationFit: number
  budgetFit: number
  partyFit: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type Currency = 'USD' | 'INR'

export interface CurrencyFormatOptions {
  currency: Currency
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}