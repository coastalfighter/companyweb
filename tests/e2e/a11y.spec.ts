import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/design-system", "/this-route-does-not-exist"] as const;

for (const route of routes) {
  test(`no WCAG 2.1 A/AA violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    // Let entrance animations settle so axe measures final colors, not mid-fade opacity.
    await page.waitForTimeout(1500);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}
