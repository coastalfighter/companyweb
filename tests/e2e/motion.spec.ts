import { expect, test, type Page } from "@playwright/test";

/** The motion system (docs/blueprint/11-motion-system.md). */

/** Waits until GSAP has loaded and any boot screen has lifted. */
async function settled(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");
  await expect(page.locator(".preloader")).toBeHidden({ timeout: 5000 });
}

test.describe("boot preloader", () => {
  test("plays once per session, then lifts in under two seconds", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-boot", "pending");
    await expect(page.locator(".preloader")).toBeVisible();
    const start = Date.now();
    await expect(page.locator(".preloader")).toBeHidden({ timeout: 4000 });
    expect(Date.now() - start).toBeLessThan(2600);
    await expect(page.locator(".preloader-letter").first()).toHaveText("A");

    // Same tab, new page load: no second boot sequence.
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-boot", "done");
    await expect(page.locator(".preloader")).toBeHidden();
  });

  test("a key press skips it", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");
    await page.keyboard.press("Shift");
    await expect(page.locator(".preloader")).toBeHidden({ timeout: 1500 });
  });
});

test.describe("route curtain", () => {
  test("covers the page, changes route behind it and lifts", async ({ page, isMobile }) => {
    test.skip(isMobile, "header links are in the menu on phones");
    await page.goto("/services");
    await settled(page);
    await page.locator("header").getByRole("link", { name: "About" }).click();
    await expect(page.locator(".route-curtain")).toBeVisible();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator(".route-curtain")).toBeHidden({ timeout: 4000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect.poll(() => page.locator("#main").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  test("leaves same-page anchors and new tabs to the browser", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator(".route-curtain")).toBeHidden();
  });
});

test.describe("scroll", () => {
  test("cards below the fold reveal as they arrive", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    const card = page
      .locator("#services-title")
      .locator("xpath=ancestor::section")
      .locator(".surface")
      .first();
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await expect(card).toHaveAttribute("data-revealed", "");
  });

  test("the reading progress bar fills with the page", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    const scale = () =>
      page.locator(".scroll-progress").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    expect(await scale()).toBeLessThan(0.02);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await expect.poll(scale).toBeGreaterThan(0.3);
  });

  test("the scroll rail is an 'On this page' nav on wide screens", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "The rail shows from 1280px");
    await page.goto("/");
    await settled(page);
    const rail = page.getByRole("navigation", { name: "On this page" });
    await expect(rail).toBeVisible();
    await expect(rail.getByRole("link")).toHaveCount(10);
    const missing = await rail
      .getByRole("link")
      .evaluateAll((links) =>
        links
          .map((a) => a.getAttribute("href")!.slice(1))
          .filter((id) => !document.querySelector(`section[aria-labelledby="${id}"]`)),
      );
    expect(missing).toEqual([]);
  });

  test("the marquee runs at a constant speed and eases to a stop on hover", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "hover is a pointer concern");
    await page.goto("/");
    await settled(page);
    const band = page.locator(".marquee-band");
    await band.scrollIntoViewIfNeeded();
    const x = () =>
      band
        .locator(".marquee-band-track")
        .first()
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e);
    const a = await x();
    await page.waitForTimeout(500);
    expect(await x()).toBeLessThan(a);
    await band.hover();
    await page.waitForTimeout(900);
    const b = await x();
    await page.waitForTimeout(400);
    expect(Math.abs((await x()) - b)).toBeLessThan(1);
  });
});

test.describe("pointer", () => {
  test.skip(({ isMobile }) => isMobile, "pointer-fine devices only");

  test("cards tilt, glow and draw their border under the pointer", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    const card = page.locator(".surface").first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveAttribute("data-revealed", "");
    await page.waitForTimeout(900);
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3, { steps: 4 });
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.25, { steps: 4 });
    await expect(card).toHaveAttribute("data-surface-active", "");
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).transform)).not.toBe("none");
    await expect
      .poll(() =>
        card
          .locator(".surface-border rect")
          .evaluate((el) => Number.parseFloat(getComputedStyle(el).strokeDashoffset)),
      )
      .toBeLessThan(0.05);
    await page.mouse.move(2, 2);
    await expect(card).not.toHaveAttribute("data-surface-active");
  });

  test("the custom cursor follows the mouse and labels links", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    const cta = page.getByRole("link", { name: "Start a Project" });
    const box = (await cta.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 });
    await expect(page.locator("html")).toHaveAttribute("data-custom-cursor", "");
    await expect(page.locator(".cursor-label")).toHaveText("View");
    // Text fields keep the real caret.
    await page.goto("/contact");
    await settled(page);
    const field = page.getByLabel("First name");
    const fb = (await field.boundingBox())!;
    await page.mouse.move(fb.x + 10, fb.y + fb.height / 2, { steps: 4 });
    expect(await field.evaluate((el) => getComputedStyle(el).cursor)).toBe("auto");
  });

  test("magnetic CTAs lean toward the pointer and spring home", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    const cta = page.getByRole("link", { name: "Start a Project" });
    const box = (await cta.boundingBox())!;
    const offset = () => cta.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e);
    await page.mouse.move(box.x + box.width + 40, box.y + box.height / 2, { steps: 6 });
    await expect.poll(offset).toBeGreaterThan(2);
    await page.mouse.move(box.x + box.width + 400, box.y + 400, { steps: 4 });
    await expect.poll(offset, { timeout: 3000 }).toBeLessThan(0.5);
  });
});

test.describe("reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("no boot screen, no curtain, no cursor; everything visible", async ({ page, isMobile }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-motion", "on");
    await expect(page.locator(".preloader")).toBeHidden();
    await expect(page.locator(".cursor")).toBeHidden();
    // Nothing is held back waiting for a reveal.
    await page.waitForTimeout(800);
    const hidden = await page
      .locator("[data-reveal]")
      .evaluateAll(
        (els) =>
          els.filter(
            (el) => getComputedStyle(el).opacity === "0" && el.getBoundingClientRect().top < innerHeight,
          ).length,
      );
    expect(hidden).toBe(0);
    if (!isMobile) {
      await page.locator("header").getByRole("link", { name: "About" }).click();
      await expect(page).toHaveURL(/\/about$/);
      await expect(page.locator(".route-curtain")).toBeHidden();
    }
  });
});
