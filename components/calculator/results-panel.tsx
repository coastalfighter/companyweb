import { type ReactNode } from "react";
import Link from "next/link";
import { WarningCircleIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  breakEvenMonth,
  FUNCTION_LABELS,
  formatHours,
  formatMoney,
  formatRange,
  MEANINGFUL_SAVINGS,
  summarySentence,
  type CalculatorInput,
  type CalculatorResult,
  type RateCard,
} from "@/lib/calculator/model";
import { FUNCTION_PRESETS, HOURS_PER_YEAR, WORK_WEEKS } from "@/lib/calculator/teaser";
import { cn } from "@/lib/utils";

export interface ResultsPanelProps {
  input: CalculatorInput;
  result: CalculatorResult;
  rateCard: RateCard | null;
  /** Where "Book a call to validate these numbers" goes. */
  contactHref: string;
  /** Extra actions under the primary CTA (the PDF report, M3b). */
  actions?: ReactNode;
}

function Metric({
  label,
  value,
  detail,
  accent = false,
  className,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <dt className="text-body-sm text-fg-muted">{label}</dt>
      <dd
        className={cn("tabular font-display font-semibold", accent ? "text-h2 text-fg" : "text-h4 text-fg")}
      >
        {value}
      </dd>
      {detail ? <dd className="text-caption text-fg-muted">{detail}</dd> : null}
    </div>
  );
}

/** In-house vs Akrostech bars (F4: --ink-500 vs --volt-500); the hatched part is the range. */
function ComparisonBars({ result }: { result: CalculatorResult }) {
  const akrostech = result.akrostech!;
  const max = Math.max(result.currentCost, akrostech.high, 1);
  const pct = (value: number) => `${(value / max) * 100}%`;
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="sr-only">
        In-house today {formatMoney(result.currentCost)} a year; Akrostech {formatRange(akrostech)} a year.
      </figcaption>
      <div aria-hidden className="flex flex-col gap-1.5">
        <span className="text-caption text-fg-muted">In-house today</span>
        <span className="block h-3 rounded-xs bg-ink-500" style={{ width: pct(result.currentCost) }} />
      </div>
      <div aria-hidden className="flex flex-col gap-1.5">
        <span className="text-caption text-fg-muted">With Akrostech</span>
        <span className="relative block h-3" style={{ width: pct(akrostech.high) }}>
          <span
            className="absolute inset-y-0 left-0 rounded-l-xs bg-volt-500"
            style={{ width: `${(akrostech.low / akrostech.high) * 100}%` }}
          />
          <span
            className="range-hatch absolute inset-y-0 right-0 rounded-r-xs"
            style={{ left: `${(akrostech.low / akrostech.high) * 100}%` }}
          />
        </span>
      </div>
    </figure>
  );
}

/** "How we calculate this": every number on screen, traced to an input or a constant. */
export function Methodology({ input, result, rateCard }: Omit<ResultsPanelProps, "contactHref" | "actions">) {
  const overheadPct = Math.round((input.overhead - 1) * 100);
  return (
    <details className="group text-body-sm text-fg-muted">
      <summary className="flex min-h-11 cursor-pointer list-none items-center font-medium text-ink-100 underline decoration-ink-500 underline-offset-4 [&::-webkit-details-marker]:hidden">
        How we calculate this
      </summary>
      <div className="mt-3 flex flex-col gap-4">
        <p>
          <strong className="font-medium text-fg">Today&apos;s cost</strong> = hours a week × {WORK_WEEKS}{" "}
          working weeks × the fully loaded hourly cost of whoever does the work: salary ×{" "}
          {input.overhead.toFixed(2)} ({overheadPct}% for benefits, payroll tax and overhead) ÷{" "}
          {HOURS_PER_YEAR.toLocaleString("en-US")} hours a year. Rounded to the nearest $100.
        </p>
        {result.lines.length > 0 ? (
          <ul className="flex flex-col gap-1.5 font-mono text-caption break-words">
            {result.lines.map((line) => (
              <li key={line.fn}>
                {FUNCTION_LABELS[line.fn]}: {line.hoursPerWeek}h × {WORK_WEEKS} ×{" "}
                {formatMoney(Math.round(line.hourlyCost))}/h = {formatMoney(line.annualCost)}
              </li>
            ))}
          </ul>
        ) : null}
        <p>
          <strong className="font-medium text-fg">Salary presets</strong> (US/Canada only, editable):{" "}
          {Object.values(FUNCTION_PRESETS)
            .map((p) => `${p.role} ${formatMoney(p.salary)}`)
            .join(", ")}
          . For other regions, enter what the person costs you.
        </p>
        {rateCard ? (
          <p>
            <strong className="font-medium text-fg">Akrostech&apos;s cost</strong> = the same hours × our
            hourly rate range for each function
            {rateCard.setupFee > 0
              ? `, plus a one-off ${formatMoney(rateCard.setupFee)} setup fee`
              : ", with no setup fee"}
            . <strong className="font-medium text-fg">Savings</strong> run from today&apos;s cost minus our
            high end to today&apos;s cost minus our low end. Savings under{" "}
            {Math.round(MEANINGFUL_SAVINGS * 100)}% of today&apos;s cost are called small, because a rounding
            error shouldn&apos;t sell a contract.
          </p>
        ) : (
          <p>
            <strong className="font-medium text-fg">Our cost</strong> depends on the scope, so we quote it in
            writing after a 20-minute call rather than guess it here.
          </p>
        )}
        <p>
          <strong className="font-medium text-fg">Hours returned</strong> = the hours your people spend on
          this work today, over {WORK_WEEKS} weeks. FTE = those hours ÷{" "}
          {HOURS_PER_YEAR.toLocaleString("en-US")}.
        </p>
      </div>
    </details>
  );
}

/** Step 3 · Results (F4). */
export function ResultsPanel({ input, result, rateCard, contactHref, actions }: ResultsPanelProps) {
  const empty = result.verdict === "empty";
  const month = breakEvenMonth(result, rateCard);
  const largestRole = result.largest ? FUNCTION_PRESETS[result.largest.fn].role : null;
  const largestFte = result.largest ? result.largest.annualHours / HOURS_PER_YEAR : 0;

  return (
    <div className="flex flex-col gap-8">
      {empty ? (
        <p className="text-body text-fg-muted">
          Turn on the work your team does and set the hours. Your numbers appear here as you go.
        </p>
      ) : (
        <>
          <dl className="grid gap-6 sm:grid-cols-2">
            <Metric
              className="sm:col-span-2"
              accent
              label="Current annual cost of this work"
              value={formatMoney(result.currentCost)}
              detail={`Fully loaded, ${formatHours(result.annualHours)} hours a year`}
            />
            {result.akrostech && result.savings ? (
              <>
                <Metric label="Estimated Akrostech cost" value={`${formatRange(result.akrostech)}/yr`} />
                <Metric
                  label="Annual savings"
                  value={
                    result.savings.high <= 0
                      ? "None"
                      : formatRange({ low: Math.max(0, result.savings.low), high: result.savings.high })
                  }
                />
              </>
            ) : null}
            <Metric
              label="Senior hours returned per year"
              value={formatHours(result.annualHours)}
              detail={
                largestRole && result.lines.length === 1
                  ? `≈ ${largestFte.toFixed(1)} FTE of your ${largestRole}'s time`
                  : `≈ ${result.fte.toFixed(1)} FTE across ${result.lines.length} functions`
              }
            />
            {month !== null ? (
              <Metric
                label="Break-even"
                value={`Month ${month}`}
                detail={rateCard?.setupFee ? undefined : "No setup fees"}
              />
            ) : null}
          </dl>

          {result.akrostech ? <ComparisonBars result={result} /> : null}

          <p className="text-body text-fg">{summarySentence(result)}</p>

          {result.verdict === "costs-more" && result.breakEvenSalary ? (
            <p className="rounded-md border border-line-strong bg-surface-2 px-4 py-3 text-body-sm text-fg-muted">
              Here&apos;s when we&apos;d become cheaper: once the people doing this work cost more than about{" "}
              <strong className="font-medium text-fg">{formatMoney(result.breakEvenSalary)}</strong> a year
              each, or when the work outgrows one person.
            </p>
          ) : null}
          {result.verdict === "cost-only" ? (
            <p className="rounded-md border border-line-strong bg-surface-2 px-4 py-3 text-body-sm text-fg-muted">
              Our cost depends on scope. Book a call and you&apos;ll have a written quote within 48 hours,
              with the savings worked out against these numbers.
            </p>
          ) : null}
        </>
      )}

      {result.missingSalary.length > 0 ? (
        <p className="flex items-start gap-2 text-body-sm text-warning">
          <WarningCircleIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          Add a salary for {result.missingSalary.map((fn) => FUNCTION_LABELS[fn]).join(" and ")} to include
          it.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button asChild size="lg" iconRight="arrow" fullWidth>
          <Link href={contactHref}>Book a call to validate these numbers</Link>
        </Button>
        {actions}
      </div>

      <Methodology input={input} result={result} rateCard={rateCard} />
    </div>
  );
}
