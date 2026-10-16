/**
 * Homepage calculator teaser (docs/blueprint/06-cta-conversion.md, F4).
 *
 * Deliberately simple and transparent: the cost of the senior time currently spent
 * on the work, nothing else. No Akrostech pricing, no "savings" claim: those need
 * the full calculator's rate card. Every assumption is shown next to the result.
 *
 * VERIFY: salary presets come from the blueprint and must be checked against a
 * current, citable salary source before launch (F4 "Rules").
 */

export type TeaserFunction = "finance" | "hiring" | "admin" | "web" | "legal";

export interface FunctionPreset {
  label: string;
  /** Who usually does this work in-house today. */
  role: string;
  /** Annual base salary in USD. */
  salary: number;
}

export const FUNCTION_PRESETS: Record<TeaserFunction, FunctionPreset> = {
  finance: { label: "Finance", role: "controller", salary: 145_000 },
  hiring: { label: "Hiring", role: "recruiter", salary: 95_000 },
  admin: { label: "Admin", role: "executive assistant", salary: 78_000 },
  web: { label: "Web", role: "software engineer", salary: 170_000 },
  legal: { label: "Legal", role: "paralegal", salary: 72_000 },
};

/** Benefits, payroll tax and overhead on top of base salary. */
export const OVERHEAD_MULTIPLIER = 1.3;
/** Standard full-time hours in a year. */
export const HOURS_PER_YEAR = 2080;
/** Working weeks counted per year (excludes holidays and PTO). */
export const WORK_WEEKS = 48;

export const HOURS_MIN = 5;
export const HOURS_MAX = 200;

export interface TeaserInput {
  fn: TeaserFunction;
  hoursPerWeek: number;
}

export interface TeaserResult {
  /** Fully loaded hourly cost of the person doing the work today. */
  hourlyCost: number;
  /** Annual cost of the hours spent, rounded to the nearest $100. */
  annualCost: number;
  /** Hours per year spent on the work. */
  annualHours: number;
  /** The same hours as a share of one full-time person. */
  fte: number;
}

export function clampHours(hours: number): number {
  if (!Number.isFinite(hours)) return HOURS_MIN;
  return Math.min(HOURS_MAX, Math.max(HOURS_MIN, Math.round(hours)));
}

export function estimateTeaser({ fn, hoursPerWeek }: TeaserInput): TeaserResult {
  const preset = FUNCTION_PRESETS[fn];
  const hours = clampHours(hoursPerWeek);
  const hourlyCost = (preset.salary * OVERHEAD_MULTIPLIER) / HOURS_PER_YEAR;
  const annualHours = hours * WORK_WEEKS;
  return {
    hourlyCost,
    annualCost: Math.round((annualHours * hourlyCost) / 100) * 100,
    annualHours,
    fte: annualHours / HOURS_PER_YEAR,
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function formatUsd(value: number): string {
  return usd.format(value);
}

/** Query string carried to the full calculator so visitors don't re-enter anything. */
export function teaserPrefill({ fn, hoursPerWeek }: TeaserInput): string {
  return new URLSearchParams({ fn, hours: String(clampHours(hoursPerWeek)) }).toString();
}
