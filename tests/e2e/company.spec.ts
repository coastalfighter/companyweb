import { expect, test, type Page } from "@playwright/test";

async function jsonLd(page: Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((b) => JSON.parse(b) as { "@type": string } & Record<string, unknown>);
}

test.describe("/about", () => {
  test("renders the hero, rules, principles and structured data", async ({ page }) => {
    const res = await page.goto("/about");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/^About · Akrostech/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "We started Akrostech because outsourcing had a trust problem.",
    );
    await expect(page.getByRole("heading", { name: "Three rules we set on day one." })).toBeVisible();
    for (const title of [
      "Precision over polish.",
      "Calm is a service.",
      "Default to visible.",
      "Your tools, your data, your call.",
    ]) {
      await expect(page.getByRole("heading", { level: 3, name: title })).toHaveCount(1);
    }
    expect((await jsonLd(page)).map((d) => d["@type"])).toContain("AboutPage");
  });

  test("shows no unverified company facts", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /Leadership|accountable for your account/ })).toHaveCount(
      0,
    );
    await expect(page.getByRole("heading", { name: /Distributed by design/ })).toHaveCount(0);
    await expect(page.getByLabel("Akrostech in numbers")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/sample/i);
  });

  test("teasers lead to the security request and careers", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("link", { name: "Running a security review?" })).toHaveAttribute(
      "href",
      "/contact?topic=security",
    );
    await expect(page.getByRole("link", { name: /hiring operators/ })).toHaveAttribute("href", "/careers");
    await expect(
      page.getByRole("heading", { name: "Let's see if we're a fit. 20 minutes, no slides." }),
    ).toBeVisible();
  });

  test("the sample preview shows the gated sections with ticking clocks", async ({ page }) => {
    await page.goto("/design-system/about-preview");
    await expect(page.getByRole("note")).toContainText("Sample data");
    await expect(page.getByRole("heading", { name: /Distributed by design/ })).toBeVisible();
    const times = page.getByTestId("hub-time");
    await expect(times).toHaveCount(3);
    await expect(times.first()).toHaveText(/^\d{1,2}:\d{2} [AP]M$/);
    await expect(page.getByRole("heading", { name: "The 30-day fit guarantee." })).toBeVisible();
  });
});

test.describe("/how-it-works", () => {
  test("renders the hero, five phases and the onboarding FAQ", async ({ page }) => {
    const res = await page.goto("/how-it-works");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/^How it works · Akrostech/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "No mystery. Here's exactly what happens.",
    );
    await expect(page.getByRole("article")).toHaveCount(5);
    await expect(page.getByRole("link", { name: "Book your scoping call" })).toHaveAttribute(
      "href",
      "/contact",
    );
    const types = (await jsonLd(page)).map((d) => d["@type"]);
    expect(types).toContain("FAQPage");
  });

  test("does not publish the unsigned fit guarantee", async ({ page }) => {
    await page.goto("/how-it-works");
    await expect(page.getByRole("heading", { name: "5-day replacement." })).toHaveCount(1);
    await expect(page.getByText("30-day fit guarantee")).toHaveCount(0);
  });

  test("the rail jumps to a phase and the tracker follows the scroll", async ({ page }) => {
    await page.goto("/how-it-works");
    const tracker = page.getByRole("navigation", { name: "Phases" });
    await expect(tracker.locator('[aria-current="step"]:visible')).toHaveAttribute(
      "href",
      "#phase-scoping-call",
    );

    await page.getByRole("navigation", { name: "The five phases" }).getByRole("link").nth(3).click();
    await expect(page).toHaveURL(/#phase-onboarding$/);
    await expect(tracker.locator('[aria-current="step"]:visible')).toHaveAttribute(
      "href",
      "#phase-onboarding",
    );

    const progress = tracker.getByTestId("phase-progress").locator("visible=true");
    const scale = await progress.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    expect(scale).toBeGreaterThan(0.5);
    expect(scale).toBeLessThan(1);
  });

  test("the tracker stays pinned while reading", async ({ page }) => {
    await page.goto("/how-it-works#phase-team-match");
    const tracker = page.locator(".phase-stepper");
    // The deep link is re-applied once fonts settle; wait for that end state.
    await expect
      .poll(async () => (await tracker.boundingBox())?.y ?? -1, { timeout: 3000 })
      .toBeGreaterThanOrEqual(0);
    await expect
      .poll(async () => (await tracker.boundingBox())?.y ?? 999, { timeout: 3000 })
      .toBeLessThan(160);
    await expect(page.locator("#phase-team-match")).toBeInViewport();
  });

  test("artifact previews open labelled as examples and close with Escape", async ({ page }) => {
    await page.goto("/how-it-works");
    const trigger = page.getByRole("button", { name: "Preview the Proposal" });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Proposal (example)" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("illustrative");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test("the homepage process link and the nav reach both pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "See the full process" }).click();
  await expect(page).toHaveURL(/\/how-it-works$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "No mystery. Here's exactly what happens.",
  );
});

test("sitemap lists About and How it works", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/about</loc>");
  expect(xml).toContain("/how-it-works</loc>");
});
