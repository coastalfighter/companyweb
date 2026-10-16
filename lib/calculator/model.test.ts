import { describe, expect, it } from "vitest";
import { rateCard } from "@/content/rate-card";
import { sampleRateCard } from "@/content/samples";
import {
  applyPrefill,
  breakEvenMonth,
  calculate,
  CALC_FUNCTIONS,
  defaultInput,
  formatRange,
  MEANINGFUL_SAVINGS,
  presetSalary,
  sanitizeInput,
  summarySentence,
  type CalculatorInput,
  type RateCard,
} from "./model";

/** Finance enabled at 40h/week on a $145K controller, nothing else. */
function financeOnly(hours = 40, salary: number | null = 145_000): CalculatorInput {
  const input = defaultInput("us-ca");
  input.functions.finance = { enabled: true, hoursPerWeek: hours, salary };
  return input;
}

const flatCard = (low: number, high: number, setupFee = 0): RateCard => ({
  hourly: Object.fromEntries(CALC_FUNCTIONS.map((fn) => [fn, { low, high }])) as RateCard["hourly"],
  setupFee,
  approvedBy: "test",
});

describe("rate card", () => {
  it("ships unset, so no savings are claimed without approved prices", () => {
    expect(rateCard).toBeNull();
  });
});

describe("defaults and presets", () => {
  it("starts with every function off and US salary presets", () => {
    const input = defaultInput();
    expect(CALC_FUNCTIONS.every((fn) => !input.functions[fn].enabled)).toBe(true);
    expect(input.functions.finance.salary).toBe(145_000);
    expect(input.overhead).toBe(1.3);
  });

  it("does not guess salaries for regions without sourced data", () => {
    expect(presetSalary("finance", "uk-eu")).toBeNull();
    expect(defaultInput("au-nz").functions.web.salary).toBeNull();
  });
});

describe("calculate: today's cost", () => {
  it("matches the hand calculation", () => {
    // 40h × 48 weeks = 1,920h; $145,000 × 1.3 / 2,080 = $90.625/h; × 1,920 = $174,000.
    const result = calculate(financeOnly(), null);
    expect(result.annualHours).toBe(1920);
    expect(result.lines[0]!.hourlyCost).toBeCloseTo(90.625, 3);
    expect(result.currentCost).toBe(174_000);
    expect(result.fte).toBeCloseTo(1920 / 2080, 5);
    expect(result.verdict).toBe("cost-only");
    expect(result.akrostech).toBeNull();
    expect(result.savings).toBeNull();
  });

  it("uses the editable overhead multiplier", () => {
    const input = { ...financeOnly(), overhead: 1 };
    expect(calculate(input, null).currentCost).toBe(Math.round((1920 * 145_000) / 2080 / 100) * 100);
  });

  it("sums enabled functions and finds the largest", () => {
    const input = financeOnly(20);
    input.functions.admin = { enabled: true, hoursPerWeek: 30, salary: 78_000 };
    input.functions.web = { enabled: false, hoursPerWeek: 100, salary: 170_000 };
    const result = calculate(input, null);
    expect(result.lines.map((l) => l.fn)).toEqual(["finance", "admin"]);
    expect(result.hoursPerWeek).toBe(50);
    expect(result.largest?.fn).toBe("admin");
  });

  it("reports enabled functions without a salary instead of inventing one", () => {
    const input = defaultInput("uk-eu");
    input.functions.legal = { enabled: true, hoursPerWeek: 15, salary: null };
    const result = calculate(input, sampleRateCard);
    expect(result.missingSalary).toEqual(["legal"]);
    expect(result.verdict).toBe("empty");
    expect(summarySentence(result)).toBe("");
  });

  it("is empty with nothing enabled or zero hours", () => {
    expect(calculate(defaultInput(), sampleRateCard).verdict).toBe("empty");
    expect(calculate(financeOnly(0), sampleRateCard).verdict).toBe("empty");
  });
});

describe("calculate: with a rate card", () => {
  it("gives ranges and the savings band", () => {
    // Akrostech 1,920h × $32–$48 = $61,440–$92,160 → rounded to $100.
    const result = calculate(financeOnly(), sampleRateCard);
    expect(result.akrostech).toEqual({ low: 61_400, high: 92_200 });
    expect(result.savings).toEqual({ low: 174_000 - 92_200, high: 174_000 - 61_400 });
    expect(result.verdict).toBe("saves");
    expect(breakEvenMonth(result, sampleRateCard)).toBe(1);
  });

  it("calls small savings marginal", () => {
    // In-house $90.63/h; our range $80–$100 → savings straddle zero.
    const result = calculate(financeOnly(), flatCard(80, 100));
    expect(result.savings!.low).toBeLessThan(0);
    expect(result.savings!.high).toBeGreaterThan(0);
    expect(result.verdict).toBe("marginal");
    expect(result.savings!.low < result.currentCost * MEANINGFUL_SAVINGS).toBe(true);
    expect(summarySentence(result)).toContain("The saving is small");
  });

  it("says plainly when we cost more, and at what salary we'd become cheaper", () => {
    const result = calculate(financeOnly(), flatCard(120, 150));
    expect(result.verdict).toBe("costs-more");
    // $120/h × 2,080 / 1.3 = $192,000.
    expect(result.breakEvenSalary).toBe(192_000);
    expect(breakEvenMonth(result, flatCard(120, 150))).toBeNull();
    expect(summarySentence(result)).toMatch(
      /^Your team spends about 40 hours.*Honestly, at this cost an in-house hire/,
    );
  });

  it("adds a setup fee to our cost and to break-even", () => {
    const card = flatCard(32, 48, 12_000);
    const result = calculate(financeOnly(), card);
    expect(result.akrostech).toEqual({ low: 61_400 + 12_000, high: 92_200 + 12_000 });
    // Recurring low saving = 174,000 − 92,200 = 81,800 / 12 ≈ 6,817 per month → 2 months.
    expect(breakEvenMonth(result, card)).toBe(2);
  });

  it("never reports a negative fee or rate as a saving", () => {
    const result = calculate(financeOnly(), flatCard(32, 48, -5000));
    expect(result.akrostech).toEqual({ low: 61_400, high: 92_200 });
  });
});

describe("sanitizeInput", () => {
  it("round-trips a valid input", () => {
    const input = financeOnly(25);
    input.companySize = "200–499";
    expect(sanitizeInput(JSON.parse(JSON.stringify(input)))).toEqual(input);
  });

  it("clamps and repairs hostile or stale data", () => {
    const result = sanitizeInput({
      region: "mars",
      companySize: "huge",
      overhead: 99,
      functions: {
        finance: { enabled: true, hoursPerWeek: 9999, salary: 5 },
        web: { enabled: "yes", hoursPerWeek: -4, salary: "lots" },
        legal: { enabled: true, hoursPerWeek: Number.NaN, salary: null },
        bogus: { enabled: true },
      },
      __proto__: { polluted: true },
    });
    expect(result.region).toBe("us-ca");
    expect(result.companySize).toBeNull();
    expect(result.overhead).toBe(2);
    expect(result.functions.finance).toEqual({ enabled: true, hoursPerWeek: 200, salary: 10_000 });
    expect(result.functions.web).toEqual({ enabled: false, hoursPerWeek: 0, salary: 170_000 });
    expect(result.functions.legal).toEqual({ enabled: true, hoursPerWeek: 10, salary: null });
    expect(Object.keys(result.functions)).toEqual([...CALC_FUNCTIONS]);
  });

  it("accepts garbage", () => {
    for (const raw of [null, undefined, 42, "x", []]) expect(sanitizeInput(raw)).toEqual(defaultInput());
  });
});

describe("applyPrefill (homepage teaser hand-off)", () => {
  it("enables the function with the teaser's hours", () => {
    const input = applyPrefill(defaultInput(), new URLSearchParams("fn=legal&hours=35"));
    expect(input.functions.legal).toEqual({ enabled: true, hoursPerWeek: 35, salary: 72_000 });
  });

  it("ignores unknown functions and keeps hours when none are given", () => {
    const base = defaultInput();
    expect(applyPrefill(base, new URLSearchParams("fn=crypto&hours=10"))).toBe(base);
    expect(applyPrefill(base, new URLSearchParams("fn=web")).functions.web.hoursPerWeek).toBe(10);
    expect(applyPrefill(base, new URLSearchParams("fn=web&hours=900")).functions.web.hoursPerWeek).toBe(200);
  });
});

describe("formatRange", () => {
  it("prints compact ranges and collapses equal ends", () => {
    expect(formatRange({ low: 142_000, high: 198_000 })).toBe("$142K – $198K");
    expect(formatRange({ low: 61_400, high: 61_400 })).toBe("$61K");
  });
});
