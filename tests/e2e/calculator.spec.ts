import { expect, test, type Page } from "@playwright/test";

const LIVE = "/resources/back-office-calculator";
const PREVIEW = "/design-system/calculator-preview";

async function ready(page: Page) {
  await expect(page.locator("#calculator[data-ready]")).toBeAttached();
}

const results = (page: Page) => page.getByRole("region", { name: /Results/ });

async function noOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("calculator (live, no rate card)", () => {
  test("renders, and claims no savings without an approved rate card", async ({ page }) => {
    const res = await page.goto(`${LIVE}?fn=finance&hours=40`);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/^Back-office cost calculator · Akrostech/);
    await ready(page);
    if (test.info().project.name === "mobile") {
      await page
        .getByRole("button", { name: /See results/ })
        .last()
        .click();
    }
    await expect(results(page)).toContainText("$174,000");
    await expect(results(page)).toContainText("1,920");
    await expect(results(page)).not.toContainText("Estimated Akrostech cost");
    await expect(results(page)).not.toContainText("Annual savings");
    await expect(results(page)).toContainText("written quote within 48 hours");
  });

  test("the homepage teaser hands its inputs over", async ({ page }) => {
    await page.goto("/");
    const teaser = page.getByRole("region", { name: /What is back-office work costing you/ });
    await teaser.getByText("Legal", { exact: true }).click();
    await teaser.getByRole("slider").focus();
    await page.keyboard.press("End");
    await teaser.getByRole("link", { name: "Get the full breakdown" }).click();
    await expect(page).toHaveURL(/\/resources\/back-office-calculator\?fn=legal&hours=200$/);
    await ready(page);
    if (test.info().project.name === "mobile") await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("checkbox", { name: /Legal ops/ })).toBeChecked();
    await expect(page.getByRole("slider")).toHaveValue("200");
  });

  test("inputs survive a reload, and Start over clears them", async ({ page }) => {
    await page.goto(LIVE);
    await ready(page);
    const mobile = test.info().project.name === "mobile";
    if (mobile) await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("checkbox", { name: /Admin/ }).check();
    await page.getByRole("button", { name: /Half a person/ }).click();

    await page.reload();
    await ready(page);
    if (mobile) await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("checkbox", { name: /Admin/ })).toBeChecked();
    await expect(page.getByRole("slider")).toHaveValue("20");
    if (!mobile) {
      await expect(
        page.getByRole("banner").getByRole("link", { name: "Pick up where you left off" }),
      ).toBeVisible();
    }

    if (mobile)
      await page
        .getByRole("button", { name: /See results/ })
        .last()
        .click();
    await results(page).getByRole("button", { name: "Start over" }).click();
    await page.reload();
    await ready(page);
    if (mobile) await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("checkbox", { name: /Admin/ })).not.toBeChecked();
  });

  test("the slider follows the keyboard (arrows ±1, PageUp ±10)", async ({ page }) => {
    await page.goto(`${LIVE}?fn=web&hours=40`);
    await ready(page);
    if (test.info().project.name === "mobile") await page.getByRole("button", { name: "Next" }).click();
    const slider = page.getByRole("slider");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveValue("41");
    await page.keyboard.press("PageUp");
    await expect(slider).toHaveValue("51");
    await expect(slider).toHaveAttribute("aria-valuetext", "51 hours a week");
  });

  test("shows its working", async ({ page }) => {
    await page.goto(`${LIVE}?fn=finance&hours=40`);
    await ready(page);
    if (test.info().project.name === "mobile") {
      await page
        .getByRole("button", { name: /See results/ })
        .last()
        .click();
    }
    await results(page).getByText("How we calculate this").click();
    await expect(results(page)).toContainText("Finance & payroll: 40h × 48 × $91/h = $174,000");
    await expect(results(page)).toContainText("we quote it in writing");
  });
});

test.describe("calculator (sample rate card preview)", () => {
  test("shows ranges for our cost and the savings, and break-even", async ({ page }) => {
    await page.goto(`${PREVIEW}?fn=finance&hours=40`);
    await ready(page);
    if (test.info().project.name === "mobile") {
      await page
        .getByRole("button", { name: /See results/ })
        .last()
        .click();
    }
    await expect(results(page)).toContainText("$61K – $92K/yr");
    await expect(results(page)).toContainText("$82K – $113K");
    await expect(results(page)).toContainText("Month 1");
  });
});

test.describe("mobile flow", () => {
  test.skip(({ isMobile }) => !isMobile, "phone layout");

  test("one step per screen with a pinned summary, and no sideways scroll", async ({ page }) => {
    await page.goto(`${PREVIEW}?fn=finance&hours=40`);
    await ready(page);
    await expect(page.getByRole("group", { name: /Your team/ })).toBeVisible();
    await expect(page.getByRole("group", { name: /The work/ })).toBeHidden();
    const summary = page.getByRole("button", { name: /Today's cost of this work.*See results/ });
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("$174,000/yr");
    await noOverflow(page);

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("group", { name: /The work/ })).toBeVisible();
    await noOverflow(page);

    await summary.click();
    await expect(results(page)).toBeVisible();
    await expect(summary).toBeHidden();
    await noOverflow(page);
    // The calculator pins its own bar, so the site-wide CTA bar stays away.
    await expect(page.getByRole("link", { name: "Estimate savings" })).toHaveCount(0);
  });
});

test.describe("PDF report", () => {
  test("downloads after name + email, and says no copy was emailed when email isn't set up", async ({
    page,
  }) => {
    await page.goto(`${LIVE}?fn=finance&hours=40`);
    await ready(page);
    if (test.info().project.name === "mobile") {
      await page
        .getByRole("button", { name: /See results/ })
        .last()
        .click();
    }
    await results(page)
      .getByRole("button", { name: /Email me the PDF/ })
      .click();
    const form = page.getByRole("form", { name: "Get the PDF report" });
    await form.getByRole("textbox", { name: /^Name/ }).fill("Dana Whitfield");
    await form.getByRole("textbox", { name: /Work email/ }).fill("dana@tidemark.example");
    await form.getByRole("textbox", { name: /Company/ }).fill("Tidemark Health");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      form.getByRole("button", { name: "Get the PDF" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("akrostech-back-office-cost-report.pdf");
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const pdf = Buffer.concat(chunks);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(2000);
    await expect(form.getByRole("status")).toHaveText("Downloaded. Check your downloads folder.");
  });

  test("the endpoint refuses cross-site, non-JSON and oversized requests", async ({ request, baseURL }) => {
    const url = "/api/calculator/report";
    const body = { name: "D", email: "d@x.test", input: {} };
    expect((await request.post(url, { data: body })).status()).toBe(403);
    expect(
      (await request.post(url, { data: body, headers: { Origin: "https://evil.example" } })).status(),
    ).toBe(403);
    const origin = new URL(baseURL!).origin;
    expect(
      (
        await request.post(url, { data: "name=D", headers: { Origin: origin, "Content-Type": "text/plain" } })
      ).status(),
    ).toBe(415);
    expect(
      (
        await request.post(url, { data: { ...body, pad: "x".repeat(20_000) }, headers: { Origin: origin } })
      ).status(),
    ).toBe(413);
    const invalid = await request.post(url, {
      data: { ...body, email: "nope" },
      headers: { Origin: origin },
    });
    expect(invalid.status()).toBe(422);
    expect(await invalid.json()).toEqual({ errors: { email: "That doesn't look like an email address." } });
  });
});

test("sitemap lists the calculator", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain(`${LIVE}</loc>`);
});
