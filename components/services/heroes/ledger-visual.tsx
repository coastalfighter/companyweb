"use client";

import { useRef } from "react";
import { whenBooted } from "@/components/motion/preloader";
import { checkedCount, formatAmount } from "@/lib/motion/hero-math";
import { useGsap } from "@/lib/motion/use-gsap";
import { duration, ease } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

/** Illustrative figures for a fictional month: labelled "Illustrative" on screen, never presented as a client's. */
export const FIGURES = [
  { label: "Revenue", value: 128400 },
  { label: "Expenses", value: 84210 },
  { label: "Net", value: 44190 },
] as const;

/** Six months of net, as bar heights (0–1) in the chart. */
export const BARS = [0.42, 0.55, 0.48, 0.66, 0.72, 0.86] as const;

export const CLOSE_STEPS = [
  "Bank feeds reconciled",
  "Payroll posted",
  "AP and AR reviewed",
  "Reports sent",
] as const;

const CHART_W = 240;
const CHART_H = 96;
const BAR_W = 22;

function barX(i: number): number {
  return 12 + i * ((CHART_W - 24 - BAR_W) / (BARS.length - 1));
}

/** The trend line through the bar tops. */
export function trendPath(bars: readonly number[] = BARS): string {
  return bars
    .map(
      (h, i) =>
        `${i === 0 ? "M" : "L"}${(barX(i) + BAR_W / 2).toFixed(1)} ${(CHART_H - h * CHART_H + 4).toFixed(1)}`,
    )
    .join(" ");
}

/**
 * Accounting, "The Ledger" (docs/blueprint/11-motion-system.md §3e).
 *
 * A month-end close in one card: the bars rise from the baseline, the trend line draws
 * through them, and the figures count up in tabular digits (no width jitter). As the
 * hero scrolls away, the close checklist ticks off step by step: the books are done by
 * the time you leave. Every figure is illustrative, and says so.
 * Reduced motion: final figures, drawn chart, every step ticked.
 */
export function LedgerVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap, root }) => {
      if (!root) return;
      const bars = gsap.utils.toArray<SVGRectElement>(".ledger-bar", root);
      const line = root.querySelector<SVGPathElement>(".ledger-line");
      const numbers = gsap.utils.toArray<HTMLElement>(".ledger-figure", root);
      const steps = gsap.utils.toArray<HTMLElement>(".ledger-step", root);

      gsap.set(bars, { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(line, { strokeDashoffset: 1 });
      steps.forEach((step) => step.removeAttribute("data-done"));
      const counters = numbers.map((el) => ({ el, value: 0, target: Number(el.dataset.value) || 0 }));
      for (const c of counters) c.el.textContent = formatAmount(0);

      const intro = gsap.timeline({ paused: true });
      intro
        .to(bars, { scaleY: 1, duration: 0.7, stagger: 0.07, ease: ease.focal }, 0)
        .to(line, { strokeDashoffset: 0, duration: 0.9, ease: ease.entrance }, 0.35);
      counters.forEach((c, i) => {
        intro.to(
          c,
          {
            value: c.target,
            duration: duration.count,
            ease: "power2.out",
            onUpdate: () => {
              c.el.textContent = formatAmount(c.value);
            },
          },
          0.1 + i * 0.12,
        );
      });
      void whenBooted().then(() => intro.delay(0.35).play());

      const section = root.closest("section") ?? root;
      let shown = 0;
      gsap.to(".ledger-card", {
        yPercent: -6,
        ease: ease.linear,
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          onUpdate: (self) => {
            const count = checkedCount(self.progress, steps.length);
            if (count === shown) return;
            shown = count;
            steps.forEach((step, i) => step.toggleAttribute("data-done", i < count));
          },
        },
      });

      return () => steps.forEach((step) => step.setAttribute("data-done", ""));
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} aria-hidden>
      <div className="ledger-card rounded-xl border border-line bg-ink-900 p-4 shadow-e4 sm:p-6">
        <div className="flex items-center justify-between font-mono text-[0.6875rem] text-fg-subtle uppercase">
          <span className="tracking-wider">Month-end close</span>
          <span className="rounded-sm border border-line px-1.5 py-0.5 tracking-wider">Illustrative</span>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          {FIGURES.map((figure, i) => (
            <div key={figure.label} className="min-w-0">
              <dt className="text-caption text-fg-subtle">{figure.label}</dt>
              <dd
                className={cn(
                  "ledger-figure tabular mt-1 truncate font-display text-[clamp(1rem,0.8rem+1vw,1.5rem)] font-semibold",
                  i === FIGURES.length - 1 ? "text-accent-text" : "text-fg",
                )}
                data-value={figure.value}
              >
                {formatAmount(figure.value)}
              </dd>
            </div>
          ))}
        </dl>

        <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 12}`} className="mt-5 block w-full" fill="none">
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1="0"
              x2={CHART_W}
              y1={CHART_H * f + 4}
              y2={CHART_H * f + 4}
              className="stroke-line"
              strokeDasharray="2 4"
            />
          ))}
          {BARS.map((h, i) => (
            <rect
              key={i}
              className={cn("ledger-bar", i === BARS.length - 1 ? "fill-volt-500/70" : "fill-ink-700")}
              x={barX(i)}
              y={CHART_H - h * CHART_H + 4}
              width={BAR_W}
              height={h * CHART_H}
              rx="3"
            />
          ))}
          <path
            d={trendPath()}
            pathLength={1}
            className="ledger-line"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="0" x2={CHART_W} y1={CHART_H + 4} y2={CHART_H + 4} className="stroke-line-strong" />
        </svg>

        <ul className="mt-5 grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
          {CLOSE_STEPS.map((step) => (
            <li
              key={step}
              className="ledger-step flex items-center gap-2.5 text-caption text-fg-muted"
              data-done=""
            >
              <span className="ledger-tick grid size-4 shrink-0 place-items-center rounded-sm border border-line-strong">
                <svg viewBox="0 0 16 16" className="size-3" fill="none">
                  <path
                    d="M3 8.5 6.5 12 13 4.5"
                    pathLength={1}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
