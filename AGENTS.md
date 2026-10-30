# AGENTS.md

## Mission
Build the Outta travel planner mobile app as a polished, reliable Expo + React Native application. Optimize for the required discovery and trip-planning flows. Follow `DESIGN.md` as the single source of truth for product scope, visual identity, UI copy, theme tokens, and quality gates.

## Required stack
- Expo + React Native + TypeScript
- Expo Router for navigation
- NativeWind for styling
- Geist Sans typography
- Hono API, Better Auth (email verification disabled), Drizzle ORM, and PostgreSQL on a free-tier host
- Zustand for client trip state; AsyncStorage for local cache
- Vitest for unit/service tests
- React Native Testing Library for component tests
- Maestro for Android end-to-end tests

Do not silently replace a chosen technology. If a dependency is incompatible with the current Expo SDK, verify compatibility and document the smallest safe adjustment.

## Product scope
Mandatory:
1. Welcome and short preference onboarding
2. Authentication screens (mandatory before onboarding; zero guest access)
3. Explore with mood-based hero imagery, search, and working filters
4. Destination details and Add to Trip
5. My Trip with remove, reorder, derived budget, and persistence
6. Preferences editing without losing saved trip data
7. Loading, empty, offline, and error states
8. README, screenshots, public repository, and Android APK/demo

Do not add booking, collaboration, live prices, maps, or AI itinerary generation before mandatory flows pass.

## Design implementation rules
- Read `DESIGN.md` before implementing or changing UI.
- Follow approved brand, typography, color, icon, illustration, and motion rules.
- Inspect existing components, tokens, assets, and dependencies before creating alternatives.
- Verify loading, selected, disabled, error, accessibility, reduced-motion, and responsive states where relevant.
- Update `DESIGN.md` when an approved design decision changes.
- Do not treat mockups or concept artwork as implemented assets.
- Never hardcode hex colors in screen code or documentation; reference existing semantic tokens (`canvas`, `surface`, `text`, `muted`, `border`, `mood.*`).

## UX rules
- Use the exact tone and primary copy in `DESIGN.md`. Keep language short, clear, useful, and calm.
- Do not claim booking or reservations are supported.
- Onboarding questions are skippable. Keep Back navigation and preserve answers.
- Ask location and notification permissions only after explaining the benefit and the user explicitly taps Enable. Both are optional. Never block core functionality after denial.
- Users can change travel mood and preferences later.
- Mood changes semantic theme accents and Explore hero imagery only. It must not reset trip data or change the app's information architecture.
- Every control must work. Avoid decorative controls, fake filters, and placeholder actions.
- Provide accessible labels, visible selected states, keyboard handling, safe areas, and reduced-motion behavior where practical.

## Data and backend rules
- Minimize stored data. Use the record minimums defined in `DESIGN.md`; add fields only when required by a visible feature or integrity constraint.
- Keep image files/URLs referenced by a stable `imageKey`; do not store image binaries in PostgreSQL.
- Never store derived trip totals; calculate them from destination estimates.
- Prevent duplicate destinations per trip.
- Persist ordering explicitly and update reorder operations atomically.
- Enforce trip ownership on the server. Never trust a client-provided user ID as authorization.
- Keep secrets on the server. Never bundle database credentials or Better Auth secrets in the mobile app.
- Cache trip data locally, validate cached data before use, and reconcile with server state when available.
- On API failure, preserve the last known good state and show retry feedback. Roll back or reconcile failed optimistic updates.
- Do not mix estimates with different cost bases or currencies. Label estimates clearly.

## Mood themes and assets
- Implement theme palettes as typed semantic tokens, not scattered hex values.
- Keep common surfaces and text roles consistent; vary mood primary/accent/soft background and hero photography.
- Seed at least five destinations per mood.
- Use stable, licensed/allowed image assets, optimized sizes, consistent crops, loading placeholders, and fallbacks.
- Do not assume remote image URLs will always work.

## Engineering practices
- Keep screens thin. Put domain logic in pure functions and services.
- Separate UI components, domain logic, API access, persistence, and data.
- Avoid giant components, duplicated styles, duplicated currency logic, and unnecessary abstractions.
- Use strict TypeScript types; avoid `any` unless documented and unavoidable.
- Validate inputs at API boundaries.
- Handle loading, success, empty, and error states explicitly.
- Do not swallow exceptions or log secrets/tokens.
- Keep environment variables documented in `.env.example`; never commit `.env`.
- Prefer small, reviewable changes. Do not reformat unrelated files.

## Testing requirements
- Add Vitest tests for recommendation scoring, theme mapping, search/filter, trip mutations, budget calculations, and currency formatting.
- Test UI states with React Native Testing Library where compatible with the Expo setup.
- Add Maestro flows for onboarding, permission denial, discovery, add/remove/reorder, preference changes, and restart persistence.
- Run the relevant tests after each domain change. Do not claim tests passed unless they were run.
- Fix release-blocking bugs before polishing optional animations.

## Definition of done
A task is done only when:
1. The user flow works on Android.
2. Loading, empty, and error cases are handled.
3. Relevant tests pass or any blocker is explicitly reported.
4. No secrets are committed.
5. UI follows `DESIGN.md`.
6. Persistence, authorization, and data integrity are verified for affected flows.
7. Documentation is updated if architecture, setup, or behavior changed.

## Agent workflow
1. Inspect the existing project before editing; preserve its conventions.
2. Identify the smallest complete implementation for the requested task.
3. State assumptions only when they affect behavior or data.
4. Implement and test the change.
5. Report files changed, commands/tests run, results, and known limitations.
6. Never claim deployment, repository updates, or device testing unless the action actually succeeded.
