// Types
export type {
  TravelMood,
  Duration,
  Budget,
  TravelParty,
  UserPreferences,
  Destination,
  DestinationImage,
  Trip,
  TripItem,
  TripWithDestinations,
  RecommendationInput,
  RecommendationScore,
  ApiError,
  PaginatedResponse,
  Currency,
  CurrencyFormatOptions,
} from './types'

// Schemas (Zod)
export {
  travelMoodSchema,
  durationSchema,
  budgetSchema,
  travelPartySchema,
  userPreferencesSchema,
  userPreferencesUpdateSchema,
  destinationImageSchema,
  destinationSchema,
  tripSchema,
  tripItemSchema,
  createTripItemSchema,
  reorderTripItemsSchema,
  addToTripSchema,
  searchParamsSchema,
  signUpSchema,
  signInSchema,
} from './schemas'

// Types from schemas
export type {
  TravelMood as TravelMoodSchema,
  Duration as DurationSchema,
  Budget as BudgetSchema,
  TravelParty as TravelPartySchema,
  UserPreferences as UserPreferencesSchema,
  UserPreferencesUpdate,
  DestinationImage as DestinationImageSchema,
  Destination as DestinationSchema,
  Trip as TripSchema,
  TripItem as TripItemSchema,
  CreateTripItem,
  ReorderTripItems,
  AddToTrip,
  SearchParams,
  SignUp,
  SignIn,
} from './schemas'

// Utilities
export {
  calculateRecommendationScores,
  getRecommendations,
  addDiversity,
} from './utils/recommendations'

export {
  formatCurrency,
  convertCurrency,
  getExchangeRate,
  getRateTimestamp,
  getDisplayCurrency,
  parseCurrencyInput,
} from './utils/currency'

// Theme constants
export {
  MOOD_THEMES,
  MOOD_LABELS,
  MOOD_DESCRIPTIONS,
  DURATION_OPTIONS,
  BUDGET_OPTIONS,
  TRAVEL_PARTY_OPTIONS,
  CATEGORY_FILTERS,
  BASE_COLORS,
  type MoodThemeTokens,
} from './constants/themes'