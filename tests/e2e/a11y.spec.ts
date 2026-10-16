import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/design-system",
  "/design-system/home-preview",
  "/design-system/about-preview",
  "/work",
  "/design-system/work-preview",
  "/design-system/work-preview/tidemark-health",
  "/careers",
  "/design-system/careers-preview",
  "/design-system/careers-preview/senior-bookkeeper-sample1",
  "/resources/back-office-calculator",
  "/design-system/calculator-preview?fn=finance&hours=40",
  "/about/security",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/dpa",
  "/legal/accessibility",
  "/pricing",
  "/compare",
  "/compare/in-house-vs-akrostech",
  "/compare/freelancers-vs-akrostech",
  "/this-route-does-not-exist",
] as const;

for (const route of routes) {
  test(`no WCAG 2.1 A/AA violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    // Read through the page so every reveal has fired, then let animations settle,
    // so axe measures final colors rather than mid-fade opacity.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}

const layoutRoutes = [
  "/",
  "/services",
  "/services/web-development",
  "/services/recruitment",
  "/services/virtual-assistance",
  "/services/accounting",
  "/services/legal",
  "/contact",
  "/contact/thank-you",
  "/about",
  "/how-it-works",
  "/design-system",
  "/design-system/about-preview",
  "/work",
  "/design-system/work-preview",
  "/design-system/work-preview/tidemark-health",
  "/careers",
  "/design-system/careers-preview",
  "/design-system/careers-preview/senior-bookkeeper-sample1",
  "/resources/back-office-calculator",
  "/design-system/calculator-preview?fn=finance&hours=40",
  "/about/security",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/dpa",
  "/legal/accessibility",
  "/pricing",
  "/compare",
  "/compare/in-house-vs-akrostech",
  "/compare/freelancers-vs-akrostech",
] as const;

for (const route of layoutRoutes) {
  test(`no horizontal overflow on ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

// The accessibility statement promises pages work at 320px and at 200% zoom
// (a 1280px window at 200% is a 640px viewport). Hold it to that.
test.describe("narrow viewports", () => {
  test.skip(({ isMobile }) => isMobile, "sets its own viewport");
  for (const width of [320, 640]) {
    test(`no horizontal overflow at ${width}px on any page`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      const failures: string[] = [];
      for (const route of layoutRoutes) {
        await page.goto(route);
        await page.waitForTimeout(150);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        if (overflow > 0) failures.push(`${route}: ${overflow}px`);
      }
      expect(failures).toEqual([]);
    });
  }
});
