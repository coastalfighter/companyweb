<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Akrostech project rules

- The spec is `docs/blueprint/`. Design decisions there (colors, type, copy, component states) are not up for re-litigation in code; change the doc first if a decision changes.
- Tokens live in `styles/tokens.css`. Use semantic utilities (`bg-surface-1`, `text-fg-muted`, `border-line`, `bg-accent`) before raw palette ones. Never put lime (`volt-500`) text on a light surface: use `text-accent-text`.
- Cache Components is on: no `new Date()`, `Math.random()` or request data in server components without `"use cache"` or a client boundary.
- Links to routes that don't exist yet use `prefetch={prefetchFor(href)}`; add new routes to `liveRoutes` in `lib/site.ts`.
- Keep the homepage JS budget (`lighthouserc.json`). Prefer CSS animation; justify any animation library per route.
- Every stat, logo, testimonial or certification shown must be real and permissioned (`[VERIFY]` / `[SAMPLE]` in the blueprint).
- Before pushing: `npm run check`, then `npm run build && npm run test:e2e`.
