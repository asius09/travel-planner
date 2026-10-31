import { z } from 'zod'

export const travelMoodSchema = z.enum(['nature', 'city', 'beach', 'adventure'])
export const durationSchema = z.enum(['weekend', '3-5-days', 'week-plus', 'flexible'])
export const budgetSchema = z.enum(['budget-friendly', 'balanced', 'premium', 'not-sure'])
export const travelPartySchema = z.enum(['solo', 'couple', 'friends', 'family'])

export const userPreferencesSchema = z.object({
  userId: z.string().uuid(),
  travelMood: travelMoodSchema,
  duration: durationSchema,
  budget: budgetSchema,
  travelParty: travelPartySchema,
  currency: z.string().length(3),
  regionCode: z.string().length(2).optional(),
  updatedAt: z.string().datetime(),
})

export const destinationSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  country: z.string().min(1),
  region: z.string().optional(),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  moodTags: z.array(travelMoodSchema).min(1),
  categoryTags: z.array(z.string()).min(1),
  estimatedCostMinor: z.number().int().nonnegative(),
  costCurrency: z.string().length(3),
  suggestedDaysMin: z.number().int().positive(),
  suggestedDaysMax: z.number().int().positive(),
  highlights: z.array(z.string()).min(1),
  heroImage: z.string().url(),
  galleryImages: z.array(z.string().url()).optional(),
  imageCredit: z.string().optional(),
  isPublished: z.boolean(),
  popularity: z.number().int().nonnegative(),
})

export const tripSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const tripItemSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  destinationId: z.string().uuid(),
  position: z.number().int().nonnegative(),
  addedAt: z.string().datetime(),
})

export const createTripItemSchema = tripItemSchema.omit({ id: true, addedAt: true })

export const reorderTripItemsSchema = z.object({
  tripId: z.string().uuid(),
  items: z.array(
    z.object({
      destinationId: z.string().uuid(),
      position: z.number().int().nonnegative(),
    })
  ),
})

export const addToTripSchema = z.object({
  destinationId: z.string().uuid(),
})

export const searchParamsSchema = z.object({
  query: z.string().optional(),
  mood: travelMoodSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
})

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255).optional(),
})

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type TravelMood = z.infer<typeof travelMoodSchema>
export type Duration = z.infer<typeof durationSchema>
export type Budget = z.infer<typeof budgetSchema>
export type TravelParty = z.infer<typeof travelPartySchema>
export type UserPreferences = z.infer<typeof userPreferencesSchema>
export type Destination = z.infer<typeof destinationSchema>
export type Trip = z.infer<typeof tripSchema>
export type TripItem = z.infer<typeof tripItemSchema>
export type CreateTripItem = z.infer<typeof createTripItemSchema>
export type ReorderTripItems = z.infer<typeof reorderTripItemsSchema>
export type AddToTrip = z.infer<typeof addToTripSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>
export type SignUp = z.infer<typeof signUpSchema>
export type SignIn = z.infer<typeof signInSchema>