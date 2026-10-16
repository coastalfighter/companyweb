import { describe, expect, it } from "vitest";
import {
  FUNCTION_PRESETS,
  HOURS_MAX,
  HOURS_MIN,
  clampHours,
  estimateTeaser,
  formatUsd,
  teaserPrefill,
} from "./teaser";

describe("estimateTeaser", () => {
  it("prices hours at the fully loaded cost of the role doing them today", () => {
    // Controller: 145,000 × 1.3 / 2080 = 90.625/h; 40h × 48 weeks = 1,920h → 174,000.
    const result = estimateTeaser({ fn: "finance", hoursPerWeek: 40 });
    expect(result.hourlyCost).toBeCloseTo(90.625);
    expect(result.annualHours).toBe(1920);
    expect(result.annualCost).toBe(174_000);
    expect(result.fte).toBeCloseTo(0.923, 3);
  });

  it("rounds to the nearest $100", () => {
    const result = estimateTeaser({ fn: "admin", hoursPerWeek: 7 });
    expect(result.annualCost % 100).toBe(0);
  });

  it("scales linearly with hours", () => {
    const ten = estimateTeaser({ fn: "web", hoursPerWeek: 10 }).annualCost;
    const twenty = estimateTeaser({ fn: "web", hoursPerWeek: 20 }).annualCost;
    expect(Math.abs(twenty - ten * 2)).toBeLessThanOrEqual(100);
  });

  it("covers every function with a positive salary", () => {
    for (const preset of Object.values(FUNCTION_PRESETS)) expect(preset.salary).toBeGreaterThan(0);
  });
});

describe("clampHours", () => {
  it("keeps hours inside the slider range and rounds", () => {
    expect(clampHours(0)).toBe(HOURS_MIN);
    expect(clampHours(999)).toBe(HOURS_MAX);
    expect(clampHours(12.6)).toBe(13);
    expect(clampHours(Number.NaN)).toBe(HOURS_MIN);
  });
});

describe("formatting and prefill", () => {
  it("formats whole US dollars", () => {
    expect(formatUsd(174000)).toBe("$174,000");
  });

  it("builds a clamped prefill query", () => {
    expect(teaserPrefill({ fn: "legal", hoursPerWeek: 500 })).toBe("fn=legal&hours=200");
  });
});
