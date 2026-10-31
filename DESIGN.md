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

## 3. Color Architecture

Outta uses a **two-layer color system** defined entirely in `global.css`:

### Layer 1: Primitive Color Tokens
Base palette colors that describe colors only. These are NOT tied to particular components. Components MUST consume semantic tokens (Layer 2), never primitive tokens directly.

| Primitive Token | Value | Description |
|---|---|---|
| `--color-ivory-50` | `#F6F4EF` | Warm ivory base background |
| `--color-white-0` | `#FFFFFF` | Pure white |
| `--color-ink-900` | `#252B2D` | Deep ink for text and primary actions |
| `--color-ink-700` | `#454B4D` | Medium ink for muted text |
| `--color-ocean-700` | `#456779` | Deep ocean blue for focus rings and active states |
| `--color-ocean-500` | `#64869A` | Muted ocean blue for accent highlights |
| `--color-mist-100` | `#DCE5E7` | Light mist for secondary surfaces |
| `--color-stone-200` | `#E7E3DB` | Stone for muted backgrounds and borders |
| `--color-muted-500` | `#777D7D` | Muted gray for secondary text |
| `--color-success-700` | `#286749` | Success green |
| `--color-warning-800` | `#795000` | Warning amber |
| `--color-danger-700` | `#B42318` | Destructive red |

### Layer 2: Semantic Color Tokens
Semantic tokens reference primitive tokens. Components MUST use these semantic tokens via NativeWind utilities (e.g., `bg-background`, `text-foreground`, `bg-primary`, `border-border`).

| Semantic Token | Primitive Reference | Role & Usage |
|---|---|---|
| `--background` | `var(--color-ivory-50)` | Base application background |
| `--foreground` | `var(--color-ink-900)` | Primary text color |
| `--surface` | `var(--color-white-0)` | Elevated content surface (cards, sheets, inputs) |
| `--surface-elevated` | `var(--color-white-0)` | Elevated surfaces (modals, popovers) |
| `--surface-muted` | `var(--color-mist-100)` | Subtle surface variant |
| `--primary` | `var(--color-ink-900)` | Primary action background |
| `--primary-foreground` | `var(--color-white-0)` | Text on primary actions |
| `--secondary` | `var(--color-mist-100)` | Secondary action background |
| `--secondary-foreground` | `var(--color-ink-900)` | Text on secondary actions |
| `--accent` | `var(--color-ocean-500)` | Accent highlights, selected states |
| `--accent-foreground` | `var(--color-ink-900)` | Text on accent |
| `--muted` | `var(--color-stone-200)` | Muted backgrounds |
| `--muted-foreground` | `var(--color-ink-700)` | Muted text |
| `--card` | `var(--color-white-0)` | Card background |
| `--card-foreground` | `var(--color-ink-900)` | Card text |
| `--popover` | `var(--color-white-0)` | Popover/modal background |
| `--popover-foreground` | `var(--color-ink-900)` | Popover text |
| `--border` | `var(--color-stone-200)` | Borders, dividers |
| `--input` | `var(--color-stone-200)` | Input field borders |
| `--ring` | `var(--color-ocean-700)` | Focus rings |
| `--success` | `var(--color-success-700)` | Success states |
| `--success-foreground` | `var(--color-white-0)` | Text on success |
| `--warning` | `var(--color-warning-800)` | Warning states |
| `--warning-foreground` | `var(--color-white-0)` | Text on warning |
| `--destructive` | `var(--color-danger-700)` | Destructive actions |
| `--destructive-foreground` | `var(--color-white-0)` | Text on destructive |
| `--navigation-background` | `var(--color-white-0)` | Navigation bar background |
| `--navigation-foreground` | `var(--color-ink-700)` | Navigation inactive icons |
| `--navigation-active` | `var(--color-ocean-700)` | Navigation active indicator |
| `--skeleton` | `var(--color-stone-200)` | Loading skeleton color |
| `--focus-ring` | `var(--color-ocean-700)` | Focus indicator color |
| `--overlay` | `#252B2D80` | General overlay (50% ink) |
| `--image-overlay` | `#252B2D99` | Image overlay (60% ink) |

### Mood Theme Palettes
Travel mood personalizes the app's accent tokens and Explore hero imagery without altering information architecture or core contrast. Mood-specific overrides are defined in `src/store/themeStore.ts` and applied via the theme store:

- **Nature (Default):** Deep forest primary (`#263F35`), vivid lime/sage accent (`#D7E58A`), soft moss wash (`#E8EBDD`).
- **City & Culture:** Terracotta/brick primary (`#963F32`), warm ochre accent (`#D8A66A`), soft sand wash (`#F1E6D5`).
- **Beach:** Deep maritime teal primary (`#176C70`), sunny sand accent (`#E3C77A`), soft seafoam wash (`#DCEEF0`).
- **Adventure:** Slate granite primary (`#344B5B`), warm canyon accent (`#CB7049`), soft stone wash (`#E8DCC8`).

Mood tokens override `--primary`, `--primary-foreground`, `--accent`, `--accent-foreground`, and `--secondary` when a mood is active.

### Typography Hierarchy (Geist Sans)
- **`hero`:** Large display headlines (Welcome screen, Explore hero banner). Tight leading, slight negative tracking.
- **`screen-title`:** Primary screen headers (Onboarding questions, My Trip heading, Auth headers). Semibold, clear prominence.
- **`card-title`:** Destination card headings, section headers, modal headers. Medium weight, legible at compact sizes.
- **`body`:** Primary reading copy, input text, button labels. Regular to medium weight, comfortable line spacing.
- **`metadata`:** Subtitles, trip estimates, tag pills, helper copy. Compact, clear proportions with tabular numerals for financial figures.

### Casing & Tracking Guidelines
- **No Uppercase:** Never use all-caps or uppercase transformations anywhere in the application. Use natural sentence case or title case.
- **No Wider Tracking:** Never use wide or expanded tracking. Geist Sans has calibrated optical bounds; headings should use standard or slightly negative tracking (`tracking-tight`), and body copy or labels should use standard default tracking.

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
- Illustrations must use the semantic palette.

---

## 5. Components and Patterns

### Action Buttons (`Button`)
- **Primary:** Full-width container, rounded corners (`borderRadius.input`), filled with `primary`, contrasting `primary-foreground` text. Anchored at the bottom of the screen with safe area padding.
- **Secondary:** Filled with `secondary`, `secondary-foreground` text.
- **Outline:** Transparent background, `primary` border, `primary` text.
- **Ghost:** Transparent background, no border, `primary` text.
- **Destructive:** Filled with `destructive`, `destructive-foreground` text.
- **Loading State:** Replaces button label with an activity spinner; keeps dimensions fixed to prevent layout shift.
- **Disabled State:** Reduced opacity (`opacity-65`); clearly communicates unavailability without hiding the control.

### Cards (`Card`, `DestinationCard`)
- Flat `card` fill, rounded corners (`borderRadius.card`), subtle `border` stroke.
- Destination cards feature high-resolution photography, bottom-anchored metadata, trip duration, and clear budget basis.

### Selection Options (`OnboardingOption`)
- Reusable selectable cards used throughout onboarding.
- **Unselected:** `surface` background, neutral `border` stroke.
- **Selected:** Prominent `primary` border highlight, accompanied by an affirmative checkmark badge using `primary-foreground`.

### Navigation & Layout (`OnboardingLayout`)
- Reusable top navigation row containing a Back arrow button on the left and a progress indicator on the right.
- Preserves answers and safe area spacing on all devices.

### Progress Indicator (`ProgressIndicator`)
- Minimal animated indicator representing the steps of the onboarding sequence.
- Inactive steps render as compact dots in `border` color; the active step smoothly expands into a horizontal line in `primary` color.

### Inputs & Form Fields (`Input`)
- Integrated label, rounded container (`borderRadius.input`), accessible placeholder, and clear error text slot.
- Password fields feature an integrated eye toggle with minimum 44×44 pt touch target.
- Focus state uses `ring` color for border.
- Error state uses `destructive` for border and background tint.

### Feedback States (`EmptyState`, `ErrorState`, `SkeletonCard`)
- **Loading:** Content-matched skeleton cards with `skeleton` color and a gentle, non-jarring pulse shimmer.
- **Empty State:** Editorial illustration or icon in `secondary` background with `primary` icon, reassuring headline in `foreground`, concise body copy in `muted-foreground`, and a single obvious recovery CTA.
- **Error State:** Clear error icon in `destructive`, plain-language description in `foreground`, and an explicit Retry action in `primary`. Never expose raw network errors or stack traces.

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
- Morphing headline and subtitle, clean indicator dots in `accent` (active) and `white/40` (inactive), full-width "Plan a trip" primary button in `accent` with `primary-foreground` text, and "I already have an account" secondary link.

### Authentication (`/auth/signup`, `/auth/signin`)
- Modal presentation over base `background`.
- Input fields: Full name (signup only), Email, Password with visibility toggle.
- Clear inline validation messages using `destructive` for errors.
- Email verification is explicitly disabled; signup creates an immediate active session.
- Seamless link between Sign in and Sign up without losing input context.

### Onboarding Flow (`/onboarding/*`)
Mandatory authenticated flow. Single question per screen, single-tap answers, working Back navigation:
- **Typography Scale & Case:** Natural sentence case throughout. Uppercase text is strictly prohibited. Page headings are left-aligned, prominent (~32–36pt, `font-medium`, tight spacing to interactive controls), and rendered as standard text to support natural line wrapping and accessibility scaling. Dynamic morphing text (`TextMorph`) is reserved exclusively for actively changing numbers and values (durations, budgets).
- **Motion & Accessibility:** Coordinated, subtle entrance animations run once on initial mount (respecting reduced-motion preferences); zero artificial delay before interaction.
1. **Destination Preferences (`/onboarding/mood`):** Two-column image-led grid (Nature, City & culture, Beach, Adventure). Photography is dominant with consistent corner radii (24px). Balanced bottom gradient ensures crystal-clear readability. Selected cards feature a `primary` border (2.5px) with check indicator in `primary-foreground`.
2. **Trip Duration (`/onboarding/duration`):** Interactive vertical 3D wheel selector with tactile haptics, steppers, and live central duration text morphing.
3. **Trip Budget (`/onboarding/budget`):** Semicircular segmented gauge with smooth motion-path fill using mood `primary` and `accent` colors, synchronized with full-width vertical wheel selector.
4. **Travel Companions (`/onboarding/travel-party`):** Two-column image-led grid sharing the exact visual language as destination preferences.
5. **Location Permission (`/onboarding/location`):** Map-inspired tile with a central location pin in `primary` and a restrained discovery radius.
6. **Notification Permission (`/onboarding/notifications`):** Phone mockup illustration fading into `background` with a single preview notification card using mood `soft` and `primary` colors.

### Explore (`/(tabs)/explore`)
- Profile-oriented header with circular avatar (`ProfileAvatar`), time-based greeting, and travel preference summary tag.
- Mood-adaptive hero banner (`FeaturedDestination`) with targeted bottom-only gradient mask and integrated search bar using `surface` background and `input` border.
- Horizontally scrollable category pills using `FilterChip` with `secondary` selected state and `surface` unselected state.
- Compact bento-style `TripSummary` displayed when saved destinations exist.
- Editorial destination cards (`DestinationCard`) using `card` background and `card-foreground` text.

### Profile (`/profile`)
- Dedicated profile and identity screen accessible through the avatar in Explore and from Settings.
- Gradient avatar placeholder using mood-specific gradients from `avatarGradients`.
- User identity display and editable display name.
- Compact bento-style `TripSummary` reusing the same visual language as Explore.
- Comprehensive `PreferenceSummary` enabling inline, in-place updates to travel mood, duration, budget, and travel party without restarting onboarding or losing saved trip data.
- Account actions including authenticated session sign out.

### Destination Details (`/destination/[id]`)
- Full-bleed hero photography with floating, translucent circular back button (top left) and bookmark button (top right) respecting safe areas.
- Clear metadata: location/region, suggested stay duration, category chips using `card` background and `secondary` icon backgrounds.
- Clean highlights list with subtle affirmative check badges in `primary`.
- Labeled estimated budget card with clear currency basis and non-booking disclaimer.
- Fixed bottom action bar: "Add to trip" in `primary` / "Saved in trip • View itinerary" in `secondary` with `primary` text.

### My Trip (`/(tabs)/trip`)
- Clean header in `foreground`.
- Bento-style summary card using `card` background, `border` border, and `primary` for budget total.
- Lightweight, readable itinerary list (`ItineraryRow`) using `card` background and `border` border.
- Inline reordering controls with `foreground` icons and destructive remove action in `destructive`.
- Empty state (`EmptyTripState`): centered travel visual in `secondary`, encouraging copy in `foreground`/`muted-foreground`, and primary "Explore destinations" CTA.
- Floating "Add another place" button using `outline` variant.

### Settings & Preferences (`/(tabs)/settings`)
- Profile entry point using `card` background and `border` border.
- In-place preference editing for travel mood, duration, budget, and travel party.
- Grouped iOS-style permission switches with track colors using `border` (off) and mood `primary` (on).
- Data and safety management: distinct destructive actions using `destructive` text and icons.
- Clean sign out action in `destructive`.

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

### WCAG Contrast Requirements
All semantic token combinations must meet WCAG 2.2 AA contrast thresholds:
- Normal text: ≥ 4.5:1
- Large text (≥24px or ≥18.67px bold): ≥ 3:1
- UI boundaries and graphical indicators: ≥ 3:1
- Focus indicators: ≥ 3:1 against adjacent colors

Contrast is validated via automated checks against the resolved CSS variable values in `global.css`.

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
- **Primitive Token Usage in Components:** Never use primitive color tokens (e.g., `--color-ink-900`) directly in component code. Always use semantic tokens.

### Screen Review Checklist
- [ ] Visual hierarchy is obvious within 2 seconds.
- [ ] Safe area insets respected at top, bottom, and edges.
- [ ] Minimum 44×44 pt touch targets verified on all interactive elements.
- [ ] Contrast meets WCAG AA on all text and iconography.
- [ ] Selected states use both color and structural indicators.
- [ ] Loading, empty, and error states are implemented and styled.
- [ ] Accessible labels present for screen readers.
- [ ] Reduced-motion fallback functional.
- [ ] All colors resolve from semantic tokens in `global.css`.
- [ ] No hardcoded hex colors in component code.
- [ ] Mood theme changes update semantic tokens without layout shifts.

---

## 11. Design Decisions

### Approved Decisions
1. **Single Typeface Family:** Geist Sans is the sole typeface across the app for both display headlines and body copy.
2. **Two-Layer Semantic Color System:** Primitive tokens in `global.css` → Semantic tokens in `global.css` → NativeWind utilities. Components consume semantic tokens only.
3. **`global.css` as Single Source of Truth:** All color values defined in `global.css`; no duplicate definitions in Tailwind config, TypeScript theme objects, or component styles.
4. **Bottom-Only Masking:** Welcome and card photography uses bottom gradient masks rather than full-screen dark overlays.
5. **Mandatory Auth Before Onboarding:** Guest mode is not supported. Users must sign in or create an account before beginning onboarding.
6. **Mood-Adaptive Semantic Accents:** Travel mood alters semantic accent tokens and Explore hero imagery without modifying information architecture or resetting trip data.
7. **Derived Trip Budget:** Trip totals are computed dynamically from destination estimates; no mutable total is stored in the database.
8. **Cross-Dissolve Text Morphing:** `TextMorph` provides smooth cross-dissolving transitions with zero initial mount flicker.
9. **NativeWind for All Styling:** Components use NativeWind utilities (`bg-background`, `text-foreground`, `bg-primary`, etc.) instead of inline styles or StyleSheet objects for color values.

### Unresolved Choices & Future Considerations
1. **Dynamic Currency Conversion:** MVP stores USD base estimates and displays INR/USD. Multi-currency live API synchronization is deferred.
2. **Multi-Trip Support:** MVP focuses on a single active trip per user. Multiple trip management is reserved for post-MVP.
3. **Offline Image Pre-caching:** Background pre-fetching strategy for remote destination imagery across offline usage.
4. **Dark Mode:** Token architecture supports dark mode (semantic overrides in `global.css`); full implementation deferred.