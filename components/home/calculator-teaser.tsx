"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FUNCTION_PRESETS,
  HOURS_MAX,
  HOURS_MIN,
  OVERHEAD_MULTIPLIER,
  WORK_WEEKS,
  estimateTeaser,
  formatUsd,
  teaserPrefill,
  type TeaserFunction,
} from "@/lib/calculator/teaser";
import { ctas, prefetchFor } from "@/lib/site";
import { cn } from "@/lib/utils";

const FUNCTIONS = Object.keys(FUNCTION_PRESETS) as TeaserFunction[];

/**
 * Homepage 1.11 calculator teaser. Two inputs, one transparent number: what the
 * senior time currently spent on the work costs. Assumptions are always visible.
 */
export function CalculatorTeaser() {
  const [fn, setFn] = useState<TeaserFunction>("finance");
  const [hours, setHours] = useState(25);
  const sliderId = useId();
  const result = estimateTeaser({ fn, hoursPerWeek: hours });
  const preset = FUNCTION_PRESETS[fn];
  const href = `${ctas.secondary.href}?${teaserPrefill({ fn, hoursPerWeek: hours })}`;

  return (
    <section aria-labelledby="teaser-title" className="px-(--gutter) py-(--section-y)">
      <div
        data-reveal
        className="mx-auto grid max-w-[1120px] grid-cols-1 gap-10 rounded-2xl border border-line bg-surface-1 p-6 shadow-e1 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14"
      >
        <div className="flex flex-col gap-5">
          <h2 id="teaser-title" className="font-display text-h3 font-semibold text-fg">
            What is back-office work costing you right now?
          </h2>
          <p className="text-body-lg text-fg-muted">
            Two inputs. Five seconds. A real number, not a sales pitch.
          </p>

          <fieldset className="mt-4 flex flex-col gap-3">
            <legend className="mb-3 text-body-sm font-medium text-ink-100">Which work?</legend>
            <div className="grid grid-cols-3 gap-1 rounded-md border border-line bg-ink-900 p-1 min-[400px]:grid-cols-5">
              {FUNCTIONS.map((key) => (
                <label
                  key={key}
                  className={cn(
                    "relative cursor-pointer rounded-sm px-1 py-2 text-center text-caption font-medium transition-colors duration-150 sm:px-3 sm:text-body-sm",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                    fn === key ? "bg-ink-600 text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  <input
                    type="radio"
                    name="teaser-fn"
                    value={key}
                    checked={fn === key}
                    onChange={() => setFn(key)}
                    className="sr-only"
                  />
                  {FUNCTION_PRESETS[key].label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <label htmlFor={sliderId} className="text-body-sm font-medium text-ink-100">
                Hours per week spent on it
              </label>
              <output htmlFor={sliderId} className="tabular font-mono text-body-sm text-fg">
                {hours}h
              </output>
            </div>
            <input
              id={sliderId}
              type="range"
              min={HOURS_MIN}
              max={HOURS_MAX}
              step={1}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="range-input w-full"
              style={
                {
                  "--fill": `${((hours - HOURS_MIN) / (HOURS_MAX - HOURS_MIN)) * 100}%`,
                } as React.CSSProperties
              }
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-8 rounded-xl border border-line bg-ink-900 p-6 sm:p-8">
          <div aria-live="polite" aria-atomic="true">
            <p className="text-body-sm text-fg-muted">Senior time spent on this work today</p>
            <p className="tabular mt-3 font-display text-stat font-medium text-fg">
              ≈ {formatUsd(result.annualCost)}
              <span className="text-h4 text-volt-500"> /yr</span>
            </p>
            <p className="mt-3 text-body-sm text-fg-muted">
              {result.annualHours.toLocaleString("en-US")} hours a year, about {Math.round(result.fte * 100)}%
              of a full-time {preset.role}.
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <details className="group text-caption text-fg-muted">
              <summary className="cursor-pointer list-none font-medium text-ink-100 underline decoration-ink-500 underline-offset-4 [&::-webkit-details-marker]:hidden">
                How we calculate this
              </summary>
              <p className="mt-3">
                {hours} hours × {WORK_WEEKS} working weeks × {formatUsd(Math.round(result.hourlyCost))}/hour.
                The hourly cost assumes a {preset.role} on a {formatUsd(preset.salary)} salary, plus{" "}
                {Math.round((OVERHEAD_MULTIPLIER - 1) * 100)}% for benefits, payroll tax and overhead, over
                2,080 hours a year.
              </p>
            </details>
            <Button asChild size="lg" iconRight="arrow" fullWidth>
              <Link href={href} prefetch={prefetchFor(ctas.secondary.href)}>
                Get the full breakdown
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
