# Product Brief: Travel Planner

## Product purpose
Help a person turn a travel mood into a shortlist of suitable destinations and a simple, ordered trip plan. The app is a planner and discovery tool, not a flight or hotel booking service.

## Target user
Someone considering a short trip who wants relevant destination ideas, a realistic estimated budget, and a low-friction way to save and organize places.

## Product principles
1. Personalize discovery without trapping the user in one theme.
2. Keep planning actions obvious and reversible.
3. Preserve a user's trip when preferences, account state, or theme changes.
4. Be transparent that costs are estimates and may become outdated.
5. Make guest exploration useful. Authentication is required only when needed for server synchronization.
6. Ask for OS permissions only when their value is clear, and always allow skipping.
7. Ship a small, reliable experience before adding complex travel features.

## MVP features
- Welcome and onboarding: travel mood, duration, budget comfort, travel party.
- Optional location and notification permission prompts with rationale and a working skip path.
- Explore: mood-specific hero imagery, recommended destinations, search, category filters, loading/error/empty states.
- Destination detail: image gallery or hero, region, description, estimated cost, highlights, duration fit, add/remove trip action.
- My Trip: saved destinations, reorder, remove, item count, calculated estimated budget, empty state.
- Preferences: edit mood and planning answers without resetting saved trip data.
- Authentication: email/password using Better Auth, email verification disabled for the MVP, session restoration and sign-out.
- Server sync for signed-in users; a documented guest migration strategy.
- Android build/demo, public repository, setup instructions, screenshots and known limitations.

## Out of scope for this deadline
Flight/hotel bookings, payment processing, collaborative live editing, chat, AI itinerary generation, reviews, social feeds, maps/navigation, push campaigns, and a general-purpose animation framework. Add only if the core flow is complete and tested.

## Success criteria
A new user can complete onboarding or skip optional answers, discover a destination, inspect details, add it to a trip, reorder or remove it, see the total estimated cost, close/reopen the app and retain the trip. A signed-in user can recover their server-backed trip on another install. Theme changes do not mutate trip contents.

## Content rules
- Use concise, reassuring copy.
- Never imply that an estimated price is a live quote.
- Never imply that the app books transport or accommodation.
- Explain why location or notification access helps before the OS prompt.
- Avoid fake ratings, fake availability, invented reviews, or urgency language.
