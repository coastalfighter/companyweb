import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/** Wait until the interactive (prefilled, draft-aware) form has replaced the static one. */
async function ready(page: Page) {
  await page.locator("form[data-ready]").waitFor();
}

async function fill(page: Page) {
  await ready(page);
  const form = page.locator("form");
  await form.getByLabel(/First name/).fill("Dana");
  await form.getByLabel(/Last name/).fill("Whitfield");
  await form.getByLabel(/Work email/).fill("dana@tidemark.example");
  await form.getByLabel(/^Company(?! size)/).fill("Tidemark Health");
  await form.getByLabel(/Company size/).selectOption("200–499");
  await form.getByText("Accounting", { exact: true }).click();
}

test.describe("/contact", () => {
  test("renders the form and the reassurance column", async ({ page }) => {
    await page.goto("/contact");
    await ready(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Tell us what's eating your team's week.",
    );
    await expect(page.getByRole("heading", { name: "What happens next" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Send/ })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/contact$/);
  });

  test("puts the form before the reassurance copy on phones", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile layout");
    await page.goto("/contact");
    await ready(page);
    const formFirst = await page.evaluate(() => {
      const form = document.querySelector("form")!.getBoundingClientRect().top;
      const next = [...document.querySelectorAll("h2")].find((h) => h.textContent === "What happens next")!;
      return form < next.getBoundingClientRect().top;
    });
    expect(formFirst).toBe(true);
  });

  test("blocks an empty submit with a focused, linked error summary", async ({ page }) => {
    await page.goto("/contact");
    await ready(page);
    await page.getByRole("button", { name: /Send/ }).click();
    // Scoped to the form: Next.js also renders a role="alert" route announcer.
    const summary = page.locator("form").getByRole("alert");
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("things to fix");
    await summary.getByRole("link", { name: /Company size/ }).click();
    await expect(page.getByLabel(/Company size/)).toBeFocused();
    expect(
      await new AxeBuilder({ page })
        .withTags(WCAG)
        .analyze()
        .then((r) => r.violations.map((v) => v.id)),
    ).toEqual([]);
  });

  test("prefills from service, bundle and topic links", async ({ page }) => {
    await page.goto("/contact?service=accounting");
    await ready(page);
    await expect(page.getByRole("checkbox", { name: "Accounting" })).toBeChecked();

    await page.goto("/contact?bundle=launch-crew");
    await ready(page);
    await expect(page.getByRole("checkbox", { name: "Web Development" })).toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Virtual Assistance" })).toBeChecked();

    await page.goto("/contact?topic=security");
    await ready(page);
    await expect(page.getByRole("checkbox", { name: "Send me a mutual NDA before our call" })).toBeChecked();
    await expect(page.getByRole("textbox", { name: /eating your team's week/ })).toHaveValue(
      /security documentation/,
    );
  });

  test("service page CTAs land on a prefilled form", async ({ page }) => {
    await page.goto("/services/legal");
    await page.getByRole("link", { name: "Book a legal ops scoping call" }).first().click();
    await expect(page).toHaveURL(/\/contact\?service=legal$/);
    await ready(page);
    await expect(page.getByRole("checkbox", { name: "Legal Assistance" })).toBeChecked();
  });

  test("keeps an unsent draft across a reload", async ({ page }) => {
    await page.goto("/contact");
    await ready(page);
    await page.getByLabel(/First name/).fill("Priya");
    await page.getByLabel(/^Company(?! size)/).fill("Larkspur Freight");
    await page.reload();
    await ready(page);
    await expect(page.getByLabel(/First name/)).toHaveValue("Priya");
    await expect(page.getByLabel(/^Company(?! size)/)).toHaveValue("Larkspur Freight");
  });

  test("submits end to end and lands on a personal thank-you page", async ({ page }) => {
    await page.goto("/?utm_source=linkedin&utm_campaign=q4");
    await page.goto("/contact");
    await ready(page);
    await fill(page);
    await page.getByRole("checkbox", { name: "Send me a mutual NDA before our call" }).check();
    await page.getByRole("button", { name: /Send/ }).click();

    await expect(page).toHaveURL(/\/contact\/thank-you$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Got it, Dana. A real person is reading this now.",
    );
    await expect(page.locator("main")).toContainText(
      /You'll hear from us by \d{1,2}:\d{2} [AP]M ET (today|tomorrow|\w+day)/,
    );
    await expect(page.getByRole("link", { name: /accounting assistance works with us/i })).toHaveAttribute(
      "href",
      "/services/accounting",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect(
      await new AxeBuilder({ page })
        .withTags(WCAG)
        .analyze()
        .then((r) => r.violations.map((v) => v.id)),
    ).toEqual([]);

    // The draft is cleared after a successful send.
    await page.goto("/contact");
    await ready(page);
    await expect(page.getByLabel(/First name/)).toHaveValue("");
  });

  test("has no accessibility violations", async ({ page }) => {
    await page.goto("/contact");
    await ready(page);
    await page.waitForTimeout(800);
    expect(
      await new AxeBuilder({ page })
        .withTags(WCAG)
        .analyze()
        .then((r) => r.violations.map((v) => v.id)),
    ).toEqual([]);
  });

  test("does not show the mobile CTA bar", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/contact");
    await ready(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator("[data-visible]").filter({ hasText: "Estimate savings" })).toHaveCount(0);
  });

  test("allows Turnstile in the CSP", async ({ request }) => {
    const csp = (await request.get("/contact")).headers()["content-security-policy"];
    expect(csp).toContain("frame-src https://challenges.cloudflare.com");
    expect(csp).toMatch(/script-src [^;]*https:\/\/challenges\.cloudflare\.com/);
  });

  test("a direct visit to the thank-you page still reads well", async ({ page }) => {
    await page.goto("/contact/thank-you");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Got it. A real person is reading this now.",
    );
  });
});
