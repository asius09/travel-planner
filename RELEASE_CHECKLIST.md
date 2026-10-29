# Release Checklist

## Repository
- [ ] Public GitHub repository exists and remote URL is correct.
- [ ] `DESIGN.md`, `AGENTS.md`, `PRODUCT.md`, `USER_FLOWS.md`, `ARCHITECTURE.md`, `TESTING.md`, `SECURITY.md` and this checklist are committed.
- [ ] Lockfile is committed; clean install works.
- [ ] `.env.example` contains placeholders only.
- [ ] Conventional commits exist for setup and completed phases.
- [ ] CI passes on the pushed branch.

## Product
- [ ] Onboarding and optional permission flows work.
- [ ] Explore mood hero and recommendation changes match preferences.
- [ ] Search and filters work together.
- [ ] Destination details show estimates and cost disclaimer.
- [ ] Add, duplicate-add, remove, reorder and total budget work.
- [ ] Trip persists across app restart.
- [ ] Preference edits do not reset trip data.
- [ ] INR/USD policy is correct and tested.
- [ ] Empty, loading, offline and recoverable error states are present.

## Backend and security
- [ ] Production API health check passes.
- [ ] Database migrations run from a clean database.
- [ ] Seed data covers each mood.
- [ ] Better Auth flows work; email verification behavior matches product decision.
- [ ] User ownership isolation tests pass.
- [ ] CORS, validation and safe error handling are configured.
- [ ] No credentials are committed or bundled into the mobile app.

## Quality
- [ ] Lint, typecheck, unit, integration and component tests pass.
- [ ] Maestro core flow passes on Android, or blocker is clearly documented.
- [ ] App builds and installs from a fresh APK.
- [ ] Cold launch, tab switching, search and list scrolling are checked.
- [ ] TalkBack labels, touch targets, safe areas and reduced-motion behavior checked.
- [ ] Images load reliably and have fallbacks/attribution where required.

## Submission
- [ ] README includes overview, features, stack, setup, architecture, screenshots, tests, known limitations and links.
- [ ] Screenshots are real captures from the working app.
- [ ] Public repository URL is verified.
- [ ] APK/demo link is verified by opening it from a clean session.
- [ ] Short demo video is included if time allows.
