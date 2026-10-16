# F · CTA & Conversion Strategy

> Our buyers don't impulse-buy. The conversion path is **two-speed**: a high-intent path (book a call) for buyers who are ready, and a low-commitment path (the calculator) for buyers who are still researching, which converts them later.

---

## F1. Primary vs. secondary CTA

| | Primary | Secondary |
|---|---|---|
| **Copy (default)** | `Book a 20-minute call →` | `See what it would cost` |
| **Short form (nav, mobile)** | `Book a call →` | `Estimate savings` |
| **Destination** | `/contact` (form → thank-you → calendar) | `/resources/back-office-calculator` |
| **Style** | Lime fill, Ink text (dark); Ink fill, Paper text (light) | Ghost: transparent, 1px `--ink-500` border, `--ink-50` text |
| **Intent** | Ready to talk | Researching / building a business case |
| **Why this wording** | "20-minute" sets a small, specific commitment. Busy executives say yes to a bounded ask. "Book" implies a calendar, not a sales chase. | "What it would cost" is the CFO's first real question; answering it without a call respects their time. |

**Contextual primary variants** (same style, page-specific copy):
- Service pages: `Book a {finance / hiring / web / VA / legal ops} scoping call →`
- How it works: `Book your scoping call →`
- Case study: `Get results like {Client}'s →`
- Security page: `Request our SOC 2 report →` (primary on that page only)

**Banned CTA copy:** "Submit," "Learn more," "Contact us," "Get started today!," "Request a demo" (we don't sell software), "Click here."

---

## F2. CTA placement rules

1. **One primary CTA per viewport, maximum.** Two lime buttons on screen at once halve the attention of each.
2. **Persistent:** the header `Book a call →` is always available (sticky header reappears on scroll-up).
3. **Rhythm:** a CTA opportunity roughly every **2 sections** (~1.5–2 viewports) on long pages, alternating forms: button → text link → inline calculator → button. Never a repeated identical banner.
4. **Mandatory positions on every marketing page:** hero (primary + secondary) · after the first proof section (text link) · the closing Volt slab (primary).
5. **The Volt slab appears once per page**, always last before the footer. It's the "decision moment."
6. **Contextual triggers (no pop-ups):**
   - **Scroll-depth nudge:** after 60% scroll on service pages, a small `e3` card slides in bottom-right (desktop only): *"Want a scoped plan for {service}? 20 minutes, no slides."* [Book a call] [×]. Shows once per session; dismissal is remembered for 30 days; never on mobile (blocks content).
   - **Return-visitor header swap:** on the 2nd+ session, the header ghost button changes from `Estimate savings` to `Pick up where you left off` if calculator data exists in localStorage.
   - **Exit intent:** ❌ **not used.** Exit-intent modals read desperate to enterprise buyers.
   - **Chat:** no auto-open chat. Optional P2: a "Talk to a human" link opening an Intercom/Crisp panel during staffed hours only, showing real response time.
7. **Mobile:** after the hero scrolls out of view, a slim **bottom bar** appears (56px, `e3`, safe-area aware): `[Estimate] [Book a call →]`. It hides while the virtual keyboard is open, on the contact page, and while the closing Volt slab or the footer is on screen (each has its own primary CTA, so this keeps rule 1).

---

## F3. Lead capture: the contact form

### F3.1 Design principles
- **6 required fields maximum.** Every extra field costs ~5–10% completion; we only ask what's needed to route the lead and prepare for the call.
- **Qualifying without interrogating:** company size and service interest let us route to the right lead and prepare, and buyers accept them because they make the call better.
- **No phone field required** (executives hate cold calls; optional only).

### F3.2 Fields

| # | Field | Type | Required | Label / placeholder | Validation & micro-copy |
|---|---|---|---|---|---|
| 1 | First name | text | ✅ | `First name` | 1–50 chars. Error: *"We'd like to know who we're talking to."* |
| 2 | Last name | text | ✅ | `Last name` | 1–50 chars |
| 3 | Work email | email | ✅ | `Work email` · placeholder `you@company.com` | RFC email + block free domains (gmail, yahoo…) with a **soft** warning, not a block: *"A work email helps us prepare. Personal is fine too."* |
| 4 | Company | text | ✅ | `Company` | Auto-enrich logo/size via Clearbit-style lookup (P2) |
| 5 | Company size | select | ✅ | `Company size` | `1–49` · `50–199` · `200–499` · `500–1,999` · `2,000+` |
| 6 | What do you need help with? | checkbox chips (multi) | ✅ (≥1) | `What should we take off your plate?` | `Web Development` · `Recruitment` · `Virtual Assistance` · `Accounting` · `Legal Assistance` · `Not sure yet`. Pre-selected from `?service=` param |
| 7 | Tell us a bit more | textarea | ❌ | `What's eating your team's week? (optional)` · placeholder *"e.g., Our month-end close takes 12 days and our controller is leaving in March."* | Max 1,500 chars, live counter at 1,200+ |
| 8 | When would you like to start? | radio (segmented) | ❌ | `Timeline` | `ASAP` · `This quarter` · `Next quarter` · `Just exploring` |
| 9 | NDA first? | checkbox | ❌ | `Send me a mutual NDA before our call` | — |
| 10 | Phone | tel | ❌ | Hidden behind a link: `+ Add a phone number` | E.164 normalization |
| — | Hidden | — | — | `utm_*`, `referrer`, `landing_page`, `calculator_result` (if any), `service_param` | — |
| — | Spam | — | — | Cloudflare Turnstile (invisible) + honeypot field + server-side rate limit (5/hour/IP) | — |

**Consent line** (caption, below the button): *"We'll use this to reply to you, and nothing else. No newsletters unless you ask. [Privacy policy]"*

> **As built (M1d):** fields, validation and micro-copy as specified, with these changes: the submit label is "Send. We'll reply within 4 business hours" (matches the SLA wording elsewhere); network/server errors show an inline alert in the form rather than a toast (announced and focused, with the email address as a link); the DocuSign NDA and the follow-up sequence are not automated yet. See README "Integrations".

### F3.3 Submit button
**`Send — we'll reply within 4 hours →`**
- Loading: `Sending…` with a 16px spinner; button keeps its width (no layout shift); fields disabled.
- Success: in-place transform to a lime check, then a redirect to `/contact/thank-you` after 600ms.
- Error (network/server): toast *"That didn't send. Your answers are saved; try again, or email hello@akrosstech.com."* (form state persisted in sessionStorage).
- Validation: on blur (not on keystroke), with an error summary at the top of the form on submit (linked to fields) for screen readers.

### F3.4 What happens after submission (the operational SLA is part of the UX)

| When | What | Owner/system |
|---|---|---|
| 0 s | Redirect to the thank-you page with personalized copy + inline Cal.com booking (pre-filled) | Next.js |
| 0 s | Lead created in HubSpot with all fields + UTMs; routed by service to the right lead | Server action → HubSpot API |
| 0 s | Slack alert to `#new-leads` with summary and a "Claim" button | Slack webhook |
| < 1 min | Confirmation email from a **named person** (not noreply): *"Hi {FirstName}, I'm {Lead}, I run {service} at Akrostech. I'll reply personally by {time}. If you'd rather just grab a slot: {calendar link}."* Plain text, no images (lands in Primary, not Promotions). | Resend + React Email |
| If NDA checked | DocuSign mutual NDA sent automatically | DocuSign API |
| < 4 business hours | Personal reply from the lead with 3 proposed times + 1 relevant case study | Human (SLA tracked in HubSpot) |
| Call booked | Calendar invite + a 3-question pre-call form (optional) + Zoom/Meet link | Cal.com |
| Call +24h | Operating Brief sent | Human |
| Call +48h | Proposal + quote | Human |
| No booking after 3 business days | One follow-up: *"Still worth a 20-minute call? If the timing's wrong, reply 'later' and I'll check back next quarter."* Then stop. | HubSpot sequence (max 2 touches) |

---

## F4. Lead magnet: **The Back-Office Cost Calculator** (`/resources/back-office-calculator`)

### Why this one
CFOs and COOs must justify outsourcing internally. The calculator **writes their business case for them** and gives them a PDF they can forward to their CEO/board. That makes it a sales tool that travels through the buying committee.

### Experience
- **Ungated results on screen** (trust first). **Gated PDF** export ("Email me the full report + methodology") requires only name + work email.
- 3 steps, one screen each on mobile, side-by-side on desktop, with a live result panel sticky on the right.

**Step 1 · Your team:** Region of in-house staff (select: US/Canada · UK/EU · Australia/NZ · Other) · Company size (select).

**Step 2 · The work:** for each function (toggle on/off): Finance & payroll · Hiring · Admin / exec support · Website · Legal ops → hours per week (slider 0–200, with presets: "a few hours," "half a person," "a full person," "a team") and who does it today (role select with salary presets: e.g., Controller $145K, EA $78K, Engineer $170K, Recruiter $95K, Paralegal $72K [VERIFY with current salary data, e.g., BLS/Levels.fyi/Robert Half guide, and cite the source in the methodology]).

**Step 3 · Results (live):**
- **Current annual cost of this work:** fully loaded (salary × 1.3 benefits/overhead multiplier, shown and editable)
- **Estimated Akrostech cost:** range from internal rate card (low–high)
- **Annual savings:** range, e.g., `$142K – $198K`
- **Senior hours returned per year:** e.g., `1,840 hours ≈ 0.9 FTE of your controller's time`
- **Break-even:** `Month 1` (no setup fees)
- A bar chart (in-house vs. Akrostech) in `--ink-500` vs. `--volt-500`
- A plain-language summary: *"Your team spends about 46 hours a week on work Akrostech could run. Moving it would cost roughly $X and return 1,840 senior hours a year."*
- CTAs: `Book a call to validate these numbers →` (primary) · `Email me the PDF` (secondary)

> **As built (M3a):** the live page shows today's cost, hours returned and FTE, and invites a written quote; "Estimated Akrostech cost", savings, break-even and the bar chart switch on once `content/rate-card.ts` holds Akrostech's approved hourly ranges. Salary presets apply to US/Canada only (elsewhere the salary is entered), the overhead multiplier is editable as a percentage, company size is optional and doesn't change the result, and the role select became an editable salary with the preset role named. The gated PDF report follows in M3b.

### Rules
- Show the **methodology and assumptions** inline (an expandable "How we calculate this"). Hidden math kills CFO trust.
- Show *ranges*, never a single magic number.
- Never inflate: if savings are small, say so. *"Honestly, at this volume, an in-house hire might make more sense. Here's when we'd become cheaper."* This candor is the strongest possible trust signal and filters out bad-fit leads.
- Store inputs in localStorage so returning visitors resume; send the inputs as hidden fields with any contact form submission.

### Secondary lead magnet (P2)
**"The Ops Readiness Scorecard":** a 12-question assessment (5 minutes) scoring each back-office function from 1 to 5 on documentation, ownership, tooling and risk, with a benchmark against companies of the same size and a tailored 90-day plan PDF. It appeals to COOs preparing for a funding round or an audit.

---

## F5. Measurement

| Event | Tool | Goal |
|---|---|---|
| `cta_click` {location, label} | PostHog | Identify which CTA positions work |
| `calculator_start`, `calculator_complete`, `calculator_pdf` | PostHog | Funnel: 40% start→complete target |
| `form_start`, `form_field_error` {field}, `form_submit` | PostHog | Form drop-off by field |
| `booking_created` | Cal.com webhook → PostHog | Primary KPI |
| Session recordings (masked inputs) | PostHog | UX diagnosis |

**Targets (first 90 days, [VERIFY baseline]):** homepage → contact CTR ≥ 4% · form completion ≥ 35% of starts · calculator completion ≥ 40% of starts · lead → booked call ≥ 50%.
