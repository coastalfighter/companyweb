import { expect, test } from "@playwright/test";

for (const [path, h1, them] of [
  ["/compare/in-house-vs-akrostech", "Should you hire for it, or hand it over?", "In-house hire"],
  ["/compare/freelancers-vs-akrostech", "Freelancer or a managed team?", "Freelancers"],
] as const) {
  test(`${path} compares honestly and links to the calculator`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    const table = page.getByRole("table", { name: `${them} compared with Akrostech` });
    await expect(table.getByRole("columnheader", { name: them })).toBeVisible();
    await expect(table.getByRole("row")).toHaveCount(8);
    await expect(page.getByRole("heading", { name: /when…$/ })).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Run the numbers for your team" })).toHaveAttribute(
      "href",
      "/resources/back-office-calculator",
    );
  });
}

test("the compare index links both comparisons and shows the full table", async ({ page }) => {
  await page.goto("/compare");
  await page.getByRole("link", { name: /Freelancers vs Akrostech/ }).click();
  await expect(page).toHaveURL(/\/compare\/freelancers-vs-akrostech$/);
});

test("pricing shows the three engagement models without list prices", async ({ page }) => {
  const res = await page.goto("/pricing");
  expect(res?.status()).toBe(200);
  for (const model of ["Dedicated", "Pooled", "Project"]) {
    await expect(page.getByRole("heading", { level: 3, name: model })).toBeVisible();
  }
  await expect(page.locator("main")).not.toContainText(/\$\d/);
});

test("unknown comparisons 404 and old pricing URLs redirect", async ({ request }) => {
  expect((await request.get("/compare/agency-vs-akrostech")).status()).toBe(404);
  const res = await request.get("/prices", { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(new URL(res.headers()["location"]!, "http://x").pathname).toBe("/pricing");
});
