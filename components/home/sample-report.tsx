"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";

const done = [
  ["FIN", "AP run approved · 42 invoices"],
  ["FIN", "September close package delivered (BD5)"],
  ["HIR", "Shortlist sent · Sr. Backend Engineer (5 candidates)"],
  ["ADM", "Board deck formatted and sent to 7 directors"],
  ["WEB", "Pricing page shipped to staging"],
] as const;

const next = [
  "Q3 accrual review with your controller (Tue)",
  "Interview loop for 3 shortlisted candidates",
  "Pricing page launch after your sign-off",
] as const;

/** "See a sample Friday report" (blueprint 1.6). Illustrative content, labelled as such. */
export function SampleReportDialog() {
  return (
    <Dialog
      size="lg"
      title="Sample Friday report · Week 41"
      description="Illustrative example of the one-page report every client gets on Fridays. Names and numbers are made up."
      triggerClassName="group inline-flex items-center gap-1.5 self-start text-body-sm font-medium text-accent-text"
      trigger={
        <>
          See a sample Friday report
          <ArrowRightIcon
            aria-hidden
            className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
          />
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <Badge variant="warning" className="self-start">
          Sample · not real client data
        </Badge>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
          {[
            ["Tasks done", "142"],
            ["On time", "98.6%"],
            ["Hours used", "312 / 340"],
            ["Open blockers", "1"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 bg-surface-1 p-4">
              <dt className="text-caption text-fg-muted">{label}</dt>
              <dd className="tabular font-display text-h4 font-semibold text-fg">{value}</dd>
            </div>
          ))}
        </dl>
        <section aria-labelledby="report-done" className="flex flex-col gap-3">
          <h3 id="report-done" className="text-h5 font-semibold text-fg">
            Done this week
          </h3>
          <ul className="flex flex-col gap-2">
            {done.map(([tag, text]) => (
              <li key={text} className="flex items-center gap-3 text-body-sm text-fg-muted">
                <Badge variant="mono">{tag}</Badge>
                {text}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="report-blocked" className="flex flex-col gap-3">
          <h3 id="report-blocked" className="text-h5 font-semibold text-fg">
            Blocked
          </h3>
          <p className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-body-sm text-warning">
            Awaiting vendor W-9 from Northline Supply. Chased twice; we need you to approve paying without it
            or to call their AP contact.
          </p>
        </section>
        <section aria-labelledby="report-next" className="flex flex-col gap-3">
          <h3 id="report-next" className="text-h5 font-semibold text-fg">
            Next week
          </h3>
          <ul className="list-disc space-y-1.5 pl-5 text-body-sm text-fg-muted marker:text-fg-muted">
            {next.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </Dialog>
  );
}
