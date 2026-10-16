import { gzipSync } from "node:zlib";
import { expect, test } from "@playwright/test";

/**
 * Render-critical JavaScript budget (docs/blueprint/09-tech-stack.md, I3): the scripts
 * a page's HTML loads itself, gzipped. Lighthouse's script total (lighthouserc.json)
 * also counts idle-time route prefetches (e.g. /contact behind "Book a call"), so it
 * gets a looser cap; this test holds the line on what blocks the first render.
 */
const BUDGET_BYTES = 200_000;
const PAGES = [
  "/",
  "/services",
  "/services/accounting",
  "/contact",
  "/careers",
  "/resources/back-office-calculator",
] as const;

test.describe("render-critical JS budget", () => {
  test.skip(({ isMobile }) => isMobile, "byte budgets don't depend on the viewport");

  for (const path of PAGES) {
    test(`${path} ≤ ${BUDGET_BYTES / 1000} KB gzipped`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      // Skip noModule polyfills: modern browsers never download them.
      const tags = [...html.matchAll(/<script([^>]*)>/g)]
        .map((m) => m[1]!)
        .filter((attrs) => !/noModule/i.test(attrs));
      const srcs = [
        ...new Set(tags.map((attrs) => /src="([^"]+\.js)"/.exec(attrs)?.[1]).filter((s): s is string => !!s)),
      ];
      expect(srcs.length).toBeGreaterThan(0);
      let total = 0;
      for (const src of srcs) total += gzipSync(await (await request.get(src)).body()).length;
      test.info().annotations.push({
        type: "js-budget",
        description: `${path}: ${(total / 1000).toFixed(1)} KB, ${srcs.length} scripts`,
      });
      expect(total).toBeLessThanOrEqual(BUDGET_BYTES);
    });
  }
});
