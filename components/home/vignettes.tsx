import { type ServiceSlug } from "@/lib/services";

/**
 * Service-card vignettes (docs/blueprint/03-page-blueprints.md, 1.4): tiny
 * illustrative product UIs, pure HTML/SVG + CSS. One registered custom property,
 * --vig-p (0 → 1), drives every moving part; it flips on card hover/focus on
 * pointer devices and when the card scrolls into view on touch devices. Reduced
 * motion shows the end state. All decorative (aria-hidden).
 */

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div aria-hidden className="vig rounded-md border border-line bg-ink-900 p-4">
      <p className="mb-3 font-mono text-[0.6875rem] tracking-wider text-fg-subtle uppercase">{label}</p>
      {children}
    </div>
  );
}

const RING = 2 * Math.PI * 26;

function WebVignette() {
  return (
    <Frame label="Lighthouse · checkout">
      <div className="flex items-center gap-5">
        <svg width="72" height="72" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" stroke="var(--ink-700)" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="var(--volt-500)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={RING}
            className="vig-ring"
            style={{ "--ring": RING } as React.CSSProperties}
          />
        </svg>
        <div className="flex flex-col gap-1">
          <span className="vig-score tabular font-display text-h3 font-semibold text-fg" />
          <span className="text-caption text-fg-subtle">Performance</span>
          <span className="font-mono text-[0.6875rem] text-fg-subtle">
            LCP{" "}
            <span className="relative inline-grid text-fg">
              <span className="vig-before col-start-1 row-start-1">3.1s</span>
              <span className="vig-after col-start-1 row-start-1">1.2s</span>
            </span>
          </span>
        </div>
      </div>
    </Frame>
  );
}

const STAGES = [
  ["Sourced", 214],
  ["Screened", 38],
  ["Assessed", 11],
  ["Shortlist", 5],
  ["Offer", 1],
] as const;

function RecruitmentVignette() {
  return (
    <Frame label="Pipeline · Sr. Backend Engineer">
      <div className="grid grid-cols-5 gap-1.5">
        {STAGES.map(([label, count], i) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div
              className={`vig-stage h-10 rounded-xs border border-line bg-ink-800${i === STAGES.length - 1 ? "vig-stage-final" : ""}`}
              style={{ "--stage": i } as React.CSSProperties}
            />
            <span className="truncate font-mono text-[0.625rem] text-fg-subtle">{label}</span>
            <span className="tabular font-mono text-[0.75rem] text-fg">{count}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function AssistanceVignette() {
  return (
    <Frame label="Inbox · CEO">
      <div className="flex items-baseline gap-2">
        <span className="vig-inbox tabular font-display text-h3 font-semibold text-fg" />
        <span className="text-caption text-fg-subtle">unread</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div className="vig-bar h-full origin-left rounded-full bg-volt-500" />
      </div>
    </Frame>
  );
}

const CLOSE_TASKS = ["Bank recs", "Accruals", "Prepaids", "Revenue"] as const;

function AccountingVignette() {
  return (
    <Frame label="Month-end close">
      <ul className="flex flex-col gap-1.5">
        {CLOSE_TASKS.map((task, i) => (
          <li key={task} className="flex items-center gap-2 font-mono text-[0.75rem] text-ink-100">
            <span
              className={
                i === CLOSE_TASKS.length - 1
                  ? "vig-last grid size-3.5 place-items-center rounded-xs border border-line"
                  : "grid size-3.5 place-items-center rounded-xs bg-volt-500/20 text-volt-500"
              }
            >
              <svg
                width="8"
                height="8"
                viewBox="0 0 10 10"
                fill="none"
                className={i === CLOSE_TASKS.length - 1 ? "vig-last-check text-volt-500" : ""}
              >
                <path
                  d="M2 5.2 4.1 7.3 8 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {task}
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[0.75rem] text-fg-subtle">
        <span className="vig-close tabular text-fg" />
        /24 · Closed BD5
      </p>
    </Frame>
  );
}

function LegalVignette() {
  return (
    <Frame label="Contract register">
      <div className="relative mt-2 h-1 rounded-full bg-ink-700">
        <div className="vig-bar absolute inset-y-0 left-0 w-full origin-left rounded-full bg-volt-500" />
        {[0, 25, 50, 75, 100].map((left) => (
          <span
            key={left}
            className="absolute top-1/2 size-2 -translate-1/2 rounded-full border border-ink-500 bg-ink-900"
            style={{ left: `${left}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-xs border border-warning/30 bg-warning/10 px-1.5 py-0.5 font-mono text-[0.625rem] text-warning">
          Renewal in 30d
        </span>
        <span className="vig-chip rounded-xs border border-volt-500/40 bg-volt-950 px-1.5 py-0.5 font-mono text-[0.625rem] text-volt-500">
          Notice sent
        </span>
      </div>
    </Frame>
  );
}

const vignettes: Record<ServiceSlug, () => React.JSX.Element> = {
  "web-development": WebVignette,
  recruitment: RecruitmentVignette,
  "virtual-assistance": AssistanceVignette,
  accounting: AccountingVignette,
  legal: LegalVignette,
};

export function ServiceVignette({ slug }: { slug: ServiceSlug }) {
  const Vignette = vignettes[slug];
  return <Vignette />;
}
