import { describe, expect, it, vi } from "vitest";
import { type ContactConfig } from "./config";
import { memoryRateLimiter } from "./rate-limit";
import { handleContactSubmission } from "./submit";

function form(overrides: Record<string, string | string[]> = {}) {
  const fields: Record<string, string | string[]> = {
    firstName: "Dana",
    lastName: "Whitfield",
    email: "dana@tidemark.example",
    company: "Tidemark",
    companySize: "200–499",
    services: ["accounting"],
    details: "",
    phone: "",
    ...overrides,
  };
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  return data;
}

const logOnly: ContactConfig = { production: true, logOnly: true };
const quiet = () => vi.spyOn(console, "info").mockImplementation(() => {});

describe("handleContactSubmission", () => {
  it("accepts a valid submission when a sink is available", async () => {
    quiet();
    const state = await handleContactSubmission(form(), {
      config: logOnly,
      limiter: memoryRateLimiter(5, 1000),
    });
    expect(state).toEqual({ status: "success", firstName: "Dana", services: ["accounting"] });
  });

  it("returns field errors without delivering", async () => {
    const fetchImpl = vi.fn();
    const state = await handleContactSubmission(form({ email: "nope", services: [] }), {
      config: { production: true, logOnly: false, slackWebhookUrl: "https://hooks.slack.com/x" },
      fetch: fetchImpl as unknown as typeof fetch,
      limiter: memoryRateLimiter(5, 1000),
    });
    expect(state.status).toBe("invalid");
    if (state.status === "invalid") expect(Object.keys(state.errors).sort()).toEqual(["email", "services"]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("silently swallows honeypot submissions", async () => {
    const log = quiet();
    const state = await handleContactSubmission(form({ website: "http://spam.example" }), {
      config: logOnly,
      limiter: memoryRateLimiter(5, 1000),
    });
    expect(state).toEqual({ status: "success", firstName: "", services: [] });
    expect(log).not.toHaveBeenCalled();
  });

  it("rate limits per IP", async () => {
    quiet();
    const limiter = memoryRateLimiter(1, 60_000);
    await handleContactSubmission(form(), { config: logOnly, limiter, ip: "1.1.1.1" });
    const second = await handleContactSubmission(form(), { config: logOnly, limiter, ip: "1.1.1.1" });
    expect(second.status).toBe("error");
    const other = await handleContactSubmission(form(), { config: logOnly, limiter, ip: "2.2.2.2" });
    expect(other.status).toBe("success");
  });

  it("requires a valid Turnstile token when Turnstile is configured", async () => {
    quiet();
    const deny = vi.fn(async () => Response.json({ success: false })) as unknown as typeof fetch;
    const state = await handleContactSubmission(form(), {
      config: { ...logOnly, turnstileSecret: "secret" },
      fetch: deny,
      limiter: memoryRateLimiter(5, 1000),
    });
    expect(state).toMatchObject({ status: "error", message: expect.stringContaining("verify") });

    const allow = vi.fn(async () => Response.json({ success: true })) as unknown as typeof fetch;
    const ok = await handleContactSubmission(form({ "cf-turnstile-response": "tok" }), {
      config: { ...logOnly, turnstileSecret: "secret" },
      fetch: allow,
      limiter: memoryRateLimiter(5, 1000),
    });
    expect(ok.status).toBe("success");
  });

  it("tells the visitor it didn't send when no sink accepted the lead", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const state = await handleContactSubmission(form(), {
      config: { production: true, logOnly: false },
      limiter: memoryRateLimiter(5, 1000),
    });
    expect(state).toMatchObject({ status: "error", message: expect.stringContaining("didn't send") });
  });
});
