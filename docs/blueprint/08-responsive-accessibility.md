# H · Responsive & Accessibility

---

## H1. Breakpoints & layout shifts

Mobile-first. Tailwind v4 breakpoints aligned to the grid in A3.

| Breakpoint | Min width | Grid | Key shifts |
|---|---|---|---|
| base | 0 | 4 col, 20px margin | Single column everywhere. Hero stacks copy → Ops Feed (feed shows 4 rows). Header = logo + compact CTA + ☰. Bottom CTA bar enabled. Bento → stacked cards. Tables → stacked "card rows" or horizontal scroll with sticky first column. |
| `sm` | 640px | 4 col, 24px | Buttons in hero sit side by side (they're full-width stacked below 640). Stats 2×2. Testimonials horizontal scroll-snap (1.1 cards visible to hint scrolling). |
| `md` | 768px | 8 col, 32px | Services bento → 2-col. Process steps 2×2. Footer 2-col. Case study grid 2-col. Contact form still single column, reassurance below. |
| `lg` | 1024px | 12 col, 40px | **Desktop nav + mega-menu appear; bottom CTA bar removed.** Hero becomes a 6/6 split. Sticky side columns enabled (FAQ, How It Works, case-study sidebar). Bento full layout. Contact 5/7 split. |
| `xl` | 1280px | 12 col, 1200px container | Body text 17px. Hero H1 reaches ~88px. Hover-only enhancements (vignette play, pointer tilt) on. |
| `2xl` | 1536px | 12 col, 1280px container | Max type sizes. Full-bleed visuals capped at 1440px; extra width becomes margin (never stretch line lengths). |

Additional queries:
- `(hover: hover) and (pointer: fine)`: enables hover-reveal patterns, tilt, cursor glow. Touch devices get always-visible equivalents.
- `(max-height: 720px) and (min-width: 1024px)`: short laptop screens; hero top padding drops to 112px and H1 caps at 72px so CTAs stay above the fold on 1366×768 (very common on corporate laptops).
- **Container queries** (`@container`) for cards, so a ServiceCard renders correctly whether it's in a mega-menu, bento cell or related-services row.

---

## H2. Mobile-first handling of the most complex sections

| Section | Desktop | Mobile treatment |
|---|---|---|
| **Hero Ops Feed** | 6-col panel, 6 rows, tabs, tilt | Full-width below the CTAs; 4 rows; tabs become a horizontally scrollable chip row; ticking slows to every 5s (battery/attention); no tilt. Hero copy + both CTAs fit within 1 viewport on a 390×844 screen. |
| **Services bento** | Asymmetric 5-card grid with hover vignettes | Stacked cards, each vignette autoplays **once** at 60% visibility; whole card is tappable (min 44px link target). |
| **Process (sticky progress)** | Sticky left column + scrolling right | Horizontal 5-step stepper pinned under the header (48px tall), with the active step centered; content scrolls normally beneath. |
| **Comparison table** | 5-column table | First column sticky, horizontal scroll inside a bordered container with a right-edge fade + "Swipe to compare →" hint; *or* (preferred for ≤ 4 rows) a segmented control choosing *one competitor vs. Akrostech* at a time. |
| **Mega-menu** | Hover panel | Accordion in the full-screen sheet. |
| **Calculator** | Inputs left, sticky results right | One step per screen, with a sticky **bottom results summary** (collapsed: "≈ $142K–$198K/yr ⌃") that expands to full results. |
| **Case study** | Sticky snapshot sidebar | Snapshot becomes a collapsible "At a glance" box above the body. |
| **Contact** | Reassurance + form split | Form first (H1 + one-line sub above it), reassurance and timeline below. `inputmode` and `autocomplete` attributes on all fields. |
| **Footer** | 5 columns | Accordions (`<details>`), badges wrap, legal links stack. |

Mobile performance specifics: no 3D scenes on mobile (static AVIF instead); `content-visibility: auto` on below-the-fold sections; images sized with `sizes` attributes; 16px minimum input font size (prevents iOS zoom); `100svh`/`100dvh` instead of `100vh`; `env(safe-area-inset-*)` on fixed bars.

---

## H3. WCAG 2.1 AA compliance (with notes for the lime-on-black palette)

### H3.1 Contrast: verified ratios

All ratios computed with the WCAG 2.x relative-luminance formula.

| Foreground | Background | Ratio | Passes | Allowed use |
|---|---|---|---|---|
| Volt `#A3E635` | Ink `#0A0A0A` | **13.13:1** | AAA | Any text, icons, focus rings |
| Ink `#0A0A0A` | Volt `#A3E635` | **13.13:1** | AAA | Button labels, slab text |
| Ink | Volt Glow `#C6F56B` (hover) | 15.72:1 | AAA | Hover state |
| Ink | Volt-600 `#84CC16` (pressed) | 10.02:1 | AAA | Active state |
| Volt `#A3E635` | Ink-850 `#141416` (card) | 12.22:1 | AAA | Lime on cards |
| Volt `#A3E635` | Ink-800 `#1C1C1F` | 11.3:1 | AAA | Lime on inputs/hover cards |
| Volt `#A3E635` | Steel `#0F1720` | 11.97:1 | AAA | Security band |
| Ink-50 `#F5F5F4` | Ink `#0A0A0A` | 18.15:1 | AAA | Primary text |
| Ink-200 `#A3A3AD` | Ink | 7.92:1 | AAA | Secondary/body text |
| Ink-300 `#8A8A94` | Ink | 5.79:1 | AA | Tertiary text, placeholders |
| Ink-300 `#8A8A94` | Ink-800 `#1C1C1F` | 4.97:1 | AA | Placeholder inside inputs (just passes, so don't go darker) |
| Ink-400 `#5C5C66` | Ink | 3.0:1 | ❌ text / ✅ non-text (3:1) | Disabled states only (exempt), icon borders |
| ⚠️ Volt `#A3E635` | Paper `#FAFAF9` | **1.44:1** | ❌ **FAIL** | **Never** as text or meaningful icon on light. Decorative fills only, with Ink content on top. |
| Volt-700 `#4D7C0F` | Paper | 4.78:1 | AA | Links / lime-family text on light |
| Volt-800 `#3F6212` | Paper | 6.78:1 | AA (AAA ≥18px bold) | Small lime-family text, focus ring on light |
| `#525252` | Paper | 7.48:1 | AAA | Secondary text (light) |
| `#6B6B6B` | Paper | 5.10:1 | AA | Tertiary text (light) |
| Semantic dark (`#34D399`, `#FBBF24`, `#F87171`, `#60A5FA`) | Ink | 10.3 / 11.86 / 7.16 / 7.79 | AAA | Status text + icons |
| Semantic light (`#047857`, `#B45309`, `#B91C1C`, `#1D4ED8`) | Paper | 5.25 / 4.81 / 6.19 / 6.42 | AA | Status text + icons |

**Non-text contrast (1.4.11, 3:1):** form field borders at rest use `--ink-600` (`#2E2E33`, 1.38:1 against Ink), which fails as the *only* boundary indicator. Fix: inputs have a **filled background** `--ink-800` + the border, so the field's boundary is identifiable by the fill change. On hover/focus the border moves to `--ink-500` / lime. Checkboxes and radios use a `--ink-300` border (5.79:1) at rest.

### H3.2 Lime-specific risks & rules
1. **Lime text on light backgrounds is banned.** Use `--accent-text` tokens, which automatically swap to `--volt-700` in light mode.
2. **Large lime areas cause glare and halation** for users with astigmatism or photosensitivity. The Volt slab is capped at one per page and ≤ 60% of a viewport's height, with no motion except the one-time sweep (disabled with reduced motion).
3. **Pure white text on pure black also halates**: primary text is `#F5F5F4`, not `#FFFFFF`.
4. **Lime vs. success green:** success uses emerald `#34D399` **plus** an icon and text label, so it's never confused with brand accent or conveyed by color alone (1.4.1).
5. **Color-blind safety:** lime and emerald are close for deuteranopes, which is another reason semantic states always pair with an icon + word. Charts use lime vs. `--ink-500` (luminance contrast) plus direct labels, never lime vs. a red/green pair.
6. **Selection color:** `::selection { background: #A3E635; color: #0A0A0A; }` (13.13:1).

### H3.3 Focus states
- Global: `:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; border-radius: inherit; }`.
- On the lime slab and primary buttons, the ring is **Ink** with a 2px offset (lime ring on lime would be invisible).
- Never `outline: none` without a replacement. Focus rings are never animated away.
- Focus order follows visual order; sticky header elements remain reachable; the skip link is the first tab stop.
- Focus not obscured: the sticky header has `scroll-padding-top: 88px` on `html` so focused elements aren't hidden under it (aligns with WCAG 2.2 2.4.11).

### H3.4 Motion & animation (2.2.2, 2.3.3 best practice)
- Respect `prefers-reduced-motion` (A6.4).
- Marquee and ticking ops feed (auto-updating > 5s) include a **pause control**. The Ops Feed has a small `⏸ Pause feed` icon button in its header.
- No flashing content > 3 times per second.
- Scroll-scrubbed animations never hide content: the end state is the default DOM state.

### H3.5 Semantics & screen readers
- One `<h1>` per page; heading levels never skip.
- Landmarks: `<header>`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer>`, plus `<nav aria-label="Footer">`.
- The Ops Feed is `aria-hidden="true"` with a visually-hidden summary: *"Example of the live task log clients see: payroll, hiring, legal, web and admin tasks completed today with timestamps."* (Avoids announcing every tick.)
- Count-up stats: `aria-label` with the final value; visual digits `aria-hidden`.
- Icons: decorative `aria-hidden="true"`; icon-only buttons have `aria-label`.
- Links describe their destination ("Read the Tidemark Health case study," with visually-hidden text appended to "Read the story →").
- Forms: explicit `<label for>`, `autocomplete` tokens (`given-name`, `family-name`, `email`, `organization`, `tel`), `aria-describedby` for helpers/errors, an error summary with `role="alert"`, and required fields marked with text "(required)" or a legend explaining the asterisk.
- Language: `<html lang="en">`; `hreflang` at P2 if localized.
- Target size: interactive targets ≥ 44×44px on touch (exceeds WCAG 2.2's 24×24).
- Text resizing to 200% without loss; layouts tested at 320px width (reflow, 1.4.10); no horizontal page scroll.
- Video (P2): captions + transcript.

### H3.6 Testing protocol
- **Automated:** axe-core in Playwright on every PR (zero violations to merge), Lighthouse CI accessibility score = 100.
- **Manual (each milestone):** keyboard-only pass, VoiceOver (Safari macOS + iOS) and NVDA (Firefox/Chrome Windows), 200% zoom and 400% reflow, Windows High Contrast / `forced-colors: active` (ensure borders and focus rings use `CanvasText`/`Highlight` system colors).
- Publish `/legal/accessibility` with the conformance target, known issues, and a contact for accessibility requests.
