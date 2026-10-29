# Initial Build Prompt: Travel Planner

You are the lead product engineer and mobile UX engineer. The repository is initially empty unless inspection proves otherwise. Build a working, testable travel-planning mobile app from the ground up. Follow `DESIGN.md` as the visual/product source of truth and `AGENTS.md` as the engineering source of truth. Do not merely describe plans: execute repository setup, install dependencies, implement, test, and commit each completed phase. Never claim a command, test, deployment, permission grant, or commit succeeded unless you verified it.

## 0. Non-negotiable first actions

1. Inspect the current directory, git status, Node/package manager versions, existing files, GitHub login and repository access. Preserve any existing work. Never overwrite a non-empty repository without inspection.
2. Check whether the target repository already exists. If so, inspect it and use it. If not, create a new public repository named `travel-planner` under the authenticated user's account if repository creation capability is available. If not available, initialize locally and provide the exact `gh repo create` command; do not pretend remote creation happened.
3. Read all of `DESIGN.md` and `AGENTS.md`; treat them as binding.
4. Install the UI taste skill using the user's requested command, with its complete output captured first:
   `npx skills use "https://uizze.sh/" --skill "ui-taste" > /tmp/travel-planner-ui-taste-install.log 2>&1; status=$?; cat /tmp/travel-planner-ui-taste-install.log; exit $status`
   Read the full output. Locate its supporting-files directory and read every referenced instruction relevant to this project. Resolve relative paths from the provided supporting-files directory, not the repository root. If the exact command is unsupported by the installed CLI, inspect `npx skills --help`, use the documented equivalent for `ui-taste`, and report the actual command/result. Do not merely mention the skill.
5. Add a relevant Apple/iOS design and accessibility skill if the skills CLI offers one (prefer `ios-design`; verify the real name and output rather than assuming). Read its complete instructions.
6. Set up REA as a local MCP/agent integration using the documented current setup (`npx rea-agents@latest setup`), choosing the actual coding agent in use. Read the setup plan before approving changes. Restart/reconnect the agent if required. Run its documented diagnostics and verify it can be used. Use REA for targeted investigations of animation and navigation approaches when useful. If this environment cannot install or connect MCP servers, document exact steps and continue without claiming it is connected.
7. Create a concise execution plan and immediately proceed into Phase 1. Do not pause to ask questions unless blocked by credentials/permissions that only the user can provide.

## 1. Repository and monorepo

Use a pnpm workspace monorepo, with Node LTS compatible with the selected Expo SDK. Pin package manager, use lockfile, strict TypeScript, shared lint/format/test scripts, and a consistent naming convention.

Preferred structure:

- `apps/mobile`: Expo + React Native + TypeScript + Expo Router + NativeWind.
- `apps/api`: Hono API, TypeScript, Better Auth, Drizzle ORM.
- `packages/shared`: shared TypeScript domain types, schema validation, preference theme metadata, recommendation/budget logic where runtime compatibility allows.
- `packages/config`: shared TypeScript, ESLint/format config only if it reduces duplication.
- `packages/animation`: only if it can be made small and worthwhile; do not force a package purely for abstraction.
- `packages/ui`: shared mobile components only if workspace resolution stays simple; keep native-specific components in mobile when necessary.
- `DESIGN.md`, `AGENTS.md`, `README.md`, `.env.example`, `.gitignore`, `pnpm-workspace.yaml`, root `package.json`, `tsconfig` and CI config.

Use the current supported Expo SDK and its compatible React Native version. First inspect official/current package docs and compatibility for Expo Router, NativeWind, Reanimated/Worklets, Skia and the dynamic notification library. Do not indiscriminately install `latest` native dependencies; use `npx expo install` for Expo-managed native packages. Verify the lockfile and a clean install.

## 2. Backend and authentication

Preferred backend:
- `apps/api`: Hono + TypeScript, deployed to a free host suitable for the runtime (consider Vercel Functions or Cloudflare Workers only after confirming Better Auth, Drizzle and database driver compatibility).
- Database: PostgreSQL using a free tier with no payment required for basic evaluation, selected after checking current free-tier/runtime requirements.
- Drizzle ORM and committed migrations.
- Better Auth email/password, email verification disabled as requested.
- Server-only secrets; `.env.example` contains placeholders only.
- Input validation at every API boundary using Zod or a compatible schema validator.
- Authorization on every trip read/write; never trust a client-provided user ID as proof of ownership.
- Basic rate limiting where supported, secure CORS allowlist, safe error responses, request size limits, and no secret/token logging.
- Add `/health` and API contract tests.
- Seed destination data via SQL/seed script; use a tiny database footprint and at least five destinations per travel mood.

Do not use Supabase. Do not add OAuth unless there is enough time and it is fully configured/tested. Anonymous/guest persistence must not be insecure. Let users browse without authentication; prompt sign-in when saving/syncing if that is the safer viable path.

## 3. Secure storage

Use `expo-secure-store` for sensitive client-side credentials/session tokens only when the Better Auth mobile session approach has been verified. Prefer secure, HttpOnly server cookies when supported by the architecture, and follow Better Auth's current React Native guidance. Never store passwords, API secrets, private keys, or long-lived bearer tokens in AsyncStorage. AsyncStorage may store non-sensitive cached destinations, user preferences and a last-known trip snapshot. Document what goes in SecureStore versus AsyncStorage. Test sign-out, token/session expiry, invalid storage, and reauthentication.

## 4. Product and interaction scope

Implement in this order:

1. Welcome and guided onboarding.
2. Auth screens and session restoration.
3. Explore screen whose top hero background/asset follows the user’s travel mood.
4. Search and working category filters.
5. Destination details and Add to Trip.
6. My Trip with remove, reorder, destination count, and computed budget.
7. Preferences editing, including travel mood and currency.
8. Optional permissions explained in context: location and notifications. Ask OS permissions only after the user taps Enable. Skip/not now must work. Denial cannot block use.
9. Release polish and accessibility.

Onboarding asks:
- Travel mood: Nature, City & culture, Beach, Adventure.
- Duration: Weekend, 3–5 days, A week or more, Flexible.
- Budget: Budget-friendly, Balanced, Premium, Not sure.
- Travel party: Solo, Couple, Friends, Family.
Make every step skippable, support Back, preserve choices through authentication, and explain that answers personalize recommendations. Permission screens must separately explain location and notifications.

Use deterministic recommendation scoring, not AI:
- mood match 40%
- duration fit 25%
- budget fit 25%
- travel-party fit 10%
Keep some discovery diversity, allow manual search/filter override, and provide a sensible default for skipped answers. Store only the minimal preferences defined in DESIGN.md.

## 5. Theme and design

Read `DESIGN.md` and apply it rather than inventing an unrelated design. Use Geist Sans, semantic tokens, low visual noise, restrained borders, no gratuitous shadows, generous spacing, and travel photography. Avoid excessive bold/semibold styling, thick borders, default template appearance and unnecessary icons.

Mood changes:
- Nature: forest/mountain/lake imagery and deep forest/sage/lime highlights.
- City & culture: clay/ochre/linen accents and city/architecture photography.
- Beach: lagoon/sand/sea-mist accents and coast photography.
- Adventure: slate/ember/stone accents and trail/rock imagery.
Only the Explore hero and limited semantic accents change. Shared surfaces and accessibility contrast stay consistent. Changing preferences must not delete, reorder, or reset trip data.

Use local static image assets or stable permitted image URLs, with consistent crops and optimized dimensions. Track image source/license and attribution when needed. Include loading placeholders and reliable fallbacks. Do not embed generated temporary links or scrape images without respecting licenses.

Copy should be concise, human, calm and useful. Keep CTAs literal: “Plan a trip”, “Continue”, “Not now”, “Enable location”, “Enable notifications”, “Add to trip”, “View trip”, “Add another place”, “Clear filters”, “Try a different search”. Do not imply flight/hotel booking exists.

## 6. Performance and data fetching

- Use TanStack Query for server state: query keys, caching, retry policy, stale times, cancellation where practical, mutations and invalidation.
- Use Zustand for small client state: onboarding draft/preferences, trip interaction state and UI state. Do not duplicate the whole server cache in Zustand.
- Use `expo-secure-store` for sensitive session values only as justified above.
- Use `expo-image` for cached remote/local images.
- Use `FlatList` or `FlashList` only after checking current Expo compatibility and showing need. Tune keys, item layout and windowing. Avoid rendering large unvirtualized destination grids.
- Keep derived data in memoized selectors or pure functions. Do not store budget totals.
- Avoid network waterfalls. Keep screen transitions responsive while data loads; skeletons must not flash for cached data or appear on tab changes without real refetching.
- Never block basic Explore navigation on non-critical network requests.

## 7. Motion, transitions and morphing

Use React Native Reanimated + Gesture Handler, matched to the Expo SDK. Implement short, purposeful animations:
- screen transitions around 180–240 ms
- card press scale approximately 0.98
- smooth bottom sheet and selection changes
- spring-based reordering
- image crossfade
- budget number transition only if stable and accessible
- subtle button feedback
Do not animate every element; avoid layout thrashing, excessive simultaneous shared values and long decorative parallax. Respect reduced motion and keep interactions usable without animation.

### Dynamic notifications
Inspect `https://github.com/rit3zh/expo-dynamic-notifications` README, license and source. It advertises Dynamic Island-style in-app notification overlays and currently lists a recent Expo SDK, Skia, Reanimated/Worklets, Gesture Handler, Safe Area Context and Expo Image peer stack. Verify compatibility with the selected SDK and Android target before installation. Use it only for short in-app feedback if compatible; it is not a substitute for OS push/local notifications. If incompatibility or build risk is high, isolate it behind an adapter and use a compatible in-app toast fallback. Do not upgrade the whole app SDK simply to force this dependency without a build/test justification.

### Torph-like text morph
`torph` is for web frameworks, not React Native. Do not import its web implementation into Expo. Inspect the open source repository `https://github.com/lochie/torph`, its LICENSE, and core interpolation/matching concepts. Reimplement a small native component using Reanimated/React Native only if it is technically appropriate and covered by tests. Do not copy substantial code without verifying license/attribution and include required license/notice if deriving from it. Do not build a general-purpose animation library for this one-day MVP. Use the effect sparingly, e.g. a short Explore headline change or a number label, with stable layout, no flicker, no accessibility regression and reduced-motion fallback.

Use REA (once actually connected) to investigate native morph, navigation transition and gesture/layout-shift patterns. Record findings and decisions briefly in `docs/animation-decisions.md`.

## 8. Dynamic notifications versus OS permissions

The `expo-dynamic-notifications` package is an in-app overlay. For actual notifications, inspect Expo Notifications capabilities and platform requirements separately. Request notification permission only after an explanatory UI and explicit action. Create only useful local reminders if the app contains a clear reminder feature. Do not add scheduled notifications solely to demonstrate the package. Test permission accepted, denied, and unavailable states.

For location, use Expo Location only if location improves nearby discovery. Request permission after the rationale. Allow skip/denial and provide a manual region fallback. Do not collect/store precise coordinates by default.

## 9. Testing strategy

Use Vitest for pure functions and API/unit tests. Use React Native Testing Library for meaningful component tests after verifying support with the selected Expo/Jest/Vitest transform setup; if Vitest cannot reliably execute React Native component tests, retain Vitest for unit/integration and use the Expo-recommended Jest preset for RN components rather than inventing brittle configuration. Document this adjustment.

Test layers:
- Unit: mood token selection, onboarding validation, recommendation scoring, search/filter combinations, budget and currency, order functions, cache parsing.
- API integration: auth config without email verification, validation failures, authorization isolation, duplicate add, remove, atomic reorder, unknown destination handling, DB failures.
- Component: onboarding back/skip, permission rationale, explore loading/error/empty states, filters, detail add action, trip list and budget states.
- End-to-end via Maestro: first launch → onboarding → deny permissions → Explore → search/filter → detail → add → My Trip → reorder/remove → kill/relaunch → persistence; edit mood and confirm trip untouched; auth sign-up/sign-in/session restoration.
- Add GitHub Actions CI for typecheck, lint, unit/integration tests, and available component tests. Keep device E2E as a documented local/CI flow.

No test is considered passed until it was run. Fix flaky tests instead of disabling them. Include seed/reset instructions to make tests deterministic.

## 10. Packages and commands

Create root scripts such as:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:unit`
- `pnpm test:integration`
- `pnpm test:mobile`
- `pnpm test:e2e`
- `pnpm dev`
- `pnpm build:android` or documented EAS command

Use current compatible package versions, create lockfile and `.env.example`, and document required services. Do not make a production build depend on local file paths or machine-specific assumptions.

## 11. Phase workflow and commit discipline

Create one initial commit after monorepo bootstrap and docs. Then work in phases with separate conventional commits:

- `chore: initialize expo monorepo and quality tooling`
- `feat: add mood onboarding and theme system`
- `feat: add destination discovery and details`
- `feat: add persisted trip planning`
- `feat: add secure auth and backend sync`
- `test: add unit integration and maestro flows`
- `docs: add setup architecture and release guide`

Adapt order as dependencies require. Keep commits small and coherent. Never commit `.env`, credentials, built secrets, test user passwords, or binary temp files. Add `.env.example`.

## 12. Quality gates

After each phase:
1. Run format/lint/typecheck and the relevant tests.
2. Run the app on Android/emulator if available.
3. Inspect every touched screen and compare against `DESIGN.md` and user-provided visual references.
4. Test at least one failure case for every networked feature.
5. Verify navigation, back behavior, safe areas, reduced motion, touch targets, and screen-reader labels.
6. Report exact commands and outcomes.

Before final release:
- Clean install from lockfile.
- Production API build/start.
- Database migrations applied to a test database.
- Security check for secrets and ownership.
- All unit/API integration/component tests pass.
- Core Maestro flow passes or clearly report environmental blocker.
- APK builds and installs; open app from fresh install.
- README, screenshot assets, repository URL, demo/APK URL and known limitations are accurate.
- `DESIGN.md` and `AGENTS.md` included in repository.
- Initial setup commit and phase commits exist on the actual GitHub remote.

## 13. User-facing progress reports

Keep progress concise. At the start, report the repository target and the first setup steps. After each phase, report changed files, commands run, pass/fail results and the next milestone. If blocked by account setup, secrets or service provisioning, state exactly what the user must do and continue with independent work. Never claim remote repo creation, deployment, testing, or REA connectivity if not verified.
