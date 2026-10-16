import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/design-system", "/design-system/home-preview", "/this-route-does-not-exist"] as const;

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
