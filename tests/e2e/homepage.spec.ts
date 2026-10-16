import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Scroll the whole page so every reveal fires (as a reader would). */
async function readThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

test.describe("homepage sections", () => {
  test("renders every section in blueprint order", async ({ page }) => {
    await page.goto("/");
    const headings = await page.locator("main h2:visible").allTextContents();
    expect(headings).toEqual([
      "Your best people are doing their worst work.",
      "Five teams. One contract. Zero babysitting.",
      "From first call to first delivery in 10 business days.",
      "You'll never have to ask “what's the status?”",
      "You have options. Here's how we stack up.",
      "Your data is safer with us than in most inboxes.",
      "What is back-office work costing you right now?",
      "Questions buyers ask us on the first call.",
      "Give us the work nobody wants. Keep the hours.",
    ]);
  });

  test("shows no unverified proof: no logos, stats, testimonials or certifications", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Clients" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Results in numbers" })).toHaveCount(0);
    await expect(page.locator("main blockquote")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText("SOC 2");
    await expect(page.locator("main")).not.toContainText("27001");
  });

  test("content is visible without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Five teams. One contract. Zero babysitting." }),
    ).toBeVisible();
    await page
      .getByRole("heading", { name: "Questions buyers ask us on the first call." })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("heading", { name: "Questions buyers ask us on the first call." }),
    ).toBeVisible();
    await context.close();
  });

  test("sections reveal as they scroll into view", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("[data-reveal]", { hasText: "Five teams. One contract." });
    await expect(header).not.toHaveAttribute("data-revealed", "");
    await header.scrollIntoViewIfNeeded();
    await expect(header).toHaveAttribute("data-revealed", "");
    await expect(header).toHaveCSS("opacity", "1");
  });

  test("service cards link to their pages and their vignettes play", async ({ page, isMobile }) => {
    await page.goto("/");
    const card = page.locator("article.vig-card", { hasText: "Accounting Assistance" });
    await expect(card.getByRole("link", { name: "Accounting Assistance" })).toHaveAttribute(
      "href",
      "/services/accounting",
    );
    await card.scrollIntoViewIfNeeded();
    if (!isMobile) await card.hover();
    const vig = card.locator(".vig");
    await expect
      .poll(() => vig.evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--vig-p"))), {
        timeout: 4000,
      })
      .toBe(1);
    await expect(card.locator(".vig-close")).toBeVisible();
  });

  test("FAQ opens one answer at a time", async ({ page }) => {
    await page.goto("/");
    const items = page.locator("details[name=faq]");
    await expect(items.nth(0)).toHaveAttribute("open", "");
    await items.nth(2).locator("summary").click();
    await expect(items.nth(2)).toHaveAttribute("open", "");
    await expect(items.nth(0)).not.toHaveAttribute("open", "");
  });

  test("publishes FAQPage structured data", async ({ page }) => {
    await page.goto("/");
    const json = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(json!);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity.length).toBe(await page.locator("details[name=faq]").count());
  });

  test("calculator teaser updates live and shows its math", async ({ page }) => {
    await page.goto("/");
    const teaser = page.locator("section", {
      has: page.getByRole("heading", { name: /back-office work costing/ }),
    });
    await teaser.scrollIntoViewIfNeeded();
    await teaser.getByText("Admin", { exact: true }).click();
    await teaser.getByLabel("Hours per week spent on it").fill("40");
    // EA: 78,000 × 1.3 / 2080 × 40 × 48 = 93,600
    await expect(teaser).toContainText("$93,600");
    await teaser.getByText("How we calculate this").click();
    await expect(teaser).toContainText("executive assistant on a $78,000 salary");
  });

  test("sample Friday report opens as a labelled modal and closes", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "See a sample Friday report" });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Sample Friday report · Week 41" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Sample · not real client data");
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    expect(
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
        .then((r) => r.violations.map((v) => v.id)),
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("comparison table is keyboard-scrollable on small screens", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    const region = page.getByRole("region", { name: "Comparison table, scrolls horizontally" });
    await region.scrollIntoViewIfNeeded();
    const scrollable = await region.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrollable).toBe(true);
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });

  test("has no horizontal overflow after reading through", async ({ page }) => {
    await page.goto("/");
    await readThrough(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("proof preview (sample data)", () => {
  test("shows the gated sections under a sample-data banner and is not indexable", async ({ page }) => {
    await page.goto("/design-system/home-preview");
    await expect(page.getByRole("note")).toContainText("Sample data for design review");
    await expect(page.getByRole("region", { name: "Clients" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Results in numbers" })).toBeVisible();
    await expect(page.locator("blockquote")).toHaveCount(3);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("marquee has a pause control", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover reveal of the control is a pointer concern");
    await page.goto("/design-system/home-preview");
    const region = page.getByRole("region", { name: "Clients" });
    await region.hover();
    const pause = page.getByRole("button", { name: "Pause logo animation" });
    await pause.click();
    await expect(page.getByRole("button", { name: "Play logo animation" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(region.locator(".marquee-track").first()).toHaveCSS("animation-play-state", "paused");
  });

  test("stats count up to their final values", async ({ page }) => {
    await page.goto("/design-system/home-preview");
    const stats = page.getByRole("region", { name: "Results in numbers" });
    await stats.scrollIntoViewIfNeeded();
    await expect(stats).toContainText("96", { timeout: 4000 });
    await expect(stats).toContainText("3h 41");
  });
});
