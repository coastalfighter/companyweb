"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { CheckIcon, PauseIcon, PlayIcon } from "@phosphor-icons/react/ssr";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";
import {
  SERVICE_LABELS,
  initialFeedState,
  nextFeedState,
  type FeedState,
  type OpsTask,
  type ServiceTag,
} from "./ops-feed-data";

type Filter = "ALL" | ServiceTag;
const FILTERS: readonly Filter[] = ["ALL", "WEB", "HIR", "ADM", "FIN", "LEG"];
const VISIBLE_ROWS = 6;
const MOBILE_MIN_INTERVAL = 5000;
const START_DELAY = 1800;

export interface OpsFeedProps {
  initialCount?: number;
  medianTurnaround?: string;
  /** Desktop tick interval; mobile never ticks faster than every 5s. */
  intervalMs?: number;
  /** Start without the load delay (tests, reduced-motion previews). */
  startImmediately?: boolean;
}

/**
 * Hero "Ops Feed": an illustrative live task log (docs/blueprint/04-hero-concepts.md, D1).
 * The row list is aria-hidden; a visually hidden summary describes it instead, so screen
 * readers aren't flooded by every tick. A pause control satisfies WCAG 2.2.2.
 */
export function OpsFeed({
  initialCount = 38,
  medianTurnaround = "3h 41m",
  intervalMs = 3200,
  startImmediately = false,
}: OpsFeedProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [state, setState] = useState<FeedState>(() => initialFeedState(initialCount));
  const [filter, setFilter] = useState<Filter>("ALL");
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [ready, setReady] = useState(startImmediately);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reduced motion starts paused; an explicit user choice always wins.
  const paused = userPaused ?? reduceMotion;

  useEffect(() => {
    if (ready) return;
    const id = window.setTimeout(() => setReady(true), START_DELAY);
    return () => window.clearTimeout(id);
  }, [ready]);

  const tick = useCallback(() => setState((s) => nextFeedState(s)), []);

  useEffect(() => {
    if (paused || !ready) return;
    let id: number | undefined;
    const start = () => {
      const ms = window.innerWidth < 640 ? Math.max(intervalMs, MOBILE_MIN_INTERVAL) : intervalMs;
      id = window.setInterval(tick, ms);
    };
    const onVisibility = () => {
      window.clearInterval(id);
      if (!document.hidden) start();
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, ready, tick, intervalMs]);

  const visible = useMemo(
    () => state.tasks.filter((t) => filter === "ALL" || t.tag === filter).slice(0, VISIBLE_ROWS),
    [state.tasks, filter],
  );

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    let next: number | undefined;
    if (event.key in keys) next = (index + keys[event.key]! + FILTERS.length) % FILTERS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = FILTERS.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setFilter(FILTERS[next]!);
    tabRefs.current[next]?.focus();
  };

  // Pointer tilt ≤ 3°, fine pointers only, never with reduced motion.
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    if (!el || reduceMotion || event.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1200px) rotateY(${(x * 6).toFixed(2)}deg) rotateX(${(-y * 6).toFixed(2)}deg)`;
  };
  const onPointerLeave = () => {
    if (panelRef.current) panelRef.current.style.transform = "";
  };

  return (
    <div
      ref={panelRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative rounded-2xl border border-line bg-surface-1/90 shadow-e4 backdrop-blur-sm transition-transform duration-300 ease-out-expo"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-10 -top-px h-px bg-(image:--edge-light)"
      />
      <p className="sr-only">
        Example of the live task log Akrostech clients see: payroll, hiring, legal, web and admin tasks
        completed today, each with a timestamp.
      </p>

      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <div aria-hidden className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-ink-600" />
            <span className="size-2.5 rounded-full bg-ink-600" />
            <span className="size-2.5 rounded-full bg-ink-600" />
          </div>
          <span className="font-mono text-[0.75rem] text-fg-subtle">akrostech / ops · this week</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "hidden items-center gap-1.5 font-mono text-[0.6875rem] tracking-wider uppercase sm:inline-flex",
              paused ? "text-fg-subtle" : "text-volt-500",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                paused ? "bg-ink-400" : "animate-live-pulse bg-volt-500",
              )}
            />
            {paused ? "Paused" : "Live"}
          </span>
          <button
            type="button"
            onClick={() => setUserPaused(!paused)}
            aria-pressed={paused}
            aria-label={paused ? "Resume live feed" : "Pause live feed"}
            className="grid size-8 place-items-center rounded-md text-fg-subtle transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg"
          >
            {paused ? (
              <PlayIcon aria-hidden weight="fill" className="size-3.5" />
            ) : (
              <PauseIcon aria-hidden weight="fill" className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filter tasks by service"
        className="flex [scrollbar-width:none] gap-1 overflow-x-auto border-b border-line px-3 py-2"
      >
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
            className="shrink-0 rounded-md px-3 py-1.5 text-[0.75rem] font-medium text-fg-subtle transition-colors duration-150 hover:text-ink-100 aria-selected:bg-ink-700 aria-selected:text-fg"
          >
            {f === "ALL" ? "All" : SERVICE_LABELS[f]}
          </button>
        ))}
      </div>

      <ul
        aria-hidden
        data-testid="ops-feed-rows"
        className="relative h-[312px] overflow-hidden px-2 py-2 sm:h-[336px]"
      >
        {visible.length === 0 ? (
          <li className="feed-row px-3 py-10 text-center font-mono text-[0.75rem] text-fg-subtle">
            Waiting for the next {SERVICE_LABELS[filter as ServiceTag].toLowerCase()} task…
          </li>
        ) : (
          visible.map((task, i) => <FeedRow key={task.id} task={task} delayIndex={ready ? null : i} />)
        )}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3.5 font-mono text-[0.75rem] text-fg-subtle">
        <span>
          <span data-testid="ops-feed-count" className="tabular text-fg">
            {state.completed}
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

interface FeedRowProps {
  task: OpsTask;
  /** Stagger index for the initial load sequence; null once the feed is live. */
  delayIndex: number | null;
}

/**
 * Rows animate in with a CSS keyframe on mount (globals.css `.feed-row`), which
 * keeps the animation library off the homepage bundle. Reduced motion is handled
 * in CSS.
 */
function FeedRow({ task, delayIndex }: FeedRowProps) {
  const review = task.status === "review";
  return (
    <li
      data-status={task.status}
      style={delayIndex === null ? undefined : { animationDelay: `${600 + delayIndex * 90}ms` }}
      className="feed-row flex items-center gap-3 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-white/[0.03]"
    >
      {review ? (
        <span className="grid size-5 shrink-0 place-items-center rounded-full border border-fg-subtle/60 text-fg-muted">
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
            <path d="M5 0a5 5 0 0 1 0 10z" fill="currentColor" />
          </svg>
        </span>
      ) : (
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-volt-500/15 text-volt-500">
          <CheckIcon aria-hidden weight="bold" className="size-3" />
        </span>
      )}
      <span className="min-w-0 flex-1 truncate font-mono text-[0.8125rem] text-ink-100">{task.text}</span>
      <span className="hidden shrink-0 rounded-xs border border-line px-1.5 py-0.5 font-mono text-[0.625rem] tracking-wider text-fg-subtle sm:inline">
        {task.tag}
      </span>
      <span
        className={cn(
          "w-[68px] shrink-0 text-right font-mono text-[0.75rem]",
          review ? "text-fg-muted" : "text-fg-subtle",
        )}
      >
        {task.time}
      </span>
    </li>
  );
}
