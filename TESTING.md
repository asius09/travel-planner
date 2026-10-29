# Test Plan and Quality Gates

## Test layers
1. Unit tests with Vitest for pure domain logic.
2. API integration tests for Hono routes and database behavior.
3. React Native component tests with React Native Testing Library using a verified compatible test runner. If Vitest cannot support the chosen native transform reliably, use Expo's recommended Jest setup for component tests and retain Vitest for unit/API tests.
4. Maestro end-to-end tests on Android for critical real-device flows.
5. Manual release checks on a fresh install and after an app restart.

## Required unit cases
- Mood theme selection and semantic token completeness.
- Onboarding validation, skipping, back navigation and default values.
- Recommendation scoring, missing preferences, stable ties and diversity.
- Search matching, empty query, case normalization and combined filters.
- Budget sum, zero items, missing estimates, mixed currencies and integer minor units.
- Currency formatting for India/INR and non-India/USD.
- Reorder operations, invalid indexes, duplicate items and removal.
- Safe cache parsing, stale/corrupt cache and migration behavior.
- Reduced-motion preference behavior and animation state helpers.

## Required API integration cases
- Sign-up/sign-in/sign-out and session restoration with email verification disabled.
- Unauthenticated access returns the expected status.
- User A cannot read or mutate User B's trip.
- Invalid IDs, invalid payloads, unknown destinations and oversized payloads are rejected.
- Duplicate add is idempotent or returns a documented conflict.
- Remove and reorder preserve valid unique positions.
- Database errors return safe errors without leaking SQL or secrets.
- CORS rejects unapproved origins.
- Rate limit behavior is tested if implemented.
- Guest-trip migration handles conflicts and retries without losing data.

## Required component cases
- Onboarding continue/back/skip and validation.
- Permission explanation, not-now path and denied-permission path.
- Explore loading, ready, empty, error, retry and offline states.
- Search and filters can be combined and cleared.
- Destination detail Add to Trip, duplicate add and mutation failure.
- My Trip empty, budget, remove, reorder and undo/confirmation.
- Preference change updates theme but leaves trip order and membership unchanged.
- Accessible labels, touch targets and reduced-motion alternatives.

## Maestro critical flow
Fresh install → onboarding mood Nature, 3–5 days, Balanced, Couple → skip location and notifications → Explore → search → filter → open detail → add to trip → My Trip → reorder → remove one item → relaunch → verify remaining trip → change mood → verify trip unchanged → sign in → verify server sync.

Add a separate auth error/retry flow if time permits.

## CI gates
Every PR/phase commit should run formatting, lint, typecheck, unit tests and API integration tests. Run component tests in the configured compatible runner. Run Maestro where emulator setup is available; if unavailable in CI, document and run locally before release. No skipped failing tests without a documented reason.

## Performance checks
- No repeated loading skeleton on cached tab switches.
- No duplicate requests caused by unstable query keys or effects.
- Virtualized list for larger result sets.
- Stable keys and memoization only where profiling shows value.
- Image caching and correctly sized assets.
- Avoid unnecessary state updates and expensive work during render.
- Measure app startup, Explore-to-detail, add-to-trip feedback and My Trip transitions on a real Android device or emulator.
