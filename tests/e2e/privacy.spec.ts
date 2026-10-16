import { expect, test } from "@playwright/test";

test.skip(({ isMobile }) => isMobile, "browser storage doesn't depend on the viewport");

test("the site sets no cookies, even while using the forms and calculator", async ({ page, context }) => {
  const thirdParty: string[] = [];
  page.on("request", (req) => {
    const host = new URL(req.url()).host;
    if (!/^localhost(:\d+)?$/.test(host)) thirdParty.push(host);
  });

  for (const path of ["/", "/services/accounting", "/work", "/careers", "/about/security"])
    await page.goto(path);

  await page.goto("/resources/back-office-calculator?fn=finance&hours=40");
  await expect(page.locator("#calculator[data-ready]")).toBeAttached();
  await page.getByRole("checkbox", { name: /Hiring/ }).check();

  await page.goto("/contact");
  await expect(page.locator("form[data-ready]")).toBeVisible();
  await page.getByLabel(/First name/).fill("Dana");

  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).toBe("");
  // Without analytics configured, nothing is asked and nothing leaves the site.
  await expect(page.getByRole("region", { name: "Analytics choice" })).toHaveCount(0);
  expect(thirdParty).toEqual([]);
});

test("what the site stores in the browser matches the cookies page", async ({ page }) => {
  await page.goto("/legal/cookies");
  const listed = await page
    .getByRole("table", { name: "Browser storage used by this website" })
    .locator("tbody tr td:first-child")
    .allTextContents();

  await page.goto("/?utm_source=test");
  await page.goto("/resources/back-office-calculator?fn=finance&hours=40");
  await expect(page.locator("#calculator[data-ready]")).toBeAttached();
  await page.getByRole("checkbox", { name: /Hiring/ }).check();
  await page.goto("/contact");
  await expect(page.locator("form[data-ready]")).toBeVisible();
  await page.getByLabel(/First name/).fill("Dana");

  const used = await page.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)]);
  for (const key of used) expect(listed, `${key} is stored but not disclosed`).toContain(key);
});
