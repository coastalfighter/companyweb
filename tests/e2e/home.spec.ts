import { expect, test } from "@playwright/test";

test.describe("homepage hero", () => {
  test("renders the headline, sub and both CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /We run the parts\s*of your business\s*nobody sees\./,
    );
    await expect(page.getByRole("link", { name: "Book a 20-minute call" })).toHaveAttribute(
      "href",
      "/contact",
    );
    await expect(page.getByRole("link", { name: "See what it would cost" })).toHaveAttribute(
      "href",
      "/resources/back-office-calculator",
    );
  });

  test("keeps the primary CTA above the fold", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "Book a 20-minute call" });
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
  });

  test("has no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("ops feed ticks, and the pause control stops it", async ({ page }) => {
    await page.goto("/");
    const count = page.getByTestId("ops-feed-count");
    await expect(count).toHaveText("38");
    await expect(count).not.toHaveText("38", { timeout: 15_000 });

    await page.getByRole("button", { name: "Pause live feed" }).click();
    const paused = await count.textContent();
    await page.waitForTimeout(6000);
    await expect(count).toHaveText(paused!);
  });

  test("feed filter tabs work with the keyboard", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "All" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Web" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "Web" })).toBeFocused();
  });
});

test.describe("reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("starts the feed paused", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Resume live feed" })).toBeVisible();
    await page.waitForTimeout(4000);
    await expect(page.getByTestId("ops-feed-count")).toHaveText("38");
  });
});

test.describe("global", () => {
  test("skip link is the first tab stop and moves focus to main", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard navigation is a desktop concern");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("sends security headers", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("unknown routes return a branded 404", async ({ page }) => {
    const res = await page.goto("/cheap-pills-casino");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("isn't part of the operation");
  });

  test("design system page is not indexable", async ({ page }) => {
    await page.goto("/design-system");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/");
    await page.waitForTimeout(2500);
    expect(errors).toEqual([]);
  });
});
