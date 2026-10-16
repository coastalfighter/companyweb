# E · Trust & Credibility Strategy

> A skeptical enterprise buyer runs a subconscious checklist in the first 5 seconds: *Is this a real company? Do they look like they're my size? Have people like me used them? Will they lose my data? Can I get out?* Every component below answers one of those questions.

---

## E1. The 5-second trust stack (above and just below the fold)

| Second | What the buyer sees | Question it answers |
|---|---|---|
| 0–1 | Premium, calm, fast-loading dark UI; precise typography; no pop-ups | "Is this a serious company?" Design quality is a proxy for operational quality. |
| 1–2 | H1 + sub with *specific* claims (named functions, "timelines you can audit") | "Do they know what they do?" |
| 2–3 | The Ops Feed: real-looking task log with timestamps | "Will I be able to see what they're doing?" |
| 3–4 | Reassurance line: `Live in 10 business days · No long-term lock-in · NDA before the first call` | "What's the risk?" (answers it before they ask) |
| 4–5 | Logo bar peeking above the fold | "Have companies like mine used them?" |

**What we deliberately remove from the first 5 seconds:** cookie walls covering the hero (use a compact bottom-left banner instead), chat widgets that auto-open, newsletter pop-ups, carousels, autoplay video with sound, and stock imagery. Each of those reads "small business marketing playbook."

---

## E2. Social proof components

### E2.1 Client logo bar
- 10–14 logos, monochrome `--ink-300`, normalized to equal *optical* weight (not equal height: wide wordmarks get 24px, square marks 32px).
- **Only logos with written permission.** Keep the permission emails in a shared folder; procurement teams do check.
- Label above with a *specific* count: `Trusted by operators at 140+ companies in 11 countries [VERIFY]`.
- Segment-aware (P2): swap logo sets by `?industry=` or by referrer (e.g., healthcare visitors see healthcare logos first).

### E2.2 Testimonial format
Every testimonial must contain:
1. **A specific outcome** (number or concrete before/after). "Great to work with" is banned.
2. **Full name, title and company** (or "Name withheld at client's request" + title + industry + company size, which is still credible when it's specific).
3. **A real photo** (duotone-treated) or company logo.
4. **The service(s) used** as a tag.
5. Optional: a `Verified client` micro-badge linking to a Clutch/G2 review.

Visual: `e1` card, a large `“` glyph in `--volt-500` at 32px, the quote in body-lg `--ink-50`, a hairline divider, an avatar (40px), name (`h5`), title/company (caption `--text-tertiary`), and service tags (`micro` badges).

### E2.3 Case study cards
Card shows: client logo (top-left), service tags, **outcome-first headline**, a 2–3 stat row in mono, and `Read the story →`. No vague titles like "Helping Company X grow."

### E2.4 Stats / counters
Rules: max 4 per band; each has a **methodology footnote** linking to `/about/security#methodology`; numbers are odd and specific (`96%`, `3h 41m`). Round numbers look invented. Count up once.

### E2.5 Certifications & security proof
A dedicated **Trust Center** at `/about/security` (a pattern Vanta/Drata clients use), with:
- current certifications (with auditor name and report date)
- a sub-processor list
- data handling and retention policy
- incident response summary
- downloadable DPA, plus a "Request SOC 2 report" form (NDA click-through)
- staff vetting process
- a public status page link (P2)

### E2.6 Reference calls
"Talk to a client" offered after the scoping call (stated on /work and the pricing FAQ). Simply *offering* this is a strong signal, and most prospects never take it up.

### E2.7 Named humans everywhere
Lead names and faces on service pages ("Your Finance Lead might be…"), a real sender name on the thank-you page, and leadership on About. Faceless outsourcing is the #1 trust killer.

---

## E3. Sample testimonial blocks `[SAMPLE: fabricated for format only. Do not publish.]`

> **Important:** these demonstrate format and tone only. Publishing fabricated testimonials violates the FTC's Rule on Consumer Reviews and Testimonials (16 CFR Part 465) and equivalent laws elsewhere. Replace with real, permissioned quotes before launch.

### Testimonial 1 · CFO, Accounting Assistance
> “I expected to spend the first three months managing a vendor. Instead I got my first business-day-5 close in month two, and a report every Friday that I actually read.”
>
> **Dana Whitfield** · CFO, Tidemark Health
> *Healthcare services · 380 employees*
> `Accounting` `Virtual Assistance`

### Testimonial 2 · CTO, Web Development + Recruitment
> “They rebuilt our marketing site in six weeks without pulling a single engineer off the product. Then they filled three backend roles we'd had open since spring. Our team never had to chase them for an update, not once.”
>
> **Marcus Oyelaran** · CTO, Bramblecrest Analytics
> *B2B SaaS · Series C · 220 employees*
> `Web Development` `Recruitment`

### Testimonial 3 · COO, Legal + Virtual Assistance
> “We had 1,200 contracts in a shared drive and no idea what auto-renewed when. Akrostech built the register in six weeks and caught 23 renewals we would have paid for. Our general counsel now reviews by exception instead of drafting NDAs at night.”
>
> **Priya Raman** · COO, Larkspur Freight
> *Logistics · $140M revenue*
> `Legal Assistance` `Virtual Assistance`

**Tone notes:** each quote names a *prior fear* ("managing a vendor," "chase them," "no idea"), states a *specific outcome*, and ends with a *human detail* ("a report I actually read," "drafting NDAs at night"). That structure (fear → proof → relief) is what converts skeptical buyers.

---

## E4. Recommended trust badges & credibility markers

Display only what is genuinely held. Ordered by impact on enterprise buyers:

| Marker | Relevance | Where shown |
|---|---|---|
| **SOC 2 Type II** (AICPA) | The #1 procurement gate for US mid-market/enterprise vendors handling data. Strongly recommended to obtain if not held (Vanta/Drata + auditor: ~3–6 months). | Footer, Security band, Contact, Trust Center |
| **ISO/IEC 27001:2022** | Required by many EU/UK and global buyers. | Same |
| **GDPR / UK GDPR + CCPA compliance** (DPA + SCCs available) | Mandatory for EU/CA personal data (candidates, payroll). | Trust Center, Contact |
| **HIPAA BAA available** | Only if serving healthcare and controls are in place. | Healthcare industry page, Trust Center |
| **PCI DSS** awareness / SAQ | Only if touching card data in AP/AR. | Trust Center |
| **Clutch / G2 verified reviews** (badge with live rating) | Third-party proof that buyers check independently. | Footer, Contact |
| **Platform partner badges:** QuickBooks ProAdvisor, Xero Certified Advisor, NetSuite Solution Provider, Gusto/Rippling Partner, Greenhouse/Lever partner, Webflow Enterprise Partner, Vercel Partner, Ironclad partner | Proves tool fluency per service. | On each service page's Tools section, not the footer (keeps the footer clean). |
| **Cyber liability + E&O / professional indemnity insurance** (state coverage amount) | CFOs ask about it. Stating it upfront ("$5M cyber + E&O coverage [VERIFY]") is rare and powerful. | Trust Center, FAQ |
| **Background-checked staff** (name the provider, e.g., Checkr/Sterling) | Directly addresses "who will be in our systems?" | Security band |
| **Mutual NDA before scoping** | Removes the first-call risk. | Hero reassurance line, Contact |
| **Accessibility statement (WCAG 2.1 AA)** | Shows rigor, required by some public-sector and enterprise procurement. | Footer |
| **IAOP membership / Global Outsourcing 100** (if eligible) | Industry-specific credibility. | About |

**Badge styling:** monochrome `--ink-300` versions (official marks permitting), equal 32px height, in a hairline-bordered row. Never a colorful "badge salad," which reads as insecure.
