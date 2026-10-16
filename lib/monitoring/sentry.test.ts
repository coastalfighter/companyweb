// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { buildEnvelope, parseDsn, parseStack, reportError } from "./sentry";

const DSN = "https://abc123@o42.ingest.sentry.io/4501";
const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe("parseDsn", () => {
  it("reads a Sentry DSN and rejects anything else", () => {
    expect(parseDsn(DSN)).toEqual({
      publicKey: "abc123",
      host: "o42.ingest.sentry.io",
      projectId: "4501",
      raw: DSN,
    });
    expect(parseDsn("http://abc@o42.ingest.sentry.io/4501")).toBeNull();
    expect(parseDsn("https://o42.ingest.sentry.io/4501")).toBeNull();
    expect(parseDsn("https://abc@o42.ingest.sentry.io/not-a-project")).toBeNull();
    expect(parseDsn("nonsense")).toBeNull();
    expect(parseDsn(undefined)).toBeNull();
  });
});

describe("buildEnvelope", () => {
  const error = Object.assign(new Error("Cannot read properties of undefined"), { digest: "123456" });
  const [header, item, body] = buildEnvelope(
    error,
    {
      path: "/contact?email=dana@tidemark.example",
      method: "POST",
      routePath: "/contact",
      routeType: "action",
    },
    parseDsn(DSN)!,
    {
      now: new Date(Date.UTC(2026, 9, 16)),
      eventId: "00000000-0000-4000-8000-000000000000",
      environment: "production",
    },
  )
    .split("\n")
    .map((line) => JSON.parse(line) as Record<string, unknown>);

  it("is a valid Sentry envelope", () => {
    expect(header).toEqual({
      event_id: "00000000000040008000000000000000",
      sent_at: "2026-10-16T00:00:00.000Z",
      dsn: DSN,
    });
    expect(item).toEqual({ type: "event" });
    expect(body).toMatchObject({
      level: "error",
      transaction: "/contact",
      exception: { values: [{ type: "Error", value: "Cannot read properties of undefined" }] },
      tags: { route_type: "action", digest: "123456" },
    });
  });

  it("drops the query string and never includes headers or cookies", () => {
    expect(body!.request).toEqual({ url: "/contact", method: "POST" });
    expect(JSON.stringify(body)).not.toContain("dana@tidemark.example");
  });
});

describe("parseStack", () => {
  it("turns a V8 stack into frames, oldest first", () => {
    const frames = parseStack(
      "Error: x\n    at inner (/app/lib/a.ts:10:5)\n    at /app/lib/b.ts:20:3\n    at Module.run (node:internal:1:1)",
    );
    expect(frames).toEqual([
      { function: "Module.run", filename: "node:internal", lineno: 1, colno: 1 },
      { filename: "/app/lib/b.ts", lineno: 20, colno: 3 },
      { function: "inner", filename: "/app/lib/a.ts", lineno: 10, colno: 5 },
    ]);
  });
});

describe("reportError", () => {
  it("does nothing without a DSN", async () => {
    const fetchImpl = vi.fn();
    await expect(reportError(new Error("x"), { path: "/", method: "GET" }, env({}), fetchImpl)).resolves.toBe(
      false,
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts the envelope with Sentry auth", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    await expect(
      reportError(
        new Error("x"),
        { path: "/", method: "GET" },
        env({ SENTRY_DSN: DSN }),
        fetchImpl as unknown as typeof fetch,
      ),
    ).resolves.toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://o42.ingest.sentry.io/api/4501/envelope/");
    expect((init.headers as Record<string, string>)["X-Sentry-Auth"]).toContain("sentry_key=abc123");
  });

  it("never throws when Sentry is unreachable", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    await expect(
      reportError(
        "boom",
        { path: "/", method: "GET" },
        env({ SENTRY_DSN: DSN }),
        fetchImpl as unknown as typeof fetch,
      ),
    ).resolves.toBe(false);
  });
});
