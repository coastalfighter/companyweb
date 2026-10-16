---
name: design-md-library
description: Reference library of 84 DESIGN.md design-system analyses of real product websites (Vercel, Stripe, Linear, Airbnb, Notion, Apple, Figma and more), from voltagent/awesome-design-md. Each file holds color, typography, spacing and radius tokens plus layout, component and motion rules. Use when choosing a visual direction, when the user says "make it look like <site>", when building a DESIGN.md or design tokens for this project, or when comparing how leading sites handle heroes, nav, cards, pricing or type scale.
---

# DESIGN.md library

84 design-system write-ups of real websites, one per file in `references/`. `INDEX.md` lists every file with a one-line summary of its look. Source and pinned commit are in `../SOURCES.md`; license in `LICENSE`.

## How to use

1. **Pick candidates from `INDEX.md`.** Do not open every reference; read the index, shortlist two or three that match the brief (audience, tone, density, light or dark), and read only those.
2. **Read the YAML front matter first.** It carries the tokens: `colors`, typography, spacing, radii. The prose after it explains how they are applied — hero composition, nav, buttons, cards, motion, do and don't lists.
3. **Borrow the system, not the brand.** Use a reference for structure — type scale ratios, spacing rhythm, contrast strategy, component anatomy, how much decoration — and give this project its own palette, logo, typefaces and copy. Never reproduce another company's logo, product names, trademarked wording or exact signature colors on this site, so it can't be mistaken for that company.
4. **Write the result into this project's own `DESIGN.md`** at the repo root (same format: YAML tokens, then rules), then map the tokens to CSS variables / Tailwind theme. Combine references when useful, e.g. one site's type scale with another's spacing density.
5. **Check accessibility after adapting.** Changed colors must still meet WCAG AA contrast (4.5:1 body text, 3:1 large text and UI). The references describe the source sites; they are not a guarantee of compliance.

## Pairs well with

- `ui-ux-pro-max` and `design-system` for turning tokens into a full token architecture.
- `impeccable` and `taste-skill` for critiquing the adapted direction.
- `web-design-guidelines` for auditing the built UI.
