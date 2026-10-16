import { expect, test, type Page } from "@playwright/test";

const PREVIEW = "/design-system/careers-preview";

async function jsonLd(page: Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((b) => JSON.parse(b) as { "@type": string } & Record<string, unknown>);
}

test.describe("/careers (no ATS configured)", () => {
  test("renders the hero, culture, hiring steps and the talent-pool empty state", async ({ page }) => {
    const res = await page.goto("/careers");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/^Careers · Akrostech/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Do the work that makes great companies run.",
    );
    await expect(page.getByRole("heading", { name: "How we hire" })).toBeVisible();
    await expect(page.getByText(/No open roles right now/)).toBeVisible();
    const pool = page.getByRole("link", { name: "Join the talent pool" });
    await expect(pool).toHaveCount(2);
    await expect(pool.first()).toHaveAttribute("href", /^mailto:.+subject=Talent%20pool$/);
  });

  test("shows no unconfirmed benefits, figures or quotes", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.getByRole("heading", { name: "The basics, done properly." })).toHaveCount(0);
    await expect(page.getByLabel("From the team")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/\$\d|Philippines|Colombia|Poland|sample/i);
  });

  test("'See open roles' jumps to the list", async ({ page }) => {
    await page.goto("/careers");
    await page.getByRole("link", { name: "See open roles" }).click();
    await expect(page).toHaveURL(/#open-roles$/);
    await expect(page.getByRole("heading", { name: "Where we need you." })).toBeInViewport();
  });

  test("the slab is reserved for buyers", async ({ page }) => {
    await page.goto("/careers");
    await expect(page.locator(".volt-slab")).toHaveCount(0);
  });

  test("role URLs 404 while nothing is open", async ({ request }) => {
    for (const slug of ["__no-open-roles__", "senior-bookkeeper-sample1"]) {
      expect((await request.get(`/careers/${slug}`)).status(), slug).toBe(404);
    }
  });
});

test.describe("open roles (sample preview)", () => {
  test("lists roles and filters by team", async ({ page }) => {
    await page.goto(PREVIEW);
    await expect(page.getByRole("list", { name: "4 open roles" })).toBeVisible();
    const filters = page.getByRole("group", { name: "Filter by team" });
    await filters.getByRole("button", { name: "Engineering" }).click();
    await expect(page.getByRole("list", { name: "1 open role" })).toContainText("Full-Stack Engineer");
    await expect(filters.getByRole("button", { name: "Engineering" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("a role opens its detail page with an apply link", async ({ page }) => {
    await page.goto(PREVIEW);
    await page.getByRole("link", { name: "Senior Bookkeeper" }).click();
    await expect(page).toHaveURL(`${PREVIEW}/senior-bookkeeper-sample1`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Senior Bookkeeper");
    await expect(page.getByText("$1.8K – $2.4K per month")).toBeVisible();
    await expect(page.getByRole("link", { name: /Apply for this role/ }).first()).toHaveAttribute(
      "href",
      "https://jobs.example.com/akrostech/senior-bookkeeper",
    );
    expect((await jsonLd(page)).map((d) => d["@type"])).toEqual(expect.arrayContaining(["BreadcrumbList"]));
  });
});

test("sitemap lists /careers", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/careers</loc>");
});
