import { expect, test } from "@playwright/test";

test.describe("homepage hero", () => {
  test("renders the headline, sub and both CTAs", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator('section[aria-labelledby="hero-title"]');
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Your\s+Back\s+Office\.\s+Rebuilt\./);
    await expect(hero.getByText("We handle the operations so your team handles the vision.")).toBeVisible();
    await expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute("href", "/contact");
    await expect(hero.getByRole("link", { name: "See Our Work" })).toHaveAttribute("href", "/work");
  });

  test("keeps the primary CTA above the fold", async ({ page }) => {
    await page.goto("/");
    const cta = page
      .locator('section[aria-labelledby="hero-title"]')
      .getByRole("link", { name: "Start a Project" });
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

  test("the headline materializes sharp, and the wireframe draws", async ({ page }) => {
    await page.goto("/");
    const words = page.locator("#hero-title .hero-word");
    await expect(words).toHaveCount(4);
    await expect
      .poll(() => words.evaluateAll((els) => els.map((el) => getComputedStyle(el).filter)), { timeout: 6000 })
      .toEqual(["none", "none", "none", "none"]);
    const lit = await page.locator(".engine-canvas").evaluate((canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d")!;
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let count = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i]! > 0) count++;
      return count;
    });
    expect(lit).toBeGreaterThan(500);
  });
});

test.describe("reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("shows the hero as a still, fully readable frame", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".preloader")).toBeHidden();
    const styles = await page
      .locator("#hero-title .hero-word")
      .evaluateAll((els) => els.map((el) => [getComputedStyle(el).filter, getComputedStyle(el).transform]));
    for (const [filter, transform] of styles) {
      expect(filter).toBe("none");
      expect(transform).toBe("none");
    }
    await expect(page.getByRole("link", { name: "Start a Project" })).toBeVisible();
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
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("isn't part of the operation");
  });

  test("spam-shaped URLs from the old site are gone, not missing", async ({ page }) => {
    const res = await page.goto("/cheap-pills-casino");
    expect(res?.status()).toBe(410);
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
