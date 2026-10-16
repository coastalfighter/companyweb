import { describe, expect, it, vi } from "vitest";
import { memoryRateLimiter } from "@/lib/contact/rate-limit";
import { handleSubscription, readNewsletterConfig } from "./newsletter";

const env = (vars: Record<string, string> = {}) => vars as unknown as NodeJS.ProcessEnv;
const config = { token: "t", portalId: "123", formId: "f-1" };

describe("readNewsletterConfig", () => {
  it("exists only when its HubSpot form is configured", () => {
    expect(readNewsletterConfig(env())).toBeNull();
    expect(readNewsletterConfig(env({ HUBSPOT_PRIVATE_APP_TOKEN: "t", HUBSPOT_PORTAL_ID: "1" }))).toBeNull();
    expect(
      readNewsletterConfig(
        env({ HUBSPOT_PRIVATE_APP_TOKEN: "t", HUBSPOT_PORTAL_ID: "1", HUBSPOT_NEWSLETTER_FORM_ID: " f " }),
      ),
    ).toEqual({ token: "t", portalId: "1", formId: "f" });
  });
});

describe("handleSubscription", () => {
  const ok = () => vi.fn(async () => new Response("{}", { status: 200 }));

  it("sends the email to the HubSpot form with the page it came from", async () => {
    const fetchImpl = ok();
    const outcome = await handleSubscription(
      { email: " ana@company.com ", page: "/services" },
      { config, fetchImpl, ip: "1.2.3.4", rateLimiter: memoryRateLimiter(5, 1000) },
    );
    expect(outcome).toEqual({ status: "ok" });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.hsforms.com/submissions/v3/integration/secure/submit/123/f-1");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer t");
    const body = JSON.parse(String(init.body)) as {
      fields: { name: string; value: string }[];
      context: { pageUri: string; ipAddress: string };
    };
    expect(body.fields).toEqual([{ objectTypeId: "0-1", name: "email", value: "ana@company.com" }]);
    expect(body.context).toMatchObject({ pageUri: "/services", ipAddress: "1.2.3.4" });
  });

  it("rejects bad emails with a message that names the fix", async () => {
    const outcome = await handleSubscription({ email: "nope" }, { config, fetchImpl: ok() });
    expect(outcome).toEqual({ status: "invalid", message: "Enter a valid email address." });
  });

  it("tells bots it worked without sending anything", async () => {
    const fetchImpl = ok();
    expect(await handleSubscription({ email: "a@b.co", website: "spam.biz" }, { config, fetchImpl })).toEqual(
      {
        status: "ok",
      },
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("is unavailable when not configured, and rate limited per IP", async () => {
    expect(await handleSubscription({ email: "a@b.co" }, { config: null })).toMatchObject({
      httpStatus: 404,
    });
    const limiter = memoryRateLimiter(1, 60_000);
    await handleSubscription({ email: "a@b.co" }, { config, fetchImpl: ok(), ip: "9", rateLimiter: limiter });
    expect(
      await handleSubscription(
        { email: "a@b.co" },
        { config, fetchImpl: ok(), ip: "9", rateLimiter: limiter },
      ),
    ).toMatchObject({ status: "error", httpStatus: 429 });
  });

  it("reports an upstream failure without leaking it", async () => {
    const fetchImpl = vi.fn(async () => new Response("boom", { status: 500 }));
    expect(
      await handleSubscription(
        { email: "a@b.co" },
        { config, fetchImpl, rateLimiter: memoryRateLimiter(5, 1000) },
      ),
    ).toEqual({
      status: "error",
      httpStatus: 502,
      message: "That didn't go through. Try again in a minute.",
    });
  });
});
