# Akrostech website

Marketing site for Akrostech. The design and content spec lives in [`docs/blueprint/`](docs/blueprint/README.md).

**Status:** M0 and M1a–M1d complete. Live: the homepage, the services hub, the five service pages and the contact flow, with the header, mobile menu, footer and mobile CTA bar; the remaining pages follow the milestones in [`docs/blueprint/10-starter-code.md`](docs/blueprint/10-starter-code.md#j3-next-steps-build-milestones).

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
app/                     Routes (layout, homepage, /services, /services/[slug], 404, robots, sitemap,
                         /design-system)
components/
  ui/                    Base components: Button, Badge, Card, Eyebrow, Field, Input, Textarea
  layout/                SiteHeader, ServicesMegaMenu, MobileNav, MobileCtaBar, SiteFooter,
                         Container, Logo, SkipLink
  home/                  Homepage sections (problem, services bento + vignettes, process, visibility,
                         proof, comparison, security, calculator teaser, FAQ)
  services/              Service page template (S1–S11) and services hub sections
  contact/               Contact form, Turnstile widget, thank-you content
  marketing/             VoltSlab (closing CTA), ServiceGlyph, SectionHeader
  marketing/hero/        Homepage hero + Ops Feed (pure state logic in ops-feed-data.ts)
content/proof.ts         VERIFIED proof only (logos, stats, testimonials, case study, certifications)
content/samples.ts       Sample proof for /design-system/home-preview only
lib/contact/             Contact pipeline: shared schema, server-side submission flow, integrations
                         (HubSpot, Slack, Resend, Turnstile), rate limiting, reply-time estimate
content/services/        Service page content, one typed file per service (Sanity-shaped)
hooks/                   usePrefersReducedMotion
lib/                     cn(), site config + navigation, services, live-route registry, calculator teaser model
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

## Decisions made in M1a

- **No menu libraries.** The desktop mega-menu is a hand-built disclosure (hover intent 150ms, 300ms close grace, Esc returns focus, closes on outside click / focus leaving / navigation). The mobile menu is the native modal `<dialog>` (browser-provided focus trap, Esc, inert background, focus return) with a native `<details>` accordion. Homepage script stayed at ~175 KB transferred, within the 200 KB budget.
- **One primary CTA in view.** The mobile bottom bar hides while the closing CTA slab or the footer is on screen (`data-cta-zone`).
- **Tertiary text never on menu surfaces.** Ink-300 on `surface-3` is 4.41:1 (fails AA); found by axe and added to the blueprint's contrast table.
- **No dead or unverified content.** Phase 2 footer links, certification badges, social icons and the mega-menu's response-time stat stay hidden until they're real (see blueprint B2.1/B2.5 "As built" notes).

## Decisions made in M1b

- **Proof is gated, not faked.** The logo bar, stats band and case study/testimonials only render when `content/proof.ts` has real data (it ships empty). Certifications only appear when flagged as held; the comparison table's security row adapts. Review the designs with sample data at `/design-system/home-preview`.
- **Almost no new JavaScript.** Vignettes, the process line, the dashboard hover-linking, the FAQ accordion (`<details name>`) and scroll reveals are CSS (plus a ~1 KB reveal observer). Client code added: calculator teaser, sample-report dialog, and (preview only) count-up + marquee.
- **System monospace font.** Dropped JetBrains Mono (32 KB per page); mobile Lighthouse went from 90–91 to 93–94.
- **Calculator teaser shows cost, not savings,** with its math on screen (blueprint F4 rules).
- **Two more contrast fixes from axe:** the mono badge on raised surfaces, and the scrollable dialog body is now keyboard-focusable.

## Integrations (contact form)

Every integration switches on when its keys are present (`.env.example`). A submission counts as sent only when **at least one** of HubSpot, Slack or the team notification email accepts it. With none configured, development logs the lead to the console; **production refuses and tells the visitor to email instead**, so a missing key can never hide lost leads behind a success screen.

| Integration          | Keys                                                                | What it does                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HubSpot (Forms API)  | `HUBSPOT_PRIVATE_APP_TOKEN`, `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID` | Creates/updates the contact with attribution. The HubSpot form must include these contact properties: `firstname`, `lastname`, `email`, `company`, `phone`, `message`, plus custom properties `akros_company_size`, `akros_services`, `akros_timeline`, `akros_nda_requested`, `akros_utm_source`, `akros_utm_medium`, `akros_utm_campaign`, `akros_calculator`, `akros_lead_source`. |
| Slack                | `SLACK_LEADS_WEBHOOK_URL`                                           | Posts the lead to `#new-leads` (user input escaped, so it can't ping channels).                                                                                                                                                                                                                                                                                                       |
| Resend               | `RESEND_API_KEY`, `LEADS_FROM_EMAIL`, `LEADS_NOTIFY_EMAIL`          | Team notification (reply-to = the lead), then a plain-text confirmation to the visitor from a named sender (best-effort; never fails the submission).                                                                                                                                                                                                                                 |
| Cloudflare Turnstile | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`            | Bot check, loaded only when the visitor first focuses the form.                                                                                                                                                                                                                                                                                                                       |
| Upstash Redis        | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`                | Rate limit (5 per IP per hour) shared across serverless instances; fails open if Upstash is down.                                                                                                                                                                                                                                                                                     |
| Cal.com              | `NEXT_PUBLIC_CAL_LINK`                                              | Shows "Book directly" on `/contact`. The inline embed comes later.                                                                                                                                                                                                                                                                                                                    |

Always on: a honeypot field (bots get a fake success and nothing is delivered), server-side validation with the same schema as the browser, and CR/LF stripping on anything that reaches an email header.

**Not yet automated** (blueprint F3.4): the DocuSign NDA is flagged in HubSpot/Slack/email for the team to send manually; the follow-up sequence lives in HubSpot.

## Decisions made in Phase 2a (compare, pricing)

- **`/compare/in-house-vs-akrostech` and `/compare/freelancers-vs-akrostech`** expand the homepage table (1.9) from one shared data module (`content/compare.ts`), so the three can't disagree (tested). Each page states the case for the alternative first ("Hire in-house when…"), in the same spirit as the calculator's candid verdicts. `/compare` lists both above the full table.
- **`/pricing`** is the engagement models, pricing FAQ and quote CTA, with no list prices (sitemap B1). Old `/prices` and `/rates` URLs 301 there.
- **Held back for content only Akrostech has:** industry pages (claims of sector experience need real clients behind them), the Field Notes blog and guides (articles to write), the Ops Readiness Scorecard (its benchmark needs real data), and the client-login redirect (needs the portal URL).

## Decisions made in M4c (analytics, error reporting)

- **No analytics until "Allow".** With `NEXT_PUBLIC_POSTHOG_KEY` set, a small non-blocking banner asks once; Global Privacy Control counts as "No thanks" and is never asked. PostHog (~100 KB) is a dynamic import that loads only after consent, so it never touches anyone else's JS budget. "Analytics settings" in the footer changes the choice, and withdrawing stops sending immediately.
- **Minimal by configuration:** localStorage persistence (still no cookies), no autocapture, session replay, surveys, heatmaps, feature flags or remote scripts, and no person profiles. Events are the F5 plan only (`cta_click`, `calculator_start` / `_complete` / `_pdf`, `form_start`, `form_field_error` with the field name, never its value, and `form_submit`), plus page views. CTA clicks come from one delegated listener, so no markup changed.
- **Verified in a real browser** with a test key: nothing contacted PostHog before consent; after "Allow" only its two hosts were contacted (now allowed by the CSP only when configured), with no cookies; after withdrawing, zero requests. That check also found a second PostHog storage key, now disclosed on the cookies page, which an E2E test keeps in sync with what the site really stores.
- **Server errors to Sentry** (`SENTRY_DSN`) through `instrumentation.ts` and a ~100-line envelope client instead of the SDK: error, route and path without the query string; never headers, cookies or bodies. Sentry and PostHog join the processor list automatically when configured.
- **Not built (needs an account):** uptime and a synthetic contact-form check every 15 minutes (Checkly / Better Stack, blueprint 09). Point it at `/contact` with `LEADS_LOG_ONLY` off and a test address you filter in HubSpot.

## Decisions made in M4b (trust center, legal pages)

- **`/about/security` and `/legal/*` (privacy, terms, cookies, DPA, accessibility)** are drafted from what this site actually does. The processor list is built from the integrations switched on in the environment, and the browser-storage table is tested against the storage keys in the code, so neither can drift.
- **Commitments wait for you.** Certifications (with auditor and report date), insurance, the vetting provider, incident-response timelines, client-data retention, hosting provider, status page and the legal entity live in `content/trust.ts` and ship empty. Their sections, and the terms' governing-law clause, appear only once filled in.
- **Claims were made true before publishing.** The accessibility statement promises pages work at 320px and at 200% zoom, so a test now checks every page at 320px and 640px. It found five pages that overflowed (two long button labels, three single-column grids, and the careers filter's hidden radios escaping their scroll container), all fixed. Known limitations (the untagged PDF, non-Latin names in it, third-party widgets) are stated, not hidden.

## Decisions made in M4a (edge hardening)

- **Old-site cleanup is code.** `lib/edge/rules.ts` holds the legacy 301 map (served from `next.config.ts` redirects, so it's cached and runs before anything else) and the spam patterns that `proxy.ts` answers with **410 Gone** + `X-Robots-Tag: noindex`: WordPress paths (`wp-*`, `xmlrpc.php`, `.php`, `.html`), date and taxonomy archives, `?p=` / `?s=` style queries, non-ASCII paths, and injected keywords. Keyword rules never fire inside the site's own sections, so a client called "Acme Pharma" can still have a case study.
- **Add your crawl export to `legacyRedirects`.** It's seeded with common equivalents (`/about-us`, `/case-studies`, `/privacy-policy`…); every legitimate URL from Screaming Frog and Search Console belongs there before launch.
- **Unknown slugs share one 404.** Unknown `/services/*` and `/work/*` slugs are rewritten to a single not-found path, closing the M1c gap where each random URL could leave its own cache entry.
- **Error pages:** a branded 500 inside the site chrome with a retry and the server-log reference (never the message), and an inline-styled `global-error` for root-layout failures.
- **Budget trade, made explicitly.** Real error boundaries cost every page about 1.6 KB, which pushed Lighthouse's total (it counts idle prefetches) over 240 KB. The calculator is now never prefetched (`prefetchFor`), an interactive tool that most visitors don't open, so every other page dropped to 228 KB. The calculator page itself gets a documented 255 KB Lighthouse cap (its own 14 KB tool chunk); the strict 200 KB render-critical test still covers it, at 175 KB.
- **`/.well-known/security.txt`** (RFC 9116, `Expires` recomputed daily so it can't lapse) and **`/llms.txt`**. Design-review pages also send `X-Robots-Tag: noindex, nofollow`.

## Decisions made in M3b (calculator report)

- **Downloaded, and emailed only when it really was.** `POST /api/calculator/report` (name + work email, optional company) returns the PDF for an immediate download and, with Resend configured, emails a copy. The page says which happened, never "sent to your inbox" when it wasn't.
- **The server does the math.** The request carries only the inputs; the server sanitizes them and recomputes with its own `content/rate-card.ts`, so a tampered request can't print other prices on an Akrostech-branded PDF.
- **Same guards as the contact form:** same-origin check, JSON only, 16 KB body cap, honeypot, 5 reports per IP per hour, Turnstile when configured, server-side validation. In production with no lead sink configured, the visitor still gets the report but lead details are kept out of the logs.
- **The lead goes where contact leads go:** HubSpot (same form; add the `akros_calculator` and `akros_lead_source` properties), Slack and the team inbox. Contact-form submissions now also carry the visitor's saved calculator inputs, re-validated and summarized server-side (`akros_calculator`).
- **PDF without font files:** pdf-lib with the standard Helvetica (server-only, nothing added to the browser bundle). Text outside Windows-1252 is transliterated where possible ("Ł" → "L") and otherwise shown as "?" rather than failing; non-Latin names are the known limitation.

## Decisions made in M3a (calculator)

- **No savings without a real rate card.** `content/rate-card.ts` ships `null`, so the live calculator shows today's fully loaded cost, the senior hours returned and the FTE, then offers a written quote. Once Akrostech approves hourly ranges per function, our cost, savings (as ranges), break-even and the comparison bars switch on. Review that view at `/design-system/calculator-preview` with a fictional card.
- **Candor is in the model, not the copy.** `lib/calculator/model.ts` returns a verdict: savings under 15% of today's cost are called small; when even our low rate costs more, the summary says an in-house hire might make more sense and gives the salary above which we'd become cheaper.
- **No guessed salaries.** Presets exist only for US/Canada (the blueprint figures, still to be checked against a cited salary guide). Elsewhere the visitor enters the salary, and every amount is in USD. Company size is optional and labelled as not changing the numbers.
- **Resume, don't track.** Inputs (never results or contact details) are saved to localStorage once the visitor changes something. Returning visitors see "Pick up where you left off" in the header, and "Start over" clears it. The homepage teaser hands its function and hours over in the URL.
- **Mobile is one step per screen** with a pinned results summary; the site-wide CTA bar stays off this page.
- **Bugs caught by tests:** the mobile grid column sized to its widest content and pushed the results card off-screen; a wrapper `<div>` broke the results' term/value pairing for screen readers.
- **JS budget held without raising caps.** Making the calculator a live route means its JS is prefetched from the header on every page. Lighthouse counts that, which put `/careers` over the 240 KB cap. Instead of raising the cap: the header's resume check moved to a tiny module so the cost model stays off other pages; the careers team filter became a radio group plus CSS `:has()` (no JS); and the employee-quote avatar uses a plain sized `<img>`, because Turbopack loads client code by import, not by what renders. Every audited page is now 236 KB.

## Careers (ATS)

Set `ATS_PROVIDER` (`ashby`, `greenhouse` or `lever`) and `ATS_BOARD` (the board name or token) to list open roles on `/careers`, each with its own page at `/careers/<title>-<id>` and `JobPosting` structured data. These are the providers' public, read-only job-board APIs, so no API key is needed. Roles are cached and refresh hourly; call `revalidateTag("jobs")` from an ATS webhook to refresh sooner. Applications happen on the ATS's own form. `NEXT_PUBLIC_TALENT_POOL_URL` points "Join the talent pool" at the ATS general application; without it, the link is an email.

## Decisions made in M2c (Careers)

- **ATS text, never ATS HTML.** Job descriptions are converted to headings, paragraphs and lists and rendered as text, so markup from a third party never reaches the page and no HTML sanitizer is needed.
- **Fail honest.** No ATS configured shows the talent-pool empty state; an ATS outage shows "Our roles list didn't load just now" with a link to the job board, never a false "No open roles". One malformed or non-https posting is skipped without hiding the rest.
- **HR facts are gated.** Benefits (12.3), the learning-budget figure, the countries people can work from and the employee quote (12.6) live in `content/careers.ts` and ship empty; the culture copy reads without the specifics until they're confirmed. Review the full design at `/design-system/careers-preview`.
- **Buyer CTAs stay off careers pages:** no lime slab (blueprint 12.7) and no mobile "Book a call" bar.
- **Bugs caught by tests:** inline-formatted paragraphs (`<p><strong>…`) were dropped by the HTML-to-text converter; salaries rendered as "$60.0K".

## Decisions made in M2b (Work, case-study template)

- **Publishing a case study is one entry.** Add it to `content/case-studies/index.ts` (typed like the planned Sanity `caseStudy` document) with the client's written permission recorded in `permission`. It then gets a page at `/work/<slug>`, an index card, a sitemap entry, related-study links and a link on the contact thank-you page for visitors who chose that service.
- **Until then, an honest empty state.** `/work` shows the hero and "Ask us for a private reference call", which opens the contact form pre-filled with `?topic=reference`. There's no filter bar with nothing to filter. The template and filters are reviewable with the fictional blueprint studies at `/design-system/work-preview`.
- **Placeholder param for Cache Components.** A dynamic route must prerender at least one param, so with nothing published `/work/[slug]` generates one placeholder slug that 404s like any other; with `ensureStatic`, unknown slugs return a real 404 on the first request.
- **Filters live in the URL** (`?service=legal&industry=SaaS`), so a filtered view can be shared; unknown values fall back to "All" instead of an empty page.
- **No JS for the reading-progress bar:** a CSS scroll-driven animation that follows the header's bottom edge, absent in browsers without scroll timelines. The section nav (scrollspy) is a small IntersectionObserver.

## Decisions made in M2a (About, How it works)

- **Company facts are gated like proof.** `content/company.ts` (origin story, numbers, leadership, hubs) ships empty, and each About section built on it renders only once it has real data. Until then the page runs on what is policy, not proof: the three operating rules and the four principles. Review the full design with sample data at `/design-system/about-preview`.
- **Unsigned guarantees stay unpublished.** The 30-day fit guarantee is marked "[VERIFY with finance/legal]" in the blueprint, so it lives in `pendingGuarantees` and only appears on the preview page. A unit test fails if a pending guarantee is ever published.
- **Deliverable previews are examples, labelled as such.** The Operating Brief, Proposal, SOP and Friday report previews are generic templates with redaction bars and an "Example" badge. They show the format, not a client.
- **No animation library.** The phase tracker is one small client component (scroll listener, one rAF per frame) that degrades to a list of anchor links; the headline word rise and hub pulse are CSS. Live hub clocks share one minute-aligned timer and render no time on the server, so there's no stale or mismatched time.
- **The security link goes to the contact form** (`/contact?topic=security`) until the `/about/security` trust centre exists.
- **Bug caught by tests:** a deep link to a phase landed about 1,100px short on phones, because layout kept shifting after the browser's initial jump; the tracker re-applies the jump once fonts settle, unless the visitor has already scrolled.

## Decisions made in M1d

- **One schema, two places.** `lib/contact/schema.ts` (zod/mini) validates on blur in the browser and again in the server action, which is reachable by direct POST, so every check lives server-side.
- **Answers are never lost.** Inputs are controlled, the submit is intercepted (so React's automatic form reset never runs), and drafts persist in sessionStorage until a successful send. Only keystrokes in the first ~200 ms before hydration can be lost.
- **Static page, client prefill.** `/contact` and `/contact/thank-you` prerender; `?service=`, `?bundle=` and `?topic=security` prefill on the client. The thank-you page reads the first name from sessionStorage, so no personal data goes in a URL.
- **JS budget measured precisely.** Lighthouse also counts the idle-time prefetch of `/contact` behind "Book a call", so its script cap is 240 KB; a new E2E test holds the 200 KB line on render-critical scripts (homepage 172 KB, contact 187 KB).
- **Bugs caught by tests:** a draft overriding an explicit `?topic=security` prefill; a hydration mismatch when restoring drafts (fixed with a one-time post-hydration remount); the long submit label widening the mobile layout (the overflow test now covers every route); `<select>` matching `:read-only` and getting the dashed read-only style.

## Decisions made in M1c

- **Content in code, shaped for Sanity.** No Sanity project yet, so each service is a typed file in `content/services/` matching the planned `service` document. Moving to the CMS is an import, not a redesign.
- **Real 404s for unknown service URLs.** With Partial Prerendering, an unknown `/services/<slug>` first returned 200 (a soft 404) before streaming the not-found page. `ensureStatic = "navigation"` makes Next finish the render first, so the status is 404 from the first request. This matters for the spam-URL cleanup.
- **Copy rules are tested.** A unit test lints all shipped content for the blueprint's banned words, exclamation marks and leftover `[VERIFY]` / `[SAMPLE]` / `TODO` markers.
- **Regulatory notes are tested** to stay on the legal and accounting pages.

## Claims to confirm before launch

These are business commitments in the live copy. They aren't gated (they're offers Akrostech defines), but each must be true on day one. Change the copy wherever one isn't.

| Claim                                                                             | Where                                |
| --------------------------------------------------------------------------------- | ------------------------------------ |
| Live / first delivery in 10 business days                                         | Hero, How it works, comparison table |
| No long-term lock-in; 90-day term, then month-to-month with 30 days' notice       | Hero, comparison, FAQ                |
| NDA before the first call                                                         | Hero, security band                  |
| Requests acknowledged within 1 business hour, resolved within 1 business day      | Visibility section                   |
| Replacement within 5 business days at no cost                                     | FAQ                                  |
| Written quote within 48 hours; no setup fees                                      | FAQ                                  |
| Access revoked within an hour of any change / of offboarding                      | FAQ, security band                   |
| Background checks, SSO + hardware-key MFA, AES-256 / TLS 1.3, GDPR/CCPA DPAs      | Security band                        |
| Tools the team already works in (Slack … DocuSign)                                | FAQ                                  |
| Replies within 4 business hours; Mon–Fri hours                                    | Mobile menu (`lib/site.ts`)          |
| Salary presets for the calculator teaser (cite a current source)                  | `lib/calculator/teaser.ts`           |
| Phase timings: Operating Brief in 24h, team match days 3–6, running by day 10     | How it works (`content/process.ts`)  |
| NDA and DPA signed before any data is shared; SSO provisioning                    | How it works                         |
| Onboarding takes about three hours of the client's time                           | How it works FAQ                     |
| Core overlap hours written into every proposal                                    | How it works FAQ                     |
| Offboarding: 30 days' notice, handover pack, access revoked within 1 business day | How it works ("Leaving well"), FAQ   |
| SOPs belong to the client                                                         | How it works, guarantees             |
| Senior hiring; month-to-month after 90 days                                       | About (operating rules)              |

## Launch checklist

- [ ] Counsel reviews `/legal/*` and `/about/security` (drafts based on the site's real behaviour, not legal advice).
- [ ] Fill `content/trust.ts`: legal entity and address, hosting provider, privacy email, and any certifications, insurance, vetting, incident and retention commitments.
- [ ] Add every legitimate old-site URL to `legacyRedirects` (`lib/edge/rules.ts`); spot-check the spam crawl against `isSpamUrl`.
- [ ] Approve the rate card (`content/rate-card.ts`) and cite the salary source for the calculator presets.
- [ ] Confirm every row in "Claims to confirm" below, and the two inconsistencies under "Known gaps".
- [ ] Set the integration keys (`.env.example`) and add the HubSpot form properties.
- [ ] In PostHog: enable IP discarding for the project, and set up the uptime + synthetic form check.
- [ ] Replace the placeholder logo; supply verified proof (`content/proof.ts`, `content/company.ts`, `content/careers.ts`, case studies).

## Known gaps

- Offboarding access timing differs between pages: the homepage FAQ says "revoke access within an hour of any change", How it works (blueprint 9.5) says "within one business day". Pick one.
- The homepage process summary says work starts "Day 7 onward" while How it works (blueprint 9.2) starts running on day 10. Both come from the blueprint; align them when the timeline is confirmed.

- Logo is a placeholder mark: replace `components/layout/logo.tsx` and `app/icon.svg` with the official SVG.
- Hero numbers (38 tasks, 3h 41m) are illustrative and announced as an example; wire to real data or keep them framed that way.
- Mobile Lighthouse (simulated slow 4G) scores 93–94 on the full homepage; desktop scores 100 on every category. Measured LCP locally equals first paint.
- `npm audit` reports advisories only in dev tooling (Lighthouse CI, shadcn CLI, eslint-config-next transitive deps); production dependencies have 0.
- Service glyphs are Phosphor stand-ins until the five custom icons are drawn.
- The mega-menu proof slot shows a process card until a permissioned case study exists.
