import { expect, test } from "@playwright/test";

const PREVIEW = "/design-system/work-preview";

test.describe("/work (nothing published yet)", () => {
  test("shows the hero and the honest empty state, no filter bar", async ({ page }) => {
    const res = await page.goto("/work");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/^Work · Akrostech/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Proof, not promises.");
    await expect(page.getByRole("navigation", { name: "Filter by service" })).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/Tidemark|sample/i);
  });

  test("the reference-call link pre-fills the contact form", async ({ page }) => {
    await page.goto("/work");
    await page.getByRole("link", { name: "Ask us for a private reference call" }).click();
    await expect(page).toHaveURL(/\/contact\?topic=reference$/);
    await expect(page.locator("form[data-ready]")).toBeVisible();
    await expect(page.getByLabel(/What's eating your team's week/)).toHaveValue(
      /speak with a current client as a reference/,
    );
  });

  test("case study URLs 404 until one is published", async ({ request }) => {
    for (const slug of ["tidemark-health", "__no-published-case-studies__", "anything"]) {
      expect((await request.get(`/work/${slug}`)).status(), slug).toBe(404);
    }
  });
});

test.describe("work index (sample preview)", () => {
  test("features the newest study and filters by service through the URL", async ({ page }) => {
    await page.goto(PREVIEW);
    await expect(page.getByRole("list", { name: "3 case studies" })).toBeVisible();
    const tabs = page.getByRole("navigation", { name: "Filter by service" });
    await tabs.getByRole("link", { name: "Legal" }).click();
    await expect(page).toHaveURL(`${PREVIEW}?service=legal`);
    await expect(page.getByRole("list", { name: "1 case study" })).toBeVisible();
    await expect(tabs.getByRole("link", { name: "Legal" })).toHaveAttribute("aria-current", "page");

    await tabs.getByRole("link", { name: "Web Development" }).click();
    await page.getByRole("combobox", { name: "Industry" }).selectOption("Healthcare");
    await expect(page).toHaveURL(`${PREVIEW}?service=web-development&industry=Healthcare`);
    await expect(page.getByText("No published case studies for this filter yet.")).toBeVisible();
  });

  test("a shared filtered link opens filtered", async ({ page }) => {
    await page.goto(`${PREVIEW}?service=virtual-assistance`);
    await expect(page.getByRole("list", { name: "2 case studies" })).toBeVisible();
  });

  test("cards open the case study template", async ({ page }) => {
    await page.goto(PREVIEW);
    await page.getByRole("link", { name: /How Tidemark Health cut month-end close/ }).click();
    await expect(page).toHaveURL(`${PREVIEW}/tidemark-health`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Tidemark Health");
  });
});

test.describe("case study template (sample preview)", () => {
  test("renders every section, the snapshot and the closing slab", async ({ page }) => {
    await page.goto(`${PREVIEW}/tidemark-health`);
    for (const name of ["The situation", "What we did", "Results", "What's next", "Related case studies"]) {
      await expect(page.getByRole("heading", { level: 2, name, exact: true })).toHaveCount(1);
    }
    await expect(page.getByRole("heading", { name: "Want results like Tidemark Health's?" })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Snapshot" })).toContainText("NetSuite");
  });

  test("the body is on the Paper theme", async ({ page }) => {
    await page.goto(`${PREVIEW}/tidemark-health`);
    const bg = await page
      .locator(".theme-paper")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgb(10, 10, 10)");
  });

  test("desktop: scrollspy follows the reader and the progress bar fills", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "sidebar nav is desktop-only");
    await page.goto(`${PREVIEW}/tidemark-health`);
    const nav = page.getByRole("navigation", { name: "On this page" });
    await expect(nav.locator('[aria-current="location"]')).toHaveText("The situation");

    // Put the section's top inside the reading band (30–40% down the viewport).
    await page.evaluate(() => {
      const el = document.getElementById("whats-next")!;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35);
    });
    await expect(nav.locator('[aria-current="location"]')).toHaveText("What's next");

    const scale = await page
      .locator(".reading-progress")
      .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    expect(scale).toBeGreaterThan(0.3);
  });

  test("mobile: the snapshot is a collapsible box", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "mobile layout");
    await page.goto(`${PREVIEW}/tidemark-health`);
    const box = page.getByRole("complementary", { name: "Snapshot" }).locator("details");
    await expect(box).not.toHaveAttribute("open");
    await box.locator("summary").click();
    await expect(box).toHaveAttribute("open");
    await expect(box).toContainText("18 months, ongoing");
  });
});

test("sitemap lists /work", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/work</loc>");
  expect(xml).not.toContain("/work/");
});
