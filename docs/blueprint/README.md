# Akrostech — Website Redesign Blueprint (v1.0)

> **Scope:** full brand system, information architecture, page-by-page wireframe blueprints with production copy, conversion strategy, component spec, accessibility rules, tech stack, and starter code for akrosstech.com.
> **Status:** Ready for design (Figma) and engineering kickoff.
> **Owner:** Akrostech Marketing · **Date:** 2026-10-16

---

## The one-sentence strategy

**Akrostech's site has to do the opposite of what bad outsourcing does: show the work instead of promising it.**

Every section of this blueprint applies that principle. Our buyers (CTO, CFO, COO, owners at $10M–$500M companies) have been sold "dedicated teams" and "seamless delivery" before, and the vendor went quiet three months in. They don't believe adjectives, but they do believe:

1. **Specifics.** Named SLAs, response times, named tools, named roles, real numbers.
2. **Visibility.** Evidence they will be able to *see* what we're doing at any time.
3. **Restraint.** A calm, fast, precise site reads as a calm, fast, precise operator.

The visual language (black canvas, a single electric-lime accent, dense typography, motion that shows systems working) exists to make those three things land in under 3 seconds.

---

## Document map

| # | Section | File |
|---|---------|------|
| A | Brand & Visual Design System | [`01-brand-design-system.md`](./01-brand-design-system.md) |
| B | Site Architecture (Sitemap + Navigation) | [`02-sitemap.md`](./02-sitemap.md) |
| C | Page-by-Page Wireframe Blueprints (12 pages, full copy) | [`03-page-blueprints.md`](./03-page-blueprints.md) |
| D | Hero Section Concepts (3) | [`04-hero-concepts.md`](./04-hero-concepts.md) |
| E | Trust & Credibility Strategy | [`05-trust-credibility.md`](./05-trust-credibility.md) |
| F | CTA & Conversion Strategy | [`06-cta-conversion.md`](./06-cta-conversion.md) |
| G | Component Library Spec | [`07-component-library.md`](./07-component-library.md) |
| H | Responsive & Accessibility | [`08-responsive-accessibility.md`](./08-responsive-accessibility.md) |
| I | Tech Stack Recommendation | [`09-tech-stack.md`](./09-tech-stack.md) |
| K | Motion System (M5: GSAP engine, preloader, transitions, heroes) | [`11-motion-system.md`](./11-motion-system.md) |
| J | Starter Code (Hero) | [`10-starter-code.md`](./10-starter-code.md) · live file: [`/starter/hero.html`](../../starter/hero.html) |
| — | Design tokens (CSS) | [`styles/tokens.css`](../../styles/tokens.css) |

---

## Non-negotiables (summary)

- **Colors:** Volt Lime `#A3E635` + Ink Black `#0A0A0A` anchor everything. Lime is a *signal* color: never more than ~8% of any viewport's pixels.
- **Lime never sits on white as text** (1.44:1, fails WCAG). On light surfaces, use Volt Ink `#4D7C0F` (4.78:1) or `#3F6212` (6.78:1).
- **One accent rule:** no per-service color coding. Services are distinguished by glyph, number, and copy, not hue. (Linear/Vercel discipline; color is reserved for meaning.)
- **Copy bans:** synergy, best-in-class, end-to-end, leverage/leveraging, seamless, cutting-edge, world-class, one-stop shop, solutions (as a noun on its own), "we deliver excellence."
- **Imagery bans:** handshakes, headset-wearing smiling agents, globes with connection lines, people pointing at whiteboards, stock "diverse team laughing at laptop."
- **Honesty gates:** every stat, client logo, testimonial and certification in this document marked `[VERIFY]` or `[SAMPLE]` must be replaced with a real, documented one before launch. Fabricated proof on a live site is an FTC (16 CFR Part 465, effective 2024) and reputational liability. Skeptical buyers check.
- **Regulated-service guardrails:** Legal Assistance copy must say we are not a law firm and work under the direction of the client's counsel. Accounting Assistance copy must not imply CPA attestation or audit services unless a licensed CPA entity performs them.

---

## Delivery milestones (recommended)

| Milestone | Weeks | Output |
|---|---|---|
| M0 · Foundations | 1–2 | Tokens, type, grid, Figma component library (Section A + G) |
| M1 · Core pages | 3–5 | Homepage, Services hub, 5 service pages, Contact (Phase 1 high-fidelity) |
| M2 · Proof pages | 6–7 | About, Process, Case Study template + 1 case study, Careers |
| M3 · Build | 5–10 (overlaps) | Next.js build, Sanity schemas, forms, calculator, analytics |
| M4 · QA & launch | 11–12 | Accessibility audit, CWV tuning, redirects from old site, spam-content purge + Search Console reconsideration |
| Phase 2 | Post-launch | Resources hub, cost calculator v2, industry pages, comparison pages, client portal login |
