import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const SERVICES = [
  { slug: "web-development", name: "Web Development", h1: "Websites built like products, not brochures." },
  {
    slug: "recruitment",
    name: "Recruitment Assistance",
    h1: "Hire faster without hiring a recruiting team.",
  },
  {
    slug: "virtual-assistance",
    name: "Virtual Assistance",
    h1: "A trained operator who clears the queue every day.",
  },
  { slug: "accounting", name: "Accounting Assistance", h1: "Books closed by business day 5. Every month." },
  { slug: "legal", name: "Legal Assistance", h1: "Your lawyers, minus the paperwork." },
] as const;

async function readThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

async function jsonLd(page: Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((b) => JSON.parse(b) as { "@type": string } & Record<string, unknown>);
}

for (const service of SERVICES) {
  test.describe(`/services/${service.slug}`, () => {
    test("renders the template, metadata and structured data", async ({ page }) => {
      const res = await page.goto(`/services/${service.slug}`);
      expect(res?.status()).toBe(200);
      await expect(page).toHaveTitle(new RegExp(`^${service.name} · Akrostech`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(service.h1);

      const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(crumbs.getByRole("link", { name: "Services" })).toHaveAttribute("href", "/services");
      await expect(crumbs.locator('[aria-current="page"]')).toHaveText(service.name);

      for (const heading of [
        "What we handle.",
        "What we don't do",
        "Who you'll work with.",
        "Service-level commitments",
        "We already work in your stack.",
      ]) {
        await expect(page.getByRole("heading", { name: heading })).toHaveCount(1);
      }
      await expect(page.getByRole("link", { name: /scoping call/ }).first()).toHaveAttribute(
        "href",
        `/contact?service=${service.slug}`,
      );

      const types = (await jsonLd(page)).map((d) => d["@type"]);
      expect(types).toEqual(expect.arrayContaining(["Service", "BreadcrumbList", "FAQPage"]));
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`/services/${service.slug}$`),
      );
    });

    test("shows no unverified proof", async ({ page }) => {
      await page.goto(`/services/${service.slug}`);
      await expect(page.getByRole("region", { name: "Results in numbers" })).toHaveCount(0);
      await expect(page.locator("main blockquote")).toHaveCount(0);
    });

    test("has no accessibility violations", async ({ page }) => {
      await page.goto(`/services/${service.slug}`);
      await readThrough(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations.map((v) => `${v.id} (${v.nodes.length})`)).toEqual([]);
    });
  });
}

test("legal and accounting state their regulatory limits", async ({ page }) => {
  await page.goto("/services/legal");
  await expect(page.locator("main")).toContainText(
    "Akrostech is not a law firm and does not provide legal advice.",
  );
  await expect(page.getByRole("note").filter({ hasText: "not a law firm" })).toBeVisible();
  await page.goto("/services/accounting");
  await expect(page.getByRole("note").filter({ hasText: "not a licensed CPA firm" })).toBeVisible();
});

test("unknown service slugs 404", async ({ page }) => {
  const res = await page.goto("/services/crypto-consulting");
  expect(res?.status()).toBe(404);
});

test("service hero vignette plays on load", async ({ page }) => {
  await page.goto("/services/accounting");
  const vig = page.locator(".vig-autoplay .vig");
  await expect
    .poll(() => vig.evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--vig-p"))), {
      timeout: 4000,
    })
    .toBe(1);
});

test.describe("/services hub", () => {
  test("lists the five services, bundles and engagement models", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "The work that keeps a company running. Handled.",
    );
    const index = page.getByRole("region", { name: "All services" });
    for (const service of SERVICES) {
      await expect(index.getByRole("link", { name: service.name })).toHaveAttribute(
        "href",
        `/services/${service.slug}`,
      );
    }
    await expect(page.getByRole("link", { name: "Scope this bundle" })).toHaveCount(3);
    await expect(page.locator("#engagement-models").getByRole("heading", { level: 3 })).toHaveText([
      "Dedicated",
      "Pooled",
      "Project",
    ]);
  });

  test("index rows reveal their scope on hover (desktop) or always (touch)", async ({ page, isMobile }) => {
    await page.goto("/services");
    const row = page.locator(".svc-row", { hasText: "Accounting Assistance" });
    const detail = row.locator(".svc-row-detail li").first();
    if (isMobile) {
      await expect(detail).toBeVisible();
      return;
    }
    await page.mouse.move(5, 5);
    await expect
      .poll(() => row.locator(".svc-row-detail").evaluate((el) => el.getBoundingClientRect().height))
      .toBe(0);
    await row.hover();
    await expect
      .poll(() => row.locator(".svc-row-detail").evaluate((el) => el.getBoundingClientRect().height))
      .toBeGreaterThan(40);
  });

  test("'See pricing models' on a service page jumps to the hub section", async ({ page }) => {
    await page.goto("/services/recruitment");
    await page.getByRole("link", { name: "See pricing models" }).click();
    await expect(page).toHaveURL(/\/services#engagement-models$/);
    await expect(page.getByRole("heading", { name: "Three ways to work with us." })).toBeInViewport();
  });

  test("has no accessibility violations", async ({ page }) => {
    await page.goto("/services");
    await readThrough(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations.map((v) => `${v.id} (${v.nodes.length})`)).toEqual([]);
  });
});

test("mega-menu and footer service links now resolve", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop mega-menu");
  await page.goto("/");
  await page.getByRole("button", { name: "Services" }).click();
  await page
    .locator("header")
    .getByRole("link", { name: /Legal Assistance/ })
    .click();
  await expect(page).toHaveURL(/\/services\/legal$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your lawyers, minus the paperwork.");
  await expect(page.getByRole("button", { name: "Services" })).toHaveAttribute("aria-expanded", "false");
});

test("sitemap lists the service pages", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const service of SERVICES) expect(xml).toContain(`/services/${service.slug}</loc>`);
  expect(xml).toContain("/services</loc>");
});
