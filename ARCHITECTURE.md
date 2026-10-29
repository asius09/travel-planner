# Architecture and Technical Decisions

## Workspace
- `apps/mobile`: Expo, React Native, TypeScript, Expo Router, NativeWind.
- `apps/api`: Hono, TypeScript, Better Auth, Drizzle ORM.
- `packages/shared`: schemas, domain types, recommendation scoring, budget/currency formatting contracts and mood metadata.
- `docs`: decisions, setup notes, screenshots and test plans.

Use pnpm workspaces and a committed lockfile. Keep shared code platform-neutral. Avoid a complex shared UI package unless it measurably reduces duplication.

## Client state boundaries
- TanStack Query: server state, caching, loading/error states, request cancellation, mutation invalidation and sync status.
- Zustand: small local UI state and onboarding/preferences draft.
- AsyncStorage: non-sensitive cached destinations, preference draft and guest trip snapshot.
- Expo SecureStore: sensitive client session material only if the chosen Better Auth mobile strategy explicitly requires it and supports it. Do not store passwords or backend secrets.
- Do not duplicate TanStack Query data into Zustand.
- Derive totals and filtered/recommended lists from source data rather than storing duplicate values.

## API and persistence
- Hono routes validate inputs at the boundary.
- PostgreSQL stores users/auth data, preferences and trip membership/order.
- Drizzle migrations are committed and reproducible.
- Every trip read/write is scoped to the authenticated server-side user.
- Client-supplied user IDs are never authorization.
- Use a unique constraint for one destination per trip, and transactional reorder/update operations where supported.
- Include health endpoint and request IDs in safe logs.
- Seed at least five destinations for each supported mood, with enough fields to render all mandatory screens.

## Suggested entities
- `destinations`: id, slug, name, country, region, short_description, description, mood_tags, category_tags, estimated_cost_minor, cost_currency, suggested_days_min, suggested_days_max, highlights, hero_image, image_credit, is_published.
- `user_preferences`: user_id, mood, duration, budget, party, region_code nullable, updated_at.
- `trips`: id, user_id, title nullable, created_at, updated_at.
- `trip_items`: id, trip_id, destination_id, position, added_at; unique trip/destination and unique trip/position constraints where practical.
- Auth tables are managed according to Better Auth's current Drizzle schema requirements.

Keep data minimal. Store image URLs or asset keys, never image binaries. Store money in integer minor units with an explicit currency code. Never store a derived total as the source of truth.

## Recommendation logic
Use deterministic scoring:
- mood match: 40%
- duration fit: 25%
- budget fit: 25%
- travel-party fit: 10%

Define how missing/unknown answers behave. Add diversity so the top results do not all look identical. Search and explicit filters must take precedence over recommendation ranking. Unit-test scoring and tie-breaking.

## Currency
Use the user's selected/derived region for display: INR for India and USD for the rest of the MVP. Format with `Intl.NumberFormat` where supported by the selected Hermes/runtime; test Android behavior. Keep the stored currency code explicit. Do not convert a destination's actual cost into a different currency unless a real, dated exchange-rate source exists. For the MVP, store and display destination estimates in the destination's configured currency, or define a single consistent conversion policy with a real source. Never label a USD amount as INR by merely changing the symbol.

## API contract
Use versioned routes if useful, typed request/response schemas, predictable error codes, pagination only where needed, and a shared contract to prevent client/server drift. Document authentication requirements per endpoint. Keep CORS origins explicit in production.

## Architecture decision records
Write short ADRs when selecting:
- hosting/database and runtime compatibility,
- Better Auth mobile session strategy,
- guest-to-account trip migration,
- notification implementation,
- animation/morph implementation,
- image source/licensing policy.
