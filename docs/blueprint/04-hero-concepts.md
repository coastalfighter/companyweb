# D · Homepage Hero Concepts

Three distinct directions. **Concept 1 is recommended** and is the one built in the starter code (Section J).

Shared constraints for all three:
- The H1 is readable and the primary CTA is visible within **1.0s** (no animation gates the content; motion only enhances).
- LCP element = the H1 text (not an image), so LCP stays < 1.5s.
- The ops/visual layer is decorative-plus-informative and announced politely to screen readers (or hidden, with an equivalent text summary).

---

> **M5 (built):** the homepage now uses "The Engine Room" (H1 "Your Back Office. Rebuilt."), specified in [`11-motion-system.md`](./11-motion-system.md) §3a at the owner's direction. The Ops Feed below remains the reference for the operations visual and the starter file.

## D1. Concept 1: "The Ops Feed" ⭐ Recommended

**Headline:** We run the parts of your business nobody sees.
**Subheadline:** Akrostech is the operations team behind growing companies. Engineering, hiring, admin, finance, and legal work, delivered by dedicated specialists on timelines you can audit.
**CTAs:** `Book a 20-minute call →` (primary) · `See what it would cost` (ghost)
**Reassurance line:** Live in 10 business days · No long-term lock-in · NDA before the first call

### What the user sees above the fold
- Black canvas with a barely visible 12-column grid (vertical hairlines at 40% of `--ink-600`) and a soft lime radial glow behind the right half.
- **Left:** the eyebrow `● OPERATIONS, HANDLED` (pulsing lime dot), the 88px, three-line H1 with "nobody sees" in the volt text gradient, the sub, two buttons and the reassurance line.
- **Right:** a product-grade "Ops Feed" panel (`akrostech / ops · this week`) with filter tabs and a live stream of completed tasks across all five services, each with a service tag, a timestamp and a lime check. One row is "in review" with an Ion half-circle, which makes it honest rather than too perfect. The panel footer reads `38 tasks completed today · median turnaround 3h 41m`.
- Below the fold line, the top of the logo bar peeks in (signals "there's more" and starts proof early).

### Load animation (total 1.8s, all transform/opacity)
| t (ms) | Element | Motion |
|---|---|---|
| 0 | Grid lines | Fade in 0 → 40% over 600ms |
| 0 | H1 | Already rendered (LCP); each line rises 12px → 0 with opacity 0 → 1, 80ms line stagger, 600ms `ease-out-expo` |
| 200 | Sub + CTAs | Fade + 8px rise, 500ms |
| 350 | Ops panel | Scales 0.98 → 1 and fades in, 700ms; lime glow blooms 0 → 14% |
| 600–1400 | Feed rows | Enter one by one from bottom (40ms stagger) |
| 1800+ | Feed (idle) | Every 3.2s a new task row slides in at top, oldest drops off; one "in review" row flips to ✓ every ~10s; the "tasks completed" counter ticks +1 |
| Hover | Panel | Pointer-tilt ≤ 3°, glow follows pointer (desktop only) |

Reduced motion: static panel with 6 rows, no ticking, no tilt.

### Why it works for our audience
- **It shows instead of tells.** Every outsourcing site *says* "transparency." This one opens with a live log of work, which is the exact artifact a CFO or COO wants to see from a vendor.
- **It covers all five services in one glance** without a cluttered 5-icon row: the service tags in the feed do the cataloguing.
- **It speaks the CTO's visual language** (product UI, mono timestamps, filter tabs), the Linear/Vercel aesthetic they already trust.
- **"Nobody sees" reframes outsourcing** from "cheap labor" to "invisible infrastructure," which matches how a $200M company thinks about its back office.
- **The one imperfect row** ("in review") is a subtle credibility device: real ops dashboards are never 100% green.

---

## D2. Concept 2: "Five Layers"

**Headline:** Five departments. One contract. Zero babysitting.
**Subheadline:** Web, hiring, admin, finance and legal ops, run by senior specialists who work inside your tools and report to you every Friday.
**CTAs:** `Book a scoping call →` · `Explore the five teams ↓`

### What the user sees
- Centered composition. Below the headline, a **3D isometric stack of five matte-black slabs** (rendered in Spline / React Three Fiber), each slab edge-lit by a thin lime line, each engraved with a service name in small caps: `WEB · HIRING · ASSISTANCE · FINANCE · LEGAL`.
- The stack sits on a faint reflective floor with a soft lime underglow, like a server rack seen from an architect's viewpoint.

### Load animation
- Slabs drop into place one by one from 40px above (spring, 120ms stagger), each landing with a subtle lime edge flash.
- On scroll (scrubbed over the first 600px), the stack **explodes vertically**: slabs separate and each label expands into a one-line outcome ("Books closed by BD5"). This transitions directly into the Services section.
- Hover on a slab (desktop): it lifts 8px and its label turns lime; click → service page.

### Why it works
- It gives an **architectural metaphor for "backbone"**: we are the layered infrastructure under the company.
- "Zero babysitting" names the #1 fear of burned buyers (managing the vendor) and dismisses it in two words.
- **Trade-offs:** heavier (3D scene ≈ 250–400KB, needs a static AVIF poster for LCP and low-end devices), and less immediately *informative* than Concept 1. Best if the brand wants a more iconic, campaign-style first impression.

---

## D3. Concept 3: "Get Your Tuesdays Back"

**Headline:** Get your Tuesdays back.
**Subheadline:** The average executive loses 11 hours a week to work someone else should be doing. [VERIFY] We take that work, from payroll to pull requests, so your team can do the job you hired them for.
**CTAs:** `Book a 20-minute call →` · `Calculate your hours back`

### What the user sees
- Copy is centered top; below it is a full-width **week-view calendar** (Mon–Fri, 8am–6pm) in product-UI style, absolutely crammed with gray task blocks: "Screen 40 resumes," "Reconcile Amex," "Fix contact form," "Chase W-9," "Redline vendor NDA," "Reschedule board prep."
- Tuesday's column is highlighted.

### Load animation
- After 600ms, the blocks begin **lifting off the calendar** (in staggered 60ms waves) and sliding into a narrow right-hand lane labeled `Akrostech`, where each gets a lime ✓ and the service tag.
- What remains on the calendar are a few lime-outlined blocks: "Strategy," "Customer calls," "Roadmap review."
- A counter in the corner ticks: `Hours returned this week: 0 → 11.5`.
- Reduced motion: shows the "after" state directly, with a toggle "See before."

### Why it works
- It's **visceral and personal**: every COO and CFO recognizes their own calendar. It turns an abstract service into a felt benefit (time).
- The "hours returned" counter **bridges naturally to the calculator CTA**.
- **Trade-offs:** the headline is more playful (great for paid social / LinkedIn landing pages, slightly less "enterprise" on first read). Recommended as the **campaign landing page hero** (`/lp/tuesdays`) and as an A/B challenger to Concept 1 after launch.

---

## Recommendation summary

| | Concept 1 · Ops Feed | Concept 2 · Five Layers | Concept 3 · Tuesdays |
|---|---|---|---|
| Trust signal strength | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| Clarity of offer | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Memorability | ★★★★☆ | ★★★★★ | ★★★★★ |
| Performance cost | Low (HTML/CSS) | High (3D) | Medium (DOM animation) |
| Best use | **Homepage** | Brand campaign / About | Paid-traffic landing page, A/B challenger |
