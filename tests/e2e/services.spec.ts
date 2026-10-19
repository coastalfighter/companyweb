import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const SERVICES = [
  {
    slug: "web-development",
    name: "Web Development",
    h1: "We Ship. Fast. Clean. Scalable.",
    visual: ".build-preview",
  },
  {
    slug: "recruitment",
    name: "Recruitment Assistance",
    h1: "The Right People. Faster.",
    visual: ".pipe-stage",
  },
  {
    slug: "virtual-assistance",
    name: "Virtual Assistance",
    h1: "Your To-Do List. Handled.",
    visual: ".swarm-stage",
  },
  {
    slug: "accounting",
    name: "Accounting Assistance",
    h1: "Numbers That Make Sense.",
    visual: ".ledger-card",
  },
  { slug: "legal", name: "Legal Assistance", h1: "Compliant. Protected. Moving.", visual: ".seal" },
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

/** GSAP loaded and any boot screen gone. */
async function settled(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");
  await expect(page.locator(".preloader")).toBeHidden({ timeout: 5000 });
}

test.describe("service heroes (docs/blueprint/11-motion-system.md §3b–3f)", () => {
  for (const service of SERVICES) {
    test(`${service.slug}: the headline sharpens and the visual arrives`, async ({ page }) => {
      await page.goto(`/services/${service.slug}`);
      await settled(page);
      const hero = page.locator('section[aria-labelledby="service-title"]');
      await expect(hero).toHaveAttribute("data-entered", "", { timeout: 4000 });
      await expect(hero.locator(service.visual)).toBeVisible();
      await expect
        .poll(() =>
          hero
            .locator(".hero-enter")
            .last()
            .evaluate((el) => getComputedStyle(el).opacity),
        )
        .toBe("1");
      // Nothing in the hero pushes the page sideways.
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(0);
    });
  }

  test("The Build types the code, then compiles it on scroll", async ({ page }) => {
    await page.goto("/services/web-development");
    await settled(page);
    const lastLine = page.locator(".code-line").last();
    await expect
      .poll(() => lastLine.evaluate((el) => getComputedStyle(el).clipPath), { timeout: 5000 })
      .toMatch(/inset\(0(%|px)?( 0(%|px)?){0,3}\)|none/);
    await expect(page.locator(".build-status")).toHaveCSS("opacity", "1");
    const offset = () =>
      page
        .locator(".wire-shape")
        .first()
        .evaluate((el) => Number.parseFloat(getComputedStyle(el).strokeDashoffset));
    expect(await offset()).toBeGreaterThan(0.9);
    await page.evaluate(() => window.scrollTo(0, innerHeight * 0.8));
    await expect.poll(offset).toBeLessThan(0.6);
  });

  test("The Pipeline sends candidates down the connectors", async ({ page }) => {
    await page.goto("/services/recruitment");
    await settled(page);
    const dot = page.locator(".pipe-particles circle").first();
    await expect(page.locator(".pipe-particles").first()).toHaveCSS("opacity", "1", { timeout: 4000 });
    const at = () => dot.getAttribute("transform");
    const a = await at();
    await page.waitForTimeout(300);
    expect(await at()).not.toBe(a);
  });

  test("The Swarm orbits, in three depth steps", async ({ page }) => {
    await page.goto("/services/virtual-assistance");
    await settled(page);
    const card = page.locator(".swarm-card").first();
    const transform = () => card.evaluate((el) => el.style.transform);
    await expect.poll(transform).not.toBe("");
    const a = await transform();
    await page.waitForTimeout(400);
    expect(await transform()).not.toBe(a);
    const depths = await page
      .locator(".swarm-card")
      .evaluateAll((els) => [...new Set(els.map((el) => el.dataset.depth))]);
    expect(depths.every((d) => ["0", "1", "2"].includes(d!))).toBe(true);
  });

  test("The Ledger counts up and ticks the close as you scroll away", async ({ page }) => {
    await page.goto("/services/accounting");
    await settled(page);
    await expect(page.locator(".ledger-figure").first()).toHaveText("128,400", { timeout: 5000 });
    await expect(page.locator(".ledger-step[data-done]")).toHaveCount(0);
    await page.evaluate(() => {
      const hero = document.querySelector('section[aria-labelledby="service-title"]')!;
      window.scrollTo(0, hero.getBoundingClientRect().height * 0.8);
    });
    await expect(page.locator(".ledger-step[data-done]")).toHaveCount(4);
  });

  test("The Seal stamps down once, in the serif voice", async ({ page }) => {
    await page.goto("/services/legal");
    await settled(page);
    const scale = () =>
      page.locator(".seal").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    // Landed: GSAP's scale and spin are back to 1 and 0 (the resting -8° tilt is CSS `rotate`).
    await expect.poll(scale, { timeout: 5000 }).toBeCloseTo(1, 3);
    await expect(page.locator(".seal")).toHaveCSS("opacity", "1");
    const family = await page
      .getByRole("heading", { level: 1 })
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family.toLowerCase()).toMatch(/fraunces|serif/);
    await expect(page.locator(".seal-page")).toHaveCSS("transform", "none");
  });

  test("reduced motion shows every visual finished and still", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/services/accounting");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("filter", "none");
    await expect(page.locator(".ledger-step[data-done]")).toHaveCount(4);
    await expect(page.locator(".ledger-figure").first()).toHaveText("128,400");
    await page.goto("/services/recruitment");
    await expect(page.locator(".pipe-particles").first()).toHaveCSS("opacity", "0");
    await expect(page.locator(".pipe-link").first()).toHaveCSS("stroke-dashoffset", "0px");
    await page.goto("/services/virtual-assistance");
    const card = page.locator(".swarm-card").first();
    const a = await card.evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(500);
    expect(await card.evaluate((el) => getComputedStyle(el).transform)).toBe(a);
  });
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

  test("a service hero's secondary CTA jumps to its section", async ({ page }) => {
    await page.goto("/services/recruitment");
    await page.getByRole("link", { name: "See our process" }).click();
    await expect(page).toHaveURL(/\/services\/recruitment#timeline-title$/);
    await expect(page.locator("#timeline-title")).toBeInViewport();
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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compliant. Protected. Moving.");
  await expect(page.getByRole("button", { name: "Services" })).toHaveAttribute("aria-expanded", "false");
});

test("sitemap lists the service pages", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const service of SERVICES) expect(xml).toContain(`/services/${service.slug}</loc>`);
  expect(xml).toContain("/services</loc>");
});
