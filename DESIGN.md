# Outta Design System

> Product and implementation source of truth for Outta's visual identity, UI architecture, interaction patterns, and design quality gates.

---

## 1. Brand Overview

### What Outta Is
Outta is an editorial, photography-led mobile travel planner that turns vague desires to escape ("I need to get outta here") into clear, realistic trip plans without booking friction, sponsored clutter, or commercial noise.

### Who It Serves
Independent travelers, weekend escape seekers, couples, and small groups of friends who want curated inspiration, budget reality checks, and a calm, tactile space to assemble trips.

### Personality & Tone
- **Grounded & Calm:** Unrushed and confident. Outta speaks with editorial clarity rather than promotional hype.
- **Tactile & Editorial:** Feels like opening a high-end travel journal or an artfully printed guide.
- **Honest & Direct:** Realistic estimates and clear timeframes. No fake urgency, countdown timers, or hidden fees.

### Product Positioning
Outta sits between aspirational travel journalism (immersive storytelling, landscape photography) and pragmatic utility (day-by-day estimates, categorized budgets, reorderable stops). Outta is explicitly for **discovery and planning**, not an Online Travel Agency (OTA) or booking broker.

### The Feeling Outta Creates
Quiet excitement, relief, and focus. Users feel inspired by places, grounded by realistic budgets, and unburdened by travel logistics.

---

## 2. Design Principles

### Visual Hierarchy
Anchor every screen with one dominant focal point—such as full-bleed landscape photography or an expressive headline. Supporting metadata and secondary controls use muted semantic tones and tighter optical bounds to maintain clear spatial rank.

### Spacing & Spatial Grid
All layout spacing follows a strict 8-point spatial grid (multiples of 4 and 8). Screen margins use consistent horizontal padding. Never use arbitrary one-off margins; spacing between cards, headings, and input containers must remain predictable and uniform across every screen.

### Typography Discipline
Use Geist Sans exclusively. Hierarchy is established through size steps and deliberate weight shifts (regular for running copy, medium for labels and controls, semibold for titles and active states). Headlines maintain tight leading and negative tracking; body copy maintains comfortable, readable leading.

### Composition & Whitespace
Embrace breathable editorial composition. Full-bleed photographic hero surfaces contrast with flat, quiet content cards. Group related items with generous whitespace rather than redundant divider rules or enclosing boxes.

### Imagery Direction
Lead with authentic, real-world landscape, architectural, and cultural photography. Images must feature natural daylight, balanced contrast, and grounded perspective. Avoid oversaturated tourist stock photos, artificial HDR, and clip art.

### Contrast & Legibility
Text and interactive glyphs must meet or exceed WCAG AA contrast against their immediate background. When placing text over photography, use directional bottom gradient masks to ensure high contrast regardless of image brightness.

### Consistency & Predictability
Repeated actions (Continue, Back, Add, Remove, Close) occupy identical relative positions, geometry, and touch targets across all screens. Common states (active, disabled, loading) share uniform styling across components.

### Accessibility by Default
Accessibility is not an afterthought. Every interactive element has an accessible label, explicit role, minimum touch area, and visible active/focused indicator.

---

## 3. Color and Typography

### Semantic Color System
Colors are defined strictly as semantic tokens. Hardcoded hex codes are prohibited in documentation and screen implementations.

| Semantic Token | Role & Visual Relationship | Usage |
|---|---|---|
| `canvas` | Base application background. Warm, neutral, low-glare tone. | Screen backgrounds, behind scrollable lists, root container views. |
| `surface` | Elevated content surface. Crisp, flat contrast against `canvas`. | Cards, bottom sheets, form input fields, modal dialogs. |
| `text` | Primary foreground color. High contrast against `canvas` and `surface`. | Screen titles, card titles, body copy, active icons. |
| `muted` | Secondary foreground tone. Soft contrast against base surfaces. | Subtitles, supporting copy, metadata, placeholders, inactive icons. |
| `border` | Structural divider tone. Subtle definition without visual noise. | Card outlines, input boundaries, divider lines, unselected chips. |
| `mood.primary` | Active mood primary brand token. Deep, confident, and grounded. | Primary action buttons, active tab indicators, selected card borders. |
| `mood.accent` | Active mood highlight token. High visibility against `mood.primary`. | Progress indicators, active check badges, highlight pills. |
| `mood.soft` | Active mood tinted surface. Gentle, low-saturation wash. | Category pill fills, subtle highlight containers, active item fills. |
| `status.error` | Urgent alert tone. Clear, distinct, non-aggressive red tone. | Destructive actions (Remove), input validation errors, alert banners. |

### Mood Theme Palettes
Travel mood personalizes the app's accent tokens and Explore hero imagery without altering information architecture or core contrast:
- **Nature (Default):** Deep forest primary, vivid lime/sage accent, soft moss wash. Reflects mountains, forests, and alpine lakes.
- **City & Culture:** Terracotta/brick primary, warm ochre accent, soft sand wash. Reflects historic architecture, masonry, and urban streets.
- **Beach:** Deep maritime teal primary, sunny sand accent, soft seafoam wash. Reflects coastlines, coves, and clear ocean water.
- **Adventure:** Slate granite primary, warm canyon accent, soft stone wash. Reflects rugged peaks, trails, and outdoor terrain.

### Typography Hierarchy (Geist Sans)
- **`hero`:** Large display headlines (Welcome screen, Explore hero banner). Tight leading, slight negative tracking.
- **`screen-title`:** Primary screen headers (Onboarding questions, My Trip heading, Auth headers). Semibold, clear prominence.
- **`card-title`:** Destination card headings, section headers, modal headers. Medium weight, legible at compact sizes.
- **`body`:** Primary reading copy, input text, button labels. Regular to medium weight, comfortable line spacing.
- **`metadata`:** Subtitles, trip estimates, tag pills, helper copy. Compact, clear proportions with tabular numerals for financial figures.

### Casing & Tracking Guidelines
- **No Uppercase:** Never use all-caps or uppercase transformations (`uppercase`, `text-transform: uppercase`) anywhere in the application (including section labels, badges, overlines, and metadata) unless explicitly requested. Use natural sentence case or title case.
- **No Wider Tracking:** Never use wide or expanded tracking (`tracking-wide`, `tracking-wider`, `tracking-widest`). Geist Sans has calibrated optical bounds; headings should use standard or slightly negative tracking (`tracking-tight`), and body copy or labels should use standard default tracking. All text containers should render in clean, inline bounding boxes without layout shift.

---

## 4. Logo and Iconography

### Outta Brand Mark
The Outta logomark is an editorial wordmark set in Geist Sans with distinctive tracking and clean proportions. It conveys movement and calm confidence. It is never decorated with generic travel clichés (suitcases, airplane silhouettes, globe outlines).

### App Icon Requirements
- Centered, high-contrast brand mark set on a solid semantic canvas background.
- Crisp recognition across compact Android home screen launchers and notification shades.
- Full adaptive icon support on Android, including foreground layer, background layer, and monochrome themed icon support.

### Interface Icon Style
- Single icon family: Outline geometry from `@expo/vector-icons` (`Ionicons`).
- Uniform stroke weight (1.5–2pt) with rounded caps and joins.
- Centered optical alignment within standard square bounding boxes (16×16 for tags, 20×20 for inline controls, 24×24 for primary navigation, 32–36 for feature illustrations).
- Icons must always serve an informative purpose. Never use floating decorative icons without direct informational value.

### Illustration Direction
- Prefer authentic destination photography for travel discovery and concrete places.
- Use clean, minimal vector graphics for abstract concepts in onboarding (e.g. route map paths for Location, a phone mockup with a single preview notification for Notifications, semicircular gauge for Budget).
- Illustrations must use the semantic palette (`surface`, `border`, `mood.primary`, `mood.accent`).

---

## 5. Components and Patterns

### Action Buttons (`Button`)
- **Primary:** Full-width container, rounded corners (`borderRadius.input`), filled with `mood.primary`, contrasting white text. Anchored at the bottom of the screen with safe area padding.
- **Secondary / Link:** Text-only or border-outlined action placed below the primary CTA or inline. Clean hit slop (minimum 44×44 pt touch target).
- **Loading State:** Replaces button label with an activity spinner; keeps dimensions fixed to prevent layout shift.
- **Disabled State:** Reduced opacity; clearly communicates unavailability without hiding the control.

### Cards (`Card`, `DestinationCard`)
- Flat `surface` fill, rounded corners (`borderRadius.card`), subtle `border` stroke.
- Destination cards feature high-resolution photography, bottom-anchored metadata, trip duration, and clear budget basis (e.g. "per person for trip").

### Selection Options (`OnboardingOption`)
- Reusable selectable cards used throughout onboarding.
- **Unselected:** `surface` background, neutral `border` stroke.
- **Selected:** Prominent `mood.primary` or `mood.accent` border highlight, accompanied by an affirmative checkmark badge.

### Navigation & Layout (`OnboardingLayout`)
- Reusable top navigation row containing a Back arrow button on the left and a progress indicator on the right.
- Preserves answers and safe area spacing on all devices.

### Progress Indicator (`ProgressIndicator`)
- Minimal animated indicator representing the steps of the onboarding sequence.
- Inactive steps render as compact dots; the active step smoothly expands into a horizontal line.

### Inputs & Form Fields (`Input`)
- Integrated label, rounded container, accessible placeholder, and clear error text slot.
- Password fields feature an integrated eye toggle with minimum 44×44 pt touch target.

### Feedback States (`EmptyState`, `ErrorState`, `SkeletonCard`)
- **Loading:** Content-matched skeleton cards with a gentle, non-jarring pulse shimmer.
- **Empty State:** Editorial illustration or icon, reassuring headline, concise body copy, and a single obvious recovery CTA.
- **Error State:** Clear error icon, plain-language description of the problem, and an explicit Retry action. Never expose raw network errors or stack traces.

---

## 6. Motion and Interaction

### Motion Principles
- **Functional, Not Decorative:** Motion explains spatial transitions and gives feedback. It must never delay a user or block interaction.
- **Physically Grounded:** Animations use smooth spring physics or ease-out timing curves. No bouncy cartoon effects.
- **Immediate Response:** Touch gestures trigger instant visual feedback (scale down to 0.98 on press, restore on release).

### Text Morphing (`TextMorph` / `Torph`)
- Smooth, layout-stable cross-dissolve with vertical micro-translation (3–4 pt) and subtle scale interpolation (0.985 to 1.0).
- Mounts in the final state immediately on initial render with zero flicker.
- Replaces staggered, word-by-word flexbox layouts to eliminate line-wrapping reflows on mobile screens.

### Scrolling & Carousel
- Horizontal paging with native momentum snapping (`pagingEnabled`).
- Auto-advance carousel pauses on user touch and resumes cleanly.
- Direct-jump indicator dots with generous hit slop targets (44×44 pt).

### Interruption Handling & Reduced Motion
- In-flight animations cancel cleanly when a new user gesture occurs; state updates take immediate precedence.
- When system reduced motion is enabled, replace sliding and morphing with instantaneous state changes or subtle opacity fades.

---

## 7. Screen-Specific Guidance

### Welcome (`/`)
- Full-bleed photography carousel showcasing diverse travel atmospheres.
- Bottom gradient mask covering only the lower ~40% of the screen; the upper ~60% remains vibrant and unobstructed.
- Morphing headline and subtitle, clean indicator dots, full-width "Plan a trip" primary button, and "I already have an account" secondary link.

### Authentication (`/auth/signup`, `/auth/signin`)
- Modal presentation over base canvas.
- Input fields: Full name (signup only), Email, Password with visibility toggle.
- Clear inline validation messages. Email verification is explicitly disabled; signup creates an immediate active session.
- Seamless link between Sign in and Sign up without losing input context.

### Onboarding Flow (`/onboarding/*`)
Mandatory authenticated flow. Single question per screen, single-tap answers, working Back navigation:
- **Typography Scale & Case:** Natural sentence case throughout. Uppercase text is strictly prohibited across all onboarding screens (titles, subtitles, labels, buttons, step indicators, accessibility labels). Page headings are left-aligned, prominent (~32–36pt, `font-medium`, tight spacing to interactive controls), and rendered as standard text to support natural line wrapping and accessibility scaling. Dynamic morphing text (`TextMorph`) is reserved exclusively for actively changing numbers and values (durations, budgets).
- **Motion & Accessibility:** Coordinated, subtle entrance animations run once on initial mount (respecting reduced-motion preferences); zero artificial delay before interaction.
1. **Destination Preferences (`/onboarding/mood`):** Two-column image-led grid (Nature, City & culture, Beach, Adventure). Photography is dominant with consistent corner radii (24px). Balanced bottom gradient (`transparent` to dark) ensures crystal-clear readability across all lighting conditions. Destination titles (~22–24pt) and descriptions (~15–17pt) near card base. Unselected cards omit heavy borders and radio circles; selected cards feature a restrained forest green outline (`2.5px`) with a compact upper-corner check indicator.
2. **Trip Duration (`/onboarding/duration`):** Interactive vertical 3D wheel selector with tactile haptics, steppers, and live central duration text morphing ("3 days", "1 week", etc.) with sentence-case target label.
3. **Trip Budget (`/onboarding/budget`):** Semicircular segmented gauge with smooth motion-path fill, synchronized with full-width vertical wheel selector (clear neighbor readability, zero bold weights).
4. **Travel Companions (`/onboarding/travel-party`):** Two-column image-led grid sharing the exact visual language as destination preferences (Solo, Couple, Friends, Family). Relevant photography, balanced bottom gradient, titles (~22–24pt), descriptions (~15–17pt), corner radii (24px), restrained forest green outline (`2.5px`), and compact upper-corner check indicator.
5. **Location Permission (`/onboarding/location`):** Map-inspired tile with a central location pin and a restrained discovery radius. Explains local discovery benefit. Actions: "Enable location" and "Not now".
6. **Notification Permission (`/onboarding/notifications`):** Phone mockup illustration (open at the bottom, fading into the canvas) with a single "Trip countdown" preview notification emerging from the screen. Explains trip update benefits. Actions: "Enable notifications" and "Maybe later".

### Explore (`/(tabs)/explore`)
- Profile-oriented header with circular avatar (`ProfileAvatar`), time-based greeting, and travel preference summary tag.
- Mood-adaptive hero banner (`FeaturedDestination`, photographic opening) with targeted bottom-only gradient mask and integrated search bar.
- Horizontally scrollable category pills ("All", "Nature", "City", "Beach", "Adventure") with tactile selection feedback and WCAG AA contrast.
- Compact bento-style `TripSummary` displayed when saved destinations exist, linking directly to the active itinerary.
- Editorial discovery sections: "Picked for your mood", "Curated highlight", "Destinations worth exploring", and "Good for a quick escape".
- Editorial destination cards (`DestinationCard`) supporting both standard and compact layouts with inline save/bookmark action.
- Subtle lower-edge scroll indicator fade (`ScreenFade`) respecting safe areas.

### Profile (`/profile`)
- Dedicated profile and identity screen accessible through the avatar in Explore and from Settings.
- Gradient avatar placeholder with user initials or minimal profile mark.
- User identity display and editable display name.
- Compact bento-style `TripSummary` reusing the same visual language as Explore.
- Comprehensive `PreferenceSummary` enabling inline, in-place updates to travel mood, duration, budget, and travel party without restarting onboarding or losing saved trip data.
- Account actions including authenticated session sign out.

### Destination Details (`/destination/[id]`)
- Full-bleed hero photography with floating, translucent circular back button (top left) and bookmark button (top right) respecting safe areas.
- Clear metadata: location/region, suggested stay duration, category chips, and descriptive editorial overview.
- Clean highlights list with subtle affirmative check badges.
- Labeled estimated budget card with clear currency basis and non-booking disclaimer.
- Fixed bottom action bar with safe area inset padding: "Add to trip" (or "Saved in trip • View itinerary").

### My Trip (`/(tabs)/trip`)
- Clean header: "Your trip, taking shape."
- Bento-style summary card: derived total budget estimate, total destination count, and currency basis.
- Lightweight, readable itinerary list (`ItineraryRow`) with position badges, destination thumbnails, and location information.
- Inline reordering controls (up/down chevron controls) and distinct destructive remove action with confirmation.
- Empty state (`EmptyTripState`): centered travel visual, encouraging copy, and primary "Explore destinations" CTA.
- Floating "Add another place" button at bottom.

### Settings & Preferences (`/(tabs)/settings`)
- Profile entry point at top linking directly to Profile and Preferences.
- In-place preference editing for travel mood, duration, budget, and travel party.
- Grouped iOS-style permission switches (Location, Notifications) with clear explanatory labels.
- Data and safety management: distinct destructive actions for "Clear my trip" and "Reset travel preferences" with confirmation dialogs.
- Clean sign out action.

---

## 8. Assets and Resources

### Approved Asset Locations
- App icons and splashes: `apps/mobile/assets/` (`icon.png`, `adaptive-icon.png`, `splash.png`, `favicon.png`, `notification-icon.png`).
- Font family: `Geist Sans` loaded through system fallback chain `['Geist', 'system-ui', 'sans-serif']`.
- Icon set: `@expo/vector-icons` (`Ionicons`).
- Curated photography: Sourced from verified, high-resolution Unsplash assets referenced via stable image URLs and mapped `imageKey` identifiers.
- Fallback assets: Every image component must provide a local placeholder or fallback color wash.

### Asset Conventions
- Use kebab-case for all asset file names (`nature-hero.jpg`, `adaptive-icon.png`).
- Never reference missing asset files or claim an unbundled mockup asset is production-ready.

---

## 9. Accessibility and Responsive Behavior

### Touch Targets
All interactive controls must maintain a minimum touch area of 44 × 44 pt. Use `hitSlop` on visually compact elements (such as pagination dots, close buttons, and inline text links).

### Dynamic Type & Font Scaling
Typography containers must flex vertically and wrap gracefully. Never set fixed heights on text containers that could cause clipping when users increase OS font size.

### Color & Contrast Independence
Never communicate state through color alone. Combine color shifts with shape changes, checkmark badges, bold weights, or explicit textual labels.

### Safe Areas & Viewport Adaptability
- Strict observance of safe area insets via `useSafeAreaInsets` for top notches, dynamic islands, and bottom home indicators.
- Responsive layout handles small screens (e.g. iPhone SE, compact Android devices) without button overlap or content clipping.

---

## 10. Anti-Patterns and Review Checklist

### Anti-Patterns to Avoid
- **Full-Screen Dark Tints:** Never place heavy dark overlays over full screens; use targeted bottom gradient masks.
- **Word-by-Word Layout Reflows:** Avoid animating individual words in flexbox wrappers that cause vertical reflow.
- **Decorative Clutter:** Avoid uninformative icons, decorative floating gradients, or gratuitous shadows.
- **Hardcoded Hex Values:** Never sprinkle literal color codes in components; always reference semantic tokens.
- **Over-Pilled Surfaces:** Avoid making every card, container, and input an extreme pill shape. Keep cards structured.
- **Broken Affordances:** Never build a control, filter, or button that does not perform an actual action.
- **Mixed Cost Bases:** Never add or compare estimates with differing bases (e.g. mixing per-day and total trip costs).

### Screen Review Checklist
- [ ] Visual hierarchy is obvious within 2 seconds.
- [ ] Safe area insets respected at top, bottom, and edges.
- [ ] Minimum 44×44 pt touch targets verified on all interactive elements.
- [ ] Contrast meets WCAG AA on all text and iconography.
- [ ] Selected states use both color and structural indicators.
- [ ] Loading, empty, and error states are implemented and styled.
- [ ] Accessible labels present for screen readers.
- [ ] Reduced-motion fallback functional.

---

## 11. Design Decisions

### Approved Decisions
1. **Single Typeface Family:** Geist Sans is the sole typeface across the app for both display headlines and body copy.
2. **Semantic NativeWind Token System:** All UI styling maps to semantic tokens defined in Tailwind/NativeWind configuration.
3. **Bottom-Only Masking:** Welcome and card photography uses bottom gradient masks rather than full-screen dark overlays.
4. **Mandatory Auth Before Onboarding:** Guest mode is not supported. Users must sign in or create an account before beginning onboarding.
5. **Mood-Adaptive Semantic Accents:** Travel mood alters semantic accent tokens and Explore hero imagery without modifying information architecture or resetting trip data.
6. **Derived Trip Budget:** Trip totals are computed dynamically from destination estimates; no mutable total is stored in the database.
7. **Cross-Dissolve Text Morphing:** `TextMorph` provides smooth cross-dissolving transitions with zero initial mount flicker.

### Unresolved Choices & Future Considerations
1. **Dynamic Currency Conversion:** MVP stores USD base estimates and displays INR/USD. Multi-currency live API synchronization is deferred.
2. **Multi-Trip Support:** MVP focuses on a single active trip per user. Multiple trip management is reserved for post-MVP.
3. **Offline Image Pre-caching:** Background pre-fetching strategy for remote destination imagery across offline usage.
