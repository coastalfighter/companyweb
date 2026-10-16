# Akrostech website

Marketing site for Akrostech. The design and content spec lives in [`docs/blueprint/`](docs/blueprint/README.md).

**Status:** M0 (foundation) complete. The homepage hero is live; the remaining pages follow the milestones in [`docs/blueprint/10-starter-code.md`](docs/blueprint/10-starter-code.md#j3-next-steps-build-milestones).

## Stack

Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Radix primitives (shadcn-style, owned in `components/ui`) · Phosphor icons · Vitest + Testing Library · Playwright + axe-core · Lighthouse CI.

## Getting started

Requires Node.js ≥ 20.9 (CI uses 22).

```bash
npm ci
cp .env.example .env.local   # only NEXT_PUBLIC_SITE_URL is needed for M0
npm run dev                  # http://localhost:3000
```

Internal component gallery: http://localhost:3000/design-system (not indexed).

## Scripts

| Command                       | What it does                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`                 | Dev server                                                                       |
| `npm run build` / `npm start` | Production build / serve it                                                      |
| `npm run check`               | Lint + typecheck + format check + unit tests (run before every push)             |
| `npm test`                    | Unit and component tests (Vitest)                                                |
| `npm run test:e2e`            | E2E + accessibility tests against a production build (run `npm run build` first) |
| `npm run lhci`                | Lighthouse CI with performance, accessibility and bundle budgets                 |
| `npm run format`              | Prettier (sorts Tailwind classes)                                                |

CI (`.github/workflows/ci.yml`) runs all of the above on every pull request.

## Project structure

```
app/                     Routes (layout, homepage, 404, robots, sitemap, /design-system)
components/
  ui/                    Base components: Button, Badge, Card, Eyebrow, Field, Input, Textarea
  layout/                SiteHeader, SiteFooter, Container, Logo, SkipLink
  marketing/hero/        Homepage hero + Ops Feed (pure state logic in ops-feed-data.ts)
hooks/                   usePrefersReducedMotion
lib/                     cn(), site config, live-route registry
styles/tokens.css        Design tokens (source of truth) mapped to Tailwind utilities
tests/e2e/               Playwright specs (behavior, security headers, axe)
docs/blueprint/          Redesign blueprint (sections A–J)
starter/hero.html        Standalone HTML prototype of the hero
```

## Decisions made in M0

- **Dark-first, no OS auto-switch.** Light mode is opt-in (`data-theme="light"` or `.theme-paper`). See blueprint A1.7.
- **No animation library on the homepage.** The Ops Feed uses CSS keyframes; removing Motion cut homepage JS from ~241 KB to ~197 KB gzip. The JS budget was revised to 200 KB (blueprint I3), since the Next.js + React runtime is most of it.
- **LCP-safe headline.** The H1 animates with transform only, never from opacity 0, so it counts as painted on the first frame.
- **Static CSP without nonces** (keeps pages on the CDN). `script-src` still allows `'unsafe-inline'`; the hardening path is Next's experimental SRI. See `next.config.ts`.
- **Links to unbuilt routes don't prefetch** (`prefetchFor()` in `lib/site.ts`), so visitors don't trigger 404 prefetches. `typedRoutes` is enabled once those routes exist (M1).

## Known gaps

- Logo is a placeholder mark: replace `components/layout/logo.tsx` and `app/icon.svg` with the official SVG.
- Hero numbers (38 tasks, 3h 41m) are illustrative and announced as an example; wire to real data or keep them framed that way.
- Mobile Lighthouse (simulated slow 4G) scores 91–96 between runs; desktop scores 100 on every category. Measured LCP locally equals first paint.
- `npm audit` reports advisories only in dev tooling (Lighthouse CI, shadcn CLI, eslint-config-next transitive deps); production dependencies have 0.
- Header has no mobile menu or Services mega-menu yet (M1a).
