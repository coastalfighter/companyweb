import { expect, test } from "@playwright/test";

/** The depth layer (docs/blueprint/01-brand-design-system.md, A6.3a). */
test.describe("depth layer", () => {
  test("the scroll rail is an 'On this page' nav on wide screens", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "The rail shows from 1280px");
    await page.goto("/");
    const rail = page.getByRole("navigation", { name: "On this page" });
    await expect(rail).toBeVisible();
    await expect(rail.getByRole("link")).toHaveCount(10);

    // Every tick points at a heading whose section names a timeline for it.
    const missing = await rail
      .getByRole("link")
      .evaluateAll((links) =>
        links
          .map((a) => a.getAttribute("href")!.slice(1))
          .filter((id) => !document.querySelector(`section[aria-labelledby="${id}"]`)),
      );
    expect(missing).toEqual([]);

    await rail.getByRole("link", { name: "Security" }).click();
    await expect(page).toHaveURL(/#security-title$/);
    await expect(page.locator("#security-title")).toBeInViewport();
  });

  test("the rail stays out of the way on smaller screens", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "On this page" })).toBeHidden();
  });

  test("the ticker slides with the scroll and never moves on its own", async ({ page }) => {
    await page.goto("/");
    const row = page.locator(".ticker-forward");
    const offset = () => row.evaluate((el) => Math.round(el.getBoundingClientRect().left));
    await row.scrollIntoViewIfNeeded();
    // Let the scroll settle, then the band must hold still.
    await page.waitForTimeout(600);
    const before = await offset();
    await page.waitForTimeout(600);
    expect(await offset()).toBe(before);
    await page.mouse.wheel(0, 400);
    await expect.poll(offset).not.toBe(before);
  });

  test("cards enter in 3D and settle flat once in view", async ({ page }) => {
    await page.goto("/");
    const card = page
      .locator("#services-title")
      .locator("xpath=ancestor::section")
      .locator(".depth-in")
      .first();
    const rotate = () => card.evaluate((el) => getComputedStyle(el).rotate);
    expect(await rotate()).not.toBe("none");
    await card.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 300);
    await expect.poll(rotate).toMatch(/^(none|x 0deg|1 0 0 0deg)$/);
  });

  test("cards light up and tilt under the pointer", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Pointer-fine devices only");
    await page.goto("/");
    const card = page.locator(".surface").first();
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.25, { steps: 4 });
    await expect(card).toHaveAttribute("data-surface-active", "");
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
    await page.mouse.move(2, 2);
    await expect(card).not.toHaveAttribute("data-surface-active");
  });

  test("reduced motion turns it all off", async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "On this page" })).toBeHidden();
    const animated = await page.evaluate(() =>
      [".depth-in", ".depth-panel", ".heading-depth", ".hero-depth", ".ticker-row", ".text-shimmer"].flatMap(
        (selector) =>
          [...document.querySelectorAll(selector)]
            .filter((el) => getComputedStyle(el).animationName !== "none")
            .map(() => selector),
      ),
    );
    expect(animated).toEqual([]);
    await context.close();
  });
});
