"use client";

import { useEffect, useState } from "react";
import { type Phase } from "@/content/process";
import { cn } from "@/lib/utils";

export interface PhaseTrackerProps {
  phases: readonly Pick<Phase, "id" | "number" | "name" | "short" | "when">[];
  /** id of the element wrapping every phase article; progress runs over its height. */
  containerId: string;
}

/** Index of the last phase whose top has passed the reading line, and 0–1 progress through the container. */
export function measure(
  phaseTops: readonly number[],
  container: { top: number; height: number },
  readingLine: number,
): { current: number; progress: number } {
  let current = 0;
  phaseTops.forEach((top, i) => {
    if (top <= readingLine) current = i;
  });
  const raw = container.height > 0 ? (readingLine - container.top) / container.height : 0;
  return { current, progress: Math.min(1, Math.max(0, raw)) };
}

/**
 * How It Works 9.2: the sticky column (desktop) or the stepper pinned under the
 * header (mobile) showing the current phase and a progress bar that fills as the
 * phases scroll past. Without JS it is still a working list of anchor links.
 */
export function PhaseTracker({ phases, containerId }: PhaseTrackerProps) {
  const [{ current, progress }, setState] = useState({ current: 0, progress: 0 });

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const articles = phases
      .map((phase) => document.getElementById(`phase-${phase.id}`))
      .filter((el): el is HTMLElement => el !== null);

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      const next = measure(
        articles.map((el) => el.getBoundingClientRect().top),
        { top: rect.top, height: rect.height },
        window.innerHeight * 0.4,
      );
      setState((prev) =>
        prev.current === next.current && Math.abs(prev.progress - next.progress) < 0.002 ? prev : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // A deep link (/how-it-works#phase-onboarding) is scrolled to while the page is
    // still laying out, so on phones it can land short. Re-apply it once fonts have
    // settled, unless the visitor has already started scrolling.
    let cancelled = false;
    const target = articles.find((el) => `#${el.id}` === window.location.hash);
    const startY = window.scrollY;
    if (target) {
      void ("fonts" in document ? document.fonts.ready : Promise.resolve()).then(() => {
        if (cancelled || Math.abs(window.scrollY - startY) > 4) return;
        const top = target.getBoundingClientRect().top;
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        if (Math.abs(top - margin) > 24) target.scrollIntoView({ block: "start" });
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [phases, containerId]);

  const active = phases[current] ?? phases[0]!;
  const bar = (
    <span aria-hidden className="block h-0.5 w-full overflow-hidden rounded-full bg-line">
      <span
        data-testid="phase-progress"
        className="block h-full origin-left bg-volt-500"
        style={{ transform: `scaleX(${progress})` }}
      />
    </span>
  );

  return (
    <nav aria-label="Phases" className="phase-tracker">
      {/* Desktop: sticky column. */}
      <div className="hidden flex-col gap-8 lg:flex">
        <div className="flex flex-col gap-3" aria-hidden>
          <span className="tabular font-display text-[5.5rem] leading-none font-semibold text-volt-500">
            {active.number}
          </span>
          <span className="font-display text-h4 font-semibold text-fg">{active.name}</span>
          <span className="font-mono text-caption text-fg-muted">{active.when}</span>
        </div>
        {bar}
        <ol className="flex flex-col gap-1">
          {phases.map((phase, i) => (
            <li key={phase.id}>
              <a
                href={`#phase-${phase.id}`}
                aria-current={i === current ? "step" : undefined}
                className={cn(
                  "flex items-baseline gap-3 rounded-md px-2 py-1.5 text-body-sm transition-colors",
                  i === current ? "text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                <span className="tabular font-mono text-caption">{phase.number}</span>
                {phase.name}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile: horizontal stepper pinned under the header. */}
      <div className="flex flex-col gap-3 lg:hidden">
        <ol className="flex justify-between gap-1">
          {phases.map((phase, i) => (
            <li key={phase.id} className="min-w-0 flex-1">
              <a
                href={`#phase-${phase.id}`}
                aria-current={i === current ? "step" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-md text-center transition-colors",
                  i <= current ? "text-fg" : "text-fg-muted",
                )}
              >
                <span
                  className={cn(
                    "tabular font-mono text-caption",
                    i <= current ? "text-accent-text" : undefined,
                  )}
                >
                  {phase.number}
                </span>
                <span className="w-full truncate text-micro font-medium">{phase.short}</span>
              </a>
            </li>
          ))}
        </ol>
        {bar}
      </div>
    </nav>
  );
}
