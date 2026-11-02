# Outta — Travel Discovery & Planning App

A calm, photography-led travel discovery and planning mobile application built with **Expo (React Native)**, **TypeScript**, **NativeWind**, and a typed **Hono** backend powered by **Better Auth**, **Drizzle ORM**, and **PostgreSQL**.

Outta is designed to help travelers turn an aspirational travel mood into a shortlist of curated destinations, explore realistic budget breakdowns, and assemble an ordered itinerary with zero friction.

---

## 📱 Visual User Flow & Screen Showcase

All screens represent real, verified states from the application running on device and simulator. Files are sorted chronologically in [`apps/mobile/assets/screens`](./apps/mobile/assets/screens/).

> 🎥 **Full Demo Walkthrough**  
> A complete end-to-end screen recording of the Outta app — authentication, onboarding, Explore, destination details, trip planning, settings, and preferences — all in one continuous take.

<video controls src="https://raw.githubusercontent.com/asius09/travel-planner/main/apps/mobile/assets/screens/19_demo_walkthrough.mov" width="320">
  Your browser does not support the video tag.
  <br/><br/>
  <a href="./apps/mobile/assets/screens/19_demo_walkthrough.mov">Download video (MOV, ~134 MB)</a>
</video>

### 1. Authentication & Onboarding

|                                                      `01_auth_create_account.png`                                                      |                                                        `02_onboarding_mood.png`                                                        |                                             `03_onboarding_duration.png`                                              |
| :------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------: |
|                           <img src="./apps/mobile/assets/screens/01_auth_create_account.png" width="220" />                            |                             <img src="./apps/mobile/assets/screens/02_onboarding_mood.png" width="220" />                              |                   <img src="./apps/mobile/assets/screens/03_onboarding_duration.png" width="220" />                   |
| **Auth Gate**<br>Mandatory sign-up before onboarding. Enforces strict password validation and guarantees trip ownership on the server. | **Step 1: Mood**<br>Visual selection of travel personality (Nature, City, Beach, Adventure) driving dynamic theme accents and scoring. | **Step 2: Duration**<br>Interactive target duration slider/picker with flexible trip options and live days indicator. |

|                                                 `04_onboarding_budget.png`                                                  |                                              `05_onboarding_party.png`                                              |
| :-------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: |
|                       <img src="./apps/mobile/assets/screens/04_onboarding_budget.png" width="220" />                       |                   <img src="./apps/mobile/assets/screens/05_onboarding_party.png" width="220" />                    |
| **Step 3: Budget Range**<br>Comfortable cost tiers (Budget-friendly, Balanced, Premium) mapped to realistic estimate bands. | **Step 4: Travel Party**<br>Party composition (Solo, Couple, Friends, Family) to calibrate destination suitability. |

---

### 2. Transparent Permission Priming

|                                                       `06_permission_location.png`                                                       |                                                  `07_permission_notifications.png`                                                  |
| :--------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------: |
|                            <img src="./apps/mobile/assets/screens/06_permission_location.png" width="220" />                             |                       <img src="./apps/mobile/assets/screens/07_permission_notifications.png" width="220" />                        |
| **Location Primer**<br>In-app explainer highlighting local discovery benefits with an explicit privacy pledge. Skippable with "Not now". | **Notification Primer**<br>Previewing contextual trip countdown reminders with explicit user consent. Skippable with "Maybe later". |

---

### 3. Explore & Contextual Discovery

|                                                     `08_explore_feed.png`                                                      |                                                      `09_explore_active_itinerary.png`                                                      |
| :----------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------: |
|                           <img src="./apps/mobile/assets/screens/08_explore_feed.png" width="220" />                           |                           <img src="./apps/mobile/assets/screens/09_explore_active_itinerary.png" width="220" />                            |
| **Explore Feed**<br>Search bar, category chips, mood-based hero card, and personalized destination cards with estimated costs. | **Active Itinerary Banner**<br>Real-time contextual header showing saved places and running estimated total with 1-tap shortcut to My Trip. |

---

### 4. Destination Detail & Action States

|                                                 `10_destination_detail.png`                                                 |                                               `11_destination_highlights_and_basis.png`                                                |                                     `12_destination_saved_state.png`                                      |
| :-------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------: |
|                      <img src="./apps/mobile/assets/screens/10_destination_detail.png" width="220" />                       |                     <img src="./apps/mobile/assets/screens/11_destination_highlights_and_basis.png" width="220" />                     |           <img src="./apps/mobile/assets/screens/12_destination_saved_state.png" width="220" />           |
| **Destination Detail**<br>Full bleed hero image, duration tag, category pill, rating, and primary "Add to trip" CTA button. | **Highlights & Cost Disclaimer**<br>Curated attractions list and transparent explanation of mid-tier accommodation and meal estimates. | **Saved State Transition**<br>Idempotent state mutation updating CTA to "Saved in trip • View itinerary". |

---

### 5. My Trip Planning, Derived Budget & Reordering

|                                     `13_trip_empty_state.png`                                     |                                                  `14_trip_single_destination.png`                                                  |                                         `15_trip_multi_destination_reorder.png`                                         |
| :-----------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------: |
|          <img src="./apps/mobile/assets/screens/13_trip_empty_state.png" width="220" />           |                       <img src="./apps/mobile/assets/screens/14_trip_single_destination.png" width="220" />                        |              <img src="./apps/mobile/assets/screens/15_trip_multi_destination_reorder.png" width="220" />               |
| **Trip Empty State**<br>Calm, encouraging empty state prompting the user to explore destinations. | **Single Destination Itinerary**<br>Derived budget ($850.00 USD) calculated purely from destination estimate without stored total. | **Multi-Stop Reordering**<br>Aggregated derived budget ($3,850.00 USD) with accessible directional reordering controls. |

---

### 6. Settings, Data Controls & Dynamic Theming

|                                     `16_settings_preferences_adventure.png`                                     |                                                `17_settings_theme_nature.png`                                                 |                                       `18_settings_data_and_permissions.png`                                        |
| :-------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: |
|          <img src="./apps/mobile/assets/screens/16_settings_preferences_adventure.png" width="220" />           |                      <img src="./apps/mobile/assets/screens/17_settings_theme_nature.png" width="220" />                      |             <img src="./apps/mobile/assets/screens/18_settings_data_and_permissions.png" width="220" />             |
| **Preferences (Adventure)**<br>Active profile with "Adventure" theme tokens (warm amber/rust accent hierarchy). | **Theme Swap (Nature)**<br>Dynamic runtime switch to "Nature" theme tokens (forest green accents) without mutating trip data. | **Data & Permissions**<br>Granular OS permission status, preference reset, trip wipe, and account sign-out actions. |

---

## 🧠 Why We Built the Flow Like This

The user experience prioritizes calm discovery, transparency, and data continuity:

### 1. Mandatory Authentication Upfront (Zero Anonymous Guest Mode)

- **Eliminating Orphaned Data & Migration Friction**: Anonymous/guest modes in travel apps frequently lead to lost itineraries upon device restart or app reinstallation. Merging anonymous trips into newly created accounts is error-prone, risks race conditions, and complicates server state.
- **Server Ownership From Day Zero**: Authenticating first ensures every created trip, preference change, and stop is backed by an authenticated user ID in PostgreSQL, enabling reliable multi-device sync.

### 2. Progressive, Single-Topic Onboarding

- **Reduced Cognitive Load**: Instead of presenting a massive intake questionnaire, onboarding is split into 4 bite-sized, single-topic steps: Mood &rarr; Duration &rarr; Budget &rarr; Travel Party.
- **Resumability & Non-Destructive Back Navigation**: State is cached step-by-step (`onboardingStore.ts`). If the user leaves the app or navigates backwards, their answers are preserved.
- **Skippable by Design**: If a user wants to jump straight into exploring, steps can be skipped or answered later in Settings without blocking discovery.

### 3. Transparent In-App Permission Priming

- **Soft Priming Over Cold OS Dialogs**: Firing native iOS/Android permission alerts immediately on launch leads to high rejection rates.
- **Clear Value & Privacy Pledges**: Location and notification permissions are preceded by custom in-app educational screens explaining _why_ access improves recommendations and confirming that data is processed on-device and never tracked or sold.
- **Zero Blocking**: Tapping "Not now" or "Maybe later" continues smoothly to Explore with zero degraded capability.

### 4. Continuous Context via the Active Itinerary Banner

- When a user adds a destination, they shouldn't have to manually switch to the "My Trip" tab to verify the addition. The Explore feed dynamically surfaces an **Active Itinerary banner** reflecting the current stop count and running estimated total, with a direct 1-tap link to inspect the itinerary.

### 5. Honest Cost Disclaimers

- Travel apps often deceive users by masquerading estimates as live bookable prices. Outta clearly labels all costs as **derived estimates** based on mid-tier accommodations and local expenses, setting clear expectations that the app is an intentional discovery and planning tool, not an OTA booking engine.

### 6. Non-Destructive Preference & Theme Editing

- Changing one's travel mood from _Adventure_ to _Nature_ updates recommendation rankings and shifts the UI accent palette, but **never wipes, resets, or reorders saved trip destinations**.

---

## ⚡ Why We Built the State Architecture Like This

The state architecture is deliberately partitioned between local-first client state, in-memory derivations, and authoritative server sync:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│                                                             │
│   ┌───────────────────────────┐ ┌───────────────────────┐   │
│   │   useTripStore (Zustand)  │ │ useOnboardingStore    │   │
│   │   • destinations[]        │ │ • mood, budget, etc.  │   │
│   │   • add / remove / reorder│ │ • resume step         │   │
│   │   • getTotalBudget()      │ └───────────┬───────────┘   │
│   └─────────────┬─────────────┘             │               │
│                 │ (Offline Cache)           │               │
│                 ▼                           ▼               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │          AsyncStorage (On-Device Storage)           │   │
│   └─────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Optimistic Sync / TanStack Query
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Server Layer                          │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Hono API + Better Auth Session                     │   │
│   │  • Enforces authenticated user ownership            │   │
│   │  • Atomic reorder transactions                      │   │
│   │  • PostgreSQL via Drizzle ORM                       │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1. Local-First Client State (Zustand + AsyncStorage)

- **Instantaneous Optimistic Interactions**: Trip planning requires high tactile responsiveness. Tapping "Add to trip", reordering itinerary stops, or toggling preferences updates the local Zustand store in 0ms without waiting for a network round-trip.
- **Offline Resilience**: Travelers frequently use planning apps in flight, transit, or areas with spotty cellular coverage. Persisting the trip state to `AsyncStorage` ensures the active itinerary is instantly loaded on cold launch even with no internet connection.

### 2. Zero Stored Derived Totals (Computed In-Memory)

- **The Problem with Storing Totals**: Persisting calculated values like `total_cost` or `item_count` in a database column or store state causes cache invalidation bugs, currency rounding drift, and synchronization discrepancies whenever items are modified.
- **The Solution**: Total trip budget is strictly derived in memory via a pure calculation (`getTotalBudget()` in `tripStore.ts`):
  ```typescript
  getTotalBudget: () => {
    return get().destinations.reduce((total, item) => {
      return total + (item.destination?.estimatedCostMinor ?? 0);
    }, 0);
  };
  ```
  The single source of truth is the ordered list of destination IDs and their estimated unit costs.

### 3. Strict Deduplication & Normalized Positional Reordering

- **Idempotent Destination Addition**: Adding a destination verifies uniqueness using `destinations.some((d) => d.destinationId === destinationId)`. If already present, the action returns `false` and prevents duplicate rows from corrupting the itinerary.
- **Normalized Positional Indexing**: Reordering items updates explicit zero-indexed `position` attributes on each item atomically (`map((d, index) => ({ ...d, position: index }))`), ensuring server and client order remain strictly synchronized without array index drift.

### 4. Separation of Server State vs Client State

- **TanStack Query**: Owns server-derived datasets that require caching, background refetching, and pagination (destination catalog, search results, deterministic recommendation scoring).
- **Zustand**: Owns purely client-side interactive state (active trip items, temporary form drafts, active theme selection).

### 5. Two-Layer Dynamic Token Architecture (NativeWind + CSS Variables)

- **No Hardcoded Hex Codes**: Colors are organized in two layers:
  1. _Primitive Tokens_: Raw palettes defined in `global.css` (`--color-ivory-50`, `--color-ink-900`, etc.).
  2. _Semantic Tokens_: Semantic design roles (`--background`, `--foreground`, `--primary`, `--accent`, `--border`, `--card`).
- **Dynamic Mood Overrides**: Changing a travel mood in `themeStore.ts` dynamically reassigns CSS variable tokens (`--primary`, `--accent`, `--secondary`) at runtime. Components styled with NativeWind utilities (`bg-primary`, `text-accent`) adapt instantly without remounting or manual style prop drilling.

---

## 🛠️ Tech Stack

### Mobile Client

- **Expo SDK 51** with **React Native 0.74**
- **Expo Router** (typed file-based routing)
- **NativeWind (Tailwind CSS v3)** for token-based styling
- **Zustand** + **AsyncStorage** for persistent client state
- **TanStack Query** for server caching and data fetching
- **React Native Reanimated** & **Gesture Handler** for micro-interactions
- **TypeScript** strict mode

### Backend Services

- **Hono** web framework (lightweight, edge-compatible)
- **Better Auth** for email/password authentication (verification disabled for development speed)
- **Drizzle ORM** with **PostgreSQL** (Neon connection pooler compatible)
- **Zod** for schema validation across API boundaries

### Shared Package (`@travel-planner/shared`)

- Universal TypeScript models, Zod validation schemas, deterministic scoring algorithms, and international currency formatting.

---

## 🎯 Deterministic Recommendation Algorithm

Outta avoids opaque AI hallucination in favor of a deterministic scoring engine:

$$\text{Suitability Score} = (0.40 \times \text{Mood}) + (0.25 \times \text{Duration}) + (0.25 \times \text{Budget}) + (0.10 \times \text{Party})$$

- **Mood Match (40%)**: Compares destination tags against user-selected travel mood.
- **Duration Fit (25%)**: Aligns suggested stay duration with user target timeframe.
- **Budget Fit (25%)**: Calculates deviation between destination estimated cost and comfort band.
- **Party Fit (10%)**: Checks suitability for solo, couple, friends, or family dynamics.
- **Search & Category Filters**: Explicit user queries and category chips take immediate precedence over algorithmic ranking.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **PostgreSQL** instance (local or hosted, e.g. Neon)

### 1. Installation & Environment Setup

```bash
# Clone and install dependencies
git clone https://github.com/your-username/travel-planner.git
cd travel-planner
pnpm install

# Configure environment variables
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/travel_planner
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 2. Database Migration & Seed

```bash
cd apps/api
pnpm db:generate
pnpm db:migrate
pnpm db:seed
cd ../..
```

> **Note**: Always use `pnpm db:migrate` rather than `drizzle-kit push` to ensure clean migrations when working with Neon connection pooling.

### 3. Run Development Servers

```bash
# Start backend API (Terminal 1)
pnpm dev:api

# Start Expo mobile app (Terminal 2)
pnpm dev
```

From the Expo CLI, press `a` to open on an Android emulator, `i` for iOS simulator, or scan the QR code with Expo Go.

---

## 🧪 Testing & Quality Gates

The codebase enforces strict quality checks across all monorepo packages:

```bash
# Run all automated tests
pnpm test

# Run isolated test suites
pnpm test:unit         # Vitest unit tests (scoring, stores, utilities)
pnpm test:integration  # API route & database integration tests
pnpm test:mobile       # React Native Testing Library component tests

# Code quality validation
pnpm lint              # ESLint check
pnpm typecheck         # Strict TypeScript typecheck across all workspaces
pnpm format:check      # Prettier formatting verification
```

---

## 📄 License

MIT
