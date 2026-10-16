# I · Tech Stack Recommendation

> Selection criteria, in order: **(1) security** (the old site was compromised; we must eliminate that attack surface), **(2) performance** (speed is a trust signal to technical buyers), **(3) motion fidelity** (the design depends on it), **(4) marketing autonomy** (non-developers must publish case studies without a deploy), **(5) cost of ownership**.

---

## I1. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | **Next.js 16 (App Router) + React 19 + TypeScript (strict)** | Static generation + ISR gives a CDN-served, mostly-static site with no runtime server or plugin layer to exploit, unlike WordPress, which is the most common target of the spam-injection attacks that hit the current site. React Server Components keep client JS small. It's the stack CTOs recognize and respect. |
| **Styling** | **Tailwind CSS v4** + CSS custom-property tokens (`tokens.css`) | Tokens are defined once and mapped via `@theme`; no runtime CSS-in-JS cost. Easy theming (dark/light/paper). |
| **Components** | **shadcn/ui** (Radix primitives), restyled | Accessible primitives (Dialog, NavigationMenu, Tabs, Accordion, Select) and code we own, with no black-box UI library. |
| **Motion** | CSS keyframes by default (M0 hero uses none of the libraries below). **Motion (formerly Framer Motion)** only where springs/layout animation earn their ~45 KB, loaded per route, + **GSAP 3 (ScrollTrigger)** for the 2–3 scroll-scrubbed narratives | Motion handles springs, layout and presence animation declaratively; GSAP is still the most robust choice for scrubbed, pinned scroll timelines. Both are loaded only on routes that need them (dynamic import). CSS handles the simple stuff (hover, marquee). |
| **3D** (Concept 2 / About only) | Spline export **or** React Three Fiber, lazy-loaded with AVIF poster | Never on the critical path; disabled on mobile and with reduced motion. |
| **Icons** | `@phosphor-icons/react` (tree-shaken, SSR-safe imports) | Section A8. |
| **Fonts** | `next/font/google`: Bricolage Grotesque, Inter, JetBrains Mono | Self-hosted at build, preloaded, no CLS. |
| **CMS** | **Sanity** (see I2) | Structured content for case studies, testimonials, team, jobs (fallback), articles. |
| **Forms** | Server Actions + **Zod** + react-hook-form, **Cloudflare Turnstile**, honeypot, rate limiting (Upstash Redis) | Server-validated, spam-resistant, no third-party form SaaS holding lead data. |
| **Email** | **Resend** + React Email | Transactional emails from a named human sender; SPF/DKIM/DMARC aligned. |
| **CRM** | **HubSpot** (Free/Starter → Pro) via API | Lead routing, sequences, attribution. |
| **Scheduling** | **Cal.com** (embed + API for "next available") | Open-source, routing forms, round-robin across service leads. |
| **ATS** | Ashby / Greenhouse / Lever job board API | Careers list fetched at build + ISR. |
| **Analytics** | **PostHog** (EU or US cloud, cookieless mode until consent) + Vercel Speed Insights | Product-style funnels, session replay (masked), feature flags for hero A/B tests. |
| **Consent** | Lightweight custom banner or Cookiebot; Google Consent Mode v2 if any Google tags | GDPR/CCPA. |
| **Search/SEO** | Next.js Metadata API, `next-sitemap`, JSON-LD (Organization, Service, FAQPage, BreadcrumbList, Article, JobPosting) | Rich results, plus `llms.txt` for AI search engines. |
| **Testing** | **Vitest** + Testing Library (unit/components), **Playwright** (E2E + axe-core a11y), **Lighthouse CI** (perf budgets), Chromatic/Storybook (visual regression) | Every PR gated. |
| **Quality** | ESLint (next/core-web-vitals), Prettier, TypeScript strict, Husky + lint-staged, Renovate | |
| **Hosting** | **Vercel** (Pro) | Edge CDN, ISR, preview deployments per PR (stakeholders review real pages), image optimization, instant rollbacks. |
| **DNS / security edge** | **Cloudflare** DNS (DNSSEC) in front of Vercel or Vercel DNS; WAF rules optional | Domain protection after the compromise. |
| **Monitoring** | Sentry (errors), Better Stack / Checkly (uptime + synthetic form submission test every 15 min) | A broken contact form is a silent revenue leak. |

### Alternative considered: Webflow
Webflow (Enterprise or CMS plan) is a credible option if the team has **no developer** and wants visual editing. **Why not primary:** the hero Ops Feed, calculator, scroll-scrubbed process and HubSpot/Cal.com routing logic all require custom code that becomes brittle in Webflow; performance tuning is limited; and the result would feel less "engineered," which matters when Web Development is one of the services we sell. **The site itself is our web-development portfolio piece.** Build it like one.

### Alternative considered: WordPress
**Rejected.** The current site's spam injection is the textbook WordPress plugin/theme compromise. Rebuilding on WordPress would re-create the attack surface. (If WordPress is ever required, use it headless only.)

---

## I2. CMS: Sanity

**Why Sanity:** schema-as-code (typed, versioned in Git alongside the site), real-time collaborative Studio, excellent image pipeline (hotspot cropping for the duotone treatments), GROQ queries, a generous free tier, and Visual Editing/Presentation mode so marketing can click on a page preview to edit it. Contentful is the enterprise alternative if procurement prefers it; Payload CMS if self-hosting is a requirement.

**Content model (Phase 1):**

| Document | Key fields |
|---|---|
| `caseStudy` | title, slug, client (ref), services[] (ref), industry (ref), heroStats[{value, label, before, after}], snapshot{size, duration, team[], tools[]}, situation (Portable Text), approach (PT), results[], quote (ref testimonial), whatsNext (PT), heroImage (with duotone flag), seo{}, publishedAt, **permissionConfirmed (boolean, required to publish)** |
| `client` | name, logo (SVG), logoPermission (file + date), industry, size, website |
| `testimonial` | quote, person{name, title, photo}, client (ref), services[], verifiedUrl, **permissionConfirmed** |
| `service` | name, slug, number, outcomeLine, hero{}, metrics[], scope[], limits[], timeline[], tools[] (ref), roles[], slas[], faqs[] (ref), related[] |
| `teamMember` | name, role, bio, previously[], photo, linkedin, isLeadership |
| `faq` | question, answer (PT), tags[] |
| `tool` | name, logo, category |
| `stat` | value, suffix, label, methodologyNote, lastVerified (date), **source (required)** |
| `page` (generic) | modular sections array for About, Careers, legal pages |
| `siteSettings` | nav, footer, contact info, response-time SLA text, badges[] |
| `post` (P2) | Field Notes articles |

Editorial guardrails built into the schema: case studies and testimonials **cannot be published** without `permissionConfirmed = true`; stats require a `source` and show a Studio warning when `lastVerified` is more than 6 months old. That enforces the honesty rules from Section E.

---

## I3. Performance targets

### Core Web Vitals (p75, mobile, field data via CrUX/Vercel Speed Insights)

| Metric | "Good" threshold | **Akrostech target** |
|---|---|---|
| LCP | ≤ 2.5s | **≤ 1.8s** (H1 text is the LCP element) |
| INP | ≤ 200ms | **≤ 150ms** |
| CLS | ≤ 0.1 | **≤ 0.05** |
| TTFB | ≤ 800ms | **≤ 200ms** (static/ISR from edge) |
| FCP | ≤ 1.8s | **≤ 1.2s** |

### Lab budgets (Lighthouse CI, enforced in PRs; fail the build if exceeded)

| Budget | Limit |
|---|---|
| Lighthouse Performance (mobile, simulated 4G) | ≥ 95 |
| Lighthouse Accessibility / Best Practices / SEO | 100 / 100 / 100 |
| Homepage JS (compressed transfer, first load) | ≤ 200 KB *(revised in M0: the Next.js 16 + React 19 runtime alone is most of this; measured 197 KB gzip in M0 after removing the animation library from the hero. Page code must fit in what remains)* |
| Homepage total transfer (first load) | ≤ 600 KB |
| Fonts | ≤ 3 families, ≤ 110 KB total WOFF2 (subset) |
| Hero LCP image (if any) | ≤ 120 KB AVIF |
| Third-party scripts before interaction | 0 (analytics deferred; Cal.com/chat loaded on intent) |

### Techniques
- Static generation for all marketing pages; ISR (revalidate on Sanity webhook) for content.
- RSC by default; `"use client"` only on interactive islands (Ops Feed, calculator, menus, forms).
- Motion/GSAP dynamically imported per route; animations limited to `transform`/`opacity`.
- `next/image` with AVIF, explicit dimensions, `priority` only on the LCP image (if one).
- `content-visibility: auto` on long below-fold sections; `loading="lazy"` on below-fold iframes (Cal.com) with facade placeholders.
- Preconnect only to essential origins; no render-blocking third parties.
- Security headers: strict CSP (nonces), HSTS preload, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`; `frame-ancestors 'none'`.

---

## I4. Project structure (Phase 1)

```
akrostech-web/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                      # Homepage
│   │   ├── services/
│   │   │   ├── page.tsx                  # Services hub
│   │   │   └── [slug]/page.tsx           # Service detail (from Sanity)
│   │   ├── how-it-works/page.tsx
│   │   ├── work/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── about/
│   │   │   ├── page.tsx
│   │   │   └── security/page.tsx
│   │   ├── careers/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── contact/
│   │   │   ├── page.tsx
│   │   │   ├── actions.ts                # Server Action: validate, Turnstile, HubSpot, Resend, Slack
│   │   │   └── thank-you/page.tsx
│   │   ├── resources/back-office-calculator/page.tsx
│   │   └── legal/[slug]/page.tsx
│   ├── studio/[[...tool]]/page.tsx       # Embedded Sanity Studio (auth-protected)
│   ├── api/revalidate/route.ts           # Sanity webhook (signature-verified)
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                               # shadcn primitives (button, dialog, tabs…)
│   ├── marketing/                        # OpsFeed, VoltSlab, ServiceCard, Stat, LogoMarquee…
│   └── layout/                           # SiteHeader, MobileNav, SiteFooter
├── lib/
│   ├── sanity/ (client.ts, queries.ts, image.ts)
│   ├── calculator/ (model.ts, model.test.ts)
│   ├── validation/ (contact-schema.ts, contact-schema.test.ts)
│   └── integrations/ (hubspot.ts, resend.ts, slack.ts, turnstile.ts, cal.ts)
├── sanity/schemas/                       # Content model (I2)
├── styles/ (tokens.css, globals.css)
├── tests/e2e/ (contact.spec.ts, a11y.spec.ts, navigation.spec.ts)
├── redirects.ts                          # Legacy 301s + spam 410s
├── proxy.ts                              # 410 responses for spam URL patterns (Next 16 renamed middleware → proxy)
├── .env.example
└── lighthouserc.json
```

`.env.example` (Phase 1):

```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=
SANITY_REVALIDATE_SECRET=

# Forms & anti-spam
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Integrations
HUBSPOT_PRIVATE_APP_TOKEN=
RESEND_API_KEY=
LEADS_FROM_EMAIL="Akrostech <hello@akrosstech.com>"
SLACK_LEADS_WEBHOOK_URL=
CAL_API_KEY=
NEXT_PUBLIC_CAL_LINK=akrostech/scoping-call
ATS_PROVIDER=ashby            # ashby | greenhouse | lever (as built, M2c)
ATS_BOARD=akrostech
NEXT_PUBLIC_TALENT_POOL_URL=

# Analytics & monitoring
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
SENTRY_DSN=

# Site
NEXT_PUBLIC_SITE_URL=https://akrosstech.com
```
