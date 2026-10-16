import { expect, test } from "@playwright/test";

const LEGAL = [
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/dpa",
  "/legal/accessibility",
] as const;

test("the trust center has practices, sub-processors and a disclosure policy", async ({ page }) => {
  const res = await page.goto("/about/security");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/^Security & trust · Akrostech/);
  for (const heading of [
    "How we protect your data",
    "Sub-processors for this website",
    "Reporting a vulnerability",
  ]) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
  // Nothing unconfirmed: no certifications table, insurance or incident timelines.
  await expect(page.getByRole("heading", { name: "Certifications" })).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText(
    /SOC 2 Type II audited|ISO\/IEC 27001 certified|insurance/i,
  );
  await expect(page.getByRole("link", { name: "request the security pack" })).toHaveAttribute(
    "href",
    "/contact?topic=security",
  );
});

test("security.txt's policy link lands on the disclosure section", async ({ page }) => {
  await page.goto("/about/security#disclosure");
  await expect(page.getByRole("heading", { name: "Reporting a vulnerability" })).toBeInViewport();
});

for (const path of LEGAL) {
  test(`${path} renders with a date and a working contents list`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByText(/^Last updated /)).toBeVisible();
    const contents = page.getByRole("navigation", { name: "Contents" });
    const first = contents.getByRole("link").first();
    const target = (await first.getAttribute("href"))!;
    await first.click();
    await expect(page.locator(target)).toBeInViewport();
  });
}

test("footer legal links and the homepage trust link all resolve", async ({ page, request }) => {
  await page.goto("/");
  const hrefs = await page
    .getByRole("contentinfo")
    // On phones the footer columns are closed accordions; their links still count.
    .getByRole("link", { includeHidden: true })
    .evaluateAll((links) =>
      links.map((a) => a.getAttribute("href")).filter((h): h is string => !!h?.startsWith("/")),
    );
  expect(hrefs).toEqual(expect.arrayContaining([...LEGAL, "/about/security"]));
  for (const href of new Set(hrefs)) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
});

test("old legal URLs redirect to the new pages", async ({ request }) => {
  const res = await request.get("/privacy-policy", { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(new URL(res.headers()["location"]!, "http://x").pathname).toBe("/legal/privacy");
});
