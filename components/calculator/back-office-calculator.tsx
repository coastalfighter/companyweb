"use client";

import { useEffect, useId, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CaretUpIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  CALC_FUNCTIONS,
  calculate,
  defaultInput,
  clampHoursPerWeek,
  clampOverhead,
  clampSalary,
  COMPANY_SIZES,
  formatMoney,
  FUNCTION_LABELS,
  HOUR_PRESETS,
  HOURS_RANGE,
  presetSalary,
  REGIONS,
  REGIONS_WITH_PRESETS,
  summarySentence,
  type CalcFunction,
  type CalculatorInput,
  type CompanySize,
  type FunctionInput,
  type RateCard,
  type Region,
} from "@/lib/calculator/model";
import { track } from "@/lib/analytics/track";
import { clearCalculatorInput, saveCalculatorInput } from "@/lib/calculator/storage";
import { FUNCTION_PRESETS } from "@/lib/calculator/teaser";
import { cn } from "@/lib/utils";
import { ReportForm } from "./report-form";
import { ResultsPanel } from "./results-panel";

export interface BackOfficeCalculatorProps {
  initialInput: CalculatorInput;
  rateCard: RateCard | null;
  contactHref: string;
  /** False during SSR / before hydration: every step is shown, nothing is saved. */
  interactive: boolean;
  /** Cloudflare Turnstile site key for the report form (optional). */
  turnstileSiteKey?: string;
}

const STEPS = ["Your team", "The work", "Results"] as const;

/** A value that settles `delay` ms after the last change (for the live region). */
function useSettled<T>(value: T, delay: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

function FunctionCard({
  fn,
  value,
  region,
  onChange,
}: {
  fn: CalcFunction;
  value: FunctionInput;
  region: Region;
  onChange: (next: FunctionInput) => void;
}) {
  const id = useId();
  const preset = FUNCTION_PRESETS[fn];
  const regionPreset = presetSalary(fn, region);
  const [salaryText, setSalaryText] = useState(value.salary === null ? "" : String(value.salary));
  // Keep the text box in step when the salary changes from outside (region switch, reset).
  const [lastSalary, setLastSalary] = useState(value.salary);
  if (lastSalary !== value.salary) {
    setLastSalary(value.salary);
    setSalaryText(value.salary === null ? "" : String(value.salary));
  }

  return (
    <li
      className={cn(
        "rounded-lg border bg-surface-1 transition-colors",
        value.enabled ? "border-line-strong shadow-e1" : "border-line",
      )}
    >
      <div className="px-5 pt-3 pb-2">
        <Checkbox
          id={`${id}-on`}
          checked={value.enabled}
          onChange={(event) => onChange({ ...value, enabled: event.target.checked })}
          label={<span className="text-body font-semibold text-fg">{FUNCTION_LABELS[fn]}</span>}
          description={`Usually done by ${/^[aeiou]/i.test(preset.role) ? "an" : "a"} ${preset.role}`}
        />
      </div>
      {value.enabled ? (
        <div className="flex flex-col gap-6 border-t border-line px-5 pt-5 pb-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor={`${id}-hours`} className="text-body-sm font-medium text-ink-100">
                Hours per week
              </label>
              <output htmlFor={`${id}-hours`} className="tabular font-mono text-body-sm text-fg">
                {value.hoursPerWeek}h
              </output>
            </div>
            <Slider
              id={`${id}-hours`}
              value={value.hoursPerWeek}
              min={HOURS_RANGE.min}
              max={HOURS_RANGE.max}
              onValueChange={(hours) => onChange({ ...value, hoursPerWeek: clampHoursPerWeek(hours) })}
              valueText={`${value.hoursPerWeek} hours a week`}
              tooltip={`${value.hoursPerWeek}h`}
            />
            <div role="group" aria-label="Hour presets" className="flex flex-wrap gap-2">
              {HOUR_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={value.hoursPerWeek === p.hours}
                  onClick={() => onChange({ ...value, hoursPerWeek: p.hours })}
                  className={cn(
                    "min-h-9 rounded-md border px-3 text-caption font-medium transition-colors",
                    value.hoursPerWeek === p.hours
                      ? "border-volt-500/60 bg-volt-950 text-fg"
                      : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
                  )}
                >
                  {p.label} <span className="tabular font-mono text-fg-muted">{p.hours}h</span>
                </button>
              ))}
            </div>
          </div>

          <Field
            label="Annual salary of whoever does it today (USD)"
            hint={
              regionPreset !== null
                ? `Preset: ${preset.role}, ${formatMoney(regionPreset)}. Change it to your real number.`
                : "We don't have sourced salary data for this region yet, so enter what this person costs you."
            }
          >
            <Input
              inputMode="numeric"
              autoComplete="off"
              placeholder={regionPreset !== null ? String(regionPreset) : "e.g. 90000"}
              value={salaryText}
              onChange={(event) => {
                const text = event.target.value.replace(/[^\d]/g, "").slice(0, 7);
                setSalaryText(text);
                const salary = text === "" ? null : clampSalary(Number(text));
                setLastSalary(salary);
                onChange({ ...value, salary });
              }}
            />
          </Field>
          {regionPreset !== null && value.salary !== regionPreset ? (
            <button
              type="button"
              onClick={() => onChange({ ...value, salary: regionPreset })}
              className="-mt-3 self-start text-caption font-medium text-accent-text underline underline-offset-4"
            >
              Reset to the {formatMoney(regionPreset)} preset
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

/**
 * The Back-Office Cost Calculator (docs/blueprint/06-cta-conversion.md, F4;
 * responsive behaviour from 08-responsive-accessibility.md). Desktop: inputs left,
 * sticky results right. Mobile: one step per screen with a results summary pinned
 * to the bottom.
 */
export function BackOfficeCalculator({
  initialInput,
  rateCard,
  contactHref,
  interactive,
  turnstileSiteKey,
}: BackOfficeCalculatorProps) {
  const [input, setInput] = useState(initialInput);
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const result = calculate(input, rateCard);
  const spoken = useSettled(summarySentence(result), 900);
  const ids = { region: useId(), size: useId(), overhead: useId() };

  // Save once the visitor has changed something (not on mount), so a first
  // visit never leaves a "resume" marker behind.
  useEffect(() => {
    if (interactive && touched) saveCalculatorInput(input);
  }, [input, interactive, touched]);

  const update = (next: CalculatorInput) => {
    if (!touched) track("calculator_start", {});
    setTouched(true);
    setInput(next);
  };

  // calculator_complete: the first time a change produces a result (F5 funnel).
  const [completed, setCompleted] = useState(false);
  if (touched && !completed && result.verdict !== "empty") {
    setCompleted(true);
    track("calculator_complete", { functions: result.lines.length, has_rate_card: rateCard !== null });
  }
  const updateFunction = (fn: CalcFunction, next: FunctionInput) =>
    update({ ...input, functions: { ...input.functions, [fn]: next } });

  const setRegion = (region: Region) => {
    // Swap untouched presets for the new region's (or clear them where we have none).
    const functions = Object.fromEntries(
      CALC_FUNCTIONS.map((fn) => {
        const f = input.functions[fn];
        const wasPreset = f.salary === null || f.salary === presetSalary(fn, input.region);
        return [fn, wasPreset ? { ...f, salary: presetSalary(fn, region) } : f];
      }),
    ) as CalculatorInput["functions"];
    update({ ...input, region, functions });
  };

  // Before hydration (or without JS) every step shows; after, phones get one at a time.
  const stepClass = (index: number) => (interactive && step !== index ? "max-lg:hidden" : undefined);
  const goTo = (index: number) => {
    setStep(index);
    document.getElementById("calculator")?.scrollIntoView({ block: "start" });
  };

  const stepNav = (index: number) => (
    <div className="flex items-center justify-between gap-3 pt-2 lg:hidden">
      {index > 0 ? (
        <Button type="button" variant="ghost" onClick={() => goTo(index - 1)}>
          <ArrowLeftIcon aria-hidden className="size-4" />
          Back
        </Button>
      ) : (
        <span />
      )}
      {index < STEPS.length - 1 ? (
        <Button type="button" onClick={() => goTo(index + 1)}>
          {index === 1 ? "See results" : "Next"}
          <ArrowRightIcon aria-hidden className="size-4" />
        </Button>
      ) : null}
    </div>
  );

  return (
    <div id="calculator" className="scroll-mt-24" data-ready={interactive ? "" : undefined}>
      <p aria-live="polite" className="sr-only">
        {spoken}
      </p>

      {interactive ? (
        <ol aria-label="Steps" className="mb-8 flex gap-2 lg:hidden">
          {STEPS.map((label, i) => (
            <li key={label} className="flex-1">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-current={step === i ? "step" : undefined}
                className="flex w-full flex-col gap-2 text-left"
              >
                <span className={cn("h-0.5 rounded-full", i <= step ? "bg-volt-500" : "bg-line")} />
                <span className={cn("text-caption", step === i ? "font-medium text-fg" : "text-fg-muted")}>
                  {i + 1}. {label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="flex min-w-0 flex-col gap-12 lg:col-span-7">
          <fieldset className={cn("flex flex-col gap-6", stepClass(0))}>
            <legend className="mb-6 font-display text-h4 font-semibold text-fg">
              <span className="font-mono text-body-sm text-accent-text">01 </span>Your team
            </legend>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Where is your in-house team?" id={ids.region}>
                <NativeSelect value={input.region} onChange={(e) => setRegion(e.target.value as Region)}>
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field
                label="Company size"
                hint="Optional. Helps us read your numbers; doesn't change them."
                id={ids.size}
              >
                <NativeSelect
                  value={input.companySize ?? ""}
                  onChange={(e) =>
                    update({ ...input, companySize: (e.target.value || null) as CompanySize | null })
                  }
                >
                  <option value="">Prefer not to say</option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} employees
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <Field
              label="Benefits, payroll tax and overhead on top of salary (%)"
              hint="30% is a common rule of thumb. Use your own figure if you have one."
              id={ids.overhead}
              className="sm:max-w-xs"
            >
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                step={1}
                value={Math.round((input.overhead - 1) * 100)}
                onChange={(e) =>
                  update({ ...input, overhead: clampOverhead(1 + Number(e.target.value) / 100) })
                }
              />
            </Field>
            {!REGIONS_WITH_PRESETS.has(input.region) ? (
              <p className="text-body-sm text-fg-muted">
                Amounts are in US dollars. Enter salaries converted to USD.
              </p>
            ) : null}
            {stepNav(0)}
          </fieldset>

          <fieldset className={cn("flex flex-col gap-4", stepClass(1))}>
            <legend className="mb-2 font-display text-h4 font-semibold text-fg">
              <span className="font-mono text-body-sm text-accent-text">02 </span>The work
            </legend>
            <p className="text-body text-fg-muted">
              Turn on what your people do today, and roughly how long it takes them.
            </p>
            <ul className="flex flex-col gap-3">
              {CALC_FUNCTIONS.map((fn) => (
                <FunctionCard
                  key={fn}
                  fn={fn}
                  value={input.functions[fn]}
                  region={input.region}
                  onChange={(next) => updateFunction(fn, next)}
                />
              ))}
            </ul>
            {stepNav(1)}
          </fieldset>
        </div>

        <section aria-labelledby="results-title" className={cn("lg:col-span-5", stepClass(2))}>
          <div className="rounded-xl border border-line-strong bg-surface-2 p-6 shadow-e2 sm:p-8 lg:sticky lg:top-28">
            <h2 id="results-title" className="mb-6 font-display text-h4 font-semibold text-fg">
              <span className="font-mono text-body-sm text-accent-text">03 </span>Results
            </h2>
            <ResultsPanel
              input={input}
              result={result}
              rateCard={rateCard}
              contactHref={contactHref}
              actions={
                <>
                  <ReportForm
                    input={input}
                    available={interactive && result.verdict !== "empty"}
                    turnstileSiteKey={turnstileSiteKey}
                  />
                  {touched || result.verdict !== "empty" ? (
                    <button
                      type="button"
                      onClick={() => {
                        clearCalculatorInput();
                        setTouched(false);
                        setInput(defaultInput(input.region));
                        goTo(0);
                      }}
                      className="min-h-11 self-center text-body-sm text-fg-muted underline underline-offset-4 hover:text-fg"
                    >
                      Start over
                    </button>
                  ) : null}
                </>
              }
            />
            {stepNav(2)}
          </div>
        </section>
      </div>

      {/* Mobile: results summary pinned to the bottom on steps 1–2 (08 responsive table). */}
      {interactive && step < 2 && result.verdict !== "empty" ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line-strong bg-surface-3/95 pb-[env(safe-area-inset-bottom)] shadow-e3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => goTo(2)}
            className="flex min-h-14 w-full items-center justify-between gap-4 px-(--gutter) text-left"
          >
            <span className="flex flex-col">
              <span className="text-caption text-fg-muted">Today&apos;s cost of this work</span>
              <span className="tabular font-display text-h5 font-semibold text-fg">
                ≈ {formatMoney(result.currentCost)}/yr
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text">
              See results
              <CaretUpIcon aria-hidden className="size-4" />
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
