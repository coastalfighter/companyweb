import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComparisonSection } from "@/components/home/comparison-section";
import { comparisonRows, comparisons, COMPETITORS, getComparison } from "@/content/compare";
import { ComparePage } from "./compare-page";

describe("comparison data", () => {
  it("fills every competitor on every row", () => {
    for (const row of comparisonRows(false)) {
      for (const c of COMPETITORS) expect(row.values[c], `${row.label} / ${c}`).toBeTruthy();
      expect(row.akrostech).toBeTruthy();
    }
  });

  it("only claims SOC 2 controls when SOC 2 is held", () => {
    const security = (soc2: boolean) =>
      comparisonRows(soc2).find((r) => r.label === "Security controls")!.akrostech;
    expect(security(false)).not.toMatch(/SOC 2/);
    expect(security(true)).toMatch(/SOC 2/);
  });

  it("has unique slugs and finds them", () => {
    expect(new Set(comparisons.map((c) => c.slug)).size).toBe(comparisons.length);
    expect(getComparison("in-house-vs-akrostech")?.competitor).toBe("in-house");
    expect(getComparison("nope")).toBeUndefined();
  });
});

describe("<ComparePage />", () => {
  it.each(comparisons.map((c) => [c.slug, c] as const))(
    "%s shows the same rows as the homepage table",
    (_slug, comparison) => {
      const { unmount } = render(<ComparisonSection />);
      const homeAkrostech = within(screen.getByRole("table"))
        .getAllByRole("row")
        .slice(1)
        .map((r) => r.lastElementChild?.textContent);
      unmount();

      render(<ComparePage comparison={comparison} />);
      const table = screen.getByRole("table", { name: /compared with Akrostech/ });
      const pageAkrostech = within(table)
        .getAllByRole("row")
        .slice(1)
        .map((r) => r.lastElementChild?.textContent);
      expect(pageAkrostech).toEqual(homeAkrostech);
      // The case for the alternative comes first.
      const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
      expect(headings.indexOf(comparison.theyWin.title)).toBeLessThan(
        headings.indexOf(comparison.weWin.title),
      );
    },
  );
});
