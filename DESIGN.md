# Travel Planner Design System

> Product and implementation reference for the Travel Planner mobile app. Keep this document as the source of truth for visual design, UX copy, interaction patterns, and accessibility.

## 1. Product direction

Build a photography-led travel planner that helps people go from “I want to get away” to a simple, realistic trip plan. The app is for discovery and planning, not flight or hotel booking.

Design principles:
- Lead with destinations and imagery, not generic booking widgets.
- Make planning feel personal without forcing users through a long setup.
- Keep the core flows obvious: discover, inspect, add, organize, estimate.
- Use one coherent layout system; adapt the visual theme to travel mood without changing navigation or interaction patterns.
- Prefer real functionality and calm polish over decorative effects.

## 2. Target users and MVP

People who have an initial travel idea but need help choosing a destination, understanding whether it fits their time and budget, and organizing a short list.

MVP screens:
1. Welcome and onboarding
2. Sign in / create account
3. Explore destinations
4. Search and filters
5. Destination details
6. My Trip
7. Preferences and permission settings

Must work:
- Search destinations and combine it with category filters.
- Open details from any destination card.
- Add a destination to a trip, without duplicates.
- Remove and reorder trip destinations.
- Calculate a trip estimate from saved destinations.
- Preserve the trip after restart and sync it to the backend when signed in.
- Change preferences later; update recommendations and theme without losing trip data.
- Handle loading, empty, offline, and error states.

Out of scope for the deadline: booking flights/hotels, collaborative trips, live availability, maps/route optimization, AI itinerary generation, and complex multi-trip management.

## 3. Brand and visual system

### Core design language
Modern travel editorial: immersive landscape photography, generous whitespace, clear typography, soft surfaces, rounded but not pill-shaped-everything components, and restrained accents. Avoid a generic hotel booking look, excessive shadows, noisy gradients, emoji-led UI, and too many icons.

### Base tokens
Use these as the default fallback and for shared app surfaces.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F7F6F0` | Main screen background |
| `surface` | `#FFFFFF` | Cards, sheets, forms |
| `text` | `#202822` | Primary text |
| `muted` | `#777F78` | Metadata and supporting copy |
| `border` | `#E5E7DF` | Dividers and outlines |
| `nature.primary` | `#263F35` | Default primary actions |
| `nature.accent` | `#D7E58A` | Selected states and small highlights |

Do not rely on color alone to communicate state. Keep text contrast accessible. Test colors in both bright photography and plain surfaces.

### Mood themes
A user’s selected travel mood changes the Explore hero background, small accents, selected chips, and recommendation treatments. It must not change the app’s information architecture, text contrast rules, or component behavior. Users can edit preferences later in Settings or from a visible Explore personalization control. Theme changes must preserve all trip data.

| Mood | Primary | Accent | Soft background | Photography |
|---|---|---|---|---|
| Nature | `#263F35` | `#D7E58A` | `#E8EBDD` | Forests, mountains, lakes |
| City & culture | `#963F32` | `#D8A66A` | `#F1E6D5` | Architecture, streets, markets |
| Beach | `#176C70` | `#E3C77A` | `#DCEEF0` | Coastlines, islands, turquoise water |
| Adventure | `#344B5B` | `#CB7049` | `#E8DCC8` | Trails, rugged peaks, outdoor activity |

Implement themes as semantic tokens, not hard-coded colors scattered across components. Keep shared canvas and surface colors stable; use mood tokens selectively.

### Typography
- Geist Sans for all UI and headings.
- Use regular and medium weights for most content; avoid making every label semibold.
- Large Explore headline: 30–36 px, tight line height.
- Screen title: 26–30 px.
- Card title: 16–18 px.
- Body: 14–16 px; metadata: 12–13 px.
- Use tabular numerals for budget totals where supported.
- Avoid decorative font mixing. Load Geist through a supported bundled font setup and provide a system fallback.

### Layout and components
- 8-point spacing scale.
- Screen horizontal padding: 20–24 px.
- Minimum interactive target: 44 × 44 px.
- Card radius: 18–24 px; input/button radius: 14–18 px.
- Borders before shadows; use shadows only when they establish hierarchy.
- Reuse `DestinationCard`, `SearchBar`, `FilterChip`, `PrimaryButton`, `BudgetSummary`, `TripDestinationRow`, `EmptyState`, `ErrorState`, `SkeletonCard`, `OnboardingOption`, and `ProgressIndicator`.
- Use consistent image aspect ratios and crop behavior. Always include loading placeholders and image fallbacks.

## 4. Screen specifications and copy

### Welcome
Purpose: explain the benefit and begin planning.
- Headline: “Your next trip starts here.”
- Supporting text: “Find places that fit your mood, time and budget.”
- Primary CTA: “Plan a trip”
- Secondary CTA: “I already have an account”
- Use a full-bleed destination photo with a readable contrast overlay. Do not ask for permissions immediately on launch.

### Onboarding
One question per step, single-tap answers, visible progress, Back and Skip options. Preserve answers if the user leaves or signs in.

Screen sequence:
1. Mood (`/onboarding/mood`): “What kind of places do you love?” Editorial 2×2 photographic card grid. Options: Nature, City & culture, Beach, Adventure.
2. Duration (`/onboarding/duration`): “How long are you thinking?” Interactive horizontal day selector with stepper (+/-) and smooth central duration morphing text (e.g. "3 days", "1 week", "1 week 2 days"). Maps to schema categories (Weekend, 3–5 days, A week or more, Flexible).
3. Budget (`/onboarding/budget`): “What feels right for your budget?” Semicircular segmented arc gauge visual showing relative tiers and synchronized interactive cards: Budget-friendly ($), Balanced ($$), Premium ($$$), Not sure yet (~).
4. Travel party (`/onboarding/travel-party`): “Who’s going with you?” 2×2 grid with clear, inclusive icons: Solo, Couple, Friends, Family.
5. Location permission (`/onboarding/location`): Dedicated screen with stylized route map card. Copy: “Find places near you” / “Use your location to discover nearby destinations and regional getaways.” CTA: “Enable location”; secondary: “Not now”.
6. Notification permission (`/onboarding/notifications`): Dedicated screen with stacked notification preview cards. Copy: “Stay on top of your trip” / “Get helpful reminders for the trips you plan.” CTA: “Enable notifications”; secondary: “Maybe later”.

Ask for OS permission only after the user taps the relevant CTA and after a short rationale. Never block Explore if permission is denied. Provide later controls in Settings. Completing or skipping the permission screens calls `completeOnboarding()` and navigates to Explore.

### Authentication
- Title: “Save your trip”
- Supporting text: “Sign in to keep your plans in sync.”
- Fields: Email, Password.
- CTAs: “Create account”, “Sign in”.
- Email verification is disabled for this project. Keep validation clear, show password visibility, prevent duplicate submissions, and explain failures in plain language.
- Do not require authentication just to browse destinations. Prompt when the user needs cloud sync or account-specific persistence.

### Explore
- Top hero image/background follows the selected mood: mountain/forest for Nature, city architecture for City & culture, coast for Beach, dramatic trail for Adventure.
- Hero headline: “Where would you like to go?”
- Search placeholder: “Search places, regions, or experiences”
- Filter labels: “All”, “Nature”, “City”, “Beach”, “Adventure”.
- Sections: “Picked for your mood”, “Good for a short escape”, “Explore somewhere different”.
- Cards show destination name, region/country, one short descriptor, and a clearly labelled estimated cost basis.
- Include a visible “Personalize” control so users can change mood/preferences later.
- Do not show weather unless real weather data is integrated and the feature is tested.

### Search and filters
- Show result count and selected filters.
- Search matches destination name, region/country, and tags; case-insensitive.
- Filters combine with search.
- CTA: “Clear filters”.
- Empty copy: “No places match that search.”
- Recovery: “Try another name or clear a filter.”
- Avoid fake filters that do not change results.

### Destination details
- Large hero image, location, concise description, highlights, ideal duration, and estimated cost.
- CTA: “Add to trip”.
- On success: “Added to your trip” with a “View trip” action.
- If already added, show “Added” and offer “View trip”.
- Never say “Book now”; this app does not sell or reserve travel.

### My Trip
- Title: “Your trip, taking shape.”
- Summary: total estimated budget, number of destinations, and currency.
- Destination row: image, name, short estimate, visible drag handle, remove action.
- CTA: “Add another place”.
- Remove should support undo or confirmation and update the total immediately.
- Empty title: “Every great trip starts somewhere.”
- Empty body: “Explore destinations and add the places you’d love to visit.”
- Empty CTA: “Explore destinations”.
- Make it clear that cost is an estimate, not a live quote. Define whether each estimate is per person or per destination and use the same basis throughout.

### Preferences
- Allow changes to mood, duration, budget, travel party, currency, location permission guidance, and notification permission guidance.
- Save preference changes without clearing or reordering the trip.
- Explain that mood changes recommendations and accent styling, not saved trip content.

## 5. Recommendation logic

Use deterministic ranking for the MVP; do not add an AI dependency.

Default weights:
- Mood match: 40%
- Duration suitability: 25%
- Budget suitability: 25%
- Travel party suitability: 10%

Score each destination from 0–100 per signal and compute the weighted sum. Use popularity as a tie-breaker. Keep some discovery diversity so results do not all look alike. Search and manually selected filters always take precedence over recommendations. If preferences are skipped, use popularity plus diversity.

Keep recommendation logic in a pure function with unit tests.

## 6. Data minimization and assets

Keep records lean. Aim for at least five seeded destinations per mood so the app does not feel empty.

Destination record minimum:
- `id`
- `name`
- `country` or region
- `moodTags`
- `imageKey` or asset URL
- `estimatedCost`
- `estimatedCostBasis` (for example `perPersonForTrip`)
- `recommendedDurationDays`

Add only fields that are displayed or needed for recommendation, such as highlights or short description. Avoid storing duplicate derived totals.

User preference record minimum:
- `userId`
- `travelMood`
- `duration`
- `budget`
- `travelParty`

Trip record minimum:
- `id`
- `userId`
- `updatedAt`

Trip destination record minimum:
- `tripId`
- `destinationId`
- `position`

Store image assets as static, named files or stable URLs; keep an `imageKey` mapping in the destination data. Use consistent landscape photography, optimize image dimensions, and provide a fallback for every image. Verify usage rights and do not rely on temporary image URLs. Do not store copies of destination images in the database.

Store location/notification permission status only if the app needs to reflect it in settings. Never treat a denied permission as an app error.

## 7. Motion and feedback

- Screen transitions: 180–220 ms fade/short slide.
- Card press: scale to 0.98 and restore on release.
- Onboarding selection: immediate selected state and subtle progress animation.
- Add to trip: short check/label transition and optional light haptic.
- Reorder: spring settling with clear drag affordance; provide accessible alternatives if practical.
- Images: crossfade from neutral placeholder.
- Respect reduced motion where possible. No looping decorative animation or interaction-blocking delays.

## 8. Currency and budget rules

- Store destination cost estimates in a single base currency, USD.
- Default display currency to INR for India and USD elsewhere, with a manual override.
- Use `Intl.NumberFormat` where supported, and test Android behavior.
- If conversion is implemented, use a real exchange-rate source, cache rates with a timestamp, and disclose the last update. Never silently use a stale rate as current.
- Budget total is derived from trip destinations. Never maintain an independently mutable total.
- Do not add estimates with inconsistent time/person bases. Show the basis next to the number.

## 9. Quality and accessibility

- All buttons have real actions and disabled/loading states.
- Search and filters combine correctly.
- Duplicate add is prevented.
- Remove/reorder updates the UI and persists.
- Reordering uses a stable position and an atomic server update.
- Restart restores cached state, then reconciles with the backend.
- API errors preserve the last known trip and offer retry.
- Unknown destination IDs and malformed cache do not crash the app.
- Image failures show a fallback.
- Keyboard does not hide auth fields or search results.
- Android back navigation and safe areas work.
- Minimum touch targets are 44 × 44 px.
- Check contrast, screen reader labels, selected states, and reduced motion.

## 10. Testing and release gate

Vitest:
- Mood theme token mapping and preference persistence
- Recommendation scoring and tie-breaking
- Search/filter combination and empty results
- Duplicate add, remove, reorder, budget calculation
- Currency formatting and rate fallback
- API validation and authorization rules

React Native Testing Library:
- Onboarding answers, Skip/Back, permission rationale
- Explore search/filter states
- Details Add to trip behavior
- My Trip empty/loading/error/success states

Maestro:
- Onboarding → Explore
- Deny location/notifications and continue
- Search/filter → details → add to trip
- Remove and reorder
- Change mood and verify trip remains intact
- Restart app and verify persistence
- Sign in/create account and verify sync

Before release: install the APK on a clean Android device/emulator, run core flows, verify the public GitHub repo and README, and ensure no secrets are committed.

## 11. Onboarding Visuals and Motion Specification

| Screen | Primary Visual / Interaction | Motion & Feedback |
|---|---|---|
| Progress Indicator | Top navigation row next to Back button; 4 core preference steps. | Animated dot-to-line morphing (`Animated.timing` 220ms). Inactive dots: 8px wide, 4px high. Active: expands to 28px wide bar. |
| 1. Mood | Editorial 2×2 photographic cards with dark bottom gradient overlays. | Card press scale down to 0.98, spring return on release. Active card features accent outline and check badge. |
| 2. Duration | Large central duration typography ("3 days", "1 week", etc.) + horizontal day selector with stepper (+/-). | Smooth vertical translation and opacity fade (`Animated.parallel` 180ms) on label change. Haptic feedback on day increment/decrement. |
| 3. Budget | Semicircular segmented arc gauge with 4 distinct tiers + synced selection list. | Arc fills progressively to selected tier with smooth rotation/color transition. Synchronized card highlight. |
| 4. Companions | 2×2 grid of soft surface cards with inclusive vector iconography. | Instant active border/accent highlight, 0.98 scale press animation. |
| 5. Location | Dedicated permission screen with stylized route map graphic (soft blue gradient, curved route, waypoint nodes). | Card subtle entry slide; loading state on "Enable location" button during system prompt. |
| 6. Notifications | Dedicated permission screen with stacked notification preview cards (trip countdown, packing tips). | Cascading card stack with slight tilt/offset and subtle shadow; completion transitions smoothly to Explore. |

