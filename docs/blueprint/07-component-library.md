# G · Component Library Spec

> Built on **shadcn/ui (Radix primitives) + Tailwind v4**, restyled to Akrostech tokens. Radix gives us keyboard support, focus management and ARIA for free, which matters for complex components (menus, dialogs, tabs, accordions).
>
> **Universal states** for every interactive component: `default · hover · focus-visible · active/pressed · disabled · loading (where relevant)`. Focus-visible on dark = 2px `--volt-500` outline with 2px offset; on light = 2px `--volt-800`.

---

## G1. Buttons `<Button>`

| Variant | Default | Hover | Active | Focus-visible | Disabled |
|---|---|---|---|---|---|
| **primary** | bg `--volt-500`, text `--ink-950`, weight 500 | bg `--volt-300` + `--shadow-glow`; trailing arrow +3px x | bg `--volt-600`, `scale(0.98)` | 2px `--volt-500` ring, 2px offset (`--ink-950` gap) | bg `--ink-700`, text `--ink-400`, no shadow, `cursor: not-allowed` |
| **primary-ink** (on lime slab / light mode) | bg `--ink-950`, text `--paper` | bg `--ink-800` | `scale(0.98)` | 2px Ink ring on lime | same as above |
| **secondary** | bg `--surface-2`, text `--ink-50`, 1px `--border` | bg `--ink-700`, border `--ink-500` | `scale(0.98)` | volt ring | — |
| **ghost** | transparent, 1px `--ink-500`, text `--ink-50` | bg `rgb(255 255 255 / 0.04)`, border `--ink-300` | `scale(0.98)` | volt ring | — |
| **link** | text `--accent-text`, no padding, underline offset 4px on hover | underline grows from left | — | volt ring | — |
| **icon** | 40×40 (md) / 32×32 (sm), ghost style, icon 20px | bg `rgb(255 255 255 / 0.06)` | `scale(0.94)` | volt ring | — |
| **destructive** (forms/admin only) | bg `--error` 12% tint, text `--error`, 1px border 32% | 20% tint | — | ring in `--error` | — |

**Sizes:** `sm` 32px h, 12px x-pad, 14px text · `md` 40px h, 16px x-pad, 15px text · `lg` 48px h, 20px x-pad, 16px text · `xl` 56px h, 24px x-pad (hero, mobile full-width).
**Props:** `variant`, `size`, `iconLeft`, `iconRight` (default arrow on primary CTAs), `loading` (spinner replaces icon; width locked), `asChild` (for `<Link>`), `fullWidth`.
**Rules:** radius `md` (8px) always; min touch target 44×44 (sm buttons get an invisible hit area extension on touch); transitions 150ms `ease-out-expo` on bg/border/shadow, 80ms on scale.

---

## G2. Cards

### G2.1 Service card `<ServiceCard>`
- **Anatomy:** number (`micro`, `--ink-300`) · 40px icon container · title (h4) · outcome line (body-sm, `--text-secondary`) · scope chips (3) · animated vignette slot · link with arrow.
- **Variants:** `bento-tall`, `bento-wide`, `compact` (mega-menu), `index-row` (services hub).
- **States:** default (`e1`) · hover (`e2`, border lime 35%, edge-light gradient on top border, translateY −2px, vignette plays) · focus-within (volt ring on the card) · active (`scale(0.995)`).
- **A11y:** single stretched link; vignette `aria-hidden="true"`.

### G2.2 Testimonial card `<TestimonialCard>`
- **Anatomy:** quote glyph · quote (body-lg) · divider · avatar 40px · name (h5) · title, company · meta (industry · size) · service tags · optional `Verified on Clutch ↗`.
- **Variants:** `card` (grid), `featured` (large pull-quote, display-lg quote at 32–40px, no card chrome), `inline` (contact page, compact).
- **States:** static (no hover lift: it isn't clickable), unless `href` is present (then card hover rules apply).
- **Markup:** `<figure>` + `<blockquote>` + `<figcaption>`.

### G2.3 Case study card `<CaseStudyCard>`
- **Anatomy:** media (16:10, duotone image or 3D render; radius inherits −padding) · client logo (24px, monochrome) · service tags · headline (h4, outcome-first) · stats row (2–3, mono) · `Read the story →`.
- **Variants:** `featured` (horizontal split, full width), `grid` (vertical), `mini` (mega-menu, related).
- **States:** hover = media `scale(1.03)` (600ms), border lime 35%, arrow shift.

### G2.4 Team member card `<TeamCard>`
- **Anatomy:** portrait 1:1 (duotone → color on hover) · name (h5) · role (body-sm) · one-line background (caption) · `Previously:` line · LinkedIn icon button.
- **Variants:** `leadership` (large, with bio expand), `role` (service pages: role title + seniority + "typical background", no photo required), `compact` (careers quotes).
- **States:** hover = 360ms grayscale/duotone → color crossfade; focus on the LinkedIn link.

### G2.5 Stat card `<Stat>`
- **Anatomy:** value (stat style, tabular), unit/suffix (`--volt-500`), label (body-sm, `--text-secondary`), optional footnote marker linking to methodology.
- **Variants:** `band` (hairline-separated, no chrome), `card` (`e1`), `inline` (case study hero; h3 size), `delta` (before → after with an arrow: `15 → 5`).
- **Behavior:** count-up once on 50% visibility; `aria-label` holds the final value so screen readers never hear intermediate numbers.

### G2.6 Feature / scope card `<FeatureCard>`
Icon container + h4 + body-sm. Variants: `default`, `limit` (the "What we don't do" style with `X` icon and warning border).

---

## G3. Navigation

### G3.1 Desktop header `<SiteHeader>`
- **States:** `top` (transparent, 80px) · `scrolled` (blurred `rgb(10 10 10 / 0.72)`, border, 64px) · `hidden` (translateY −100% on scroll-down after 400px) · `menu-open` (never hides).
- **Nav link states:** default `--ink-200` · hover `--ink-50` + underline grow · active page `--ink-50` + 4px lime dot · focus volt ring.
- **Mega-menu** `<NavigationMenu>` (Radix): opens on hover with a 150ms intent delay and on click/Enter/Space/↓; closes on Esc, outside click, or pointer leave (300ms grace). Panel animates `opacity 0→1, translateY −4px→0, scale 0.98→1` over 220ms. Arrow keys move between tiles.
- **Skip link:** `Skip to main content` as the first focusable element, visible on focus (lime button style, top-left).

### G3.2 Mobile menu `<MobileNav>`
Full-screen Radix Dialog sheet (see B2.4). Focus trap, `aria-modal`, body scroll lock, Services accordion, CTA pinned to the bottom with safe-area padding, and closes on route change.

### G3.3 Sticky elements
- `<StickyHeader>` as above.
- `<MobileCTABar>`: bottom fixed bar (F2.7).
- `<ReadingProgress>`: 2px lime bar on articles/case studies, `role="progressbar"` hidden from AT (decorative); `aria-hidden="true"`.
- `<Scrollspy>`: case-study sidebar TOC; the current item gets a lime 2px left border.

### G3.4 Breadcrumb `<Breadcrumb>`
Caption size, `/` separators in `--ink-500`, current page `aria-current="page"`, plus `BreadcrumbList` JSON-LD.

### G3.5 Footer `<SiteFooter>`
Per B2.5; columns become accordions below 640px (`<details>` based, works without JS).

---

## G4. Forms

All fields: 48px height (md), radius `sm` (6px), bg `--surface-2`, 1px `--border`, text `--ink-50`, placeholder `--ink-300` (5.79:1, intentionally legible). Label above the field (never placeholder-only), 14px/500 `--ink-100`. Helper text caption `--text-tertiary`. Spacing: label → field 8px, field → helper 6px, field groups 24px.

| State | Treatment |
|---|---|
| default | as above |
| hover | border `--ink-500` |
| focus | border `--volt-500` + `0 0 0 3px rgb(163 230 53 / 0.2)` ring; label color `--ink-50` |
| filled | default border, text `--ink-50` |
| error | border `--error`, ring `rgb(248 113 113 / 0.2)` on focus, `XCircle` icon + message in `--error` caption below; `aria-invalid="true"` + `aria-describedby` |
| success (async-validated) | trailing `CheckCircle` in `--success` |
| disabled | bg `--ink-900`, text `--ink-400`, border `--ink-700` |
| read-only | bg transparent, dashed border |

### Components
- **`<Input>`**: types text/email/tel/url/number; optional leading icon, trailing action (clear, show password), and `size` sm/md/lg.
- **`<Textarea>`**: min 120px, auto-grows to 320px, character counter appears at 80% of max.
- **`<Select>`**: Radix Select; trigger matches Input; `e3` popover list, 36px items, check icon on the selected item, typeahead. Native `<select>` fallback on mobile for better UX.
- **`<Combobox>`** (P2): industry/country search.
- **`<Checkbox>`**: 18px box, radius xs, checked = lime fill + Ink check (tick draws in 80ms), indeterminate state. Label clickable, 44px row hit area.
- **`<ChipCheckbox>`** (service picker): toggle-pill style with radius-md (not pill), 40px high; selected = `--volt-950` bg, lime border, lime check icon prefix.
- **`<Radio>` / `<SegmentedControl>`**: radio 18px circle, selected = lime ring + lime dot. The segmented variant: an ink-800 track with a sliding selected indicator (`--ink-600` bg, 220ms ease-in-out-quart).
- **`<Slider>`** (calculator): 4px track `--ink-600`, filled portion lime, 20px thumb (Paper with lime 2px border), value tooltip on drag, full keyboard (arrow ±1, PageUp/PageDown ±10).
- **`<Switch>`**: 36×20 track, lime when on.
- **`<FormField>`** wrapper: label, control, helper, error, with id wiring for ARIA.
- **`<FormErrorSummary>`**: top-of-form summary on submit with anchor links to each invalid field, focus moved to it.
- **Validation:** Zod schema shared between client (react-hook-form) and server action.

---

## G5. Accordion / FAQ `<Accordion>`

- Radix Accordion; `type="single" collapsible` for FAQs; `type="multiple"` for the mobile footer.
- Row: 72px min height, question in h5 (`--ink-50`), `+` icon (20px) right-aligned that rotates 45° to `×`. Hairline dividers between items.
- Open: content height animates via `grid-template-rows: 0fr → 1fr` (220ms ease-out-expo); content opacity 0 → 1 (150ms, 60ms delay). Answer in body (`--text-secondary`), max 68ch.
- Hover: only the `+` icon's container background changes (to `--ink-800`); the question text stays `--ink-50`, because lime text would read as a link. Focus-visible: volt ring around the row.
- Variants: `faq` (with FAQPage schema), `bordered` (inside cards), `plain` (footer).
- Deep-linkable: each item has an id; `#faq-pricing` opens and scrolls to it.

---

## G6. Tabs `<Tabs>`

- Radix Tabs; automatic activation on arrow keys.
- **Variants:**
  - `underline`: text tabs with a 2px lime indicator that slides between tabs (Motion `layoutId`, 220ms ease-in-out-quart). Used on the Ops Feed and case study filters.
  - `segmented`: pill track (radius-md) as in the segmented control. Used in the calculator and the pricing-model toggle.
  - `vertical`: left list + right panel on desktop, collapsing to an accordion on mobile. Used for "Services → what we handle" deep dives (P2).
- States: inactive `--ink-300` · hover `--ink-100` · active `--ink-50` · focus volt ring · disabled `--ink-400`.
- Panel transition: crossfade 150ms + 4px y-shift. Content height changes animate with layout animation.

---

## G7. Modal / Dialog `<Dialog>`

- Radix Dialog. Overlay `rgb(10 10 10 / 0.7)` + `backdrop-filter: blur(8px)`.
- Panel: `e4`, radius-xl, max-width `sm` 440 / `md` 640 / `lg` 880 / `full` (sample report preview: 90vw × 90vh), padding 32px.
- Anatomy: title (h4), optional description, body, footer actions (right-aligned: secondary, primary), close icon button top-right.
- Motion: in = opacity 0→1 + `scale(0.97)→1` + `translateY(8px)→0`, 360ms ease-out-expo; out = 220ms ease-in-quad. Mobile (<640) renders as a **bottom sheet** (slides up, drag-to-dismiss handle, safe-area padding).
- Focus: moves to the first focusable element (or the title for read-only); trapped; returns to the trigger on close; Esc closes; scroll locked.
- Uses: sample Friday report preview, artifact previews, Cal.com booking embed, video (P2), NDA request.

---

## G8. Toast `<Toaster>` (Sonner)

- Position: bottom-right desktop, bottom-center mobile (above the mobile CTA bar). Max 3 visible, stacked with 8px offset and scale 0.95 for depth.
- Style: `e3`, radius-md, 14px text, 16px icon, optional action button (`link` variant), close on hover.
- **Variants:** `success` (CheckCircle `--success`), `error` (XCircle `--error`), `warning`, `info`, `loading` (spinner → resolves into success/error via `toast.promise`).
- Duration: 5s default, 8s for errors, persistent for loading; pauses on hover/focus; swipe to dismiss on touch.
- A11y: `role="status"` (polite) for success/info; `role="alert"` for errors. Never the only feedback for form errors (inline errors are required too).
- Uses: form network errors, "Copied to clipboard" (email address), calculator "Report sent to your inbox."

---

## G9. Pricing / engagement table `<EngagementModels>`

We don't publish list prices (enterprise deals are scoped), but we **do publish structure and starting points**, because hiding pricing entirely reads as "expensive or evasive."

- **Layout:** 3 columns (Dedicated · Pooled · Project); the middle column ("Dedicated", the most popular) is highlighted with a lime top border, a `Most chosen` badge and `--volt-950` tint.
- **Each column:** model name (h4) · one-line description · "Best for" · `Starting from $X / month [VERIFY or omit]` (or "Fixed quote in 48h") · feature list (6–8 lines, `Check` icons in `--ink-300`, lime for highlights) · billing terms · CTA button (`Get a quote →`, primary only on the highlighted column, secondary on the others).
- **Below:** a full comparison table (`<ComparisonTable>`) with sticky header row, sticky first column on mobile, and row-group headers (Commitment · Team · Reporting · Security).
- **States:** column hover = `e2`; on mobile, columns become a horizontal snap carousel with dot indicators **and** a segmented control to jump between them.

`<ComparisonTable>` is also used for the homepage "Honest comparison" (Akrostech column highlighted as above).

---

## G10. Marquee / ticker `<LogoMarquee>`

- Two duplicated tracks, CSS `@keyframes` translateX(0 → −50%), `linear`, 40s duration (scaled by item count so speed stays ~40px/s).
- Edge fade masks; 64px gap between logos; logos `--ink-300`, hover `--ink-50` (150ms).
- **Pause on hover and on focus-within**; a visually-hidden "Pause" toggle button is the first focusable element (WCAG 2.2.2, Pause, Stop, Hide: required for content moving > 5s).
- `aria-hidden="true"` on the duplicate track; the primary track is a `<ul>` with each logo's `alt` = company name.
- Reduced motion → static, wrapped centered grid.
- Variant: `<Ticker>` (text): a mono "ops ticker" for the Careers/About pages, e.g., `● 2,847 tasks completed this month · 214 payroll runs · 63 hires placed [VERIFY/live]`.

---

## G11. Additional components

| Component | Purpose | Variants / notes |
|---|---|---|
| `<Badge>` | Service tags, status | `neutral`, `volt` (lime outline), `success`, `warning`, `error`; radius xs, `micro` text |
| `<Eyebrow>` | Section overline | With/without live dot (dot pulses 2s, disabled in reduced motion) |
| `<SectionHeader>` | Eyebrow + H2 + intro + optional link | `left`, `center`, `split` (H2 left, intro right) |
| `<VoltSlab>` | Closing CTA | Props: heading, sub, primary, secondary, availability (from Cal.com API) |
| `<OpsFeed>` | Hero panel | `live` (ticking), `static` (reduced motion/SSR), filterable by service |
| `<Vignette>` | Service mini-animations | One per service; `autoplay`, `on-hover`, `static` |
| `<Timeline>` | Process / engagement steps | `horizontal`, `vertical`, `sticky-progress` |
| `<LogoGrid>` | Tools/integrations | Hairline cells, tooltip names |
| `<Tooltip>` | Explanations | Radix; 150ms delay; `e3`; max 240px |
| `<Callout>` | Compliance notes, "what we don't do" | `info`, `warning`, `note` |
| `<CodeBlock>` (P2) | Field Notes articles | Shiki, Ink theme |
| `<CookieBanner>` | Consent | Bottom-left compact card, "Accept / Reject / Settings" with **equal visual weight** (GDPR) |
| `<Skeleton>` | Loading (careers list, calculator PDF) | Ink-800 shimmer at 1.6s, disabled in reduced motion |
| `<EmptyState>` | Filters with no results | Icon, message, helpful CTA |
| `<ThemeToggle>` | Footer | System / Dark / Light |
| `<Avatar>` | Testimonials, team | 24/32/40/64; duotone filter option |
