import { describe, expect, it } from "vitest";
import { liveRoutes } from "@/lib/site";
import { goneHtml, isSpamUrl, isUnknownSlug, legacyRedirects } from "./rules";

const spam = (url: string) => {
  const u = new URL(url, "https://akrosstech.com");
  return isSpamUrl(u.pathname, u.searchParams);
};

describe("isSpamUrl", () => {
  it.each([
    "/wp-admin/setup.php",
    "/wp-content/uploads/2019/x.jpg",
    "/xmlrpc.php",
    "/index.php?option=com",
    "/cheap-viagra-online",
    "/best-casino-bonus-2024",
    "/replica-watches.html",
    "/2019/05/hello-world",
    "/category/news/",
    "/tag/seo",
    "/feed",
    "/?p=123",
    "/?s=cialis",
    "/?page_id=7",
    "/%E3%83%96%E3%83%A9%E3%83%B3%E3%83%89", // Japanese injected page
    "/página",
    "/?q=buy-viagra",
  ])("flags %s", (url) => {
    expect(spam(url)).toBe(true);
  });

  it.each([
    ...liveRoutes,
    "/services/accounting",
    "/contact?service=legal&topic=security",
    "/resources/back-office-calculator?fn=finance&hours=40",
    "/work?service=accounting&industry=Healthcare",
    "/?utm_source=linkedin&utm_campaign=q4",
    // A real client name must never be mistaken for spam inside the site's own sections.
    "/work/acme-pharma",
    "/careers/casino-host-ops-1234abcd",
    "/legal/privacy",
    "/about/security",
  ])("allows %s", (url) => {
    expect(spam(url)).toBe(false);
  });

  it("treats malformed escapes as raw text rather than throwing", () => {
    expect(() => spam("/%E0%A4%A")).not.toThrow();
  });
});

describe("isUnknownSlug", () => {
  const known = { services: new Set(["accounting", "legal"]), work: new Set<string>() };

  it("flags slugs outside the known set, only for those sections", () => {
    expect(isUnknownSlug("/services/accounting", known)).toBe(false);
    expect(isUnknownSlug("/services/crypto", known)).toBe(true);
    expect(isUnknownSlug("/work/anything", known)).toBe(true);
    expect(isUnknownSlug("/careers/anything", known)).toBe(false);
    expect(isUnknownSlug("/services", known)).toBe(false);
    expect(isUnknownSlug("/services/accounting/extra", known)).toBe(false);
  });
});

describe("legacyRedirects", () => {
  it("only points at live or M4 pages, from lowercase paths that aren't routes themselves", () => {
    const targets = new Set<string>([
      ...liveRoutes,
      "/about/security",
      "/legal/privacy",
      "/legal/terms",
      "/legal/cookies",
    ]);
    for (const [from, to] of Object.entries(legacyRedirects)) {
      expect(from).toBe(from.toLowerCase());
      expect(from.endsWith("/")).toBe(false);
      expect((liveRoutes as readonly string[]).includes(from), from).toBe(false);
      expect(targets.has(to), `${from} → ${to}`).toBe(true);
    }
  });
});

describe("goneHtml", () => {
  it("is a noindex page with a way home", () => {
    const html = goneHtml("Akrostech");
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain('<a href="/">');
  });
});
