# Travel Planner

A photography-led travel discovery and planning app built with Expo, React Native, and a Hono backend.

## Features

- **Welcome & Onboarding** - Personalized preference collection (mood, duration, budget, travel party)
- **Explore** - Mood-based hero imagery, search, category filters, personalized recommendations
- **Destination Details** - Rich destination info with estimated costs, highlights, and add-to-trip
- **My Trip** - Saved destinations with reorder, remove, and budget calculation
- **Settings** - Preference editing, theme switching, permissions, account management
- **Authentication** - Email/password with Better Auth (email verification disabled)

## Tech Stack

### Mobile
- Expo SDK 51 + React Native 0.74
- Expo Router for navigation
- NativeWind (Tailwind CSS) for styling
- Zustand for client state
- TanStack Query for server state
- React Native Reanimated + Gesture Handler for animations
- TypeScript strict mode

### Backend
- Hono + TypeScript
- Better Auth for authentication
- Drizzle ORM with PostgreSQL
- Zod for validation

### Shared
- TypeScript types and Zod schemas
- Recommendation scoring algorithm
- Currency formatting utilities
- Theme tokens

## Project Structure

```
travel-planner/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── api/             # Hono API server
├── packages/
│   ├── shared/          # Shared types, schemas, utilities
│   └── config/          # Shared ESLint/Prettier config
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database (local or hosted)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and auth secret

# Set up database
cd apps/api
pnpm db:generate
pnpm db:migrate
pnpm db:seed
cd ../..

# Start development servers
pnpm dev          # Starts Expo mobile app
pnpm dev:api      # Starts API server (in separate terminal)
```

> **Note:** use `pnpm db:migrate`, not `pnpm db:push`. `drizzle-kit push`
> introspects the live database, which hangs indefinitely on Neon's connection
> pooler. `db:migrate` applies the SQL that `db:generate` produces directly.

### Mobile App

```bash
cd apps/mobile
pnpm dev          # Start Expo dev server
pnpm android      # Run on Android emulator
pnpm ios          # Run on iOS simulator
pnpm build:android # Build APK via EAS
```

### API Server

```bash
cd apps/api
pnpm dev          # Start with tsx watch
pnpm build        # Compile to dist/
pnpm start        # Run compiled server
```

## Environment Variables

See `.env.example` for required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - 32+ character secret for auth
- `BETTER_AUTH_URL` - API base URL
- `EXPO_PUBLIC_API_URL` - API URL for mobile app

## Database Schema

- **users** - Better Auth managed
- **user_preferences** - Travel mood, duration, budget, party
- **destinations** - Seeded destination data with mood tags
- **trips** - User trips
- **trip_items** - Ordered trip destinations

## Recommendation Algorithm

Deterministic scoring (no AI):
- Mood match: 40%
- Duration suitability: 25%
- Budget suitability: 25%
- Travel party suitability: 10%

Diversity ensures varied results. Search and filters take precedence.

## Currency

- Stored in USD (minor units/cents)
- Display: INR for India, USD elsewhere
- Formatted with `Intl.NumberFormat`
- No automatic conversion without real exchange rates

## Testing

```bash
pnpm test              # All tests
pnpm test:unit         # Unit tests only
pnpm test:integration  # API integration tests
pnpm test:mobile       # Mobile component tests
pnpm test:e2e          # Maestro E2E tests
```

## Quality Gates

```bash
pnpm lint              # ESLint all packages
pnpm typecheck         # TypeScript all packages
pnpm format:check      # Prettier check
```

## Deployment

### Mobile (EAS Build)
```bash
cd apps/mobile
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

### API (Vercel/Cloudflare Workers)
Deploy the `apps/api` directory as a Node.js function.

## License

MIT