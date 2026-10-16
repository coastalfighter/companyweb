import {
  calculate,
  formatHours,
  formatMoney,
  formatRange,
  FUNCTION_LABELS,
  sanitizeInput,
  type RateCard,
} from "./model";

/** Longest calculator payload accepted from a form. */
export const CALCULATOR_FIELD_MAX = 4096;

/**
 * Turns the calculator inputs a visitor saved (sent as a hidden contact-form field,
 * blueprint F4) into one line for the sales team. The raw value is untrusted: it is
 * size-capped, parsed defensively, sanitized and recomputed with the server's own
 * rate card. Returns undefined when there's nothing useful.
 */
export function calculatorLeadSummary(raw: unknown, rateCard: RateCard | null): string | undefined {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > CALCULATOR_FIELD_MAX) return undefined;
  let stored: unknown;
  try {
    stored = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!stored || typeof stored !== "object" || (stored as { v?: unknown }).v !== 1) return undefined;
  const input = sanitizeInput((stored as { input?: unknown }).input);
  const result = calculate(input, rateCard);
  if (result.verdict === "empty") return undefined;
  const work = result.lines.map((l) => `${FUNCTION_LABELS[l.fn]} ${l.hoursPerWeek}h/wk`).join(", ");
  return [
    `Today ${formatMoney(result.currentCost)}/yr`,
    `${formatHours(result.annualHours)} h/yr (${result.fte.toFixed(1)} FTE)`,
    result.akrostech ? `Akrostech ${formatRange(result.akrostech)}/yr` : null,
    work,
  ]
    .filter(Boolean)
    .join(" · ");
}
