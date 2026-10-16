/**
 * Back-Office Cost Calculator model (docs/blueprint/06-cta-conversion.md, F4).
 *
 * Pure functions, no I/O: the page, the PDF report and the tests all run the same
 * math. Rules from the blueprint, enforced here rather than in copy:
 * - every assumption is an explicit, visible input (salary, overhead, weeks);
 * - Akrostech's cost and the savings are ranges, never one number;
 * - no savings are claimed without a rate card Akrostech has signed off
 *   (content/rate-card.ts), and small or negative savings are reported as such.
 */
import {
  FUNCTION_PRESETS,
  HOURS_PER_YEAR,
  OVERHEAD_MULTIPLIER,
  WORK_WEEKS,
  type TeaserFunction,
} from "./teaser";

export type CalcFunction = TeaserFunction;

export const CALC_FUNCTIONS: readonly CalcFunction[] = ["finance", "hiring", "admin", "web", "legal"];

export const FUNCTION_LABELS: Record<CalcFunction, string> = {
  finance: "Finance & payroll",
  hiring: "Hiring",
  admin: "Admin / exec support",
  web: "Website",
  legal: "Legal ops",
};

export type Region = "us-ca" | "uk-eu" | "au-nz" | "other";

export const REGIONS: readonly { value: Region; label: string }[] = [
  { value: "us-ca", label: "US / Canada" },
  { value: "uk-eu", label: "UK / EU" },
  { value: "au-nz", label: "Australia / NZ" },
  { value: "other", label: "Other" },
];

/**
 * Regions with sourced salary presets. Only US figures exist (blueprint F4,
 * [VERIFY] against a current salary guide); elsewhere the visitor enters the
 * salary, rather than us guessing one.
 */
export const REGIONS_WITH_PRESETS: ReadonlySet<Region> = new Set<Region>(["us-ca"]);

export const COMPANY_SIZES = ["1–49", "50–199", "200–499", "500–1,999", "2,000+"] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

export const HOURS_RANGE = { min: 0, max: 200 } as const;
export const SALARY_RANGE = { min: 10_000, max: 1_000_000 } as const;
export const OVERHEAD_RANGE = { min: 1, max: 2 } as const;

/** Slider presets (F4 Step 2). */
export const HOUR_PRESETS = [
  { label: "A few hours", hours: 5 },
  { label: "Half a person", hours: 20 },
  { label: "A full person", hours: 40 },
  { label: "A team", hours: 120 },
] as const;

export interface FunctionInput {
  enabled: boolean;
  hoursPerWeek: number;
  /** Annual base salary (USD) of whoever does the work today; null until known. */
  salary: number | null;
}

export interface CalculatorInput {
  region: Region;
  companySize: CompanySize | null;
  /** Benefits, payroll tax and overhead on top of base salary. */
  overhead: number;
  functions: Record<CalcFunction, FunctionInput>;
}

/** Akrostech's hourly rate range per function (USD), from content/rate-card.ts. */
export interface RateCard {
  hourly: Record<CalcFunction, { low: number; high: number }>;
  /** One-off fees before work starts. 0 means "Break-even: month 1". */
  setupFee: number;
  /** Who approved these rates and when (not rendered). */
  approvedBy: string;
}

export interface Range {
  low: number;
  high: number;
}

export interface FunctionResult {
  fn: CalcFunction;
  hoursPerWeek: number;
  annualHours: number;
  salary: number;
  hourlyCost: number;
  annualCost: number;
  akrostech: Range | null;
}

export type Verdict =
  /** Nothing enabled with hours and a salary yet. */
  | "empty"
  /** No rate card: current cost only. */
  | "cost-only"
  /** The low end of the savings is at least MEANINGFUL_SAVINGS of today's cost. */
  | "saves"
  /** Savings are possible but small or uncertain. */
  | "marginal"
  /** Even the low end of our range costs more than doing it in-house. */
  | "costs-more";

export interface CalculatorResult {
  lines: FunctionResult[];
  /** Enabled functions with hours but no salary yet. */
  missingSalary: CalcFunction[];
  hoursPerWeek: number;
  annualHours: number;
  /** Annual hours as full-time equivalents. */
  fte: number;
  /** Today's annual cost of the hours, fully loaded. */
  currentCost: number;
  akrostech: Range | null;
  savings: Range | null;
  verdict: Verdict;
  /**
   * When we cost more: the average salary above which Akrostech's low rate would
   * be cheaper ("Here's when we'd become cheaper", F4 Rules).
   */
  breakEvenSalary: number | null;
  /** The function taking most hours (for "≈ 0.9 FTE of your controller's time"). */
  largest: FunctionResult | null;
}

/** Savings below this share of today's cost are reported as marginal, not as a win. */
export const MEANINGFUL_SAVINGS = 0.15;

export function presetSalary(fn: CalcFunction, region: Region): number | null {
  return REGIONS_WITH_PRESETS.has(region) ? FUNCTION_PRESETS[fn].salary : null;
}

export function defaultInput(region: Region = "us-ca"): CalculatorInput {
  return {
    region,
    companySize: null,
    overhead: OVERHEAD_MULTIPLIER,
    functions: Object.fromEntries(
      CALC_FUNCTIONS.map((fn) => [
        fn,
        { enabled: false, hoursPerWeek: 10, salary: presetSalary(fn, region) },
      ]),
    ) as Record<CalcFunction, FunctionInput>,
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

export function clampHoursPerWeek(value: number): number {
  return finite(value) ? clamp(Math.round(value), HOURS_RANGE.min, HOURS_RANGE.max) : HOURS_RANGE.min;
}

export function clampSalary(value: number | null): number | null {
  if (!finite(value) || value <= 0) return null;
  return clamp(Math.round(value), SALARY_RANGE.min, SALARY_RANGE.max);
}

export function clampOverhead(value: number): number {
  return finite(value)
    ? clamp(Math.round(value * 100) / 100, OVERHEAD_RANGE.min, OVERHEAD_RANGE.max)
    : OVERHEAD_MULTIPLIER;
}

/**
 * Rebuilds a valid input from anything (localStorage, a URL, a POST body).
 * Unknown keys are dropped and every number is clamped, so stored or shared
 * state can never put the calculator into an impossible state.
 */
export function sanitizeInput(raw: unknown): CalculatorInput {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const region = REGIONS.some((r) => r.value === source.region) ? (source.region as Region) : "us-ca";
  const base = defaultInput(region);
  const companySize = (COMPANY_SIZES as readonly unknown[]).includes(source.companySize)
    ? (source.companySize as CompanySize)
    : null;
  const fns =
    source.functions && typeof source.functions === "object"
      ? (source.functions as Record<string, unknown>)
      : {};

  const functions = Object.fromEntries(
    CALC_FUNCTIONS.map((fn) => {
      const f = fns[fn] && typeof fns[fn] === "object" ? (fns[fn] as Record<string, unknown>) : {};
      const salary =
        f.salary === null ? null : finite(f.salary) ? clampSalary(f.salary) : base.functions[fn].salary;
      return [
        fn,
        {
          enabled: f.enabled === true,
          hoursPerWeek: finite(f.hoursPerWeek)
            ? clampHoursPerWeek(f.hoursPerWeek)
            : base.functions[fn].hoursPerWeek,
          salary,
        },
      ];
    }),
  ) as Record<CalcFunction, FunctionInput>;

  return {
    region,
    companySize,
    overhead: finite(source.overhead) ? clampOverhead(source.overhead) : base.overhead,
    functions,
  };
}

/** Applies the homepage teaser's `?fn=finance&hours=25` on top of an input. */
export function applyPrefill(input: CalculatorInput, params: URLSearchParams): CalculatorInput {
  const fn = params.get("fn");
  if (!fn || !(CALC_FUNCTIONS as readonly string[]).includes(fn)) return input;
  const key = fn as CalcFunction;
  const hours = Number(params.get("hours"));
  return {
    ...input,
    functions: {
      ...input.functions,
      [key]: {
        ...input.functions[key],
        enabled: true,
        hoursPerWeek:
          Number.isFinite(hours) && params.has("hours")
            ? clampHoursPerWeek(hours)
            : input.functions[key].hoursPerWeek,
      },
    },
  };
}

const round100 = (value: number) => Math.round(value / 100) * 100;

export function calculate(input: CalculatorInput, rateCard: RateCard | null): CalculatorResult {
  const lines: FunctionResult[] = [];
  const missingSalary: CalcFunction[] = [];

  for (const fn of CALC_FUNCTIONS) {
    const f = input.functions[fn];
    const hoursPerWeek = clampHoursPerWeek(f.hoursPerWeek);
    if (!f.enabled || hoursPerWeek === 0) continue;
    const salary = clampSalary(f.salary);
    if (salary === null) {
      missingSalary.push(fn);
      continue;
    }
    const annualHours = hoursPerWeek * WORK_WEEKS;
    const hourlyCost = (salary * input.overhead) / HOURS_PER_YEAR;
    const rates = rateCard?.hourly[fn];
    lines.push({
      fn,
      hoursPerWeek,
      annualHours,
      salary,
      hourlyCost,
      annualCost: round100(annualHours * hourlyCost),
      akrostech: rates
        ? { low: round100(annualHours * rates.low), high: round100(annualHours * rates.high) }
        : null,
    });
  }

  const sum = (pick: (line: FunctionResult) => number) =>
    lines.reduce((total, line) => total + pick(line), 0);
  const hoursPerWeek = sum((l) => l.hoursPerWeek);
  const annualHours = sum((l) => l.annualHours);
  const currentCost = sum((l) => l.annualCost);
  const largest = lines.reduce<FunctionResult | null>(
    (best, line) => (!best || line.annualHours > best.annualHours ? line : best),
    null,
  );

  const base = {
    lines,
    missingSalary,
    hoursPerWeek,
    annualHours,
    fte: annualHours / HOURS_PER_YEAR,
    currentCost,
    largest,
  };

  if (lines.length === 0) {
    return { ...base, akrostech: null, savings: null, verdict: "empty", breakEvenSalary: null };
  }
  if (!rateCard) {
    return { ...base, akrostech: null, savings: null, verdict: "cost-only", breakEvenSalary: null };
  }

  const setup = Math.max(0, rateCard.setupFee);
  const akrostech: Range = {
    low: sum((l) => l.akrostech!.low) + setup,
    high: sum((l) => l.akrostech!.high) + setup,
  };
  const savings: Range = { low: currentCost - akrostech.high, high: currentCost - akrostech.low };

  let verdict: Verdict;
  if (savings.high <= 0) verdict = "costs-more";
  else if (savings.low >= currentCost * MEANINGFUL_SAVINGS) verdict = "saves";
  else verdict = "marginal";

  // Salary at which our low rate matches the in-house hourly cost, averaged by hours.
  const blendedLowRate = annualHours > 0 ? (akrostech.low - setup) / annualHours : 0;
  const breakEvenSalary =
    verdict === "costs-more"
      ? Math.ceil((blendedLowRate * HOURS_PER_YEAR) / input.overhead / 1000) * 1000
      : null;

  return { ...base, akrostech, savings, verdict, breakEvenSalary };
}

/** Months until cumulative savings cover the setup fee; 1 when there is none. */
export function breakEvenMonth(result: CalculatorResult, rateCard: RateCard | null): number | null {
  if (!rateCard || !result.savings) return null;
  const setup = Math.max(0, rateCard.setupFee);
  // The conservative (low) annual saving, before the one-off fee.
  const monthlyRecurringSaving = (result.savings.low + setup) / 12;
  if (monthlyRecurringSaving <= 0) return null;
  return setup === 0 ? 1 : Math.max(1, Math.ceil(setup / monthlyRecurringSaving));
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatMoney(value: number): string {
  return usd.format(value);
}

/** "$142K – $198K"; a range that collapses to one value prints once. */
export function formatRange(range: Range): string {
  const low = usdCompact.format(range.low);
  const high = usdCompact.format(range.high);
  return low === high ? low : `${low} – ${high}`;
}

export function formatHours(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/**
 * The plain-language summary (F4 Step 3), built only from the result, so it
 * can never say more than the numbers do.
 */
export function summarySentence(result: CalculatorResult): string {
  if (result.verdict === "empty") return "";
  const hours = `Your team spends about ${formatHours(result.hoursPerWeek)} hours a week on work Akrostech could run.`;
  const returned = `${formatHours(result.annualHours)} senior hours a year`;
  switch (result.verdict) {
    case "cost-only":
      return `${hours} Today that time costs about ${formatMoney(result.currentCost)} a year. Moving it would return ${returned}.`;
    case "saves":
      return `${hours} Moving it would cost roughly ${formatRange(result.akrostech!)} a year, save ${formatRange(result.savings!)}, and return ${returned}.`;
    case "marginal":
      return `${hours} Moving it would cost roughly ${formatRange(result.akrostech!)} a year. The saving is small, so the stronger case is the ${returned} it returns.`;
    case "costs-more":
      return `${hours} Honestly, at this cost an in-house hire might make more sense: we'd cost roughly ${formatRange(result.akrostech!)} a year against ${formatMoney(result.currentCost)} today.`;
  }
}
