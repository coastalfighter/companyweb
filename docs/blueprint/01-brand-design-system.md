# A · Brand & Visual Design System

> Design principle: **"Quiet surface, loud signal."** The canvas is black and calm; lime appears only where something is *happening* (an action, a live status, a result). Our buyers read that as "this team knows what matters."

---

## A1. Color system

### A1.1 Core brand (non-negotiable)

| Token | Name | HEX | Role |
|---|---|---|---|
| `--volt-500` | **Volt Lime** | `#A3E635` | Primary accent. CTAs, live indicators, key numbers, focus rings on dark. |
| `--ink-950` | **Ink Black** | `#0A0A0A` | Primary canvas (dark mode default), text on lime, logo. |

**Why lime feels electric, not highlighter:** highlighter lime happens when lime sits on white, is used as a fill behind text, or is flat across large areas. We prevent all three:

1. Lime lives on **near-black** (13.13:1 contrast, which is luminous and reads as emitted light, like a status LED).
2. Lime is applied as **thin, precise elements** (1px borders, 6px status dots, a single button, numerals) and **glow** (a radial `#A3E635` at 8–14% opacity behind key objects), never as a large flat background block, except the one deliberate "Volt slab" section per page (the closing CTA).
3. Lime is paired with **cool grays**, not warm ones, which keeps it crisp.

### A1.2 Volt scale (lime tints and shades)

| Token | HEX | Usage | Contrast notes |
|---|---|---|---|
| `--volt-50` | `#F7FEE7` | Light-mode tinted background for success/selected rows | Ink on it: 19.12:1 |
| `--volt-100` | `#ECFCCB` | Light-mode badge background | Ink: 18.25:1 · `#365314` text: 8.05:1 |
| `--volt-200` | `#D9F99D` | Light-mode chart fill, selection highlight (`::selection` on light) | — |
| `--volt-300` | `#C6F56B` | **Volt Glow:** hover state for primary button on dark | Ink on it: 15.72:1 |
| `--volt-400` | `#B5EE4E` | Gradient midstop | — |
| `--volt-500` | `#A3E635` | **Brand.** Primary button fill, accent | Ink on it: 13.13:1 ✅ AAA |
| `--volt-600` | `#84CC16` | Pressed/active state of primary button; charts on dark | Ink on it: 10.02:1 |
| `--volt-700` | `#4D7C0F` | **Volt Ink:** lime-family *text/link* on light surfaces | On `#FAFAF9`: 4.78:1 ✅ AA |
| `--volt-800` | `#3F6212` | Lime text on light at small sizes, light-mode focus ring | On `#FAFAF9`: 6.78:1 ✅ AA |
| `--volt-900` | `#365314` | Badge text on `--volt-100` | 8.05:1 |
| `--volt-950` | `#1A2E05` | Dark-mode tinted surface ("lime-tinted black") for selected cards | Volt-500 on it: 9.69:1 |

### A1.3 Ink neutrals (cool, slightly blue-shifted grays)

All tested against Ink `#0A0A0A` and Paper `#FAFAF9`.

| Token | HEX | Dark-mode role | Light-mode role | Contrast |
|---|---|---|---|---|
| `--ink-950` | `#0A0A0A` | Page canvas | Primary text | — |
| `--ink-900` | `#111113` | Section alt canvas | — | — |
| `--ink-850` | `#141416` | Card surface (elevation 1) | — | Volt on it 12.2:1 |
| `--ink-800` | `#1C1C1F` | Card hover / elevation 2 / input bg | — | Volt on it 11.3:1 |
| `--ink-700` | `#26262A` | Elevation 3 (menus, modals) | — | — |
| `--ink-600` | `#2E2E33` | **Hairline border** (default) | — | Decorative only (non-text) |
| `--ink-500` | `#3F3F46` | Strong border, divider on hover | Disabled text | 1.9:1, non-text only |
| `--ink-400` | `#5C5C66` | Disabled text, placeholder icons | Hairline on light | Not for body text |
| `--ink-300` | `#8A8A94` | **Tertiary text** (captions, meta, ≥14px) | — | On `#0A0A0A`: 5.79:1 (4.97:1 on `--ink-800`) ✅ |
| `--ink-200` | `#A3A3AD` | **Secondary text** (body copy on dark) | — | On `#0A0A0A`: 7.92:1 ✅ |
| `--ink-100` | `#D4D4DA` | Emphasized body | Borders (light) | 13.41:1 |
| `--ink-50` | `#F5F5F4` | **Primary text on dark** (not pure white: reduces halation on black) | Alt canvas | 18.15:1 |
| `--paper` | `#FAFAF9` | — | Light canvas | — |
| `--white` | `#FFFFFF` | Only inside product mockups | Cards on paper | — |

**Rule:** never use a gray darker than `--ink-300` for text on `--ink-950`. `#737373` (Tailwind neutral-500) fails at 4.18:1, so we deliberately do not ship it.

On light surfaces, secondary text is `#525252` (7.48:1) and tertiary is `#6B6B6B` (5.10:1).

### A1.4 Secondary & accent

Used **sparingly** and never on CTAs.

| Token | Name | HEX | Role |
|---|---|---|---|
| `--ion-400` | **Ion** (cool cyan-teal) | `#5EEAD4` | Secondary data series in charts; "in progress" state in the ops-feed visual. |
| `--ultra-400` | **Ultraviolet** | `#A78BFA` | Tertiary data series; illustration rim-light (complements lime). On ink: 7.27:1. |
| `--ultra-700` | Ultraviolet Deep | `#6D28D9` | Light-mode equivalent (6.8:1 on paper). |
| `--steel-900` | **Steel** | `#0F1720` | Alternate deep canvas with a blue cast, used in the "Security & Compliance" band to signal a shift to a serious register. |

**Why so restrained?** Every extra hue is a decision a skeptical buyer's eye has to process. Linear and Stripe use one dominant accent; color equals meaning. When lime appears, it means "act here" or "this is live/true."

### A1.5 Semantic colors

Success is deliberately **not lime**, so a "success" message is never confused with a brand CTA, and every semantic state also carries an icon (color is never the sole signal: WCAG 1.4.1).

| State | Dark mode (on `#0A0A0A`) | Contrast | Light mode (on `#FAFAF9`) | Contrast | Icon (Phosphor) |
|---|---|---|---|---|---|
| Success | `#34D399` | 10.3:1 | `#047857` | 5.25:1 | `CheckCircle` |
| Warning | `#FBBF24` | 11.86:1 | `#B45309` | 4.81:1 | `WarningDiamond` |
| Error | `#F87171` | 7.16:1 | `#B91C1C` | 6.19:1 | `XCircle` |
| Info | `#60A5FA` | 7.79:1 | `#1D4ED8` | 6.42:1 | `Info` |

Semantic backgrounds (dark): same hue at 12% opacity on `--ink-850`, with a 1px border at 32% opacity.

### A1.6 Gradients & glows (the only allowed ones)

```css
/* Hero glow: lime light source behind the key visual */
--glow-volt: radial-gradient(60% 60% at 50% 40%, rgb(163 230 53 / 0.14) 0%, rgb(163 230 53 / 0) 70%);

/* Edge light: 1px top border on cards, suggests light from above */
--edge-light: linear-gradient(90deg, transparent, rgb(163 230 53 / 0.5), transparent);

/* Text gradient: used on ONE word per page max (e.g., hero keyword) */
--text-volt: linear-gradient(180deg, #D9F99D 0%, #A3E635 55%, #84CC16 100%);

/* Grain overlay: kills banding on dark gradients, adds tactility */
--grain: url("/textures/grain-128.png"); /* 128px tiling noise at 4% opacity, mix-blend-mode: overlay */
```

### A1.7 Theme strategy

- **Default theme: dark.** Matches the logo, makes lime luminous, and puts us visually next to Linear/Vercel and away from the white-and-blue outsourcing category.
- **Light mode:** opt-in only, via a toggle in the footer (not the header, since 90%+ of users will never touch it). The site does **not** auto-switch on the OS `prefers-color-scheme` setting: the dark canvas is the brand's first impression, and every component is designed and contrast-checked dark-first. *(Decision made in M0; revisit once every component has a reviewed light variant.)* Light mode swaps lime-as-text for `--volt-700`/`--volt-800`, and primary buttons stay **Ink fill + Paper text** with a lime 2px left-edge indicator on hover.
- **"Paper" sections inside dark mode:** case study reading pages and legal/policy pages use the light palette even in dark mode for long-form readability (CFOs read on laptops in bright offices). This is an intentional editorial shift, like turning to the printed appendix.

---

## A2. Typography system

### A2.1 Typefaces (Google Fonts)

| Role | Font | Weights loaded | Why |
|---|---|---|---|
| **Display / headings** | **Bricolage Grotesque** (variable, `opsz` 12–96, `wght` 200–800) | 500, 600, 700 (variable range 500–700) | It's a grotesque with genuine character: slightly ink-trapped, condensed at large optical sizes. It reads "designed" without being quirky. At 600 weight with −3% tracking it has the confidence of Linear's headlines but isn't the same Inter-everywhere look every SaaS site uses. The `opsz` axis means H1s get tighter, sharper forms automatically. |
| **Body / UI** | **Inter** (variable, `wght` 400–600, with `opsz`) | 400, 500, 600 | The most legible screen sans for dense UI, tables, forms and long reading. It's neutral enough to let Bricolage carry the personality. Enable `font-feature-settings: "cv11", "ss01", "ss03", "tnum"` (single-story a off, open digits, tabular numbers for stats). |
| *(Optional utility)* Mono | JetBrains Mono, 400/500 | 400, 500 | Only for the "ops feed" visual, timestamps, SLA readouts and code. It signals "systems" without needing an illustration. |

Load via `next/font/google` (self-hosted at build, zero layout shift, no third-party request). Subset to Latin. Use `display: swap` with metric-matched fallbacks (`adjustFontFallback`).

### A2.2 Modular scale

- **Body base:** 16px (1rem); 17px on ≥1280px screens for comfortable reading.
- **Ratio:** **1.25 (Major Third)** for UI and body steps, and **1.333 (Perfect Fourth)** for display steps above H3, which gives headings real drama while keeping UI tight.
- All display sizes are **fluid** using `clamp()` between 375px and 1440px viewports.

| Token | Element | Font | Size (mobile → desktop) | `clamp()` | Weight | Line-height | Tracking | Notes |
|---|---|---|---|---|---|---|---|---|
| `display-xl` | Hero H1 | Bricolage | 48 → 96px | `clamp(3rem, 1.94rem + 4.51vw, 6rem)` | 600 | 0.95 | −0.035em | Max 3 lines; `text-wrap: balance` |
| `display-lg` | Section-opening statements | Bricolage | 40 → 72px | `clamp(2.5rem, 1.8rem + 2.99vw, 4.5rem)` | 600 | 1.0 | −0.03em | |
| `h1` | Page H1 (interior pages) | Bricolage | 40 → 64px | `clamp(2.5rem, 2.06rem + 1.88vw, 4rem)` | 600 | 1.02 | −0.03em | |
| `h2` | Section headline | Bricolage | 32 → 48px | `clamp(2rem, 1.65rem + 1.5vw, 3rem)` | 600 | 1.08 | −0.025em | |
| `h3` | Sub-section / large card title | Bricolage | 24 → 32px | `clamp(1.5rem, 1.32rem + 0.75vw, 2rem)` | 600 | 1.15 | −0.02em | |
| `h4` | Card title | Bricolage | 20 → 24px | `clamp(1.25rem, 1.16rem + 0.38vw, 1.5rem)` | 600 | 1.25 | −0.015em | |
| `h5` | Minor heading, list headers | Inter | 18px | — | 600 | 1.35 | −0.01em | |
| `h6` | Overline / eyebrow | Inter | 12px | — | 500 | 1.4 | +0.12em, UPPERCASE | Color `--ink-300`; a 6px lime dot precedes it on dark |
| `body-lg` | Lead paragraph / subheadline | Inter | 18 → 20px | `clamp(1.125rem, 1.08rem + 0.19vw, 1.25rem)` | 400 | 1.55 | −0.005em | Max 60ch |
| `body` | Default body | Inter | 16 → 17px | — | 400 | 1.6 | 0 | Max 68ch |
| `body-sm` | Dense UI, table cells, card body | Inter | 14px | — | 400 | 1.55 | 0 | |
| `caption` | Captions, meta, legal | Inter | 13px | — | 400 | 1.45 | +0.005em | Min color `--ink-300` |
| `micro` | Badges, tags | Inter | 12px | — | 500 | 1.3 | +0.02em | |
| `button-lg` | Hero/large buttons | Inter | 16px | — | 500 | 1 (24px box) | −0.005em | |
| `button` | Default buttons | Inter | 15px | — | 500 | 1 | 0 | |
| `button-sm` | Compact buttons, nav CTA | Inter | 14px | — | 500 | 1 | 0 | |
| `stat` | Big numerals | Bricolage | 48 → 80px | `clamp(3rem, 2.47rem + 2.25vw, 5rem)` | 500 | 1 | −0.04em | `font-variant-numeric: tabular-nums` |
| `mono` | Ops feed, timestamps | JetBrains Mono | 13px | — | 400 | 1.6 | 0 | |

**Typographic rules**

- Headlines are **sentence case**, never Title Case. Title Case reads "corporate brochure."
- Max **one** text-gradient word per page, always in the hero.
- Headlines end without periods, except deliberate punch lines (e.g., "Zero babysitting.").
- Use `text-wrap: balance` on H1–H3 and `text-wrap: pretty` on paragraphs.
- Numerals in stats and tables are always tabular.

---

## A3. Spacing & layout

### A3.1 Spacing scale (4px base)

| Token | px | rem | Typical use |
|---|---|---|---|
| `space-0.5` | 2 | 0.125 | Icon-to-text optical nudges |
| `space-1` | 4 | 0.25 | Tight inline gaps |
| `space-2` | 8 | 0.5 | Icon + label gap, badge padding |
| `space-3` | 12 | 0.75 | Input inner padding (y), small stacks |
| `space-4` | 16 | 1 | Default stack, mobile gutter |
| `space-5` | 20 | 1.25 | Button padding (x) |
| `space-6` | 24 | 1.5 | Card padding (mobile), grid gap (mobile) |
| `space-8` | 32 | 2 | Card padding (desktop), grid gap (desktop) |
| `space-10` | 40 | 2.5 | Heading → body in sections |
| `space-12` | 48 | 3 | Between content groups |
| `space-16` | 64 | 4 | Section padding (mobile) |
| `space-20` | 80 | 5 | — |
| `space-24` | 96 | 6 | Section padding (tablet) |
| `space-32` | 128 | 8 | Section padding (desktop) |
| `space-40` | 160 | 10 | Hero top padding (desktop), "breath" sections |

**Section vertical rhythm:** `padding-block: clamp(4rem, 2.6rem + 6vw, 8rem)`. Generous whitespace is the single cheapest signal of premium positioning.

### A3.2 Grid

| Breakpoint | Columns | Gutter | Side margin | Container |
|---|---|---|---|---|
| `xs` < 640px | 4 | 16px | 20px | fluid |
| `sm` 640–767 | 4 | 16px | 24px | fluid |
| `md` 768–1023 | 8 | 24px | 32px | fluid |
| `lg` 1024–1279 | 12 | 24px | 40px | fluid |
| `xl` 1280–1535 | 12 | 32px | auto | **1200px content** |
| `2xl` ≥ 1536 | 12 | 32px | auto | **1280px content** |

- `--container-max: 1280px` (content), `--container-wide: 1440px` (full-bleed visuals, marquees), `--container-prose: 720px` (case study body, legal).
- **Asymmetric layouts are the default** for marketing sections (e.g., headline in cols 1–5, body in cols 7–12). Centered layouts are reserved for the hero and closing CTA, so they *feel* like moments.
- A faint **12-column guide overlay** (1px `--ink-600` at 40% opacity, vertical lines) is used as a decorative background motif in the hero and process page. It literally shows "structure," which is our brand promise.

---

## A4. Border radius

Tight radii read as "precise tooling" (Linear, Vercel); big pill shapes read as "consumer app." We stay tight.

| Token | Value | Use |
|---|---|---|
| `radius-none` | 0 | Full-bleed sections, dividers, marquee |
| `radius-xs` | 4px | Badges, tags, checkboxes, tooltips |
| `radius-sm` | 6px | Inputs, small buttons |
| `radius-md` | 8px | **Default buttons**, selects, toasts |
| `radius-lg` | 12px | Cards, dropdown menus |
| `radius-xl` | 16px | Large feature cards, modals |
| `radius-2xl` | 24px | Hero product-mockup frame, Volt slab CTA panel |
| `radius-full` | 9999px | Status dots, avatars, toggle switches only, **never buttons** |

Nested radius rule: inner radius = outer radius − padding (e.g., 16px card with 8px padding → 8px inner image).

---

## A5. Elevation & shadow

On dark backgrounds, traditional drop shadows are invisible. Elevation is communicated with **surface lightness + inner top highlight + border**, and shadows only add depth on top.

| Level | Surface | Border | Inner highlight | Shadow (dark) | Shadow (light) | Use |
|---|---|---|---|---|---|---|
| `e0` | `--ink-950` | none | none | none | none | Canvas |
| `e1` | `--ink-850` | 1px `--ink-600` | `inset 0 1px 0 rgb(255 255 255 / 0.04)` | `0 1px 2px rgb(0 0 0 / 0.4)` | `0 1px 2px rgb(10 10 10 / 0.06)` | Cards |
| `e2` | `--ink-800` | 1px `--ink-500` | `inset 0 1px 0 rgb(255 255 255 / 0.06)` | `0 8px 24px -8px rgb(0 0 0 / 0.6)` | `0 8px 24px -8px rgb(10 10 10 / 0.12)` | Hovered cards, sticky nav |
| `e3` | `--ink-700` | 1px `--ink-500` | `inset 0 1px 0 rgb(255 255 255 / 0.08)` | `0 16px 48px -12px rgb(0 0 0 / 0.7)` | `0 16px 48px -12px rgb(10 10 10 / 0.16)` | Dropdowns, popovers, toasts |
| `e4` | `--ink-700` | 1px `--ink-500` | same as e3 | `0 32px 80px -16px rgb(0 0 0 / 0.8)` + backdrop `rgb(10 10 10 / 0.7)` w/ `blur(8px)` | `0 32px 80px -16px rgb(10 10 10 / 0.24)` | Modals |
| `glow` | — | 1px `rgb(163 230 53 / 0.4)` | — | `0 0 0 1px rgb(163 230 53 / 0.25), 0 8px 32px -8px rgb(163 230 53 / 0.35)` | — | Primary CTA hover, "featured" card, focus emphasis |

---

## A6. Motion principles

**Philosophy: motion shows systems working.** We animate to demonstrate *process* (things moving through a pipeline, tasks being completed, numbers being reconciled), never for decoration. A COO should feel "these people are organized" from the motion alone.

### A6.1 Duration tokens

| Token | ms | Use |
|---|---|---|
| `dur-instant` | 80 | Press feedback (scale), checkbox tick |
| `dur-fast` | 150 | Hover color/border changes, tooltip in |
| `dur-base` | 220 | Dropdowns, accordions, tab indicator slide |
| `dur-slow` | 360 | Modals, drawers, mobile menu |
| `dur-reveal` | 600 | Scroll-reveal of section content |
| `dur-narrative` | 1200–2400 | Hero load sequence, counters, process diagrams |

**Exits are faster than entrances:** exit = 70% of the entrance duration.

### A6.2 Easing curves

| Token | Curve | Use |
|---|---|---|
| `ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | **Default for entrances.** Fast start, long soft landing; feels precise and expensive. |
| `ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` | Things moving *between* positions (tab indicator, carousel slide) |
| `ease-in-quad` | `cubic-bezier(0.55, 0.085, 0.68, 0.53)` | Exits |
| `spring-ui` | Motion: `{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }` | Interruptible UI: menus, toggles, drag |
| `linear` | `linear` | Marquees, progress bars, the ops-feed scroll only |

### A6.3 What gets animated (and why)

| Element | Animation | Purpose for the buyer |
|---|---|---|
| Hero ops-feed | Task rows enter from bottom (`translateY 12px → 0`, opacity, 40ms stagger), status flips "In progress" → "Done" with a lime tick | Shows throughput and visibility, our core promise |
| Section headings | Fade + 16px rise, words staggered 30ms, once | Guides reading order |
| Stat counters | Count up over 1200ms with `ease-out-expo` when 50% visible, once | Draws eye to proof; once only (repeat = gimmick) |
| Process steps | Connector line draws (SVG `stroke-dashoffset`) as user scrolls, scrubbed | Literally shows "a process with no gaps" |
| Cards | Hover: border to `--ink-500`, 1px edge-light gradient fades in at top, translateY(−2px) | Signals interactivity without bounce |
| Primary button | Hover: fill to `--volt-300` + glow shadow; arrow icon shifts 3px right; press: `scale(0.98)` | Tactile, confident |
| Logo marquee | Linear 40s loop, pauses on hover/focus | Ambient proof without demanding attention |
| Page transitions | Cross-fade 220ms (View Transitions API), header persists | Feels like an app, not a brochure |

**What does NOT animate:** body paragraphs (beyond the single section reveal), navigation links on load, form fields, footer, legal text, anything on repeat scroll (reveals fire once). No parallax on text. No scroll-jacking. No cursor followers.

### A6.4 Reduced motion

`@media (prefers-reduced-motion: reduce)`: all reveals become opacity-only at 150ms; counters display final values; marquee becomes a static wrapped grid; ops-feed shows a static snapshot of 6 completed rows; scrubbed animations are replaced by their end state.

---

## A7. Imagery & illustration direction

### A7.1 The concept: "The Operations Layer"

We are the invisible backbone. So our imagery makes the invisible visible: **the inner workings of a business rendered as precise, beautiful systems.** Think exploded-view technical drawings, not people at desks.

### A7.2 Asset types (in priority order)

**1. Product-style UI vignettes (primary, ~50% of visuals).**
Crisp, realistic but fictional interface panels showing our work as data: a recruiting pipeline board with candidate cards moving stages; a month-end close checklist with 23/24 tasks done; a contract tracker with renewal dates; a Lighthouse score panel at 98; a VA task inbox with SLA timers. Built in Figma/code (not screenshots), rendered at 2× in dark UI with lime accents, slight 3D tilt (`rotateX(8deg) rotateY(-12deg)`) on a soft lime glow.
*Why:* CTOs and CFOs trust dashboards. It shows the visibility they'll get, rather than claiming it.

**2. Abstract 3D "systems" renders (hero and section anchors, ~25%).**
Matte black and dark-graphite geometric forms (stacked slabs, interlocking rails, modular blocks) lit with a single lime rim light and soft volumetric glow. Materials: anodized aluminum, matte ceramic, frosted glass (≤ 1 glass element per render). No floating orbs, no glossy blobs, no gradient spheres. Tools: Blender/Spline → exported as optimized AVIF stills plus one lightweight Spline/R3F scene max (hero only, with a static AVIF poster fallback).
Motif per service (used as glyph-renders on service pages):
- Web Development: stacked layered panes (like a DOM tree in 3D)
- Recruitment: a funnel of discrete cubes, one lit lime at the bottom
- Virtual Assistance: a grid of tiles, several sliding into a "done" rail
- Accounting: perfectly balanced stacked slabs (a ledger in 3D)
- Legal: interlocking rings or a clasp mechanism (agreement, binding)

**3. Duotone documentary photography (~20%, About, Careers, Case studies only).**
Real Akrostech people at work: hands on keyboards, whiteboards with real process diagrams, team stand-ups on video calls, shot candidly, never posed at the camera. Treated as **black + lime duotone** (shadows `#0A0A0A`, highlights `#D9F99D` at 85% to avoid neon skin) or high-contrast monochrome with a lime rule. Grain at 4%.
*Why:* proves real humans exist (critical for outsourcing trust) without the stock-photo cliché. Faces get credibility; duotone keeps them on-brand.

**4. Line-based technical diagrams (~5%).**
1.5px `--ink-300` strokes, lime for the "active" path, on the faint grid. Used on Process and service pages to show workflows (intake → assignment → QA → delivery).

**Banned:** handshakes, globes/network maps, headsets, rocket ships, lightbulbs, puzzle pieces, isometric cartoon people, AI-generated people, generic city skylines.

### A7.3 Technical specs

- Formats: AVIF primary, WebP fallback, via `next/image`. Hero LCP image ≤ 120KB.
- Every image has a meaningful `alt` or `alt=""` if decorative.
- Product vignettes are built as **HTML/SVG components where possible** (crisp at any DPR, animatable, selectable, tiny).

---

## A8. Iconography

- **Library: Phosphor Icons** (`@phosphor-icons/react`), using the **Light** weight (1.5px-equivalent at 24px) for UI and marketing, and **Fill** weight only for active/selected states.
  *Why Phosphor over Lucide:* six consistent weights let us express state (light → fill) without a second icon set, and its geometry has slightly more character, matching Bricolage. Lucide is the fallback if a glyph is missing.
- **Style:** outline (Light), 24px default grid, 20px in buttons, 16px inline with body-sm. Color `--ink-200` default; `--volt-500` only when the icon represents an active/live/selected state.
- **Service glyphs:** five custom icons drawn on Phosphor's 256 grid so they sit alongside the library: `Code` brackets inside a window (Web), a funnel with a single dot (Recruitment), a checklist with a lightning tick (VA), a ledger with a balancing bar (Accounting), a document with a clasp (Legal).
- **Icon containers:** 40×40 rounded `radius-md` squares, `--ink-800` fill, 1px `--ink-600` border. On hover the border goes `rgb(163 230 53 / 0.4)` and the icon goes lime.
- Never use emoji in UI.

---

## A9. Voice & copy principles (applied throughout Section C)

| Do | Don't |
|---|---|
| "We reply within 4 business hours." | "We're highly responsive." |
| "Your books close by business day 5." | "Accurate, timely financial solutions." |
| "Hire a vetted backend engineer in 14 days." | "Best-in-class talent acquisition." |
| "You'll see every task, every timestamp." | "Full transparency." |
| Short sentences. Occasional fragments. For rhythm. | Paragraphs of qualifiers |
| Admit limits: "We're not a law firm. We make your lawyers faster." | Overpromise |

**Voice attributes:** *Precise* (numbers over adjectives) · *Calm* (no exclamation marks, ever) · *Dry wit, once per page max* · *Direct address* ("you", "your team").

---

## A10. Logo usage

- Primary: lime mark + Ink wordmark on light; lime mark + Paper wordmark on dark.
- Clear space = height of the "A" in the wordmark on all sides.
- Minimum size: 24px mark height (digital).
- On the Volt slab CTA: all-Ink logo.
- Never place the logo on photography without a solid Ink plate.
- Favicon: lime mark on Ink square, 32/180/512 PNG + SVG with `prefers-color-scheme` swap.

---

## A11. Tokens

The complete token set is implemented in [`styles/tokens.css`](../../styles/tokens.css) as CSS custom properties, with a Tailwind v4 `@theme` mapping. See Section I for integration.
