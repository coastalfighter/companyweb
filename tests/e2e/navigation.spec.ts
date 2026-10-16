import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function axeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`);
}

test.describe("desktop mega-menu", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("opens on hover after the intent delay and closes on leave", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Services" });
    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator(`#${await trigger.getAttribute("aria-controls")}`.replace(/:/g, "\\:"));
    await expect(panel.getByRole("link", { name: /Accounting Assistance/ })).toBeVisible();

    await page.mouse.move(700, 850);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();
  });

  test("works with the keyboard: Enter opens, Tab reaches links, Escape returns focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Services" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(page.locator("header").getByRole("link", { name: /Web Development/ })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("closes when focus leaves the panel", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Services" });
    await trigger.click();
    await page.getByRole("link", { name: "How it works", exact: true }).first().focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("keeps the header pinned while the panel is open", async ({ page }) => {
    await page.goto("/");
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(300);
    await page.mouse.wheel(0, -50);
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Services" }).click();
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(400);
    await expect(page.locator("header")).toHaveAttribute("data-hidden", "false");
  });

  test("has no accessibility violations while open", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Services" }).click();
    await page.waitForTimeout(400);
    expect(await axeViolations(page)).toEqual([]);
  });
});

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("opens as a modal sheet, traps focus and locks scroll", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close menu" })).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");

    // Tabbing many times never escapes the dialog.
    for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("dialog")))).toBe(true);
  });

  test("Escape closes it and returns focus to the menu button", async ({ page }) => {
    await page.goto("/");
    const open = page.getByRole("button", { name: "Open menu" });
    await open.click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
    await expect(open).toBeFocused();
    await expect(open).toHaveAttribute("aria-expanded", "false");
  });

  test("expands Services and closes on navigation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await dialog.getByText("Services", { exact: true }).click();
    await expect(dialog.getByRole("link", { name: "Accounting" })).toBeVisible();
    await dialog.getByRole("link", { name: "Careers" }).click();
    await expect(page).toHaveURL(/\/careers$/);
    await expect(dialog).toBeHidden();
  });

  test("has no accessibility violations while open", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(600);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("bottom CTA bar appears after the hero and never covers the page at the top", async ({ page }) => {
    // A long page: the homepage is still short enough that its closing CTA is always in view.
    await page.goto("/design-system");
    const bar = page
      .locator("[data-visible]")
      .filter({ has: page.getByRole("link", { name: "Book a call" }) });
    await expect(bar).toHaveAttribute("data-visible", "false");
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
    await expect(bar).toHaveAttribute("data-visible", "true");
    await expect(bar.getByRole("link", { name: "Book a call" })).toBeInViewport();

    // ...and steps aside at the closing CTA so only one primary CTA is in view.
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(bar).toHaveAttribute("data-visible", "false");
  });

  test("footer columns are accordions", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    const company = footer.locator("summary", { hasText: "Company" });
    await company.scrollIntoViewIfNeeded();
    await expect(footer.getByRole("link", { name: "Careers" })).toBeHidden();
    await company.click();
    await expect(footer.getByRole("link", { name: "Careers" })).toBeVisible();
  });
});

test.describe("footer", () => {
  test("has the five groups, legal links and the disclaimer", async ({ page, isMobile }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();
    for (const title of ["Services", "Company", "Proof", "Resources"]) {
      await expect(footer.getByText(title, { exact: true }).locator("visible=true")).toHaveCount(1);
    }
    for (const label of ["Privacy", "Terms", "Cookies", "DPA", "Accessibility"]) {
      await expect(
        footer.getByRole("navigation", { name: "Legal" }).getByRole("link", { name: label }),
      ).toBeVisible();
    }
    await expect(footer).toContainText("Akrostech is not a law firm or CPA firm.");
    await expect(footer).toContainText(String(new Date().getFullYear()));
    if (!isMobile) {
      await expect(footer.getByRole("link", { name: "Security & trust" })).toHaveAttribute(
        "href",
        "/about/security",
      );
    }
  });
});

test("closing CTA slab links to contact and email", async ({ page }) => {
  await page.goto("/");
  const slab = page.getByRole("region", { name: "Give us the work nobody wants. Keep the hours." });
  await slab.scrollIntoViewIfNeeded();
  await expect(slab.getByRole("link", { name: "Book a 20-minute call" })).toHaveAttribute("href", "/contact");
  await expect(slab.getByRole("link", { name: "Email us instead" })).toHaveAttribute(
    "href",
    "mailto:hello@akrosstech.com",
  );
});
