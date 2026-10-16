import {
  breakEvenMonth,
  formatHours,
  formatMoney,
  formatRange,
  FUNCTION_LABELS,
  MEANINGFUL_SAVINGS,
  REGIONS,
  summarySentence,
  type CalculatorInput,
  type CalculatorResult,
  type RateCard,
} from "./model";
import { FUNCTION_PRESETS, HOURS_PER_YEAR, WORK_WEEKS } from "./teaser";

/**
 * What the PDF report says (docs/blueprint/06-cta-conversion.md, F4: "Email me the
 * full report + methodology"), separate from how it's drawn, so the words and
 * numbers are unit tested. Everything is derived from the same model as the page.
 */

export interface ReportRecipient {
  name: string;
  company?: string;
}

export interface ReportContent {
  title: string;
  preparedFor: string;
  summary: string;
  keyFigures: [label: string, value: string][];
  tableHead: string[];
  tableRows: string[][];
  /** The candid note, when savings are small or negative. */
  caveat: string | null;
  methodology: string[];
  nextStep: string;
  disclaimer: string;
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

export function reportContent(
  input: CalculatorInput,
  result: CalculatorResult,
  rateCard: RateCard | null,
  recipient: ReportRecipient,
  generatedAt: Date,
  siteUrl: string,
): ReportContent {
  const who = recipient.company ? `${recipient.name}, ${recipient.company}` : recipient.name;
  const region = REGIONS.find((r) => r.value === input.region)?.label ?? input.region;
  const month = breakEvenMonth(result, rateCard);

  const keyFigures: ReportContent["keyFigures"] = [
    ["Current annual cost of this work", formatMoney(result.currentCost)],
    ["Hours spent per year", formatHours(result.annualHours)],
    ["Full-time equivalent", `${result.fte.toFixed(1)} FTE`],
  ];
  if (result.akrostech && result.savings) {
    keyFigures.push(
      ["Estimated Akrostech cost", `${formatRange(result.akrostech)} a year`],
      [
        "Annual savings",
        result.savings.high <= 0
          ? "None at these rates"
          : formatRange({ low: Math.max(0, result.savings.low), high: result.savings.high }),
      ],
    );
    if (month !== null) keyFigures.push(["Break-even", `Month ${month}`]);
  }

  const tableHead = ["Work", "Hours / week", "Salary", "Cost / hour", "Cost / year"];
  if (rateCard) tableHead.push("With Akrostech");
  const tableRows = result.lines.map((line) => {
    const row = [
      FUNCTION_LABELS[line.fn],
      String(line.hoursPerWeek),
      formatMoney(line.salary),
      formatMoney(Math.round(line.hourlyCost)),
      formatMoney(line.annualCost),
    ];
    if (rateCard) row.push(line.akrostech ? formatRange(line.akrostech) : "");
    return row;
  });

  let caveat: string | null = null;
  if (result.verdict === "costs-more") {
    caveat = `Honestly, at these numbers an in-house hire may make more sense.${
      result.breakEvenSalary
        ? ` We'd become cheaper once the people doing this work cost more than about ${formatMoney(result.breakEvenSalary)} a year each, or when the work outgrows one person.`
        : ""
    }`;
  } else if (result.verdict === "marginal") {
    caveat = `The saving is under ${Math.round(MEANINGFUL_SAVINGS * 100)}% of today's cost, so the stronger case is the ${formatHours(result.annualHours)} senior hours a year it returns.`;
  }

  const overheadPct = Math.round((input.overhead - 1) * 100);
  const methodology = [
    `Today's cost = hours a week x ${WORK_WEEKS} working weeks x the fully loaded hourly cost of whoever does the work: salary x ${input.overhead.toFixed(2)} (${overheadPct}% for benefits, payroll tax and overhead) / ${HOURS_PER_YEAR.toLocaleString("en-US")} hours a year, rounded to the nearest $100.`,
    `Salaries are the ones entered in the calculator (team in ${region}, in USD). Where a preset was used, it was: ${Object.values(
      FUNCTION_PRESETS,
    )
      .map((p) => `${p.role} ${formatMoney(p.salary)}`)
      .join(", ")}.`,
    rateCard
      ? `Akrostech's cost = the same hours x our hourly rate range for each function${
          rateCard.setupFee > 0
            ? `, plus a one-off ${formatMoney(rateCard.setupFee)} setup fee`
            : ", with no setup fee"
        }. Savings run from today's cost minus our high end to today's cost minus our low end.`
      : "Akrostech's cost depends on the scope, so we quote it in writing after a 20-minute call rather than estimate it here.",
    `Hours returned = the hours your people spend on this work today, over ${WORK_WEEKS} weeks. FTE = those hours / ${HOURS_PER_YEAR.toLocaleString("en-US")}.`,
  ];

  return {
    title: "Back-office cost report",
    preparedFor: `Prepared for ${who} on ${dateFormat.format(generatedAt)}`,
    summary: summarySentence(result),
    keyFigures,
    tableHead,
    tableRows,
    caveat,
    methodology,
    nextStep: rateCard
      ? `Book a 20-minute call to check these numbers against your real workload: ${siteUrl}/contact`
      : `Book a 20-minute call and you'll have a written quote within 48 hours, with the savings worked out against these numbers: ${siteUrl}/contact`,
    disclaimer:
      "An estimate from the figures you entered, not a quote or an offer. Your actual costs and any Akrostech fees depend on the scope we agree in writing.",
  };
}

/* ---------- Text safe for the PDF's standard font (WinAnsi) ---------- */

const REPLACEMENTS: Record<string, string> = {
  "→": "->",
  "←": "<-",
  "≈": "~",
  "×": "x",
  "−": "-",
  "‑": "-",
  " ": " ",
  " ": " ",
  " ": " ",
};

/** Characters the standard PDF fonts can draw beyond Latin-1 (Windows-1252 0x80–0x9F). */
const WIN_ANSI_EXTRA = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");

function isWinAnsi(char: string): boolean {
  const code = char.codePointAt(0)!;
  return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_EXTRA.has(char);
}

/**
 * Makes text drawable with Helvetica: known symbols get ASCII stand-ins, accents
 * outside Latin-1 are dropped ("Łódź" → "Lodz"), control characters go, and
 * anything else becomes "?" rather than failing the whole report.
 */
export function pdfSafe(text: string): string {
  let out = "";
  for (const char of text.replace(/[\r\n\t]+/g, " ")) {
    if (REPLACEMENTS[char] !== undefined) out += REPLACEMENTS[char];
    else if (isWinAnsi(char)) out += char;
    else {
      const base = char.normalize("NFKD").replace(/[̀-ͯ]/g, "");
      out += [...base].every(isWinAnsi) && base !== "" ? base : char === "Ł" ? "L" : char === "ł" ? "l" : "?";
    }
  }
  return out;
}
