# J · Starter Code: Homepage Hero (Concept 1 "The Ops Feed")

Two versions:

1. **[`/starter/hero.html`](../../starter/hero.html):** a self-contained HTML + Tailwind file you can open in any browser right now. It includes the sticky header, hero copy, CTAs and a working live Ops Feed with filter tabs, a pause control, pointer tilt, reduced-motion support and keyboard-accessible tabs. It was checked in headless Chromium at 1440×900 and 390×844, with no console errors and no horizontal overflow.
2. **Next.js / React components (below):** the same hero split into production components for the stack in Section I (Next.js 15 + Tailwind v4 + `tokens.css`).

---

## J1. Using the HTML file

```bash
# Open directly
open starter/hero.html            # macOS
xdg-open starter/hero.html        # Linux

# Or serve it (fonts and CDN load the same either way)
npx serve starter
```

Notes:
- It uses the **Tailwind Play CDN** (pinned `3.4.17`) for drop-in convenience. That's fine for prototyping, but **not for production**: in the real build, Tailwind v4 compiles with `tokens.css`, which removes the ~100 KB runtime.
- The logo is a **placeholder mark**. Swap in the official SVG.
- The **numbers in the feed** (38 tasks, 3h 41m) are illustrative. Wire them to real ops data, or keep them clearly framed as an example (the visually-hidden summary already says "Example of the live task log…").

### What's implemented

| Feature | Detail |
|---|---|
| LCP-safe H1 | Text renders immediately; only the line rise animates (transform/opacity) |
| Load choreography | Grid fade → H1 lines (80ms stagger) → sub → CTAs → panel → feed rows (90ms stagger) |
| Live feed | New task every 3.2s (5s on mobile), newest first, with a simulated workday clock; an "in review" item periodically resolves to ✓ and re-queues |
| Filter tabs | `role="tablist"`, arrow-key navigation, roving tabindex |
| Pause control | WCAG 2.2.2 compliant; `aria-pressed`; auto-pauses in background tabs |
| Pointer tilt | ≤ 3°, fine-pointer devices only, disabled with reduced motion |
| Reduced motion | All motion collapses to 150ms fades; the feed starts paused |
| Sticky header | Transparent → blurred Ink at 24px scroll, 80px → 64px |
| Accessibility | Skip link, landmarks, the feed is `aria-hidden` with an sr-only summary, visible lime focus rings |

---

## J2. Next.js components (production version)

### File tree

```
components/marketing/hero/
├── hero.tsx              # Server component: copy, CTAs, layout
├── ops-feed.tsx          # Client island: live feed
├── ops-feed-data.ts      # Typed seed + stream data
└── ops-feed.test.tsx     # Vitest + Testing Library
```

### `ops-feed-data.ts`

```ts
export type ServiceTag = "WEB" | "HIR" | "ADM" | "FIN" | "LEG";
export type TaskStatus = "done" | "review";

export interface OpsTask {
  id: string;
  tag: ServiceTag;
  text: string;
  time: string; // "HH:MM" or "in review"
  status: TaskStatus;
}

export const SERVICE_LABELS: Record<ServiceTag, string> = {
  WEB: "Web",
  HIR: "Hiring",
  ADM: "Admin",
  FIN: "Finance",
  LEG: "Legal",
};

/** Newest first. */
export const SEED_TASKS: OpsTask[] = [
  { id: "s1", tag: "FIN", text: "Q3 accruals reconciled · 0 variances", time: "12:08", status: "done" },
  { id: "s2", tag: "ADM", text: "Board deck formatted · sent to 7 directors", time: "11:30", status: "done" },
  { id: "s3", tag: "WEB", text: "Checkout LCP 3.1s → 1.2s", time: "11:03", status: "done" },
  { id: "s4", tag: "LEG", text: "Vendor MSA redline · round 2", time: "in review", status: "review" },
  { id: "s5", tag: "HIR", text: "Shortlist sent · Sr. Backend Engineer", time: "10:15", status: "done" },
  { id: "s6", tag: "FIN", text: "Payroll run closed · 214 employees", time: "09:42", status: "done" },
];

export const STREAM_TASKS: ReadonlyArray<Pick<OpsTask, "tag" | "text">> = [
  { tag: "HIR", text: "4 interviews scheduled · Product Designer" },
  { tag: "ADM", text: "Inbox triaged · 186 → 9 flagged" },
  { tag: "LEG", text: "NDA executed · Larkspur Freight" },
  { tag: "WEB", text: "Pricing page shipped to staging" },
  { tag: "FIN", text: "AP run approved · 42 invoices · $318,400" },
  { tag: "HIR", text: "Offer accepted · Data Engineer" },
  { tag: "LEG", text: "Renewal flagged · notice due in 60 days" },
  { tag: "ADM", text: "Offsite booked · 18 travelers, 3 cities" },
  { tag: "WEB", text: "Accessibility fixes merged · 0 axe issues" },
  { tag: "FIN", text: "Bank recs complete · 6 accounts" },
];

/** Advances a simulated workday clock by 4–11 minutes, capped at 17:59. */
export function advanceClock(minutes: number, random: () => number = Math.random): number {
  return Math.min(minutes + 4 + Math.floor(random() * 8), 17 * 60 + 59);
}

export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
```

### `ops-feed.tsx`

```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  SEED_TASKS,
  SERVICE_LABELS,
  STREAM_TASKS,
  advanceClock,
  formatClock,
  type OpsTask,
  type ServiceTag,
} from "./ops-feed-data";

type Filter = "ALL" | ServiceTag;
const FILTERS: Filter[] = ["ALL", "WEB", "HIR", "ADM", "FIN", "LEG"];
const MAX_ROWS = 6;

interface OpsFeedProps {
  initialCount?: number;
  medianTurnaround?: string;
  intervalMs?: number;
}

export function OpsFeed({ initialCount = 38, medianTurnaround = "3h 41m", intervalMs = 3200 }: OpsFeedProps) {
  const reduceMotion = useReducedMotion();
  const [tasks, setTasks] = useState<OpsTask[]>(SEED_TASKS);
  const [count, setCount] = useState(initialCount);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [paused, setPaused] = useState(false);
  const clockRef = useRef(12 * 60 + 8);
  const streamRef = useRef(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Reduced motion: start paused (user can still resume)
  useEffect(() => {
    if (reduceMotion) setPaused(true);
  }, [reduceMotion]);

  const tick = useCallback(() => {
    clockRef.current = advanceClock(clockRef.current);
    const time = formatClock(clockRef.current);

    setTasks((prev) => {
      const reviewIdx = prev.findIndex((t) => t.status === "review");
      if (reviewIdx > -1 && Math.random() < 0.25) {
        const resolved = prev[reviewIdx];
        const rest = prev.filter((_, i) => i !== reviewIdx);
        return [{ ...resolved, id: `${resolved.id}-done`, text: resolved.text.replace(/round \d/, "approved"), time, status: "done" as const }, ...rest].slice(0, 24);
      }
      const next = STREAM_TASKS[streamRef.current % STREAM_TASKS.length];
      streamRef.current += 1;
      return [{ id: `t${streamRef.current}-${clockRef.current}`, ...next, time, status: "done" as const }, ...prev].slice(0, 24);
    });
    setCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (paused) return;
    let id: number | undefined;
    const run = () => {
      id = window.setInterval(tick, window.innerWidth < 640 ? Math.max(intervalMs, 5000) : intervalMs);
    };
    const onVisibility = () => {
      window.clearInterval(id);
      if (!document.hidden) run();
    };
    run();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, tick, intervalMs]);

  const visible = useMemo(
    () => tasks.filter((t) => filter === "ALL" || t.tag === filter).slice(0, MAX_ROWS),
    [tasks, filter],
  );

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const nextIndex = (index + dir + FILTERS.length) % FILTERS.length;
    setFilter(FILTERS[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="relative rounded-3xl border border-ink-600 bg-ink-850/90 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_32px_80px_-24px_rgb(0_0_0/0.8)]">
      <div aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(163_230_53/0.6),transparent)]" />
      <p className="sr-only">
        Example of the live task log Akrostech clients see: payroll, hiring, legal, web and admin tasks completed today,
        each with a timestamp.
      </p>

      <div className="flex items-center justify-between border-b border-ink-600 px-5 py-4">
        <span className="font-mono text-[12px] text-ink-300">akrostech / ops · this week</span>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Resume live feed" : "Pause live feed"}
          className="grid size-7 place-items-center rounded-md text-ink-300 transition-colors hover:bg-white/[0.06] hover:text-ink-50"
        >
          {paused ? "▶" : "❚❚"}
        </button>
      </div>

      <div role="tablist" aria-label="Filter tasks by service" className="flex gap-1 overflow-x-auto border-b border-ink-600 px-3 py-2">
        {FILTERS.map((f, i) => (
          <button
            key={f}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={filter === f}
            tabIndex={filter === f ? 0 : -1}
            onClick={() => setFilter(f)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
            className="shrink-0 rounded-md px-3 py-1.5 text-[12px] font-medium text-ink-300 transition-colors hover:text-ink-100 aria-selected:bg-ink-700 aria-selected:text-ink-50"
          >
            {f === "ALL" ? "All" : SERVICE_LABELS[f]}
          </button>
        ))}
      </div>

      <ul aria-hidden className="relative h-[312px] overflow-hidden px-2 py-2 sm:h-[336px]" data-testid="ops-feed-rows">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((t) => (
            <motion.li
              key={t.id}
              layout={!reduceMotion}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.15 : 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/[0.03]"
            >
              <span
                className={
                  t.status === "review"
                    ? "grid size-5 shrink-0 place-items-center rounded-full border border-ion-400/40 text-[10px] text-ion-400"
                    : "grid size-5 shrink-0 place-items-center rounded-full bg-volt-500/15 text-[10px] text-volt-500"
                }
              >
                {t.status === "review" ? "◐" : "✓"}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink-100">{t.text}</span>
              <span className="hidden shrink-0 rounded border border-ink-600 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-ink-300 sm:inline">
                {t.tag}
              </span>
              <span className={`w-[68px] shrink-0 text-right font-mono text-[12px] ${t.status === "review" ? "text-ion-400" : "text-ink-300"}`}>
                {t.time}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-600 px-5 py-3.5 font-mono text-[12px] text-ink-300">
        <span>
          <span className="text-ink-50" data-testid="ops-feed-count">
            {count}
          </span>{" "}
          tasks completed today
        </span>
        <span>
          median turnaround <span className="text-volt-500">{medianTurnaround}</span>
        </span>
      </div>
    </div>
  );
}
```

### `hero.tsx`

```tsx
import Link from "next/link";
import { OpsFeed } from "./ops-feed";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pb-24 pt-28 sm:pt-32 lg:flex lg:min-h-[max(680px,calc(100svh-64px))] lg:items-center lg:pt-32"
    >
      <div aria-hidden className="hero-grid-overlay pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 size-[720px] rounded-full bg-[radial-gradient(closest-side,rgb(163_230_53/0.16),transparent_70%)] max-lg:left-1/2 max-lg:top-[55%] max-lg:-translate-x-1/2 lg:right-[-8%] lg:top-[8%]"
      />

      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-14 px-5 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-10">
        <div className="lg:col-span-7">
          <p className="mb-6 inline-flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.12em] text-ink-300">
            <span aria-hidden className="size-1.5 rounded-full bg-volt-500 motion-safe:animate-pulse" />
            Operations, handled
          </p>

          <h1
            id="hero-title"
            className="font-display text-[clamp(3rem,1.94rem+4.51vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-balance"
          >
            We run the parts of your business{" "}
            <span className="bg-[linear-gradient(180deg,#d9f99d_0%,#a3e635_55%,#84cc16_100%)] bg-clip-text text-transparent">
              nobody sees.
            </span>
          </h1>

          <p className="mt-7 max-w-[52ch] text-[clamp(1.125rem,1.08rem+0.19vw,1.25rem)] leading-[1.55] text-ink-200">
            Akrostech is the operations team behind growing companies. Engineering, hiring, admin, finance, and legal
            work, delivered by dedicated specialists on timelines you can audit.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-lg bg-volt-500 px-6 text-base font-medium text-ink-950 transition-all duration-150 ease-out-expo hover:bg-volt-300 hover:shadow-[0_0_0_1px_rgb(163_230_53/0.25),0_8px_32px_-8px_rgb(163_230_53/0.45)] focus-visible:outline-ink-50 active:scale-[0.98] active:bg-volt-600 sm:h-12 sm:px-5"
            >
              Book a 20-minute call
              <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-[3px]">
                →
              </span>
            </Link>
            <Link
              href="/resources/back-office-calculator"
              className="inline-flex h-14 items-center justify-center rounded-lg border border-ink-500 px-6 text-base font-medium text-ink-50 transition-colors duration-150 hover:border-ink-300 hover:bg-white/[0.04] sm:h-12 sm:px-5"
            >
              See what it would cost
            </Link>
          </div>

          <ul aria-label="Commitments" className="mt-8 flex flex-wrap gap-x-3 gap-y-2 text-[13px] text-ink-300">
            <li>Live in 10 business days</li>
            <li aria-hidden className="text-ink-500">·</li>
            <li>No long-term lock-in</li>
            <li aria-hidden className="text-ink-500">·</li>
            <li>NDA before the first call</li>
          </ul>
        </div>

        <div className="lg:col-span-5">
          <OpsFeed />
        </div>
      </div>
    </section>
  );
}
```

Add to `globals.css`:

```css
.hero-grid-overlay {
  background-image: repeating-linear-gradient(to right, rgb(46 46 51 / 0.4) 0 1px, transparent 1px calc(100% / 12));
  mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, #000 30%, transparent 75%);
}
```

### `ops-feed.test.tsx`

```tsx
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OpsFeed } from "./ops-feed";
import { advanceClock, formatClock } from "./ops-feed-data";

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react");
  return { ...actual, useReducedMotion: () => false };
});

describe("ops-feed-data", () => {
  it("formats minutes as HH:MM", () => {
    expect(formatClock(9 * 60 + 5)).toBe("09:05");
  });

  it("advances the clock 4–11 minutes and caps at 17:59", () => {
    expect(advanceClock(600, () => 0)).toBe(604);
    expect(advanceClock(600, () => 0.999)).toBe(611);
    expect(advanceClock(17 * 60 + 58, () => 0.5)).toBe(17 * 60 + 59);
  });
});

describe("<OpsFeed />", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders six seed rows and the initial count", () => {
    render(<OpsFeed initialCount={38} />);
    expect(within(screen.getByTestId("ops-feed-rows")).getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByTestId("ops-feed-count")).toHaveTextContent("38");
  });

  it("increments the count on each tick", () => {
    render(<OpsFeed initialCount={38} intervalMs={1000} />);
    act(() => {
      vi.advanceTimersByTime(window.innerWidth < 640 ? 5000 : 1000);
    });
    expect(screen.getByTestId("ops-feed-count")).toHaveTextContent("39");
  });

  it("stops ticking when paused", () => {
    render(<OpsFeed initialCount={38} intervalMs={1000} />);
    fireEvent.click(screen.getByRole("button", { name: /pause live feed/i }));
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByTestId("ops-feed-count")).toHaveTextContent("38");
    expect(screen.getByRole("button", { name: /resume live feed/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("filters rows by service tab and supports arrow-key navigation", () => {
    render(<OpsFeed />);
    fireEvent.click(screen.getByRole("tab", { name: "Finance" }));
    const rows = within(screen.getByTestId("ops-feed-rows")).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    rows.forEach((row) => expect(row).toHaveTextContent("FIN"));

    fireEvent.keyDown(screen.getByRole("tab", { name: "Finance" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Legal" })).toHaveAttribute("aria-selected", "true");
  });
});
```

---

## J3. Next steps (build milestones)

The blueprint is complete. To build it sequentially, request these milestones in order:

1. **M0 · Foundation repo:** "Scaffold the Next.js 15 project with Tailwind v4, `tokens.css`, fonts, shadcn primitives restyled to tokens, ESLint/Prettier/Vitest/Playwright, and `.env.example`."
2. **M1a · Global layout:** "Build SiteHeader (with mega-menu), MobileNav, SiteFooter, VoltSlab, and the Button/Badge/Card primitives from Section G, with tests."
3. **M1b · Homepage:** "Build the homepage sections 1.1–1.13 using the hero above."
4. **M1c · Service template + 5 service pages** (Sanity schema + page template).
5. **M1d · Contact flow:** "Form, server action, Turnstile, HubSpot, Resend, Slack, thank-you page, with tests."
6. **M2 · Proof pages:** About, How It Works, Work index + case-study template, Careers (ATS).
7. **M3 · Calculator:** "Build the Back-Office Cost Calculator with a unit-tested cost model and PDF export."
8. **M4 · Launch hardening:** redirects/410s, security headers + CSP, Lighthouse CI budgets, axe tests, sitemap, JSON-LD.
