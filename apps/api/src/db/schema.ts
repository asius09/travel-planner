import { pgTable, uuid, varchar, text, integer, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

// Users table (managed by Better Auth, but we define for reference)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Sessions table (managed by Better Auth)
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
})

// Accounts table (managed by Better Auth)
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: varchar('scope', { length: 255 }),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Verification tokens (managed by Better Auth)
export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// User preferences. The four answer columns are nullable so onboarding can
// persist partial progress one step at a time; completion is tracked
// server-side so a failed save can never falsely complete the flow.
export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).primaryKey(),
  travelMood: varchar('travel_mood', { length: 20 }),
  duration: varchar('duration', { length: 20 }),
  budget: varchar('budget', { length: 20 }),
  travelParty: varchar('travel_party', { length: 20 }),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  regionCode: varchar('region_code', { length: 2 }),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  onboardingFlowVersion: integer('onboarding_flow_version').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Ordered destination image collection. Positions are unique per destination so
// the detail gallery keeps a stable order; duplicates within a destination are
// impossible.
export const destinationImages = pgTable('destination_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  destinationId: uuid('destination_id').references(() => destinations.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  alt: text('alt'),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  destinationPositionUnique: uniqueIndex('destination_images_destination_position_unique').on(table.destinationId, table.position),
  destinationIdIdx: index('destination_images_destination_id_idx').on(table.destinationId),
}))

// Destinations
export const destinations = pgTable('destinations', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  country: varchar('country', { length: 255 }).notNull(),
  region: varchar('region', { length: 255 }),
  shortDescription: text('short_description').notNull(),
  description: text('description').notNull(),
  moodTags: text('mood_tags').array().notNull(),
  categoryTags: text('category_tags').array().notNull(),
  estimatedCostMinor: integer('estimated_cost_minor').notNull(),
  costCurrency: varchar('cost_currency', { length: 3 }).notNull().default('USD'),
  suggestedDaysMin: integer('suggested_days_min').notNull(),
  suggestedDaysMax: integer('suggested_days_max').notNull(),
  highlights: text('highlights').array().notNull(),
  heroImage: text('hero_image').notNull(),
  imageCredit: text('image_credit'),
  isPublished: boolean('is_published').default(true).notNull(),
  popularity: integer('popularity').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  countryIdx: index('destinations_country_idx').on(table.country),
  moodTagsIdx: index('destinations_mood_tags_idx').on(table.moodTags),
  publishedIdx: index('destinations_published_idx').on(table.isPublished),
}))

// Trips
export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('trips_user_id_idx').on(table.userId),
}))

// Trip items
export const tripItems = pgTable('trip_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }).notNull(),
  destinationId: uuid('destination_id').references(() => destinations.id, { onDelete: 'cascade' }).notNull(),
  position: integer('position').notNull(),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tripDestinationUnique: uniqueIndex('trip_items_trip_destination_unique').on(table.tripId, table.destinationId),
  tripPositionUnique: uniqueIndex('trip_items_trip_position_unique').on(table.tripId, table.position),
  tripIdIdx: index('trip_items_trip_id_idx').on(table.tripId),
}))

// Zod schemas for validation
export const insertUserPreferencesSchema = createInsertSchema(userPreferences)
export const insertDestinationSchema = createInsertSchema(destinations)
export const insertDestinationImageSchema = createInsertSchema(destinationImages)
export const insertTripSchema = createInsertSchema(trips)
export const insertTripItemSchema = createInsertSchema(tripItems)

// Types
export type User = typeof users.$inferSelect
export type UserPreferences = typeof userPreferences.$inferSelect
export type Destination = typeof destinations.$inferSelect
export type DestinationImage = typeof destinationImages.$inferSelect
export type Trip = typeof trips.$inferSelect
export type TripItem = typeof tripItems.$inferSelect

export type NewUserPreferences = typeof userPreferences.$inferInsert
export type NewDestination = typeof destinations.$inferInsert
export type NewDestinationImage = typeof destinationImages.$inferInsert
export type NewTrip = typeof trips.$inferInsert
export type NewTripItem = typeof tripItems.$inferInsert
// Relations (used by Drizzle's relational queries, e.g. db.query.tripItems)
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  trips: many(trips),
}))

export const destinationsRelations = relations(destinations, ({ many }) => ({
  images: many(destinationImages),
}))

export const destinationImagesRelations = relations(destinationImages, ({ one }) => ({
  destination: one(destinations, {
    fields: [destinationImages.destinationId],
    references: [destinations.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, { fields: [trips.userId], references: [users.id] }),
  items: many(tripItems),
}))

export const tripItemsRelations = relations(tripItems, ({ one }) => ({
  trip: one(trips, { fields: [tripItems.tripId], references: [trips.id] }),
  destination: one(destinations, {
    fields: [tripItems.destinationId],
    references: [destinations.id],
  }),
}))
