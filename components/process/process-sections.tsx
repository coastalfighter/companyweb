import Link from "next/link";
import { ArrowRightIcon, ArrowsClockwiseIcon, FilesIcon, SealCheckIcon } from "@phosphor-icons/react/ssr";
import { SampleReportBody } from "@/components/home/sample-report";
import { SectionHeader } from "@/components/marketing/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Eyebrow } from "@/components/ui/eyebrow";
import { guarantees, phases, type Guarantee } from "@/content/process";
import { ctas, prefetchFor } from "@/lib/site";
import { cn } from "@/lib/utils";
import { PhaseTracker } from "./phase-tracker";

/** How It Works sections (docs/blueprint/03-page-blueprints.md, section 9). */

export function ProcessHero() {
  return (
    <section
      aria-labelledby="process-title"
      className="grain isolate overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24"
    >
      <div aria-hidden className="grid-overlay pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-6 px-(--gutter)">
        <Eyebrow>How it works</Eyebrow>
        <h1 id="process-title" className="max-w-[20ch] font-display text-h1 font-semibold text-fg">
          No mystery. Here&apos;s exactly what happens.
        </h1>
        <p className="max-w-[58ch] text-body-lg text-fg-muted">
          From your first call to a running team in 10 business days, with a written plan, named people and a
          weekly report from day one.
        </p>
        <div className="mt-4">
          <Button asChild size="lg" iconRight="arrow" className="max-sm:w-full">
            <Link href={ctas.primary.href} prefetch={prefetchFor(ctas.primary.href)}>
              Book your scoping call
            </Link>
          </Button>
        </div>

        {/* The rail: a preview of the five phases, each an anchor into 9.2. */}
        <nav aria-label="The five phases" className="mt-12">
          <ol className="relative grid grid-cols-5">
            <span aria-hidden className="absolute top-[7px] right-[10%] left-[10%] h-px bg-line-strong" />
            {phases.map((phase) => (
              <li key={phase.id} className="relative flex justify-center">
                <a
                  href={`#phase-${phase.id}`}
                  className="group flex min-w-0 flex-col items-center gap-3 rounded-md px-1 text-center"
                >
                  <span
                    aria-hidden
                    className="size-[15px] rounded-full border border-volt-500 bg-bg transition-colors duration-150 group-hover:bg-volt-500"
                  />
                  <span className="tabular font-mono text-caption text-fg-muted">{phase.number}</span>
                  <span className="hidden text-body-sm font-medium text-fg sm:block">{phase.name}</span>
                  <span className="text-body-sm font-medium text-fg sm:hidden">{phase.short}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}

/** 9.2: sticky tracker + scrolling phase articles. */
export function PhaseSection() {
  return (
    <section aria-labelledby="phases-title" className="border-t border-line pb-(--section-y)">
      <h2 id="phases-title" className="sr-only">
        The five phases
      </h2>
      <div className="mx-auto grid max-w-(--container-content) px-(--gutter) lg:grid-cols-12 lg:gap-8">
        <div className="phase-stepper sticky top-16 z-20 -mx-(--gutter) self-start border-b border-line bg-bg/90 px-(--gutter) py-2 backdrop-blur-md lg:top-32 lg:col-span-4 lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-16 lg:backdrop-blur-none">
          <PhaseTracker phases={phases} containerId="phase-list" />
        </div>
        <div id="phase-list" className="flex flex-col lg:col-span-7 lg:col-start-6">
          {phases.map((phase) => (
            <article
              key={phase.id}
              id={`phase-${phase.id}`}
              aria-labelledby={`phase-${phase.id}-title`}
              className="flex scroll-mt-40 flex-col justify-center gap-6 border-b border-line py-16 last:border-b-0 lg:min-h-[80vh] lg:scroll-mt-24"
            >
              <p className="font-mono text-caption text-fg-muted">
                <span className="text-accent-text">Phase {phase.number}</span> · {phase.when}
              </p>
              <h3 id={`phase-${phase.id}-title`} className="font-display text-h2 font-semibold text-fg">
                {phase.name}
              </h3>
              <p className="max-w-[56ch] text-body-lg text-fg-muted">{phase.body}</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-volt-500/30 bg-surface-1 p-5">
                  <dt className="text-overline font-medium text-accent-text uppercase">You get</dt>
                  <dd className="mt-2 text-body font-semibold text-fg">{phase.youGet}</dd>
                </div>
                <div className="rounded-lg border border-line bg-surface-1 p-5">
                  <dt className="text-overline font-medium text-fg-muted uppercase">You do</dt>
                  <dd className="mt-2 text-body text-fg-muted">{phase.youDo}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A grey bar standing in for redacted text; screen readers hear "redacted". */
function Redacted({ width }: { width: string }) {
  return (
    <span className="inline-block h-[0.9em] translate-y-[0.1em] rounded-xs bg-ink-600" style={{ width }}>
      <span className="sr-only">redacted</span>
    </span>
  );
}

function ExampleBadge() {
  return (
    <Badge variant="warning" className="self-start">
      Example · illustrative, client details redacted
    </Badge>
  );
}

function OperatingBriefBody() {
  const rows = [
    ["Work in scope", "Vendor invoice intake and coding, weekly AP run, month-end accrual list"],
    ["Volumes", "≈ 1,100 invoices / month across 3 entities"],
    ["Tools", "NetSuite, Bill.com, Slack, Google Drive"],
    ["Done well means", "Invoices coded within 1 business day; AP run approved every Thursday"],
    ["Owner today", "Controller (6 hrs/week), AP clerk (full time)"],
  ] as const;
  return (
    <div className="flex flex-col gap-6">
      <ExampleBadge />
      <p className="text-body-sm text-fg-muted">
        Prepared for <Redacted width="9ch" /> · after the scoping call on <Redacted width="6ch" />
      </p>
      <dl className="divide-y divide-line rounded-lg border border-line">
        {rows.map(([term, detail]) => (
          <div key={term} className="grid gap-1 p-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-body-sm font-medium text-fg">{term}</dt>
            <dd className="text-body-sm text-fg-muted sm:col-span-2">{detail}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-2">
        <h3 className="text-h5 font-semibold text-fg">Risks we noted</h3>
        <ul className="list-disc space-y-1.5 pl-5 text-body-sm text-fg-muted">
          <li>Approval routing lives in one person&apos;s inbox; we&apos;d move it into Bill.com.</li>
          <li>Two entities share a vendor master; duplicates likely.</li>
        </ul>
      </div>
    </div>
  );
}

function ProposalBody() {
  const roles = [
    ["Finance lead", "Dedicated", "Day 6"],
    ["Senior bookkeeper", "Dedicated", "Day 6"],
    ["AP specialist", "Pooled, 80 hrs/month", "Day 8"],
  ] as const;
  return (
    <div className="flex flex-col gap-6">
      <ExampleBadge />
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[420px] text-left text-body-sm">
          <caption className="sr-only">Named roles</caption>
          <thead className="bg-surface-2 text-fg">
            <tr>
              <th scope="col" className="p-3 font-medium">
                Role
              </th>
              <th scope="col" className="p-3 font-medium">
                Model
              </th>
              <th scope="col" className="p-3 font-medium">
                Starts
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-fg-muted">
            {roles.map(([role, model, start]) => (
              <tr key={role}>
                <td className="p-3 text-fg">{role}</td>
                <td className="p-3">{model}</td>
                <td className="p-3">{start}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-line p-4">
          <dt className="text-caption text-fg-muted">Monthly fee (fixed)</dt>
          <dd className="mt-1 text-h5 font-semibold text-fg">
            <Redacted width="8ch" />
          </dd>
        </div>
        <div className="rounded-lg border border-line p-4">
          <dt className="text-caption text-fg-muted">Term</dt>
          <dd className="mt-1 text-body-sm text-fg">90 days, then month-to-month (30 days&apos; notice)</dd>
        </div>
      </dl>
      <div className="flex flex-col gap-2">
        <h3 className="text-h5 font-semibold text-fg">SLAs</h3>
        <ul className="list-disc space-y-1.5 pl-5 text-body-sm text-fg-muted">
          <li>Invoices coded within 1 business day of receipt</li>
          <li>Close package delivered by business day 5</li>
          <li>Replies in the shared channel within 2 business hours, during overlap</li>
        </ul>
      </div>
    </div>
  );
}

function SopBody() {
  const steps = [
    "Pull new invoices from the AP inbox into Bill.com (auto-forward rule in place).",
    "Match to PO or contract; if neither exists, flag to the requester in Slack #ap-questions.",
    "Code to GL and department using the coding guide; split across entities where marked.",
    "Route for approval by location manager; chase at 48 hours, escalate to the controller at 96.",
    "Thursday 10:00: assemble the AP run, attach the aging report, request sign-off.",
  ] as const;
  return (
    <div className="flex flex-col gap-6">
      <ExampleBadge />
      <dl className="grid grid-cols-2 gap-4 text-body-sm sm:grid-cols-3">
        <div>
          <dt className="text-caption text-fg-muted">Owner</dt>
          <dd className="text-fg">Senior bookkeeper</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-muted">Backup</dt>
          <dd className="text-fg">Finance lead</dd>
        </div>
        <div>
          <dt className="text-caption text-fg-muted">Last reviewed</dt>
          <dd className="text-fg">
            <Redacted width="7ch" />
          </dd>
        </div>
      </dl>
      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-4 text-body-sm text-fg-muted">
            <span aria-hidden className="tabular font-mono text-accent-text">
              {String(i + 1).padStart(2, "0")}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <p className="rounded-md border border-line bg-surface-2 px-4 py-3 text-body-sm text-fg-muted">
        <strong className="font-medium text-fg">Exceptions:</strong> any invoice over <Redacted width="5ch" />{" "}
        or from a new vendor needs controller approval before coding.
      </p>
    </div>
  );
}

const artifacts = [
  {
    id: "brief",
    title: "Operating Brief",
    when: "24 hours after the scoping call",
    summary: "One page: the work, the volumes, the tools, and what “done well” means.",
    Body: OperatingBriefBody,
  },
  {
    id: "proposal",
    title: "Proposal",
    when: "Days 2–3",
    summary: "Named roles, a fixed monthly fee, the SLAs and the term, in writing.",
    Body: ProposalBody,
  },
  {
    id: "sop",
    title: "SOP document",
    when: "Days 6–10, then kept current",
    summary: "Your processes written down step by step. Yours to keep, even if you leave.",
    Body: SopBody,
  },
  {
    id: "report",
    title: "Friday report",
    when: "Every Friday",
    summary: "What was done, what's blocked, hours used, what's next. Read it in 90 seconds.",
    Body: SampleReportBody,
  },
] as const;

/** 9.3: the four deliverables, each with an illustrative preview. */
export function ArtifactsGallery() {
  return (
    <section aria-labelledby="artifacts-title" className="py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader
          id="artifacts-title"
          eyebrow="What you'll get"
          title="The paperwork, before you sign anything."
          intro="Every engagement produces the same four documents. Here's what they look like, with client details taken out."
        />
        <ul className="-mx-(--gutter) flex snap-x snap-mandatory gap-4 overflow-x-auto px-(--gutter) pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
          {artifacts.map((artifact, i) => (
            <li
              key={artifact.id}
              data-reveal
              style={{ "--reveal-i": i } as React.CSSProperties}
              className="depth-in flex w-[78vw] max-w-[320px] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-line bg-surface-1 shadow-e1 md:w-auto md:max-w-none"
            >
              <div aria-hidden className="relative h-40 overflow-hidden border-b border-line bg-ink-900 p-5">
                <div className="flex h-full flex-col gap-2 rounded-sm bg-surface-2 p-4 shadow-e2">
                  <span className="h-2 w-1/2 rounded-xs bg-volt-500/70" />
                  <span className="h-1.5 w-full rounded-xs bg-ink-600" />
                  <span className="h-1.5 w-5/6 rounded-xs bg-ink-600" />
                  <span className="h-1.5 w-2/3 rounded-xs bg-ink-600" />
                  <span className="mt-auto h-1.5 w-1/3 rounded-xs bg-ink-700" />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <p className="font-mono text-caption text-fg-muted">{artifact.when}</p>
                <h3 className="font-display text-h5 font-semibold text-fg">{artifact.title}</h3>
                <p className="text-body-sm text-fg-muted">{artifact.summary}</p>
                <Dialog
                  size="lg"
                  title={`${artifact.title} (example)`}
                  description="Illustrative example of the document every client receives. Names, fees and dates are redacted or made up."
                  triggerClassName="group mt-auto inline-flex min-h-11 items-center gap-1.5 self-start text-body-sm font-medium text-accent-text"
                  trigger={
                    <>
                      Preview <span className="sr-only">the {artifact.title}</span>
                      <ArrowRightIcon
                        aria-hidden
                        className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
                      />
                    </>
                  }
                >
                  <artifact.Body />
                </Dialog>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const guaranteeIcons = {
  fit: SealCheckIcon,
  replacement: ArrowsClockwiseIcon,
  sops: FilesIcon,
} as const;

/** 9.4: only guarantees signed off by finance and legal (content/process.ts). */
export function GuaranteesSection({ items = guarantees }: { items?: readonly Guarantee[] }) {
  if (items.length === 0) return null;
  return (
    <section
      aria-labelledby="guarantees-title"
      className="border-y border-line bg-surface-1 py-(--section-y)"
    >
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader id="guarantees-title" eyebrow="Guarantees" title="What we promise in writing." />
        <ul className={cn("grid gap-8", items.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
          {items.map((item, i) => {
            const Icon = guaranteeIcons[item.id as keyof typeof guaranteeIcons] ?? FilesIcon;
            return (
              <li
                key={item.id}
                data-reveal
                style={{ "--reveal-i": i } as React.CSSProperties}
                className="flex flex-col gap-4"
              >
                <span className="grid size-12 place-items-center rounded-md border border-line-strong bg-surface-2">
                  <Icon aria-hidden weight="light" className="size-6 text-volt-500" />
                </span>
                <h3 className="text-h5 font-semibold text-fg">{item.title}</h3>
                <p className="text-body text-fg-muted">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** 9.5 */
export function LeavingWell() {
  return (
    <section aria-labelledby="leaving-title" className="py-(--section-y)">
      <div data-reveal className="mx-auto flex max-w-(--container-prose) flex-col gap-5 px-(--gutter)">
        <h2 id="leaving-title" className="font-display text-h3 font-semibold text-fg">
          And if you ever leave?
        </h2>
        <p className="text-body-lg text-fg-muted">
          30 days&apos; notice, a complete handover pack, access revoked and confirmed in writing within one
          business day. We want you to be able to say we were easy to leave, because that&apos;s why people
          stay.
        </p>
      </div>
    </section>
  );
}
