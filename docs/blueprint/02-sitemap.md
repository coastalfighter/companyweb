# B · Site Architecture

> IA principle: **a buyer should reach "what you do, what it costs me, who's done it, how to start" in ≤ 2 clicks from anywhere.** Executives don't explore; they verify.

---

## B1. Full sitemap

Legend: **P1** = Phase 1 (launch) · **P2** = Phase 2 (post-launch, 60–120 days) · 🔒 = noindex

```
akrosstech.com
│
├── /                                         Homepage                                P1
│
├── /services                                 Services hub                            P1
│   ├── /services/web-development             Web Development                         P1
│   │   ├── /services/web-development/rebuilds           Site rebuilds & migrations   P2
│   │   ├── /services/web-development/maintenance        Care & maintenance plans     P2
│   │   └── /services/web-development/performance        Performance & CWV audits     P2
│   ├── /services/recruitment                 Recruitment Assistance                  P1
│   │   ├── /services/recruitment/technical-hiring       Technical hiring             P2
│   │   └── /services/recruitment/high-volume            High-volume hiring           P2
│   ├── /services/virtual-assistance          Virtual Assistance                      P1
│   │   ├── /services/virtual-assistance/executive       Executive assistance         P2
│   │   └── /services/virtual-assistance/operations      Operations support           P2
│   ├── /services/accounting                  Accounting Assistance                   P1
│   │   ├── /services/accounting/bookkeeping             Bookkeeping & close          P2
│   │   ├── /services/accounting/payroll                 Payroll operations           P2
│   │   └── /services/accounting/ap-ar                   AP / AR management           P2
│   └── /services/legal                       Legal Assistance                        P1
│       ├── /services/legal/contract-management          Contract management          P2
│       └── /services/legal/compliance                   Compliance operations        P2
│
├── /how-it-works                             Process / onboarding                    P1
├── /pricing                                  Engagement models (no list prices)      P2
│
├── /work                                     Case studies index                      P1
│   └── /work/[slug]                          Case study detail (template)            P1 (1–3 at launch)
│
├── /industries                               Industries hub                          P2
│   ├── /industries/saas
│   ├── /industries/healthcare
│   ├── /industries/professional-services
│   ├── /industries/ecommerce
│   └── /industries/fintech
│
├── /about                                    About                                   P1
│   ├── /about/leadership                     Leadership (anchor on /about at P1)     P2
│   └── /about/security                       Security & compliance (trust center)    P1
│
├── /careers                                  Careers                                 P1
│   └── /careers/[role-slug]                  Job detail                              P1 (via ATS embed)
│
├── /resources                                Resources hub                           P2
│   ├── /resources/blog/[slug]                Articles ("Field Notes")                P2
│   ├── /resources/guides/[slug]              Gated guides                            P2
│   └── /resources/back-office-calculator     Cost calculator (lead magnet)           P1 ← launch with v1
│
├── /compare                                  Comparison pages                        P2
│   ├── /compare/in-house-vs-akrostech
│   └── /compare/freelancers-vs-akrostech
│
├── /contact                                  Contact / Get started                   P1
│   ├── /contact/thank-you               🔒   Post-submit confirmation + booking      P1
│   └── /contact/book                    🔒   Direct calendar (for email/sales links) P1
│
├── /client-login                             → external portal redirect              P2
│
└── /legal
    ├── /legal/privacy                        Privacy policy                          P1
    ├── /legal/terms                          Terms of use                            P1
    ├── /legal/cookies                        Cookie policy                           P1
    ├── /legal/dpa                            Data processing addendum (PDF + page)   P1
    └── /legal/accessibility                  Accessibility statement                 P1

System:  /404 · /500 · /sitemap.xml · /robots.txt · /llms.txt · /rss.xml (P2)
```

### Slug rules

- Lowercase, hyphenated, no trailing slash, no dates in blog slugs.
- `/services/recruitment` (not `/recruitment-assistance`): shorter, and "assistance" is implied by the page.
- `/work` instead of `/case-studies`: shorter, more confident, and the convention used by premium agencies.

### Migration from the compromised site (critical)

The current site is spam-injected. Launch tasks:

1. Crawl the old site (Screaming Frog) and export every indexed URL from Google Search Console.
2. **301** legitimate legacy URLs to their new equivalents (map in a `redirects.ts` file in Next.js).
3. Return **410 Gone** for every spam URL (pharma, casino, foreign-language injected pages). 410 de-indexes faster than 404.
4. Submit the new `sitemap.xml`, use the GSC Removals tool for the worst spam URLs, and request review if a Manual Action exists.
5. Rotate all hosting, DNS, CMS and email credentials. Enable DNSSEC, and set SPF/DKIM/DMARC (`p=reject`) so spammers can't spoof the domain.

---

## B2. Navigation

### B2.1 Primary nav (desktop, ≥1024px)

```
[Logo]   Services ▾   How it works   Work   About   Careers        [Calculator]   [Book a call →]
```

| Item | Behavior |
|---|---|
| **Services ▾** | Opens a mega-menu panel (see below) on hover (150ms intent delay) and on click/Enter. |
| How it works | `/how-it-works` |
| Work | `/work` |
| About | `/about` (Security sits inside About's mega-dropdown at P2) |
| Careers | `/careers` |
| **Calculator** | Ghost button → `/resources/back-office-calculator`. Secondary CTA, always visible. |
| **Book a call →** | Primary lime button → `/contact`. |

Five text links max. Every extra link dilutes the CTA.

**Services mega-menu (desktop):** full-container-width panel, `e3` surface, 3-zone layout:

| Zone (cols) | Content |
|---|---|
| Cols 1–8: Services grid (2×3) | Each tile: 40px glyph, service name (h5), one-line outcome in body-sm `--text-secondary`, e.g. **Web Development** · "Sites that load in under a second and convert." The sixth tile is **All services →** |
| Cols 9–12: Proof slot | Latest case study card: thumbnail, "Case study" eyebrow, headline "How Northwind cut month-end close from 15 days to 5", link "Read the story →" |
| Footer strip | `Not sure where to start? Take the 2-minute calculator →` · `Avg. response time: 3h 12m [VERIFY]` with a live lime dot |

### B2.2 Utility nav

No top utility bar at launch (it adds visual noise and pushes the hero down). Utility items live in:
- the **header right** (Calculator, Book a call)
- the **footer** (Client login, Security, Status, Theme toggle)

At P2, once a client portal exists, add `Client login` as a 14px text link to the left of the Calculator button.

### B2.3 Sticky header behavior

- Initial: transparent background, 80px tall, logo full size.
- After 24px scroll: background `rgb(10 10 10 / 0.72)` + `backdrop-filter: blur(12px) saturate(140%)`, 1px bottom border `--ink-600`, height 64px (transitions over 220ms `ease-out-expo`).
- **Hides on scroll-down after 400px, reappears on any scroll-up** (saves vertical space for reading). It never hides when the mega-menu is open or focus is inside the header.
- A 2px lime **reading progress bar** sits on the header's bottom edge on case-study and article pages only.

### B2.4 Mobile menu (< 1024px)

Header: `[Logo] ················ [Book a call] [☰]`. The CTA stays visible outside the menu as a compact 36px button.

Tapping ☰ opens a **full-screen sheet** (slides down 360ms, `ease-out-expo`; background `--ink-950`; focus trapped; body scroll locked):

```
┌───────────────────────────────┐
│ [Logo]                    [✕] │
│                               │
│ Services                   +  │  ← accordion, expands to:
│    Web Development            │
│    Recruitment                │
│    Virtual Assistance         │
│    Accounting                 │
│    Legal                      │
│    All services →             │
│ How it works                  │
│ Work                          │
│ About                         │
│ Careers                       │
│ ───────────────────────────── │
│ [ Estimate your savings ]     │  ← ghost, full width
│ [ Book a 20-min call → ]      │  ← primary, full width, pinned bottom
│                               │
│ hello@akrosstech.com          │
│ Mon–Fri · replies in < 4h     │
└───────────────────────────────┘
```

- Top-level items: Bricolage 32px / 600, 56px tap rows.
- Items stagger in (30ms each, 12px rise).
- Close: ✕, the Esc key, or tapping any link.

### B2.5 Footer navigation

Ink-950 background, top border `--ink-600`. Five columns at ≥1024, two at md, an accordion at <640.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo]                                                                       │
│ The operations team behind growing companies.                                │
│ [Book a call →]                                                              │
│                                                                              │
│ Services            Company            Proof               Resources         │
│ Web Development     About              Case studies        Cost calculator   │
│ Recruitment         How it works       Security & trust    Field notes (P2)  │
│ Virtual Assistance  Careers            Status page (P2)    Guides (P2)       │
│ Accounting          Contact            Client login (P2)                     │
│ Legal                                                                        │
│                                                                              │
│ ─────────────────────────────────────────────────────────────────────────── │
│ [SOC 2] [ISO 27001] [GDPR] [Clutch ★4.9]   ← only the ones you actually hold │
│ ─────────────────────────────────────────────────────────────────────────── │
│ © 2026 Akrostech. Akrostech is not a law firm or CPA firm.                   │
│ Privacy · Terms · Cookies · DPA · Accessibility        [◐ Theme] [in] [GitHub]│
└──────────────────────────────────────────────────────────────────────────────┘
```

The disclaimer line ("not a law firm or CPA firm") is intentional. It protects us legally, and to a CFO it reads as *honest*, which is a trust signal in itself.
