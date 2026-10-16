# C · Page-by-Page Wireframe Blueprints

> **How to read this:** every section lists **Layout · Content · Visuals · CTA · Interaction**. Copy is final-draft production copy. Anything in `[VERIFY]` is a real number or claim Akrostech must confirm before launch. Anything in `[SAMPLE]` is illustrative and must be replaced with real material. Column references use the 12-col desktop grid (Section A3).
>
> Global elements (header, footer, closing CTA slab) are specified once in the Homepage and referenced elsewhere.

---

## Table of contents

1. [Homepage](#1-homepage-)
2. [Services Overview](#2-services-overview-services)
3. [Service detail template](#service-detail-template) (shared structure for pages 3–7)
   3. [Web Development](#3-web-development-servicesweb-development)
   4. [Recruitment Assistance](#4-recruitment-assistance-servicesrecruitment)
   5. [Virtual Assistance](#5-virtual-assistance-servicesvirtual-assistance)
   6. [Accounting Assistance](#6-accounting-assistance-servicesaccounting)
   7. [Legal Assistance](#7-legal-assistance-serviceslegal)
8. [About Us](#8-about-us-about)
9. [How It Works](#9-how-it-works-how-it-works)
10. [Case Studies](#10-case-studies-work--workslug)
11. [Contact / Get Started](#11-contact--get-started-contact)
12. [Careers](#12-careers-careers)

---

## 1. Homepage `/`

**Page goal:** in 3 seconds, establish *competence and calm*; in 30 seconds, establish *what we do and that it's visible*; in 3 minutes, get a booked call or a calculator run.
**Primary conversion:** Book a call. **Secondary:** Run the calculator.

### 1.0 Header (global)
- **Layout:** 80px → 64px sticky (B2.3). Logo cols 1–2, nav centered cols 4–9, CTAs right cols 10–12.
- **Content:** `Services ▾ · How it works · Work · About · Careers` | `Estimate savings` (ghost) | `Book a call →` (primary, sm).
- **Interaction:** nav link hover = text from `--ink-200` to `--ink-50` + 1px lime underline that grows from left (150ms). The active page shows a 4px lime dot under the link.

> **As built (M1b):** every homepage section below is implemented in `components/home/`. Logo bar (1.2), stats band (1.7) and case study + testimonials (1.8) render only once `content/proof.ts` holds real, permissioned data; until then they're absent from the live page and reviewable with sample data at `/design-system/home-preview`. The FAQ question about team locations is held back until locations are confirmed. Other deviations are noted inline.

### 1.1 Hero (Concept 1 "The Ops Feed": see Section D)
- **Layout:** 2-column split on ≥1024: copy in cols 1–7 (left-aligned), live Ops Feed panel in cols 8–12. The H1 is capped at 88px in the hero so it sets in 3 lines and the CTAs + reassurance line stay above the fold on a 1440×900 screen. Top padding 128px desktop / 112px mobile. Height ≈ 100svh − 64px (min 680px). A faint 12-col grid overlay and the lime radial glow sit behind the panel.
- **Content:**
  - Eyebrow (h6 + live dot): `● OPERATIONS, HANDLED`
  - H1 (display-xl): **We run the parts of your business nobody sees.**
    *("nobody sees" gets the volt text gradient)*
  - Sub (body-lg, `--text-secondary`, max 52ch): *Akrostech is the operations team behind growing companies. Engineering, hiring, admin, finance, and legal work, delivered by dedicated specialists on timelines you can audit.*
  - CTAs: `Book a 20-minute call →` (primary lg) · `See what it would cost` (ghost lg)
  - Reassurance line (caption, `--text-tertiary`), with three items separated by `·`: `Live in 10 business days · No long-term lock-in · NDA before the first call`
- **Visual:** the **Ops Feed** panel: an `e2` card (radius-2xl, 1px border, edge-light top) styled like a product UI, titled `akrostech / ops · this week`, with tabs `All · Web · Hiring · Admin · Finance · Legal`. Rows (JetBrains Mono 13px):
  ```
  ✓  Payroll run closed · 214 employees            FIN   09:42
  ✓  Candidate shortlist sent · Sr. Backend Eng.   HIR   10:15
  ◐  Vendor MSA redline · round 2                  LEG   in review
  ✓  Checkout page LCP 3.1s → 1.2s                 WEB   11:03
  ✓  Board deck formatted + sent to 7 directors    ADM   11:30
  ✓  Q3 accruals reconciled · 0 variances          FIN   12:08
  ```
  Footer of the panel: `38 tasks completed today · median turnaround 3h 41m [VERIFY]`
- **CTA destinations:** primary → `/contact`; ghost → `/resources/back-office-calculator`.
- **Interaction:** load sequence in Section D1. Hovering a feed row reveals a tooltip "Every task is logged like this in your client dashboard." Feed tabs are functional (they filter rows with a 220ms layout animation). The panel tilts ≤ 3° toward the cursor on desktop (pointer-fine only, disabled with reduced motion).

### 1.2 Logo bar / proof strip
- **Layout:** full-wide container, 96px vertical padding, centered label above a single-row marquee. Hairline top and bottom borders.
- **Content:** label (caption, `--text-tertiary`): `Trusted by operators at 140+ companies in 11 countries [VERIFY]`. 10–14 client logos, monochrome `--ink-300`, 28px tall.
- **Visual:** logos rendered as SVG with `fill: currentColor`. Edge fade masks (`mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)`).
- **CTA:** none (proof, not action).
- **Interaction:** marquee 40s linear loop; pauses on hover/focus. Hovering a logo brightens it to `--ink-50`. If fewer than 8 logos can be used publicly, **do not marquee**: show a static row plus `+ 30 companies under NDA` as text. A sparse moving marquee looks fake.

### 1.3 Problem framing: "the expensive-hands problem"
- **Layout:** asymmetric. H2 in cols 1–5 (sticky on scroll at ≥1024), three stacked pain cards in cols 7–12.
- **Content:**
  - Eyebrow: `THE PROBLEM`
  - H2: **Your best people are doing their worst work.**
  - Body (body-lg): *Every growing company hits the same wall. The people you hired to think are buried in tasks that need doing, but not by them. That's not a talent problem. It's a routing problem.*
  - Card 1. Persona `CTO`. Title: **11:40 pm, reviewing a freelancer's pull request.** Body: *Your principal engineer is QA'ing a marketing site instead of shipping the roadmap.*
  - Card 2. Persona `CFO`. Title: **Day 14 of month-end close.** Body: *Your controller is chasing receipts and fixing coding errors when they should be forecasting cash.*
  - Card 3. Persona `COO`. Title: **312 applications, one hiring manager.** Body: *Your ops lead spent the week screening resumes. The role is still open.*
  - Closing line under cards (h4, `--ink-50`): *We take the work. You keep the hours.*
- **Visuals:** each card has a tiny monochrome vignette on its right (a PR diff with 47 comments; a calendar with "Close" spanning 14 days in red-error tint; a resume stack counter "312"). Persona label is a `micro` badge.
- **CTA:** none. This section builds tension for the next.
- **Interaction:** cards reveal one by one as they enter the viewport (600ms, 16px rise). On scroll-past, each card dims to 60% opacity as the next one activates (a scroll-linked "reading focus").

### 1.4 Services: "Five teams. One contract."
- **Layout:** H2 + intro left-aligned (cols 1–7), with a link right (cols 10–12). Below it a **bento grid**: row 1 = Web Dev (cols 1–7, tall) + Recruitment (cols 8–12); row 2 = VA (cols 1–4) + Accounting (cols 5–8) + Legal (cols 9–12). Gap 24px.
- **Content:**
  - Eyebrow: `WHAT WE RUN`
  - H2: **Five teams. One contract. Zero babysitting.**
  - Intro: *Use one service or all five. Each is run by a dedicated lead who already knows the tools you use.*
  - Link: `Compare all services →` (`/services`)
  - Cards (number · title · outcome line · 3 scope chips · link):
    - **01 · Web Development**: *Websites that load in under a second and actually convert.* Chips: `Next.js` `Webflow` `WordPress rescue`. Link `Explore web →`
    - **02 · Recruitment**: *Shortlists of vetted candidates in 10 business days, not 10 weeks.* Chips: `Sourcing` `Screening` `Scheduling`.
    - **03 · Virtual Assistance**: *A trained operator who clears your team's queue every day.* Chips: `Inbox` `Calendar` `CRM hygiene`.
    - **04 · Accounting**: *Books closed by business day 5. Every month.* Chips: `Bookkeeping` `Payroll` `AP/AR`.
    - **05 · Legal**: *Contracts tracked, redlined and renewed on time, under your counsel's direction.* Chips: `CLM` `NDAs` `Compliance calendars`.
- **Visuals:** each card has a live mini-vignette (the Web card shows a Lighthouse ring animating to 98; Recruitment shows a 5-stage pipeline with dots moving; VA shows an inbox count going 47 → 0; Accounting shows a checklist 23/24 → 24/24; Legal shows a contract timeline with "Renewal in 30d" flag). Vignettes are SVG/HTML, not video.
- **CTA:** each card links to its service page (the whole card is clickable, with a single `<a>` wrapping the title to avoid nested-link issues; the card uses the `::after` stretched-link pattern).
- **Interaction:** hover = card lifts 2px, border → `rgb(163 230 53 / 0.35)`, vignette plays its animation (they're paused until hover/in-view on desktop, and autoplay once on mobile when 60% visible). Arrow in the link translates 3px.

### 1.5 How it works (summary)
> *As built (M1b):* the connector draws (1.2s) once the steps scroll into view and each number lights as the line reaches it, rather than being scrubbed to scroll position, which proved unreliable across section heights. No GSAP.
- **Layout:** H2 centered. A horizontal 4-step track (4 equal cols) with an SVG connector line beneath the step numbers. Vertical on mobile.
- **Content:**
  - Eyebrow: `HOW IT WORKS`
  - H2: **From first call to first delivery in 10 business days. [VERIFY]**
  - Step 1 **Scope** · `Days 1–2`: *A 45-minute working session. We map the tasks, tools and handoffs, and write them down in a one-page Operating Brief you sign off on.*
  - Step 2 **Match** · `Days 3–6`: *We assign a dedicated lead and specialists with experience in your stack and your industry. You meet them before anything starts.*
  - Step 3 **Run** · `Day 7 onward`: *Work starts inside your tools: your Slack, your Jira, your QuickBooks. No new portal to learn unless you want one.*
  - Step 4 **Report** · `Every Friday`: *A one-page report: what was done, what's blocked, hours used, what's next. Read it in 90 seconds.*
- **Visuals:** step numbers in Bricolage 64px `--ink-500` that turn lime when active. A thin connector line.
- **CTA:** `See the full process →` (text link → `/how-it-works`).
- **Interaction:** the connector line draws left-to-right, scrubbed to scroll position (GSAP ScrollTrigger, `scrub: 0.5`). Each step number lights lime as the line reaches it.

### 1.6 Visibility: "You'll never wonder what we're doing."
> *As built (M1b):* the dashboard stays inside the container (bleeding off the edge clipped its labels), is captioned "Illustrative example", and the sample Friday report opens in an HTML dialog labelled as sample data. The downloadable PDF comes with real report templates.
- **Layout:** full-bleed `--bg-alt` band. Copy cols 1–5; a large dashboard vignette cols 6–12 that bleeds off the right edge on desktop.
- **Content:**
  - Eyebrow: `VISIBILITY`
  - H2: **You'll never have to ask "what's the status?"**
  - Body: *Bad outsourcing goes dark. We do the opposite. Every task is logged, timestamped, and visible to you the moment it moves.*
  - Feature list (icon + title + one line):
    - `Timer` **SLA clocks on every request.** *Standard requests are acknowledged within 1 business hour and resolved within 1 business day. [VERIFY]*
    - `ChatsCircle` **A shared Slack or Teams channel.** *Talk to the people doing the work, not an account manager relaying messages.*
    - `FileText` **The Friday report.** *One page. Done, blocked, next. Hours used against budget.*
    - `ShieldCheck` **Access you control.** *Role-based access to your systems, revoked in one click, logged in an audit trail.*
- **Visuals:** dashboard mock "Weekly Ops Report · Week 41" showing a 4-tile KPI row (Tasks done 142 · On-time 98.6% · Hours 312/340 · Open blockers 1), a burndown sparkline in lime, and a list with one amber "Blocked: awaiting vendor W-9" item. That last detail is deliberate: showing a blocker proves honesty.
- **CTA:** `See a sample Friday report →` opens a modal with a full-size, annotated sample report PDF preview (and a download that is not email-gated, since trust comes before capture).
- **Interaction:** KPI numbers count up once in view. Hovering each feature-list item highlights the matching area of the dashboard (lime outline, 220ms), which links copy to proof.

### 1.7 Stats band
- **Layout:** 4 equal columns, separated by 1px vertical hairlines. 2×2 on tablet, stacked on mobile. 128px vertical padding.
- **Content [VERIFY all]:**
  - **96%** · *client retention after year one*
  - **3h 41m** · *median task turnaround*
  - **10 days** · *average time to first delivery*
  - **0** · *data incidents since 2019*
  - Footnote (caption): `Figures from Akrostech client data, Jan–Sep 2026. Methodology →` (links to a methodology anchor on /about/security). The methodology link is the move that makes CFOs believe the numbers.
- **Visuals:** stat numerals in the `stat` style, `--ink-50`, with the unit in `--volt-500`.
- **CTA:** none.
- **Interaction:** count-up once at 50% visibility (1200ms, ease-out-expo, tabular numerals so the width doesn't jitter).

### 1.8 Featured case study + testimonials
- **Layout:** feature case study card spanning cols 1–12 (image left cols 1–6, content right cols 7–12), then a 3-card testimonial row below.
- **Content (case study [SAMPLE]):**
  - Eyebrow: `CASE STUDY · ACCOUNTING + VIRTUAL ASSISTANCE`
  - H3: **How Tidemark Health cut month-end close from 15 days to 5.**
  - Results row: `15 → 5 days close` · `$212K saved / year` · `0 audit findings`
  - Link: `Read the full story →` (`/work/tidemark-health`)
- **Testimonials:** the three blocks from Section E3 [SAMPLE].
- **Visuals:** case study image = duotone photo of the client's actual finance team, or a 3D ledger render if the client can't be photographed.
- **Interaction:** the case card image scales 1.03 on hover (600ms). Testimonial cards are static (no carousel: carousels hide proof).

### 1.9 Comparison: "Why not just…?"
- **Layout:** H2 cols 1–6; full-width comparison table below (sticky first column on mobile with horizontal scroll inside the table container only).
- **Content:**
  - Eyebrow: `THE HONEST COMPARISON`
  - H2: **You have options. Here's how we stack up.**
  - Table columns: `Freelancers` · `Typical offshore BPO` · `In-house hire` · **`Akrostech`** (highlighted column with lime top border and `--volt-950` tint)
  - Rows:
    | | Freelancers | Typical BPO | In-house hire | Akrostech |
    |---|---|---|---|---|
    | Time to start | 1–3 weeks | 4–8 weeks | 6–12 weeks | **10 business days** |
    | Who manages the work | You | An account manager | You | **A dedicated Akrostech lead** |
    | Coverage when someone's out | None | Varies | None | **Built-in backup on every role** |
    | Visibility | Whatever they tell you | Monthly report | Daily standup | **Live task log + Friday report** |
    | Security controls | Unknown | Varies | Yours | **SOC 2 controls, NDA, access logs [VERIFY]** |
    | Commitment | Per project | 12–36 months | Permanent | **Month-to-month after 90 days** |
    | Fully loaded cost | $$ | $ | $$$$ | **$$** |
- **Visuals:** checkmarks are not used. Plain specific text is more credible.
- **CTA:** below the table: `Run the numbers for your team →` (secondary button → calculator).
- **Interaction:** on hover, the Akrostech column gets the glow shadow. On row hover, the row background goes `--surface-1`.

### 1.10 Security band
- **Layout:** full-bleed `--steel-900` band (a deliberate register shift: "now we're serious"). Copy cols 1–6, badges + controls list cols 7–12.
- **Content:**
  - Eyebrow: `SECURITY`
  - H2: **Your data is safer with us than in most inboxes.**
  - Body: *We handle payroll files, employment contracts and production code. So we built the controls before we built the sales team.*
  - Controls list (two columns, each with a `ShieldCheck` icon): `SOC 2 Type II audited [VERIFY]` · `ISO/IEC 27001 aligned [VERIFY]` · `Background-checked staff` · `NDA signed before scoping` · `SSO + hardware-key MFA on all staff accounts` · `Least-privilege access, revoked within 1 hour of offboarding` · `Encrypted at rest (AES-256) and in transit (TLS 1.3)` · `GDPR / CCPA DPAs available`
- **Visuals:** badge row of actual certification marks (only those held); a subtle line-art lock/shield made from the grid motif.
- **CTA:** `Visit the trust center →` (`/about/security`) · `Request our SOC 2 report` (text link → `/contact?topic=security`).
- **Interaction:** none beyond reveal. Serious sections stay still.

### 1.11 Calculator teaser (lead magnet)
- **Layout:** `e1` card, radius-2xl, spanning cols 2–11. Left: copy. Right: 3 inline inputs and a live result.
- **Content:**
  - H3: **What is back-office work costing you right now?**
  - Body: *Three inputs. Ten seconds. A real number, not a sales pitch.*
  - *As built (M1b):* two inputs (function + hours); team size was dropped because it didn't change the number, and an input that does nothing is dishonest UI. Copy is "Two inputs. Five seconds." The output is the cost of the senior time spent today (salary × 1.3 overhead ÷ 2,080 h × hours × 48 weeks), with the math shown under "How we calculate this". No savings figure until the full calculator has the rate card.
  - Inputs: `Team size` (select: 10–50 / 51–200 / 201–500 / 500+) · `Function` (segmented: Finance · Hiring · Admin · Web · Legal) · `Hours per week on it` (slider 5–200)
  - Live output: `≈ $184,600 / year in senior time on work we could take off your plate.`
  - CTA: `Get the full breakdown →` → `/resources/back-office-calculator?prefill=…` (carries the inputs over).
- **Interaction:** the number animates on every input change (300ms tween). See Section F4 for full calculator logic.

### 1.12 FAQ
- **Layout:** H2 cols 1–4 (sticky), accordion cols 6–12.
- **Content:**
  - H2: **Questions buyers ask us on the first call.**
  - Q: **Where is your team located?** A: *Our specialists work from [VERIFY: e.g., the Philippines, Colombia and Poland], with leads overlapping your business hours by at least 6 hours. You'll know every person's name, role and location.*
  - Q: **What if the person assigned to us isn't a fit?** A: *Tell your lead. We'll replace them within 5 business days at no cost, with a proper handover. It's happened; it's in our process.*
  - Q: **How do you price?** A: *A fixed monthly fee per dedicated role, or a monthly retainer for a pool of hours. No setup fees. You'll have a written quote within 48 hours of your scoping call.*
  - Q: **Do we have to sign a long contract?** A: *No. 90-day initial term, then month-to-month with 30 days' notice. If we're not earning the renewal, we shouldn't get it.*
  - Q: **How do you handle access to our systems?** A: *Through accounts you create and control, with SSO where you have it. We follow least-privilege access, log everything, and revoke access within an hour of any change.*
  - Q: **Can you work in our tools?** A: *Yes, that's the default. We already work in Slack, Teams, Jira, Linear, Asana, HubSpot, Salesforce, QuickBooks, Xero, NetSuite, Gusto, Rippling, Greenhouse, Lever, Ironclad and DocuSign, among others.*
  - Q: **Are you a law firm or an accounting firm?** A: *No. Our legal team supports your counsel; it doesn't replace them. Our accounting team runs your bookkeeping and payroll; audits and tax filings stay with your CPA. We make both of them faster and cheaper to work with.*
- **Interaction:** single-open accordion; first item open by default; `+` rotates to `×` (220ms). FAQ marked up with `FAQPage` JSON-LD.

### 1.13 Closing CTA ("Volt slab", global)
- **Layout:** the one large lime block per page. Container-wide, radius-2xl, `--volt-500` background, Ink text, 96px padding, centered.
- **Content:**
  - H2 (display-lg, Ink): **Give us the work nobody wants. Keep the hours.**
  - Sub (Ink at 80%): *20 minutes. No slides. You'll leave with a scoped plan, whether you hire us or not.*
  - CTAs: `Book a 20-minute call →` (Ink fill, Paper text, lg) · `Email us instead` (Ink text link → `mailto:hello@akrosstech.com`)
  - Micro-proof under the buttons (Ink 70%): `Next available: Tomorrow, 10:00 AM EST [dynamic from Cal.com API]`
- **Visuals:** subtle Ink grid lines at 6% across the slab plus 2% grain. It stays flat lime with no gradient, so it reads electric and confident.
- **Interaction:** the button hover inverts to `--ink-800`. The slab has a slow (8s) diagonal light sweep on first view only.

### 1.14 Footer (global)
Per Section B2.5.

---

## 2. Services Overview `/services`

**Goal:** let a buyer self-select a service in under 15 seconds, and see that bundling is possible.

### 2.1 Page hero
- **Layout:** left-aligned, cols 1–8, 128px top padding. No visual on the right; typographic confidence.
- **Content:**
  - Eyebrow: `SERVICES`
  - H1: **The work that keeps a company running. Handled.**
  - Sub: *Five specialist teams, one standard of delivery. Start with the function that's hurting most. Most clients add a second within six months. [VERIFY]*
  - CTA: `Not sure where to start? Book a call →` (primary)
- **Interaction:** the H1 words reveal with a 30ms stagger.

### 2.2 Service index (the core of the page)
- **Layout:** 5 full-width rows (not cards), each 160px tall, separated by hairlines, in an editorial "index" style like a table of contents. Row layout: number (cols 1), title (cols 2–5), outcome line (cols 6–10), arrow (col 12).
- **Content:**
  | # | Title | Outcome line | Starting point |
  |---|---|---|---|
  | 01 | Web Development | Sites that load in under a second and convert. | Rebuilds, migrations, maintenance |
  | 02 | Recruitment Assistance | Vetted shortlists in 10 business days. | Sourcing, screening, scheduling |
  | 03 | Virtual Assistance | A trained operator who clears the queue daily. | Exec, admin, ops support |
  | 04 | Accounting Assistance | Books closed by business day 5. | Bookkeeping, payroll, AP/AR |
  | 05 | Legal Assistance | Contracts tracked, redlined, renewed on time. | CLM, NDAs, compliance ops |
- **Visuals:** on hover, the row expands to 280px and reveals the service's 3D glyph render (right side, cols 9–12) plus three bullet scope items, a "preview" pattern.
- **CTA:** each row → its service page.
- **Interaction:** hover/focus expands the row (360ms, ease-out-expo, height animated via `grid-template-rows: 0fr → 1fr`). Only one row is expanded at a time. On touch devices the rows are always expanded (no hover dependency).

### 2.3 Bundles: "Better together"
- **Layout:** H2 left; 3 bundle cards (4 cols each).
- **Content:**
  - H2: **Common combinations.**
  - Card **The Scale-Up Stack**: Recruitment + Virtual Assistance. *For teams hiring 10+ people a year. We source the hires, then onboard them: equipment, accounts, day-one schedules.*
  - Card **The Finance Backbone**: Accounting + Legal. *Contracts and the money they generate, tracked in one place. Renewals never surprise your forecast.*
  - Card **The Launch Crew**: Web Development + Virtual Assistance. *A new site, plus someone to run the content calendar, form leads and CMS updates once it's live.*
  - Note under cards: *Bundled engagements share one lead and one Friday report.*
- **CTA:** each card: `Scope this bundle →` → `/contact?bundle=scale-up` (pre-fills the form).
- **Interaction:** hover lifts the card. The bundle's service glyphs overlap and separate slightly on hover (a 4px spread).

### 2.4 Shared standards strip
- **Layout:** 4 cols, icon + title + line.
- **Content:** **Dedicated lead** *(one name, one inbox)* · **Backup on every role** *(vacations don't stall your work)* · **Your tools, not ours** · **Friday report, every week**
- **Interaction:** none.

### 2.5 Engagement models
- **Layout:** 3-col pricing-style table (no prices; see Section G pricing block).
- **Content:**
  - **Dedicated** · *A full-time specialist, yours exclusively.* Best for: ongoing, daily work. Billing: fixed monthly per role. Minimum: 90 days.
  - **Pooled** · *A block of hours across a team.* Best for: variable or multi-function work. Billing: monthly retainer, from 40 hours. Unused hours roll over once.
  - **Project** · *Fixed scope, fixed price, fixed date.* Best for: site builds, hiring sprints, contract migrations. Billing: 40% start / 40% midpoint / 20% on acceptance.
- **CTA:** `Get a quote in 48 hours →` (primary, centered below the table).

### 2.6 FAQ (3 service-agnostic Qs, reusing the homepage answers on pricing, contracts, tools) → 2.7 Volt slab CTA → Footer.

---

## Service detail template

> **As built (M1c):** `app/services/[slug]/page.tsx` + `components/services/`, content in `content/services/*.ts` (typed to mirror the planned Sanity `service` schema). S2 metrics and S9 proof render only when verified data exists, so all five pages currently ship without them. Scope cards are numbered rather than repeating the service glyph six times. Tools are text names, no third-party logos. The web "What does a rebuild cost?" answer is held back until the price range is confirmed. The services hub drops the "Most chosen" badge on engagement models (a claim about client behavior) and the "Most clients add a second within six months" line.

All five service pages share this structure, so buyers comparing services know where everything is. Per-service copy follows.

| # | Section | Purpose |
|---|---|---|
| S1 | Hero (split: copy + service vignette) | Outcome promise in one line |
| S2 | Outcome metrics strip (3 stats) | Proof in numbers |
| S3 | "What we handle" (scope grid, 6 items) | Concrete scope |
| S4 | "What we don't do" (honest limits) | Trust through honesty; filters bad-fit leads |
| S5 | "How an engagement runs" (week-by-week timeline) | Reduces perceived risk |
| S6 | Tools we work in (logo grid) | "They already know our stack" |
| S7 | Who you'll work with (role cards) | Real people, real seniority |
| S8 | Service-level commitments (SLA table) | Specific, auditable promises |
| S9 | Case study snippet + 1 testimonial | Proof |
| S10 | FAQ (5 questions) | Objection handling + SEO |
| S11 | Related services (2 cards) | Cross-sell |
| S12 | Volt slab CTA | Conversion |

**Template layout specs**
- **S1 Hero:** copy cols 1–6, vignette cols 7–12; 128px top padding; breadcrumb `Services / Web Development` above the eyebrow (caption, `--text-tertiary`). Primary CTA `Book a {service} scoping call →` + ghost `See pricing models`. **Interaction:** the vignette animates on load (≤1.5s), then idles.
- **S2 Metrics:** 3 cols, numerals in `stat` style; footnote with methodology link.
- **S3 Scope grid:** 3×2 grid of `e1` cards with a 40px icon container, h4 title and body-sm. Hover = border to lime 35%.
- **S4 Limits:** single `e1` panel with a 2px left `--warning` border, title "What we don't do" and a 3–4 item list with `X` icons in `--ink-300`. Tone: matter-of-fact.
- **S5 Timeline:** vertical timeline on the left (cols 1–1), with week labels and step content (cols 2–8). A sticky summary card (cols 9–12) shows "Your first 30 days". The line draws on scroll.
- **S6 Tools:** 6-col logo grid, monochrome, hairline cells (like Vercel's integrations grid). Tooltip on hover with the tool name.
- **S7 Roles:** 3 cards: role title, seniority, what they do, and "Typical background". Optional duotone portrait (real staff only).
- **S8 SLA table:** 2-col table (Commitment | Standard), mono font for times.
- **S9 Proof:** case-study card (cols 1–7) + testimonial (cols 8–12).
- **S10 FAQ:** accordion, `FAQPage` schema.
- **S11 Related:** 2 service cards.
- **S12:** Volt slab with service-specific headline.

---

## 3. Web Development `/services/web-development`

**S1 Hero**
- Eyebrow: `01 · WEB DEVELOPMENT`
- H1: **Websites built like products, not brochures.**
- Sub: *We design, build and maintain fast, accessible sites on Next.js, Webflow or WordPress. You get a senior team that ships weekly and never holds your code hostage.*
- CTAs: `Book a web scoping call →` · `See pricing models`
- Vignette: a browser frame whose layout assembles itself from wireframe boxes into a finished page (1.4s), followed by a Lighthouse panel animating rings to `Performance 98 · Accessibility 100 · Best Practices 100 · SEO 100`.

**S2 Metrics [VERIFY]:** **1.2s** *median LCP on sites we've shipped* · **6 weeks** *typical marketing-site rebuild* · **100%** *of code and accounts owned by you from day one*

**S3 What we handle**
1. **Rebuilds from zero.** *Strategy, IA, design and build, launched in 6–10 weeks with redirects mapped so you keep your rankings.*
2. **Platform migrations.** *WordPress to Next.js or Webflow, Squarespace to anything. Content moved, URLs preserved.*
3. **Performance and Core Web Vitals.** *We find what's slowing you down and fix it, with before/after measurements.*
4. **Accessibility remediation.** *WCAG 2.1 AA audits and fixes, with a written conformance report your legal team can file.*
5. **Care plans.** *Updates, security patches, uptime monitoring, and a monthly bank of change requests.*
6. **Landing pages on demand.** *Campaign pages built in 3 business days from brief to live, A/B-ready.*

**S4 What we don't do:** *Native mobile apps.* · *Custom SaaS products or complex back-end platforms (we'll refer you to partners who do).* · *Paid ads management.* · *"Quick fixes" on hacked sites without a security review first.*

**S5 Engagement timeline (rebuild):**
- **Week 0. Audit:** *Analytics, Search Console, CWV, content inventory. You get a 6-page audit, free, whether or not you proceed.*
- **Weeks 1–2. Architecture + design:** *Sitemap, wireframes and a design system in Figma. Two rounds of revisions included.*
- **Weeks 3–6. Build:** *Weekly staging links every Friday. You review real pages, not screenshots.*
- **Week 7. QA + launch:** *Cross-browser, accessibility and performance checks. Launch on a Tuesday morning, never on a Friday.*
- **Weeks 8+. Care:** *30 days of hypercare included, then optional care plan.*

**S6 Tools:** Next.js · React · Webflow · WordPress · Sanity · Contentful · Vercel · Netlify · Cloudflare · Figma · GitHub · Google Analytics 4 · Search Console · HubSpot

**S7 Roles:** **Web Lead** (8+ yrs, owns delivery and is your single contact) · **Senior Front-End Engineer** (performance and accessibility specialist) · **Product Designer** (systems-first, works in Figma with you live)

**S8 SLAs:** Critical outage response `30 min, 24/7` · Standard change request `1 business day` · Staging preview cadence `Weekly (Fridays)` · Uptime monitoring `1-min checks, alerts to your channel` · Security patches `Within 72h of release`

**S9 Proof [SAMPLE]:** *Larkspur Freight: 41 legacy WordPress plugins down to 0, LCP 4.8s → 1.1s, demo requests +63% in 90 days.*

**S10 FAQ**
- **Who owns the code?** *You do. Repos live in your GitHub organization from day one; hosting and domains are in your accounts.*
- **Can you work with our in-house engineers?** *Yes. We follow your PR process, branch rules and code review. Many clients use us so their engineers can stay on product.*
- **Do you write the copy?** *We can, through our content partner, or we work with your team's copy. Either way, we write the microcopy (buttons, forms, errors).*
- **Our current site was hacked. Can you help?** *Yes. We do a security review first, clean or rebuild, then set up monitoring and hardened hosting so it doesn't happen again.*
- **What does a rebuild cost?** *Most marketing-site rebuilds land between $18K and $60K depending on page count and integrations [VERIFY]. You'll get a fixed quote after the audit.*

**S11 Related:** Virtual Assistance (content ops after launch) · Legal (accessibility compliance documentation)

**S12 Slab H2:** **Your website is your best salesperson. Let's make it a fast one.**

---

## 4. Recruitment Assistance `/services/recruitment`

**S1 Hero**
- Eyebrow: `02 · RECRUITMENT`
- H1: **Hire faster without hiring a recruiting team.**
- Sub: *We source, screen and schedule. You interview people already worth your time. Your ATS, your employer brand, your final call.*
- CTAs: `Book a hiring scoping call →` · `See pricing models`
- Vignette: a 5-column pipeline board (`Sourced 214 → Screened 38 → Assessed 11 → Shortlist 5 → Offer 1`), with candidate cards (anonymized initials) sliding stage to stage; the final card glows lime.

**S2 Metrics [VERIFY]:** **10 days** *to a vetted shortlist* · **4.2** *candidates interviewed per hire (industry avg. ~10)* · **91%** *of placed hires still in seat after 12 months*

**S3 What we handle**
1. **Sourcing.** *Outbound on LinkedIn, GitHub, niche boards and referrals. We find people who aren't applying.*
2. **Screening.** *Structured phone screens against a scorecard you approve. Every candidate gets the same questions.*
3. **Skills assessments.** *Coordinated take-homes, technical screens or work samples, run through your tools.*
4. **Interview scheduling.** *We juggle five calendars so your hiring managers don't have to. Median time-to-schedule: under 24 hours.*
5. **Candidate experience.** *Every applicant hears back, including the rejections. Your employer brand stays intact.*
6. **ATS hygiene and reporting.** *Clean pipelines in Greenhouse, Lever, Ashby or Workable, plus a weekly funnel report.*

**S4 What we don't do:** *Make hiring decisions (you always do).* · *Contingency "resume dumps."* · *Executive search for C-suite roles.* · *Employer-of-record or payroll for hires (ask about our accounting team instead).*

**S5 Engagement timeline (per role):**
- **Day 1. Intake:** *A 45-minute call with the hiring manager. We write the scorecard and job post together.*
- **Days 2–3. Calibration:** *We send 5 sample profiles. You tell us "yes, no, closer." This step saves weeks.*
- **Days 4–10. Source + screen:** *Daily outreach, structured screens, a live pipeline you can see.*
- **Day 10. Shortlist:** *3–5 candidates with written screen notes and scorecard ratings.*
- **Days 11+. Interview + close:** *We schedule, gather feedback within 24h, and support offer logistics.*

**S6 Tools:** Greenhouse · Lever · Ashby · Workable · BambooHR · LinkedIn Recruiter · GitHub · Calendly · Google Workspace · Microsoft 365 · Slack · Teams

**S7 Roles:** **Talent Lead** (ex-agency or in-house, 7+ yrs, owns your hiring plan) · **Technical Sourcer** (reads code, knows the difference between React and React Native) · **Recruiting Coordinator** (scheduling, candidate communications, ATS)

**S8 SLAs:** First calibration profiles `48 hours` · Candidate response to applicants `≤ 3 business days` · Interview scheduling `≤ 24 hours` · Shortlist delivery `10 business days` · Weekly funnel report `Mondays`

**S9 Proof [SAMPLE]:** *Bramblecrest Analytics: 14 engineering hires in 5 months, time-to-hire 68 → 29 days, $140K saved vs. agency fees.*

**S10 FAQ**
- **Do you charge a percentage of salary?** *No. You pay a flat monthly fee, so we're never incentivized to push a higher salary or a faster-but-worse hire.*
- **Which roles do you recruit for?** *Engineering, product, design, finance, operations, customer success, and sales up to Director level.*
- **Will candidates know you're a third party?** *Your call. Most clients have us recruit under their brand, using an @yourcompany.com address.*
- **What if a hire doesn't work out?** *If they leave within 90 days, we re-run the search at no extra cost.*
- **How do you handle candidate data?** *Inside your ATS, under your privacy policy. We don't keep a separate copy.*

**S11 Related:** Virtual Assistance (onboarding logistics) · Accounting (payroll setup for new hires)

**S12 Slab H2:** **Stop screening. Start interviewing people worth your time.**

---

## 5. Virtual Assistance `/services/virtual-assistance`

**S1 Hero**
- Eyebrow: `03 · VIRTUAL ASSISTANCE`
- H1: **A trained operator who clears the queue every day.**
- Sub: *Inbox, calendar, CRM, vendor follow-ups, travel, the hundred small tasks that eat your team's week. Handled by someone who's done it for executives before.*
- CTAs: `Book a VA scoping call →` · `See pricing models`
- Vignette: a task inbox counter `47` that ticks down to `0` as rows slide into a "Done" column; a calendar beside it de-conflicts itself (overlapping blocks animate into a clean schedule).

**S2 Metrics [VERIFY]:** **11 hrs** *saved per executive per week, on average* · **< 1 hr** *acknowledgment on every request* · **5 days** *to a fully onboarded assistant*

**S3 What we handle**
1. **Inbox management.** *Triage, draft, file, and flag only what needs you. Most executives go from 200 unread to 12.*
2. **Calendar ownership.** *Scheduling across time zones, prep docs attached to every meeting, buffers protected.*
3. **CRM and data hygiene.** *Deduplicating HubSpot or Salesforce, updating deal stages, enriching records.*
4. **Vendor and procurement admin.** *Chasing W-9s, collecting quotes, renewing subscriptions, tracking spend.*
5. **Travel and events.** *Flights, hotels, visas, offsites, booked against your travel policy.*
6. **Docs and reporting.** *Board decks formatted, weekly reports compiled, SOPs written and kept current.*

**S4 What we don't do:** *Personal errands unrelated to the business.* · *Tasks requiring physical presence.* · *Anything that requires you to share a personal password (we use delegated access only).* · *Unsupervised payments over your defined approval threshold.*

**S5 Engagement timeline:**
- **Day 1. Discovery:** *We shadow your week through your calendar and inbox (with permission), and list everything you'd hand off.*
- **Days 2–3. Playbook:** *We write your personal SOP: preferences, VIPs, approval rules, tone of voice.*
- **Days 4–5. Shadow mode:** *Your assistant drafts; you approve. You see how they think.*
- **Week 2. Full handoff:** *Drafts become sends. Daily end-of-day summary in your channel.*
- **Day 30. Review:** *We adjust scope, add tasks, and lock in the rhythm.*

**S6 Tools:** Google Workspace · Microsoft 365 · Slack · Teams · Notion · Asana · Monday · ClickUp · HubSpot · Salesforce · Zoom · Calendly · Navan · Expensify · 1Password (delegated vaults)

**S7 Roles:** **Executive Assistant** (supports C-suite, 5+ yrs) · **Operations Assistant** (CRM, vendors, reporting) · **VA Team Lead** (QA's work, covers absences, owns your SOP)

**S8 SLAs:** Request acknowledgment `≤ 1 business hour` · Standard task completion `Same business day` · Coverage hours `Your business hours, ≥ 8h overlap` · Backup coverage `Named backup trained on your SOP` · Daily summary `End of your day`

**S9 Proof [SAMPLE]:** *Tidemark Health: a VA team of 3 supporting 9 executives, 98 hours a week returned to leadership, 0 missed board deadlines in 12 months.*

**S10 FAQ**
- **Is it one person or a team?** *A dedicated primary assistant, backed by a team lead and a trained backup. You get continuity without the single point of failure.*
- **How do you keep access secure?** *Delegated access only (Google/Microsoft delegation, shared vaults). No passwords in chat. Access is logged and revocable instantly.*
- **What time zone do they work in?** *Yours. We guarantee at least 8 hours of overlap with your core business hours.*
- **Can one assistant support several people?** *Yes. Most of our assistants support 2–4 people on the same team.*
- **What if I don't have enough work for full-time?** *Start on a pooled plan from 40 hours a month and scale up.*

**S11 Related:** Recruitment (new-hire onboarding) · Accounting (expense and AP admin)

**S12 Slab H2:** **Get your Tuesdays back.**

---

## 6. Accounting Assistance `/services/accounting`

**S1 Hero**
- Eyebrow: `04 · ACCOUNTING`
- H1: **Books closed by business day 5. Every month.**
- Sub: *Bookkeeping, payroll, payables and receivables, run by finance professionals inside your accounting system. Your CFO gets clean numbers early enough to actually use them.*
- CTAs: `Book a finance scoping call →` · `See pricing models`
- Vignette: a month-end close checklist (`Bank recs ✓ · Credit cards ✓ · Accruals ✓ · Prepaids ✓ · Revenue ✓ … 24/24`) with a progress ring filling to "Closed · BD5"; next to it a balance tile where "Variance $0.00" settles in.

**S2 Metrics [VERIFY]:** **BD 5** *median month-end close* · **99.7%** *transaction coding accuracy (QA-sampled)* · **$0** *in payroll penalties across all clients in 2025*

**S3 What we handle**
1. **Bookkeeping and reconciliations.** *Daily transaction coding, monthly bank and card recs, clean ledgers.*
2. **Month-end close.** *A documented close checklist, accruals, prepaids, and a close package your CFO can review in an hour.*
3. **Payroll operations.** *Multi-state payroll runs in Gusto, Rippling or ADP, plus new-hire setup and year-end forms.*
4. **Accounts payable.** *Invoice capture, approval routing, payment runs, vendor statements.*
5. **Accounts receivable.** *Invoicing, collections follow-up, cash application, aging reports.*
6. **Audit and tax prep support.** *PBC lists, schedules and documentation organized for your CPA, so their bill goes down.*

**S4 What we don't do:** *Audits, reviews or attestation (that's your CPA firm).* · *Tax filing or tax advice.* · *Sign-off on financial statements.* · *Move money without your documented approval workflow.*
*Note: Akrostech is not a licensed CPA firm. [VERIFY with counsel: wording per your jurisdiction.]*

**S5 Engagement timeline:**
- **Week 1. Diagnostic:** *We review your chart of accounts, last 3 closes, and open items. You get a cleanup estimate in writing.*
- **Weeks 2–3. Cleanup (if needed):** *Catch-up bookkeeping and reconciliations to a clean starting balance.*
- **Week 4. Parallel month:** *We run the close alongside your team to prove the process.*
- **Month 2. Ownership:** *We own the close. You get the close package by business day 5.*
- **Ongoing:** *Monthly close review call, quarterly process improvement list.*

**S6 Tools:** QuickBooks Online · Xero · NetSuite · Sage Intacct · Bill.com · Ramp · Brex · Expensify · Gusto · Rippling · ADP · Stripe · Shopify · Excel / Google Sheets

**S7 Roles:** **Finance Lead** (accounting degree, 8+ yrs, ex-Big 4 or controller [VERIFY]) · **Senior Bookkeeper** (owns the close) · **Payroll Specialist** (multi-state, multi-entity)

**S8 SLAs:** Month-end close package `By business day 5` · Payroll processing `48h before pay date, every cycle` · AP payment runs `Weekly, on your schedule` · Response to finance questions `≤ 4 business hours` · QA sampling `10% of transactions monthly, reviewed by a second accountant`

**S9 Proof [SAMPLE]:** *Tidemark Health: close 15 → 5 days, $212K a year saved versus two in-house hires, clean audit with 0 adjustments.*

**S10 FAQ**
- **Do we need to switch accounting software?** *No. We work in yours. If you're outgrowing it, we'll tell you and help you migrate.*
- **Who approves payments?** *You. We prepare payment runs; your designated approvers release them under dual control.*
- **How do you ensure accuracy?** *Every month a second accountant samples 10% of transactions. Errors are logged, root-caused, and reported in your close package.*
- **Can you support multiple entities or currencies?** *Yes, including intercompany eliminations and multi-currency revaluation in NetSuite, Xero and Intacct.*
- **We have a messy backlog. Is that a problem?** *Not at all; most clients start that way. We quote cleanup separately so you know the cost upfront.*

**S11 Related:** Legal (contract-to-revenue tracking) · Virtual Assistance (expense and receipt collection)

**S12 Slab H2:** **Clean books by day 5. Then you can actually use them.**

---

## 7. Legal Assistance `/services/legal`

> **Compliance note (mandatory):** Akrostech must not imply it provides legal advice or representation. All copy positions the team as *legal operations support working under the direction of the client's licensed attorneys*. Have counsel review final copy for unauthorized-practice-of-law (UPL) risk in every jurisdiction served.

**S1 Hero**
- Eyebrow: `05 · LEGAL ASSISTANCE`
- H1: **Your lawyers, minus the paperwork.**
- Sub: *Contract intake, redline preparation, CLM administration, NDAs and compliance calendars, run by experienced legal operations professionals under the direction of your counsel. Akrostech is not a law firm and does not provide legal advice.*
- CTAs: `Book a legal ops scoping call →` · `See pricing models`
- Vignette: a contract timeline: 6 agreements on a horizontal timeline, each with a status chip (`Executed`, `In redline`, `Renewal in 30d` in amber). An "auto-renewal caught" event pulses lime: *"Notice sent 60 days before auto-renewal. $48K saved."*

**S2 Metrics [VERIFY]:** **24 hrs** *NDA turnaround on your templates* · **100%** *of renewals flagged ≥ 60 days out* · **40%** *less outside-counsel spend reported by clients in year one*

**S3 What we handle**
1. **Contract intake and triage.** *A single request channel. Every contract logged, categorized and routed to the right attorney.*
2. **First-pass redlines against your playbook.** *We mark up third-party paper against your approved fallback positions, so your counsel reviews instead of drafting.*
3. **CLM administration.** *Setup and upkeep of Ironclad, Juro, DocuSign CLM or a well-built spreadsheet if that's what you need.*
4. **NDAs and standard agreements.** *Your templates, filled, sent and executed, typically within 24 hours.*
5. **Obligation and renewal tracking.** *Key dates, notice periods and obligations extracted and calendared.*
6. **Compliance calendars.** *Annual filings, registered agent renewals, license and policy-review deadlines tracked across entities.*

**S4 What we don't do:** *Provide legal advice or opinions.* · *Represent you in any matter.* · *Approve non-standard terms (your counsel decides).* · *Litigation support beyond document organization.*

**S5 Engagement timeline:**
- **Week 1. Inventory:** *We collect your executed agreements and templates and build a contract register.*
- **Week 2. Playbook:** *With your counsel, we document standard positions, fallbacks and escalation rules.*
- **Week 3. Pilot:** *We run NDAs and low-risk agreements end-to-end; counsel reviews every output.*
- **Week 4+. Scale:** *We add commercial agreements and renewals. Counsel reviews by exception.*
- **Quarterly:** *Playbook review: what's escalating most, and which positions to update.*

**S6 Tools:** Ironclad · Juro · DocuSign / DocuSign CLM · PandaDoc · Adobe Sign · Microsoft Word (track changes) · SharePoint · Google Drive · Notion · Salesforce · HubSpot · Carta (entity management)

**S7 Roles:** **Legal Operations Lead** (JD or paralegal certification, 7+ yrs in-house legal ops [VERIFY]) · **Contract Specialist** (redlines against playbooks) · **Compliance Coordinator** (calendars, filings, entity records)

**S8 SLAs:** NDA turnaround `≤ 24 business hours` · First-pass redline `≤ 3 business days` · Renewal alerts `≥ 60 days before notice deadline` · Contract register updated `Within 1 business day of execution` · Escalation to counsel `Same day for non-standard terms`

**S9 Proof [SAMPLE]:** *Larkspur Freight: 1,240 contracts migrated to a CLM in 6 weeks, 23 unwanted auto-renewals stopped, $310K in avoided spend.*

**S10 FAQ**
- **Are you a law firm?** *No. We're a legal operations team. We work under your attorneys' direction and never give legal advice.*
- **We don't have in-house counsel. Can we still use you?** *Yes, alongside your outside counsel. We make their time more efficient, which usually lowers your bill.*
- **How do you handle confidentiality and privilege?** *We work under NDA and your counsel's instructions, within your systems, to help preserve privilege. Your counsel should advise on privilege specifics.*
- **Do you work with our existing CLM?** *Yes. If you don't have one, we'll help you pick and implement one, or run a disciplined spreadsheet register until you need more.*
- **What types of contracts do you handle?** *NDAs, MSAs, SOWs, DPAs, vendor and customer agreements, employment offer letters (with HR) and leases.*

**S11 Related:** Accounting (contract-to-invoice alignment) · Virtual Assistance (signature chasing, entity admin)

**S12 Slab H2:** **Never miss a renewal date again.**

---

## 8. About Us `/about`

> **As built (M2a):** sections built on company facts (origin narrative, 8.4 numbers, 8.5 leadership, 8.6 hubs) render only once `content/company.ts` holds real data; until then the page carries the hero, the three operating rules, the principles and the teasers, and the full design is reviewable at `/design-system/about-preview`. With no real photos yet, 8.2 is typographic (no duotone image) and leader cards fall back to an initials tile. The 8.7 security teaser links to `/contact?topic=security` until `/about/security` exists.

### 8.1 Hero
- **Layout:** left-aligned, cols 1–9; large type, no image.
- **Content:**
  - Eyebrow: `ABOUT AKROSTECH`
  - H1: **We started Akrostech because outsourcing had a trust problem.**
  - Sub: *Too many companies have been burned by vendors who overpromise in the sales call and disappear by month three. We built the opposite: a team that shows its work, every day.*
- **Interaction:** H1 word reveal.

### 8.2 Origin story
- **Layout:** two-column editorial. Duotone photo of founders/team at work (cols 1–5, radius-xl); story (cols 7–12) in body-lg.
- **Content [VERIFY: replace with the true story]:**
  - *Akrostech began in [year] with [founder name] running operations for a fast-growing [industry] company. The pattern was always the same: brilliant people buried in admin, and outsourcing partners who were cheap until they were expensive.*
  - *So we set three rules that still run the company today:*
    1. **Show the work.** *Every task logged. Every week reported.*
    2. **Hire senior, then train obsessively.** *We'd rather have fewer, better people.*
    3. **Earn the renewal.** *Month-to-month after 90 days, because lock-in is a crutch for bad service.*
  - *Today we're [N] specialists across [N] countries, running back offices for companies from 40-person startups to 2,000-person enterprises.*
- **Interaction:** photo has a slow 1.05 → 1 scale settle on reveal.

### 8.3 Principles
- **Layout:** 2×2 grid of large text cards (6 cols each).
- **Content:**
  - **Precision over polish.** *A correct report in plain text beats a beautiful one with a wrong number.*
  - **Calm is a service.** *Nothing we do should create urgency for you. If something's on fire, we tell you, with a fix.*
  - **Default to visible.** *If you have to ask what we're doing, we've already failed.*
  - **Your tools, your data, your call.** *We work inside your systems and leave them cleaner than we found them.*
- **Visual:** a large lime numeral (01–04) top-left of each card at 10% opacity, as a watermark.

### 8.4 Numbers band
`[N] specialists · [N] countries · [N] clients · [year] founded` [VERIFY]. Count-up once.

### 8.5 Leadership
- **Layout:** 4-col grid of team member cards (see G: Team member card).
- **Content:** Name, role, one-line background, a "Previously at" line, and LinkedIn icon link. Duotone portraits of real leadership only [VERIFY].
  - Example format: **[Name]** · *Founder & CEO* · *Ran operations at [company] through 4× growth.* · `Previously: [Company], [Company]`
- **Interaction:** hover swaps the duotone to full-color (360ms crossfade), which humanizes on intent.

### 8.6 Where we work
- **Layout:** full-bleed dark band; minimal dot-matrix map (lime dots for hubs, `--ink-500` dots elsewhere), not a globe.
- **Content:** H3: **Distributed by design. Overlapping with you by default.** List of hubs with local time live-updating: `Manila 10:42 PM · Bogotá 9:42 AM · Kraków 4:42 PM` [VERIFY]
- **Interaction:** clocks tick live (minute precision). The dots pulse once in sequence on reveal.

### 8.7 Security teaser → `/about/security` link card · 8.8 Careers teaser ("We're hiring operators who care about the details." → `/careers`) · 8.9 Volt slab (**"Let's see if we're a fit. 20 minutes, no slides."**) · Footer.

---

## 9. How It Works `/how-it-works`

> **As built (M2a):** the 9.2 progress bar follows scroll through one small client component, not a scroll-scrubbing library, and the tracker is a working list of anchor links without JS. The 9.3 previews are generic templates with redaction bars and an "Example" badge. The 30-day fit guarantee (9.4) is held back until finance and legal sign it off, so two guarantees show.

**Goal:** remove the fear of the unknown. A COO should be able to forward this page to their CEO as "here's exactly what happens."

### 9.1 Hero
- Eyebrow: `HOW IT WORKS`
- H1: **No mystery. Here's exactly what happens.**
- Sub: *From your first call to a running team in 10 business days, with a written plan, named people and a weekly report from day one.*
- CTA: `Book your scoping call →`
- Visual: the 12-col grid overlay plus a horizontal "rail" that previews the 5 phases as small labeled nodes.

### 9.2 Phase-by-phase (the core section)
- **Layout:** sticky left column (cols 1–4) showing the current phase number + name + progress bar; the right column (cols 6–12) scrolls through the phase content. Each phase is ~80vh tall on desktop.
- **Content:**

  **Phase 01 · The scoping call** `Day 1 · 45 min`
  *We ask about the work, not your budget. What's eating your team's time? What tools do you use? What does "done well" look like?*
  You get: **A one-page Operating Brief within 24 hours.**
  You do: *Bring the person who owns the work today.*

  **Phase 02 · Proposal + agreement** `Days 2–3`
  *A fixed quote, the named roles, the SLAs and a 90-day plan. Mutual NDA and DPA signed before any data is shared.*
  You get: **Proposal, MSA, DPA, plus a sample Friday report.**
  You do: *Review and sign, or ask us to change anything.*

  **Phase 03 · Team match** `Days 3–6`
  *We select specialists for your stack and industry. You meet your lead on video before work starts. Don't like the fit? We match again.*
  You get: **Your lead's name, profile and direct line.**
  You do: *A 30-minute intro call.*

  **Phase 04 · Onboarding** `Days 6–10`
  *Access provisioned through your SSO. Shared channel set up. We document your processes as SOPs, which you keep even if we part ways.*
  You get: **SOPs, access log, and a kick-off agenda.**
  You do: *Grant access; walk us through one live example.*

  **Phase 05 · Run + report** `Day 10 onward`
  *Work happens in your tools. Every Friday, a one-page report. Every month, a 30-minute review. Every quarter, a list of things we think you should change.*
  You get: **Weekly report, monthly review, quarterly recommendations.**
  You do: *Read a one-page report. That's it.*

- **Interaction:** the sticky progress bar fills (scrubbed) as the right column scrolls. Phase nodes in the hero rail are anchor links. On mobile the sticky column becomes a horizontal stepper pinned under the header.

### 9.3 "What you'll get" artifacts gallery
- **Layout:** 4-card horizontal row (scroll-snap on mobile).
- **Content:** preview thumbnails of **Operating Brief** · **Proposal** · **SOP document** · **Friday report**, each with `Preview →` opening a modal with the redacted sample.
- **Why:** showing the actual deliverables is the strongest de-risking tool on the site.

### 9.4 Guarantees
- **Layout:** 3 cols with an icon container each, on `--bg-alt`.
- **Content:**
  - **The 30-day fit guarantee.** *If it's not working in the first 30 days, we'll re-match your team or refund the month. [VERIFY with finance/legal]*
  - **5-day replacement.** *If a team member needs replacing, it happens within 5 business days, with handover.*
  - **Your SOPs are yours.** *Everything we document belongs to you, even if you leave.*

### 9.5 Leaving well
- H3: **And if you ever leave?**
- Body: *30 days' notice, a complete handover pack, access revoked and confirmed in writing within one business day. We want you to be able to say we were easy to leave, because that's why people stay.*

### 9.6 FAQ (onboarding-specific: time commitment, data access, time zones) → 9.7 Volt slab (**"Ten business days from now, this could be someone else's job."**) → Footer.

---

## 10. Case Studies `/work` + `/work/[slug]`

### 10A. Index page `/work`
- **Hero:** Eyebrow `WORK` · H1 **Proof, not promises.** · Sub *Real clients, real numbers, published with permission. (Most of our clients prefer NDA silence; these generously didn't.)*
- **Filter bar:** tabs `All · Web · Recruitment · Virtual Assistance · Accounting · Legal` + select `Industry`. Filters update the URL query (`?service=accounting`) for shareability. Results animate with a layout transition (220ms).
- **Grid:** 2-col case study cards (see G: Case study card). The first card spans the full width as "featured."
- **Empty state:** *"No published case studies for this filter yet. Ask us for a private reference call →"* (honest, and converts).
- **Bottom:** "Want to talk to a client directly? We'll arrange a reference call after your scoping session." + Volt slab.

### 10B. Case study template `/work/[slug]`

Long-form reading switches to the **Paper (light) theme** for readability.

| # | Section | Layout | Spec |
|---|---|---|---|
| T1 | Hero | Dark. Cols 1–8 copy, client logo top-left | Eyebrow (services used), H1 = outcome-first headline, client one-liner, 3 result stats inline |
| T2 | Snapshot sidebar | Sticky right column (cols 9–12) on desktop; collapsible box on mobile | Client, Industry, Size, Services, Team, Duration, Tools |
| T3 | The situation | Paper prose (720px) | 150–250 words; the "before" with specific pains |
| T4 | What we did | Prose + numbered steps | 250–400 words; the approach, with 1–2 product vignettes or screenshots |
| T5 | Results | Full-width dark stats band | 3–4 stats with before → after notation |
| T6 | Client quote | Large pull-quote | Quote, name, title, photo |
| T7 | What's next | Short prose | Ongoing relationship (shows retention) |
| T8 | Related case studies | 2 cards | Same service or industry |
| T9 | CTA | Volt slab | "Want results like {client}'s?" |

**Interaction:** 2px lime reading-progress bar in the header. Stats in T5 count up once. The sidebar highlights the current section (scrollspy).

### 10C. Example case study (full) [SAMPLE: fictional, replace before launch]

**T1 Hero**
- Eyebrow: `ACCOUNTING · VIRTUAL ASSISTANCE · HEALTHCARE`
- H1: **How Tidemark Health cut month-end close from 15 days to 5.**
- One-liner: *A 380-person multi-site clinic group was growing faster than its finance team. We rebuilt the close, took over payables, and gave leadership their numbers while they still mattered.*
- Stats: **15 → 5** *days to close* · **$212K** *saved per year* · **0** *audit adjustments*

**T2 Snapshot**
Client: Tidemark Health · Industry: Healthcare services · Size: 380 employees, 7 locations, $64M revenue · Services: Accounting Assistance, Virtual Assistance · Team: Finance Lead, 2 Senior Bookkeepers, 1 Executive Assistant · Duration: 18 months, ongoing · Tools: NetSuite, Bill.com, Ramp, Rippling, Slack

**T3 The situation**
*When Tidemark's CFO, Dana Whitfield, joined in early 2025, the monthly close took 15 business days. The finance team of three was coding 4,000 transactions a month by hand across seven locations, and payables ran on a shared inbox. Board packages arrived the week before the next month ended, which meant leadership was always steering by a month-old map.*

*Hiring two more accountants would have cost about $260,000 a year fully loaded, and taken a quarter to fill. Dana needed the capacity in weeks, and she needed it auditable.*

**T4 What we did**
1. **Diagnostic (week 1).** *We reviewed the last three closes and found 61% of close time went to reconciliations that could be daily, not monthly.*
2. **Cleanup (weeks 2–3).** *We reconciled 14 months of intercompany balances and cleared 312 aged items.*
3. **A documented close.** *We wrote a 46-step close checklist with owners and deadlines, run in NetSuite with task tracking visible to Dana's team.*
4. **AP takeover.** *We moved payables from a shared inbox into Bill.com with approval routing by location manager. Vendor queries dropped by 70%.*
5. **Executive support.** *An Akrostech EA took over board-package assembly and the CFO's calendar, returning about 9 hours a week to Dana.*

**T5 Results**
`Close time 15 → 5 days` · `Cost $260K (2 hires) → $48K/yr net of Akrostech fees: $212K saved` · `AP processing time −64%` · `External audit: 0 adjustments, first time in 4 years`

**T6 Quote**
> *"I expected to spend the first three months managing a vendor. Instead I got my first BD5 close in month two, and a report every Friday that I actually read."*
> **Dana Whitfield**, CFO, Tidemark Health [SAMPLE]

**T7 What's next**
*Tidemark has since added Recruitment Assistance for its clinical admin roles, and we're supporting its migration to a multi-subsidiary NetSuite setup ahead of two acquisitions.*

---

## 11. Contact / Get Started `/contact`

**Goal:** maximum qualified submissions, minimum friction. See Section F3 for full form logic.

### 11.1 Layout
- 2-col split on ≥1024: **left (cols 1–5)** = reassurance; **right (cols 7–12)** = form card (`e2`, radius-xl, 40px padding). On mobile, the form comes first, then reassurance.

### 11.2 Left column content
- Eyebrow: `GET STARTED`
- H1: **Tell us what's eating your team's week.**
- Sub: *We'll reply within 4 business hours with a few times for a 20-minute call. No slides, no pressure, and an NDA on request before we talk.*
- "What happens next" mini-timeline:
  1. **You send this form** · *2 minutes*
  2. **We reply with times** · *within 4 business hours [VERIFY]*
  3. **20-minute scoping call** · *with a lead, not a salesperson*
  4. **Written plan + quote** · *within 48 hours*
- Direct contact block: `hello@akrosstech.com` · `+1 (XXX) XXX-XXXX [VERIFY]` · *Mon–Fri, 8 AM – 6 PM ET*
- Trust row: SOC 2 badge [VERIFY] · "NDA available" chip · a single small testimonial quote.
- Live indicator: `● Team online now · last reply 23 min ago` (driven by a real ops metric; hide it if no data is available rather than fake it).

### 11.3 Form card
Fields, validation and micro-copy are in Section F3. Submit button: **`Send — we'll reply within 4 hours →`**

### 11.4 Alternative paths (below the form)
- `Prefer to pick a time now? Book directly →` (inline Cal.com embed opens in a modal)
- `Security review first? Request our SOC 2 report and DPA →`
- `Looking for a job? See open roles →` (keeps careers inquiries out of the sales funnel)

### 11.5 Thank-you page `/contact/thank-you`
- H1: **Got it, {FirstName}. A real person is reading this now.**
- Body: *You'll hear from {Lead name / "our team"} by {computed time, e.g., "2:30 PM ET today"}. Want to skip the email back-and-forth? Book a time below.*
- Inline Cal.com embed (pre-filled name/email).
- Below: *While you wait:* 3 links: the most relevant case study (based on the service selected), the sample Friday report, the security page.

---

## 12. Careers `/careers`

Phase 1 is a lean structure; roles are managed in the ATS (Ashby/Greenhouse/Lever) and embedded.

### 12.1 Hero
- Eyebrow: `CAREERS`
- H1: **Do the work that makes great companies run.**
- Sub: *We hire operators who notice the details everyone else misses: the miscoded transaction, the double-booked interview, the 3-second load time. If that's you, you'll fit here.*
- CTA: `See open roles ↓` (anchor scroll to 12.5)
- Visual: duotone collage of 3 real team photos (staggered heights, cols 7–12) [VERIFY: real photos only].

### 12.2 What it's like here (3 cols)
- **Senior work, not ticket queues.** *You'll own a client's operations, not just tasks.*
- **Training that's actually funded.** *[VERIFY: e.g., $1,500/year learning budget, certifications paid: QuickBooks ProAdvisor, SHRM, AWS.]*
- **Remote, with real overlap.** *Work from home in [countries], with core hours that respect your time zone.*

### 12.3 Benefits grid [VERIFY all]
Icon cards: `Competitive USD-indexed pay` · `HMO / health coverage` · `Paid time off + local holidays` · `Equipment provided` · `Learning budget` · `Internal promotion first`

### 12.4 How we hire
4 steps, inline: **Apply** (5 min) → **Skills task** (paid if > 2 hours) → **Two interviews** (team lead + client lead) → **Offer within 48h**.
Line: *We reply to every applicant. Yes, including the no's.*

### 12.5 Open roles
- **Layout:** filter tabs by team (`All · Engineering · Recruiting · Assistance · Finance · Legal Ops`) and a list (not cards): Role title · Team · Location · Type · `→`.
- **Content:** ATS-fed list via API at build time (ISR revalidate 1h).
- **Empty state:** *"No open roles right now. Send us your profile and we'll reach out when something fits →"* (talent-pool form).

### 12.6 Team quote (duotone portrait + quote from a real employee [VERIFY]) → 12.7 Simple CTA band (not the lime slab; the slab is reserved for buyers): **"Don't see your role? We hire for talent first."** `Join the talent pool →`

### 12.7 Job detail `/careers/[role-slug]`
Template: H1 role title · meta row (team, location, type, salary range [show it: transparency attracts better candidates]) · About the role · What you'll do · What you'll bring · Nice to have · How we hire · `Apply for this role →` (ATS application) · `JobPosting` JSON-LD for Google for Jobs.
