import { expect, test } from "@playwright/test";

// Status codes and headers don't depend on the viewport.
test.skip(({ isMobile }) => isMobile, "HTTP behaviour only");

test.describe("old-site cleanup", () => {
  for (const url of [
    "/wp-admin/",
    "/xmlrpc.php",
    "/cheap-viagra-online",
    "/2019/05/hello",
    "/?p=12",
    "/%E3%83%96",
  ]) {
    test(`410 Gone for ${url}`, async ({ request }) => {
      // A trailing slash first gets Next's standard 308 to the slash-less URL, then the 410.
      const res = await request.get(url, { maxRedirects: url.endsWith("/") ? 1 : 0 });
      expect(res.status()).toBe(410);
      expect(res.headers()["x-robots-tag"]).toBe("noindex");
      expect(await res.text()).toContain("This page is gone.");
    });
  }

  test("legacy URLs 301 to their new home", async ({ request }) => {
    for (const [from, to] of [
      ["/about-us", "/about"],
      ["/case-studies", "/work"],
      ["/contact-us", "/contact"],
    ] as const) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(301);
      expect(new URL(res.headers()["location"]!, "http://x").pathname).toBe(to);
    }
  });

  test("unknown service and case-study slugs get the real 404 page", async ({ page }) => {
    for (const url of ["/services/crypto-mining", "/work/no-such-client"]) {
      const res = await page.goto(url);
      expect(res?.status(), url).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "This page isn't part of the operation.",
      );
    }
  });

  test("real pages and query-driven links are untouched", async ({ request }) => {
    for (const url of [
      "/",
      "/services/legal",
      "/contact?topic=security",
      "/work?service=legal",
      "/?utm_source=x",
    ]) {
      expect((await request.get(url, { maxRedirects: 0 })).status(), url).toBe(200);
    }
  });
});

test("design-review pages are never indexed", async ({ request }) => {
  const res = await request.get("/design-system/home-preview");
  expect(res.headers()["x-robots-tag"]).toBe("noindex, nofollow");
});

test("security.txt follows RFC 9116", async ({ request }) => {
  const res = await request.get("/.well-known/security.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/plain");
  const body = await res.text();
  expect(body).toMatch(/^Contact: mailto:/m);
  const expires = new Date(/^Expires: (.+)$/m.exec(body)![1]!);
  const days = (expires.getTime() - Date.now()) / 86_400_000;
  expect(days).toBeGreaterThan(30);
  expect(days).toBeLessThan(366);
});

test("llms.txt summarises the site", async ({ request }) => {
  const res = await request.get("/llms.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toMatch(/^# Akrostech/);
  expect(body).toContain("/services/accounting");
  expect(body).toContain("not a law firm or a CPA firm");
});
