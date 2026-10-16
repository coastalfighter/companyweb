import { describe, expect, it, vi } from "vitest";
import { readContactConfig, type ContactConfig } from "./config";
import { deliverLead } from "./deliver";
import { hubspotPayload } from "./integrations/hubspot";
import { confirmationText } from "./integrations/resend";
import { slackEscape, slackPayload } from "./integrations/slack";
import { verifyTurnstile } from "./integrations/turnstile";
import { headerSafe, leadSummary, type Lead } from "./lead";
import { memoryRateLimiter, upstashRateLimiter } from "./rate-limit";
import { addBusinessHours, formatReplyBy } from "./reply-by";

const lead: Lead = {
  firstName: "Dana",
  lastName: "Whitfield",
  email: "dana@tidemark.example",
  company: "Tidemark <script>",
  companySize: "200–499",
  services: ["accounting", "legal"],
  details: "Close takes 12 days.\n<!channel> please",
  timeline: "this-quarter",
  nda: true,
  phone: "(415) 555-0134",
  attribution: {
    utmSource: "linkedin",
    utmCampaign: "q4",
    landingPage: "/services/accounting",
    hubspotUtk: "abc",
  },
  submittedAt: new Date("2026-10-14T15:00:00Z"),
  ip: "203.0.113.7",
};

const ok = () => new Response("{}", { status: 200 });
const fail = (status = 500) => new Response("nope", { status });

function config(overrides: Partial<ContactConfig> = {}): ContactConfig {
  return { production: true, logOnly: false, ...overrides };
}

describe("payloads", () => {
  it("maps the lead onto HubSpot form fields with context", () => {
    const payload = hubspotPayload(lead);
    const field = (name: string) => payload.fields.find((f) => f.name === name)?.value;
    expect(field("email")).toBe("dana@tidemark.example");
    expect(field("akros_services")).toBe("Accounting;Legal Assistance");
    expect(field("akros_timeline")).toBe("This quarter");
    expect(field("akros_nda_requested")).toBe("true");
    expect(field("phone")).toBe("+14155550134");
    expect(payload.context).toMatchObject({
      hutk: "abc",
      ipAddress: "203.0.113.7",
      pageUri: "/services/accounting",
    });
    expect(payload.fields.every((f) => f.value !== "")).toBe(true);
  });

  it("escapes Slack control sequences in user input", () => {
    expect(slackEscape("<!channel> & <http://x|y>")).toBe("&lt;!channel&gt; &amp; &lt;http://x|y&gt;");
    const json = JSON.stringify(slackPayload(lead));
    expect(json).not.toContain("<!channel>");
    expect(json).not.toContain("<script>");
  });

  it("never lets user input break email headers", () => {
    expect(headerSafe("Dana\r\nBcc: evil@example.com")).toBe("Dana Bcc: evil@example.com");
  });

  it("writes a plain, personal confirmation that mentions the NDA when asked", () => {
    const text = confirmationText(lead);
    expect(text).toMatch(/^Hi Dana,/);
    expect(text).toContain("Accounting, Legal Assistance");
    expect(text).toContain("mutual NDA");
    expect(text).not.toMatch(/\n\n\n/);
  });

  it("summarizes the lead for the team", () => {
    const summary = leadSummary(lead);
    expect(summary).toContain("NDA first: Yes");
    expect(summary).toContain("Source: linkedin / q4");
  });
});

describe("deliverLead policy", () => {
  it("refuses in production when nothing is configured (never a silent drop)", async () => {
    const result = await deliverLead(lead, config());
    expect(result).toMatchObject({ delivered: false, sinks: [] });
  });

  it("logs instead in development, or with LEADS_LOG_ONLY", async () => {
    const log = vi.fn();
    expect((await deliverLead(lead, config({ production: false }), { log })).sinks).toEqual(["log"]);
    expect((await deliverLead(lead, config({ logOnly: true }), { log })).delivered).toBe(true);
    expect(log).toHaveBeenCalledTimes(2);
  });

  it("succeeds when any one sink accepts the lead, and reports the others", async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request) =>
      String(url).includes("hsforms") ? fail(400) : ok(),
    ) as unknown as typeof fetch;
    const result = await deliverLead(
      lead,
      config({
        hubspot: { portalId: "1", formId: "f", token: "t" },
        slackWebhookUrl: "https://hooks.slack.com/services/x",
      }),
      { fetch: fetchImpl },
    );
    expect(result.delivered).toBe(true);
    expect(result.sinks).toEqual(["slack"]);
    expect(result.failed[0]).toMatchObject({ sink: "hubspot" });
  });

  it("fails when every configured sink fails", async () => {
    const fetchImpl = vi.fn(async () => fail()) as unknown as typeof fetch;
    const result = await deliverLead(
      lead,
      config({ slackWebhookUrl: "https://hooks.slack.com/services/x" }),
      {
        fetch: fetchImpl,
      },
    );
    expect(result.delivered).toBe(false);
  });

  it("does not count the visitor confirmation as delivery, and never fails on it", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const body = String(init?.body ?? "");
      calls.push(body.includes('"to":["dana@') ? "confirmation" : "notify");
      return body.includes('"to":["dana@') ? fail() : ok();
    }) as unknown as typeof fetch;
    const result = await deliverLead(
      lead,
      config({
        resend: { apiKey: "k", from: "Maya <maya@akrosstech.com>", notifyTo: "leads@akrosstech.com" },
      }),
      { fetch: fetchImpl },
    );
    expect(calls).toEqual(["notify", "confirmation"]);
    expect(result).toMatchObject({ delivered: true, sinks: ["email"], confirmationSent: false });
  });

  it("does not send a confirmation when nothing was delivered", async () => {
    const fetchImpl = vi.fn(async () => ok()) as unknown as typeof fetch;
    const result = await deliverLead(lead, config({ resend: { apiKey: "k", from: "a@b.c" } }), {
      fetch: fetchImpl,
    });
    expect(result.delivered).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("readContactConfig", () => {
  it("only enables integrations whose keys are all present", () => {
    const cfg = readContactConfig({
      NODE_ENV: "production",
      HUBSPOT_PRIVATE_APP_TOKEN: "t",
      HUBSPOT_PORTAL_ID: "1",
      RESEND_API_KEY: "k",
      LEADS_FROM_EMAIL: " ",
      SLACK_LEADS_WEBHOOK_URL: "https://hooks.slack.com/services/x",
    } as NodeJS.ProcessEnv);
    expect(cfg.hubspot).toBeUndefined();
    expect(cfg.resend).toBeUndefined();
    expect(cfg.slackWebhookUrl).toBeDefined();
    expect(cfg.production).toBe(true);
    expect(cfg.logOnly).toBe(false);
  });
});

describe("verifyTurnstile", () => {
  it("passes only on success: true", async () => {
    const yes = vi.fn(async () => Response.json({ success: true })) as unknown as typeof fetch;
    const no = vi.fn(async () => Response.json({ success: false })) as unknown as typeof fetch;
    expect(await verifyTurnstile("tok", "secret", "1.2.3.4", yes)).toBe(true);
    expect(await verifyTurnstile("tok", "secret", undefined, no)).toBe(false);
    expect(await verifyTurnstile("", "secret", undefined, yes)).toBe(false);
  });

  it("treats network errors as unverified", async () => {
    const boom = vi.fn(async () => {
      throw new Error("down");
    }) as unknown as typeof fetch;
    expect(await verifyTurnstile("tok", "secret", undefined, boom)).toBe(false);
  });
});

describe("rate limiting", () => {
  it("allows up to the limit per window, per key", async () => {
    let t = 0;
    const limiter = memoryRateLimiter(2, 1000, () => t);
    expect(await limiter.hit("a")).toBe(true);
    expect(await limiter.hit("a")).toBe(true);
    expect(await limiter.hit("a")).toBe(false);
    expect(await limiter.hit("b")).toBe(true);
    t = 1001;
    expect(await limiter.hit("a")).toBe(true);
  });

  it("uses Upstash counts and fails open when Upstash is down", async () => {
    const count = vi.fn(async () => Response.json([{ result: 6 }, { result: 0 }])) as unknown as typeof fetch;
    expect(await upstashRateLimiter({ url: "https://u", token: "t" }, 5, 3600, count).hit("ip")).toBe(false);
    const down = vi.fn(async () => fail()) as unknown as typeof fetch;
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await upstashRateLimiter({ url: "https://u", token: "t" }, 5, 3600, down).hit("ip")).toBe(true);
  });
});

describe("reply-by (business hours, ET)", () => {
  it("adds 4 business hours within the same day", () => {
    const now = new Date("2026-10-14T13:00:00Z"); // Wed 9:00 AM EDT
    const target = addBusinessHours(now, 4);
    expect(formatReplyBy(target, now)).toBe("1:00 PM ET today");
  });

  it("rolls over the evening into the next morning", () => {
    const now = new Date("2026-10-14T20:00:00Z"); // Wed 4:00 PM EDT → 2h today + 2h Thu
    expect(formatReplyBy(addBusinessHours(now, 4), now)).toBe("10:00 AM ET tomorrow");
  });

  it("skips the weekend", () => {
    const now = new Date("2026-10-16T21:00:00Z"); // Fri 5:00 PM EDT → 1h Fri + 3h Mon
    expect(formatReplyBy(addBusinessHours(now, 4), now)).toBe("11:00 AM ET Monday");
  });

  it("counts from opening time when written overnight", () => {
    const now = new Date("2026-10-15T03:00:00Z"); // Wed 11:00 PM EDT
    expect(formatReplyBy(addBusinessHours(now, 4), now)).toBe("12:00 PM ET tomorrow");
  });
});
