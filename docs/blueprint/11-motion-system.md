# K. Motion System (M5): implementation reference

> **Status:** M5a built (global system + homepage). M5b built (five service heroes, §3b–3f). M5c (About, How it works, Work, Contact, Careers heroes + per-page scroll configs) are specified in §3 and §8.
> **Supersedes:** the motion rules in A6.3, A6.3a and the "no cursor followers / no parallax on text" line in [`01-brand-design-system.md`](./01-brand-design-system.md) (A6), and D1 as the homepage hero in [`04-hero-concepts.md`](./04-hero-concepts.md). The owner asked for a more immersive, interactive site; this document is the agreed replacement.
> **Engine:** GSAP 3.15 (core + ScrollTrigger only), loaded asynchronously; CSS for first frames, failsafes and hover states.

The thesis, unchanged from A6: **motion shows systems working.** A preloader that boots, a curtain that routes, a wireframe engine that turns, a line that draws through a process, a counter that lands on a real number. Lime stays an accent: it "hits like a laser, not a floodlight". The only lime field in the system is the 0.6s route curtain.

Design references used while building, and what each one decided:

| Skill | What it decided here |
|---|---|
| emil-design-eng | Frequency rule (the preloader plays once per session, not on every click); strong ease-out for entrances; hover states as interruptible CSS transitions; `scale(0.98)` press feedback; exits faster than entrances; never animate from `scale(0)`. |
| gsap-react / gsap-scrolltrigger / gsap-performance | `gsap.context()` + `ctx.revert()` in effects (async-loaded GSAP rules out `useGSAP`'s static import); scoped selectors; `quickTo` for every pointer follower; ScrollTrigger on top-level timelines only; `ease: "none"` on scrubbed motion; transform/opacity only; `will-change` only while moving. |
| impeccable | "The brief wins" where a skill's house style conflicts with the owner's brief; one authored focal moment per surface; content visible in the default state so a failed script never hides the page; the craft floor (contrast, states, browser surfaces). |
| design-taste-frontend | The idea comes from the subject (an operations company's machine room, not a generic "3D blob"); proof is never invented; headlines in two lines; every control has feedback. Its house bans (grid lines, glows, monospace, 01/02 numbering) were overridden by the brief, which asks for each of them explicitly. |
| vercel-react-best-practices / web-design-guidelines | Defer non-critical JS (GSAP is out of the render-critical budget); no layout-triggering animation; honour `prefers-reduced-motion`; keep focus management and keyboard paths intact through transitions. |

`/voltagent/awesome-design-md` is not installed in this environment; its DESIGN.md role is filled by this document and A1–A6.

---

## Revision: color & UX review (M5b)

Reviewed against **ui-ux-pro-max** (its 119 UX guidelines and color rules) and the **brand** skill (color ratios, consistency checklist). The two skills named in the request, "ux-guidelines" and "color-and-branding-guidelines", aren't installed here or in the org catalog; these are the closest matches. Where this list and the sections below disagree, this list wins.

| Was | Now | Rule |
|---|---|---|
| Full-screen **lime** route curtain, 0.3s + 0.3s, focus left on a vanished link | **Ink** panel with a 2px lime leading edge, 0.22s cover + 0.3s reveal; focus moves to `#main` after the reveal | Brand accent ratio (lime ≤10% of a screen); `focus-on-route-change` |
| Boot meter was a 1s timer dressed up as progress; the screen held for 1.45s whatever the page did | Meter reports real readiness (fonts 55%, load 90%); lifts as soon as the page is ready, no earlier than 0.85s and no later than 2s from navigation start, and on any key, click, wheel or touch | `loading-states`: feedback matches the real wait |
| Custom cursor hid the system cursor and drew a solid lime disc over link text | System cursor always visible; a **hollow** lime ring with a label beside it, over links and buttons only | `system-controls`: low-vision users keep their enlarged cursor; nothing under the pointer is covered |
| Ambient loops, the marquee and the grid pulse moved forever; only the OS setting could stop them | A visible **"Reduce motion" switch** (footer, mobile menu), remembered in localStorage `akros:motion`, read before first paint. It works like the OS setting everywhere. The marquee also pauses off-screen; the hero grid no longer pulses. | WCAG 2.2.2 pause mechanism; `auto-rotation-controls`; `excessive-motion` (1–2 moving elements per view) |
| H2/H3 flickered on hover | Removed (the hero accent word still glitches once on arrival) | `motion-meaning`: motion on non-interactive text expresses no cause and effect |
| Rail and top progress bar both on wide screens | Where the rail shows, the top bar hides | One indicator per meaning |
| Hero CTAs "Start a Project" / "See Our Work" | The site's standard pair, "Book a 20-minute call" / "See what it would cost" | Brand consistency: one action, one name everywhere; /work is an empty state until a case study is permissioned |
| Lime marquee words; lime closing-CTA slab (32–47% of a screen) | Muted words with lime marks; Ink slab lit by a lime edge (A1.4) | Accent ratio 5–10% |
| Pointer effects hydrated on every page | Card tilt, magnets and cursor ring load as one deferred chunk after idle, mouse/trackpad only (`components/motion/deferred-effects.tsx`) | `lazy-loading`, `bundle-splitting`; keeps /contact under the 200 KB render-critical budget |

---

## §1 Design-system tokens

Source: [`lib/motion/tokens.ts`](../../lib/motion/tokens.ts) (GSAP) mirrored by [`styles/tokens.css`](../../styles/tokens.css) (`--ease-*`, `--dur-*`).

| Group | Token | Value | Use |
|---|---|---|---|
| Ease | `entrance` | `power3.out` | Every scroll reveal and sub-element entrance |
| | `focal` | `expo.out` | Hero words, curtain reveal, card border draw |
| | `curtain` | `power4.inOut` | Preloader shutters, route curtain |
| | `loop` | `power2.inOut` | Ambient yoyo loops (mesh, particles, grid pulse) |
| | `exit` | `power2.in` | Content stepping back before a transition |
| | `follow` | `power3.out` | `quickTo` followers (cursor, tilt, magnet) |
| | `spring` | `elastic.out(1, 0.55)` | Magnetic release only |
| | `linear` | `none` | Scrubbed and constant motion |
| Duration (s) | `press` / `fast` / `base` / `slow` | 0.12 / 0.15 / 0.22 / 0.36 | UI feedback |
| | `reveal` | 0.8 | Scroll reveals |
| | `count` | 1.5 | Stat counters |
| | `curtainHalf` | 0.3 | Each half of the 0.6s route curtain |
| | `preloader` | 1.45 | Boot sequence, first frame to lifted (brief: 1.2–1.8) |
| | `follow` | 0.1 | Cursor dot lag |
| Stagger (s) | `words` / `tight` / `base` / `loose` | 0.06 / 0.05 / 0.09 / 0.12 | Headline words / menus / siblings (brief: 0.08–0.12) / sparse |
| Distance (px) | `text` / `card` / `blur` | 48 / 80 / 8 | Reveal travel and the "materialize" blur |
| | `lift` / `nudge` | 8 / 4 | Card hover lift, content shift |
| | `magnet` / `magnetRadius` | 12 / 80 | Magnetic pull and reach |
| Parallax (×scroll) | `mesh` / `grid` / `particles` / `pointer` | 0.15 / 0.3 / 0.5 / 0.05 | Atmosphere layers |
| Tilt (deg) | `max` / `maxMedia` | 8 / 10 | Text cards / media cards (`data-tilt="media"`) |

Colors stay the brand's: `#A3E635` accent, `#0A0A0A` canvas (A1). Lime text only on dark (AGENTS.md).

---

## §2 Global components (mounted in `app/layout.tsx`)

| § | Component | File | What it does |
|---|---|---|---|
| 2.1 | Boot preloader | [`components/motion/preloader.tsx`](../../components/motion/preloader.tsx) | Grid fades up; AKROS·TECH letters scramble through glyphs and lock (40ms apart); meter 000→100 (power2.inOut); "Operations, handled." types itself (`steps()`); content dims, a lime seam flashes, two shutters part (power4.inOut). 1.45s. **Once per session** (`akros:booted`, sessionStorage, disclosed on /legal/cookies). Any key or click skips (timeScale 4). |
| 2.2 | Route curtain | [`components/motion/route-transition.tsx`](../../components/motion/route-transition.tsx) | A capture-phase click listener runs before `<Link>`'s handler and calls `preventDefault()` (which `<Link>` respects). The lime panel rises (0.3s), the current page steps back (y −24, opacity 0.4), `router.push()`, then the panel lifts (0.3s) while the new page assembles (y 32→0, expo.out). Prefetch, scroll restoration and the route announcer stay Next's. Back/forward stay instant. Skipped for new tabs, modifiers, hash links, same-path query changes, files and `/api`. |
| 5e | Custom cursor | [`components/motion/custom-cursor.tsx`](../../components/motion/custom-cursor.tsx) | 8px lime dot (`quickTo`, 0.1s) + 40px ring (0.35s) that grows over links ("View") and buttons ("Click"); `data-cursor="…"` overrides. Native cursor hidden only once the custom one is drawn; restored over text fields, in forced-colors mode and when the pointer leaves the window. Fine pointers only. |
| 6 | Atmosphere | [`components/motion/atmosphere.tsx`](../../components/motion/atmosphere.tsx) | Fixed, behind everything: (1) three very dark lime/white radial fields on 18–26s yoyo loops, (2) a 1px grid at 3.5% white moving at 0.3× scroll (wrapped, seamless), (3) 18 lime data points (2–4px) drifting on randomised loops, at 0.5× scroll and 0.05× pointer. All composited transforms; loops pause with the tab. |
| 7e | Reading progress | [`components/motion/scroll-progress.tsx`](../../components/motion/scroll-progress.tsx) | 2px lime line at the top of the viewport, `scaleX` scrubbed 0→1 over the page. Replaces the case study's CSS-only bar. |
| 4 | Scroll reveal engine | [`components/motion/scroll-reveal.tsx`](../../components/motion/scroll-reveal.tsx) | See §4. |
| 5b/7d | Pointer surfaces | [`components/motion/pointer-surfaces.tsx`](../../components/motion/pointer-surfaces.tsx) | See §5b. |
| 5g | Magnetic field | [`components/motion/magnetic-field.tsx`](../../components/motion/magnetic-field.tsx) | See §5g. |
| 8 | Header + mobile menu | [`components/layout/site-header.tsx`](../../components/layout/site-header.tsx), [`mobile-nav.tsx`](../../components/layout/mobile-nav.tsx) | Transparent on the hero → 95% Ink, blurred, lime hairline after 100px; shrinks 80→64px; hides on scroll-down, returns on scroll-up (B2.3). Links draw a lime underline left→right (0.3s, power2.out) and turn lime; the active page keeps its underline. Mobile: native modal `<dialog>` (focus trap, Esc, inert page) over a faint lime grid; items stagger in with GSAP (y 20→0, 0.05s); the X turns 90° on hover. |
| 9 | Footer | [`components/layout/site-footer.tsx`](../../components/layout/site-footer.tsx) | "AKROS" at 50vw in 5% lime behind everything, drawn with `::before` so it's never read or contrast-scanned as text, drifting at 0.4× scroll. Social icons (only when real profiles exist in `lib/site.ts`) fill lime with a 3px hop. Magnetic back-to-top ([`back-to-top.tsx`](../../components/layout/back-to-top.tsx)): content dips to 96% around mid-screen, the view resets, the top settles back (expo.out); focus moves to `#main`. Newsletter ([`newsletter-form.tsx`](../../components/layout/newsletter-form.tsx) → `POST /api/newsletter` → HubSpot) renders **only** when `HUBSPOT_NEWSLETTER_FORM_ID` is set; its arrow slides in on focus. |

**State on `<html>`** (set by the inline head script in [`lib/motion/boot.ts`](../../lib/motion/boot.ts) before first paint, then by the engine):
`data-motion="on"` (motion allowed) · `data-boot="pending|done"` · `data-motion-ready` (GSAP loaded) · `data-custom-cursor` · `data-reveal-ready`.

**Why the preloader isn't on every navigation:** the brief asked for both a preloader and a curtain on every route change. Played on every click, a 1.5s boot screen plus a 0.6s curtain is 2.1s of waiting per page, for a buyer comparing vendors in several tabs. Per emil-design-eng's frequency rule, the boot plays once per session and route changes get the curtain.

---

## §3 Hero sections

### 3a Homepage: "The Engine Room" (built, M5a)

File: [`components/home/engine-hero.tsx`](../../components/home/engine-hero.tsx), geometry in [`lib/motion/wireframe.ts`](../../lib/motion/wireframe.ts).

- **Copy.** H1 "Your Back Office. Rebuilt." (clamp 3.5rem → 8rem; "Rebuilt." in lime). Sub "We handle the operations so your team handles the vision." CTAs "Start a Project" → `/contact` (primary, magnetic) and "See Our Work" → `/work` (ghost, magnetic). The three commitments stay under the CTAs (README "Claims to confirm").
- **Background.** A lime 56px grid masked to the shape's side, pulsing on a 3.2s power2.inOut loop. A wireframe torus (40×14) with a counter-rotating icosahedron core, drawn on Canvas 2D in seven depth buckets: one `stroke()` per bucket, far edges at 6% alpha, near at 90%. Core vertices are lit nodes. No WebGL, no three.js.
- **Entrance (GSAP timeline, after the boot screen).** Shape alpha 0→1 and scale 0.86→1 (1.4s, expo.out) · grid fades up · words from blur 8px / y 0.35em to sharp, 0.06s apart (expo.out) · "Rebuilt." RGB-split glitch once at 0.62s · sub, CTAs and commitments rise 24px, 0.09s apart (power3.out) · then the grid starts breathing.
- **Scroll (scrubbed, top top → bottom top).** Shape spins up to 5× and grows to 1.3× while receding at 0.5× (yPercent 18), fading to 35%. Copy lifts at 1× + 12% and dims to 25%. Grid drifts. The canvas stops drawing once the hero is off screen.
- **Pointer.** The camera leans toward the cursor (±0.35 rad X, ±0.45 rad Y, quickTo 1.1s). CTAs are magnetic.
- **LCP.** The H1 paints at first paint, blurred, not hidden, so it stays the LCP candidate. A CSS failsafe sharpens it at 1.2s if GSAP never loads.
- **Reduced motion.** One still frame of the shape; sharp words; no loops.

### 3b–3f Service heroes (built, M5b)

Shared frame: [`components/services/heroes/hero-frame.tsx`](../../components/services/heroes/hero-frame.tsx), wired per slug in [`components/services/service-hero.tsx`](../../components/services/service-hero.tsx); pure math in [`lib/motion/hero-math.ts`](../../lib/motion/hero-math.ts). Same rules as 3a:

- **LCP.** The H1 paints at first paint, blurred and low (never `opacity: 0`), and sharpens word by word (0.06s, expo.out) once GSAP is ready and the boot screen has lifted. Sub, CTAs and note rise 24px, 0.09s apart; the visual rises last. The copy is never inside the entrance wrapper.
- **Finished state in the markup.** Every visual renders its end state (code typed, wireframe drawn, figures final, steps ticked, seal down). GSAP sets the start states at runtime, so reduced motion, no-JS and a failed chunk all show the finished picture, still.
- **One focal motion per view.** Loops (particles, orbit) run on GSAP's ticker only while the hero is on screen, and stop for the "Reduce motion" switch (WCAG 2.2.2). Nothing else repeats.
- **Scroll-away.** The copy lifts 8% and dims to 35% (scrubbed, top top → bottom top); each visual does one thing of its own over the same range.
- **Decorative.** Every visual is `aria-hidden`; the page's facts live in the copy and sections below.
- **CTA consistency (decision).** The primary CTA is the service's scoping call (`content.hero.cta` → `/contact?service=<slug>`), the same label as the closing slab, not the brief's per-page variants ("Get a Quote", "Open a Requisition", …): one verb for one action site-wide. The secondary goes somewhere real on the page or site (`content.hero.secondary`).

| Page | Layout · headline | Visual (file) | Entrance | Scroll | Pointer | Honesty |
|---|---|---|---|---|---|---|
| b · Web | split · plain | "The Build" ([`build-visual.tsx`](../../components/services/heroes/build-visual.tsx)): editor with a 5-line App Router page | Each line types on `steps(n)` (one step per glyph, 0.028s), caret blinks 3× then rests, "Build ready" appears | Wireframe page outlines draw (dashoffset 1→0), then fill; editor dims | Editor tilts ≤4° (quickTo 0.8s) | "Weeks, not months" listed in README claims |
| c · Recruitment | split · scan | "The Pipeline" ([`pipeline-visual.tsx`](../../components/services/heroes/pipeline-visual.tsx)): Source → Screen → Interview → Hire | Nodes pop 0.12s apart (spring), connectors draw; scan line sweeps the H1 at 0.7s, once more at 6s, and on hover. Never on a loop | Stage dims and settles 8% | — (node hover pulse dropped: the visual is aria-hidden, so hover-only detail would be pointer-only information) | Counts labelled **Example** |
| d · VA | center · plain | "The Swarm" ([`swarm-visual.tsx`](../../components/services/heroes/swarm-visual.tsx)): 7 generic task cards orbit "Your VA" | Cards fade up as the ring scales in; core springs in | Orbit tightens to 55% | Camera parallax ±18/12px, near cards drift more | Tasks are generic, not client data. Depth = scale + 3 quantized blur/brightness steps (never per-frame filter changes) |
| e · Accounting | split · ledger | "The Ledger" ([`ledger-visual.tsx`](../../components/services/heroes/ledger-visual.tsx)): month-end close card | Ruled lines draw under the H1; bars rise, trend line draws, figures count (1.5s, power2.out, tabular) | The close checklist ticks step by step (not pinned: a pinned hero delays the content people came for) | — (bar tooltips dropped: aria-hidden visual) | Card labelled **Illustrative**; figures add up (revenue − expenses = net) |
| f · Legal | split-reverse · serif | "The Seal" ([`seal-visual.tsx`](../../components/services/heroes/seal-visual.tsx)): a redlined agreement | Clauses rise; the seal stamps 1.4→1 (power4.in, 0.26s), the page shakes 3px for two frames, once; an ink ring spreads | The contract scrolls under its window (−22%); the seal lifts | — (tilt dropped: the stamp's stillness after impact is the point) | Seal reads "Playbook checked · Routed to counsel", never "approved". The not-a-law-firm note sits under the CTAs. Serif: Fraunces 500 (one static weight) via `next/font`, `preload: false`, this route only |

### 3g–3k: specified for M5c

| Page | Concept | Copy (owner's brief) | Entrance | Scroll | Pointer | Honesty constraint |
|---|---|---|---|---|---|---|
| g · About | "People." and the team grid | H1 "People." · "Not a call center. A team of specialists who've done this before." · "Meet the Team" → `#leadership` · "Our Culture" → `/careers` | H1 letters rise; grid cards stagger | Cards drift at 0.9×/1.1× in alternating columns | Card lifts −8px, desaturated → color, lime border glow | **Real people only.** The grid renders from `content/company.ts` `leadership` (gated); until it's filled, "Meet the Team" becomes "How we work" and the grid shows the principles instead. No stock or AI faces. |
| h · How it works | "The Timeline": 01–05, line draws | "From Brief to Done. Five Steps." · "No black boxes. No 47-email threads. A clear path." · "Start Step 1" (scrolls to step 1) | Steps pop as the line reaches them | **Pinned**: vertical SVG line scrubbed through five phases (replaces the 9.2 progress bar) | Phase hover highlights its deliverables | Phases from `content/process.ts` (existing) |
| i · Case studies | "The Proof": a slow zoom behind minimal text | "Results. Not Promises." · "See what happens when operations stop being a bottleneck." · "Browse Case Studies" → `#studies` | Text rises; "scroll to explore" pulses (stops after 3 cycles) | Background zoom tied to scroll, not a 20s auto-loop (WCAG 2.2.2) | — | With no permissioned studies, the CTA scrolls to the honest empty state (M2b) |
| j · Contact | "The Signal": radar ping from a point | "Let's Talk." · "Tell us what's broken. We'll tell you how we fix it." + reply promise from `siteConfig.replySla` | Rings expand from the send point 3×, then rest | Rings compress as the form arrives | Ping origin follows the pointer ≤20px | The reply time comes from `siteConfig.replySla` (currently "4 business hours", VERIFY), not a hard-coded "24-hour", so the site never states two different SLAs |
| k · Careers | "The Open Door": a lime entry shape | "Build the Machine With Us." · "We're hiring operators, builders, and thinkers." · "See Open Roles" → `#roles` | Door shape swings open (rotateY 0→−35°, perspective) | Door opens further with scroll | Door tracks pointer ≤6° | Roles from the ATS only (M2c) |

---

## §4 Scroll animation system

Engine: [`components/motion/scroll-reveal.tsx`](../../components/motion/scroll-reveal.tsx), one instance in the layout, re-scanned per route.

| Attribute | From → to | Notes |
|---|---|---|
| `data-reveal` | y 48, opacity 0 → 0, 1 | Default block |
| `data-reveal="text"` | + blur 8px → 0 | Headings ("materialize"); used by `SectionHeader` H2s |
| `data-reveal="card"` | y 80, opacity 0 → 0, 1 | Every `.surface` card |
| `data-reveal="stagger"` | children y 60 → 0, 0.09s | Lists that arrive as lists |
| `data-reveal="fade"` | opacity 0 → 1 | Tables, figures that must not move |
| `data-parallax="0.5"` | yPercent ±speed×12, scrubbed | Background layers (footer wordmark 0.4) |
| `data-draw` | stroke-dashoffset 1 → 0, scrubbed | SVG lines with `pathLength="1"` ([`section-divider.tsx`](../../components/motion/section-divider.tsx)) |

Rules: siblings entering together are batched (`ScrollTrigger.batch`) and staggered 0.09s; reveals fire once at `top 85%`, power3.out over 0.8s. **The hidden state is applied by GSAP at runtime, only to elements still below the fold.** Content is never hidden by CSS, so a failed chunk leaves a normal page. Reduced motion: opacity only, 0.2s. `will-change` is set while moving and cleared after.

**Pinned section per page.** Homepage: "How it works" ([`components/home/process-pin.tsx`](../../components/home/process-pin.tsx)): pinned ≥1024px for 110% of the viewport, the connector `scaleX` 0→1 scrubbed, each step rising and its number lighting lime as the line reaches it; below 1024px, a staggered list (pinning fights the thumb). M5b/M5c pins: Accounting close checklist, How it works timeline, Recruitment pipeline (§3).

**Why not ScrollSmoother / Lenis:** native scrolling keeps keyboard, find-in-page, anchor links and assistive tech behaving, and costs no JS. The brief doesn't ask for smooth scrolling.

---

## §5 Micro-interactions

Hover states are CSS transitions in [`styles/motion.css`](../../styles/motion.css): they're seen dozens of times per visit, and CSS transitions are interruptible and run off the main thread. Pointer followers are GSAP. All hover rules sit behind `(hover: hover) and (pointer: fine)`.

| § | Pattern | Spec |
|---|---|---|
| 5a | Primary button (`.btn-primary`) | Ink fill sweeps in from the left (`clip-path: inset(0 100% 0 0)` → `inset(0)`, 320ms ease-out-expo), label turns lime (inverted), 1px lime inset edge, `scale: 1.03`, a white reflection crosses (750ms). Press: `scale: 0.98` in 80ms. |
| 5a | Ghost button (`.btn-ghost`) | Border → lime, 5% lime wash, arrow +4px (220ms). |
| 5b | Cards (`.surface`) | Lift −8px and deeper shadow (CSS `translate`, 360ms); content shifts −4px; 1px lime border draws around the card (SVG `rect pathLength=1`, stroke-dashoffset 1→0, 0.6s expo.out, injected on first hover); 3D tilt toward the pointer ≤8° (`quickTo` rotationX/Y, perspective 900px); a lime glare follows the pointer (`--gx/--gy` via quickTo). GSAP owns `transform`, CSS owns `translate`, so they compose. |
| 5c | Nav links (`.nav-link`) | Underline `scaleX` 0→1 from the left, color → lime, 300ms power2.out; permanent on `aria-current="page"` and on the open Services trigger. Arrow text links (`.link-sweep`) draw an underline the same way. |
| 5d | Media (`.media-hover`) | Inner scale 1.05 over 0.4s, 10% lime wash, a label ("Read the case study") rises 12px from the bottom. Also on keyboard focus. |
| 5e | Cursor | §2. |
| 5f | H2/H3 flicker | Two frames of lime/white channel split and a 1px jog over 300ms (`steps(1)`), hover only. |
| 5g | Magnetic (`data-magnetic`, optional px) | Within 80px of the element's **edge**, pulled toward the pointer proportionally, capped at 12px; released with `elastic.out(1, 0.55)` over 0.9s. Used on hero CTAs and back-to-top. |

---

## §6 Atmosphere

See §2 (Atmosphere). The `<body>` background is transparent so the fixed layer at `z-index: -1` shows; the canvas color comes from `<html>`. Sections with their own surfaces (Steel, Paper, slabs) still cover it.

---

## §7 Special components

| § | Component | File | Notes |
|---|---|---|---|
| 7a | Stat counter | [`components/home/count-up.tsx`](../../components/home/count-up.tsx) | Server renders the final value (SEO, no-JS, screen readers). Below the fold it resets to 0 and counts to target on enter (1.5s, power2.out, tabular digits); the suffix pops in (scale 0.4→1, expo.out). **Numbers come only from `content/proof.ts`.** The brief's "500+ Projects / 98% Retention / 12 Countries / 24hr" are not verified, so the stats band stays hidden until real, sourced figures are entered (honesty gate, AGENTS.md). Review it with sample data at `/design-system/home-preview`. |
| 7b | Marquee | [`components/motion/marquee.tsx`](../../components/motion/marquee.tsx) | Two identical tracks, GSAP x loop at a constant 60px/s; hovering eases `timeScale` 1→0 over 0.5s; scroll velocity speeds it up (≤5×), then it settles. `aria-hidden` (its words are real content elsewhere). |
| 7c | Glitch text | [`components/motion/glitch-text.tsx`](../../components/motion/glitch-text.tsx) | RGB-split slices from `data-text`, 360ms `steps(1)`, on hover or once on load. **No 4-second loop:** auto-repeating flashes need a pause control (WCAG 2.2.2), and a headline that keeps glitching reads as a broken screen. |
| 7d | Tilt card | §5b | Delegated, so every `.surface` (and `Card interactive`) gets it with no per-card JS. |
| 7e | Progress | §2 | |
| 7f | Section divider | [`components/motion/section-divider.tsx`](../../components/motion/section-divider.tsx) | 1px lime line + node, drawn by scroll (`data-draw`). |

---

## §8 Performance, accessibility, roadmap

**Budget.** GSAP core + ScrollTrigger is ~38 KB gzip: over the brief's 30 KB for animation JS. Plugins (Flip, SplitText, ScrollSmoother) are not used, so it can't be cut without dropping ScrollTrigger. It's loaded by dynamic `import()` from [`lib/motion/gsap.ts`](../../lib/motion/gsap.ts), so it isn't render-critical: `tests/e2e/budgets.spec.ts` (≤200 KB in the HTML) still passes, and Lighthouse's script total, which counts it, was raised from 240 KB to 300 KB (calculator: 255 → 315 KB) for exactly this chunk plus the motion components. With it, the homepage scores Performance 96 / Accessibility 100 / Best Practices 100 / SEO 100, LCP 0.7s, CLS 0 (desktop preset, local run).

**Guards.**
- `useGsap` ([`lib/motion/use-gsap.ts`](../../lib/motion/use-gsap.ts)): async engine, `gsap.context` + revert on unmount, re-run when reduced motion flips. `useReducedMotion` is re-exported from it.
- Transform and opacity only. The exceptions are bounded: `filter: blur` on hero words for 0.9s, `stroke-dashoffset` on 1px lines, `clip-path` on a button.
- Every loop is decorative, slow, stops off-screen or with the tab, and is off with reduced motion.
- No `opacity` between 0 and 1 at rest on text. That keeps axe and Lighthouse contrast checks honest.

**Reduced motion** (`prefers-reduced-motion: reduce`): no preloader, curtain, cursor, magnets, tilt, loops or parallax. Reveals become 0.2s opacity fades. The hero is a still frame. Hover color/border feedback stays.

**Roadmap.**
1. **M5a (done):** tokens, engine, preloader, curtain, cursor, atmosphere, progress, reveal engine, pointer surfaces, magnets, buttons/nav/media/heading micro-interactions, counter, marquee, glitch, divider, header/menu/footer, newsletter (gated), homepage Engine Room hero + pinned process.
2. **M5b:** service heroes 3b–3f (Web, Recruitment, VA, Accounting, Legal), each with its pinned narrative; Legal's serif face.
3. **M5c:** About, How it works, Case studies, Contact, Careers heroes (3g–3k) and their per-page scroll configs.
4. **M5d:** a Lighthouse pass across all routes on throttled mobile; `prefers-reduced-data` handling for the canvas; field-test the cursor on Safari/Firefox.
