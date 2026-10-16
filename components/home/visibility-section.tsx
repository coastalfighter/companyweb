import { ChatsCircleIcon, FileTextIcon, ShieldCheckIcon, TimerIcon } from "@phosphor-icons/react/ssr";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SampleReportDialog } from "./sample-report";

const features = [
  {
    key: "sla",
    Icon: TimerIcon,
    title: "SLA clocks on every request.",
    body: "Standard requests are acknowledged within 1 business hour and resolved within 1 business day.",
  },
  {
    key: "channel",
    Icon: ChatsCircleIcon,
    title: "A shared Slack or Teams channel.",
    body: "Talk to the people doing the work, not an account manager relaying messages.",
  },
  {
    key: "report",
    Icon: FileTextIcon,
    title: "The Friday report.",
    body: "One page. Done, blocked, next. Hours used against budget.",
  },
  {
    key: "access",
    Icon: ShieldCheckIcon,
    title: "Access you control.",
    body: "Role-based access to your systems, revoked in one click, logged in an audit trail.",
  },
] as const;

const kpis = [
  ["Tasks done", "142"],
  ["On time", "98.6%"],
  ["Hours", "312/340"],
  ["Blockers", "1"],
] as const;

/** Homepage 1.6: "You'll never have to ask 'what's the status?'" */
export function VisibilitySection() {
  return (
    <section aria-labelledby="visibility-title" className="vis overflow-hidden bg-bg-alt py-(--section-y)">
      <div className="mx-auto grid max-w-(--container-content) items-center gap-12 px-(--gutter) lg:grid-cols-12 lg:gap-8">
        <div data-reveal className="flex flex-col gap-8 lg:col-span-5">
          <div className="flex flex-col gap-5">
            <Eyebrow>Visibility</Eyebrow>
            <h2 id="visibility-title" className="heading-depth font-display text-h2 font-semibold text-fg">
              You&apos;ll never have to ask &ldquo;what&apos;s the status?&rdquo;
            </h2>
            <p className="text-body-lg text-fg-muted">
              Bad outsourcing goes dark. We do the opposite. Every task is logged, timestamped, and visible to
              you the moment it moves.
            </p>
          </div>
          <ul className="flex flex-col gap-5">
            {features.map(({ key, Icon, title, body }) => (
              <li key={key} data-feature={key} className="flex gap-4">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-ink-800 text-ink-200"
                >
                  <Icon weight="light" className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-h5 font-semibold text-fg">{title}</h3>
                  <p className="text-body-sm text-fg-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
          <SampleReportDialog />
        </div>

        <figure data-reveal className="lg:col-span-7">
          <div
            aria-hidden
            className="depth-panel rounded-xl border border-line bg-surface-1 p-5 shadow-e4 sm:p-6"
          >
            <div data-area="report" className="vis-area rounded-lg p-2">
              <div className="flex items-center justify-between">
                <p className="font-mono text-caption text-fg-subtle">Weekly Ops Report · Week 41</p>
                <span className="font-mono text-micro text-volt-500">● Live</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {kpis.map(([label, value]) => (
                  <div key={label} className="rounded-md border border-line bg-ink-900 p-3">
                    <p className="text-micro text-fg-subtle">{label}</p>
                    <p className="tabular mt-1 font-display text-h4 font-semibold text-fg">{value}</p>
                  </div>
                ))}
              </div>
              <svg viewBox="0 0 400 60" className="mt-4 h-14 w-full" preserveAspectRatio="none">
                <path
                  d="M0 52 L40 46 L80 48 L120 38 L160 40 L200 30 L240 26 L280 28 L320 18 L360 14 L400 8"
                  fill="none"
                  stroke="var(--volt-500)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div data-area="sla" className="vis-area rounded-lg border border-line bg-ink-900 p-4">
                <p className="text-micro text-fg-subtle">Request SLA · this week</p>
                <p className="mt-2 font-mono text-caption text-ink-100">Acknowledged in 38m median</p>
                <p className="mt-1 font-mono text-caption text-ink-100">94% resolved same day</p>
              </div>
              <div data-area="channel" className="vis-area rounded-lg border border-line bg-ink-900 p-4">
                <p className="text-micro text-fg-subtle"># akrostech-ops</p>
                <p className="mt-2 text-caption text-ink-100">
                  <span className="font-semibold text-fg">Maya · Finance lead</span>
                  <br />
                  AP run ready for approval: 42 invoices.
                </p>
              </div>
              <div data-area="access" className="vis-area rounded-lg border border-line bg-ink-900 p-4">
                <p className="text-micro text-fg-subtle">Access log</p>
                <p className="mt-2 font-mono text-caption text-ink-100">
                  NetSuite · AP clerk · granted by you
                </p>
                <p className="mt-1 font-mono text-caption text-ink-100">Mon 09:12 · expires in 90 days</p>
              </div>
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                <p className="text-micro text-warning">Blocked</p>
                <p className="mt-2 text-caption text-ink-100">Awaiting vendor W-9. Needs your call.</p>
              </div>
            </div>
          </div>
          <figcaption className="mt-4 text-caption text-fg-subtle">
            Illustrative example of a client&apos;s weekly view.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
