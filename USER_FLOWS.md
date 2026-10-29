# User Flows and Screen States

## Primary flow
Fresh install → Welcome → Onboarding → Optional permission explanations → Explore → Search/filter → Destination detail → Add to trip → My Trip → Reorder/remove → Restart app → Trip restored.

## Onboarding
1. Welcome: “A trip that feels like you.” CTA: “Plan a trip”.
2. Mood: Nature, City & culture, Beach, Adventure.
3. Duration: Weekend, 3–5 days, A week or more, Flexible.
4. Budget: Budget-friendly, Balanced, Premium, Not sure.
5. Travel party: Solo, Couple, Friends, Family.
6. Location explanation: “Use your location to make nearby ideas more relevant.” Actions: “Enable location”, “Not now”.
7. Notification explanation: “Get useful reminders for trips you plan.” Actions: “Enable notifications”, “Not now”.
8. Finish: “Your kind of trip, coming up.” CTA: “Explore destinations”.

Rules:
- Back navigation preserves answers.
- Optional questions can be skipped.
- OS permissions are requested only after the corresponding explicit action.
- Denial never blocks Explore.
- Avoid asking for all permissions in one OS prompt sequence without context.
- If authentication interrupts onboarding, retain the draft locally.

## Explore
- Header: personalized, short greeting or “Find your next escape”.
- Mood hero: destination imagery tied to selected mood, short copy and a clear search entry point.
- Search: title, city/region and supported tags.
- Filters: mood/category and budget/duration filters if data supports them.
- Sections: “Picked for your trip”, “Explore by mood”, “More places to discover”.
- Cards: image, destination, region, estimated trip cost, fit label where useful.
- Keep a clear path to change preferences.
- Search and filters can be cleared independently.

## Destination detail
- Hero image with accessible back and favorite/add controls.
- Title and location.
- Short description.
- Estimated budget with currency and estimate disclaimer.
- Highlights/attractions and suggested duration.
- CTA changes from “Add to trip” to “Added to trip” / “View trip” when saved.
- Duplicate add should not create duplicate trip entries.
- Missing image and missing optional fields have designed fallbacks.

## My Trip
- Title: “My trip”.
- Show destination count and estimated total.
- Reorder with accessible drag handles plus move up/down actions for non-gesture users.
- Remove action has clear confirmation or an immediate undo pattern.
- Budget is derived from the current ordered destinations; do not store a duplicate total.
- Empty state: “Your trip starts with one place.” CTA: “Explore destinations”.
- If offline, show last saved trip and a clear sync state.

## Preference editing
- Changes update the mood theme and recommendation order.
- Do not reset or reorder the saved trip.
- If sync fails, retain local preference changes and show a retryable state.
- Currency display changes formatting only, never numeric amounts or stored destination facts.

## State matrix to implement
Every network-driven screen must have: initial loading, cached/ready, empty, recoverable error, offline/stale, and retry where appropriate. Every form must have validation errors, disabled/submitting state, and success/failure feedback.
