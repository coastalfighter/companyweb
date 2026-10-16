import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { SectionHeader } from "@/components/marketing/section-header";
import { prefetchFor } from "@/lib/site";

const steps = [
  {
    name: "Scope",
    when: "Days 1–2",
    body: "A 45-minute working session. We map the tasks, tools and handoffs, and write them down in a one-page Operating Brief you sign off on.",
  },
  {
    name: "Match",
    when: "Days 3–6",
    body: "We assign a dedicated lead and specialists with experience in your stack and your industry. You meet them before anything starts.",
  },
  {
    name: "Run",
    when: "Day 7 onward",
    body: "Work starts inside your tools: your Slack, your Jira, your QuickBooks. No new portal to learn unless you want one.",
  },
  {
    name: "Report",
    when: "Every Friday",
    body: "A one-page report: what was done, what's blocked, hours used, what's next. Read it in 90 seconds.",
  },
] as const;

/**
 * Homepage 1.5. When the steps scroll into view the connector line draws across and
 * each number lights up as the line reaches it (CSS transitions keyed off the reveal
 * observer). Without JS or with reduced motion, the end state is shown.
 */
export function HowItWorksSummary() {
  return (
    <section aria-labelledby="how-title" className="py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-16 px-(--gutter)">
        <SectionHeader
          id="how-title"
          eyebrow="How it works"
          align="center"
          title="From first call to first delivery in 10 business days."
        />
        <div data-reveal className="process-steps relative">
          <span aria-hidden className="absolute top-8 right-0 left-0 hidden h-px bg-line lg:block">
            <span className="process-line absolute inset-0 origin-left bg-volt-500" />
          </span>
          <ol className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, i) => (
              <li key={step.name} className="relative flex flex-col gap-4">
                <span
                  aria-hidden
                  className="process-number tabular relative w-fit bg-bg pr-4 font-display text-[4rem] leading-none font-semibold text-ink-500"
                  style={{ "--step": i } as React.CSSProperties}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="flex items-baseline gap-3 font-display text-h4 font-semibold text-fg">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.name}
                  <span className="font-mono text-caption font-normal text-fg-subtle">{step.when}</span>
                </h3>
                <p className="text-body-sm text-fg-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <Link
          href="/how-it-works"
          prefetch={prefetchFor("/how-it-works")}
          className="group mx-auto inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
        >
          See the full process
          <ArrowRightIcon
            aria-hidden
            className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
          />
        </Link>
      </div>
    </section>
  );
}
