// @vitest-environment node
import { PDFDocument } from "pdf-lib";
import { describe, expect, it, vi } from "vitest";
import { sampleRateCard } from "@/content/samples";
import { type ContactConfig } from "@/lib/contact/config";
import { calculatorLeadSummary } from "./lead-summary";
import { calculate, CALC_FUNCTIONS, defaultInput, type CalculatorInput, type RateCard } from "./model";
import { pdfSafe, reportContent } from "./report-content";
import { renderReportPdf } from "./report-pdf";
import { handleReportRequest } from "./report-request";

const NOW = new Date(Date.UTC(2026, 9, 16, 12));

function financeOnly(hours = 40): CalculatorInput {
  const input = defaultInput();
  input.functions.finance = { enabled: true, hoursPerWeek: hours, salary: 145_000 };
  return input;
}

const flatCard = (rate: number): RateCard => ({
  hourly: Object.fromEntries(
    CALC_FUNCTIONS.map((fn) => [fn, { low: rate, high: rate + 20 }]),
  ) as RateCard["hourly"],
  setupFee: 0,
  approvedBy: "test",
});

const baseConfig: ContactConfig = { production: false, logOnly: true };
const allowAll = { hit: async () => true };

describe("reportContent", () => {
  it("reports today's cost and a quote invitation without a rate card", () => {
    const input = financeOnly();
    const content = reportContent(
      input,
      calculate(input, null),
      null,
      { name: "Dana" },
      NOW,
      "https://x.test",
    );
    expect(content.preparedFor).toBe("Prepared for Dana on October 16, 2026");
    expect(content.keyFigures).toEqual([
      ["Current annual cost of this work", "$174,000"],
      ["Hours spent per year", "1,920"],
      ["Full-time equivalent", "0.9 FTE"],
    ]);
    expect(content.tableHead).not.toContain("With Akrostech");
    expect(content.tableRows).toEqual([["Finance & payroll", "40", "$145,000", "$91", "$174,000"]]);
    expect(content.nextStep).toContain("written quote within 48 hours");
    expect(content.methodology.join(" ")).toContain("we quote it in writing");
    expect(content.caveat).toBeNull();
  });

  it("adds our cost, savings and break-even with a rate card", () => {
    const input = financeOnly();
    const content = reportContent(
      input,
      calculate(input, sampleRateCard),
      sampleRateCard,
      { name: "Dana", company: "Tidemark" },
      NOW,
      "https://x.test",
    );
    expect(content.preparedFor).toContain("Dana, Tidemark");
    expect(content.keyFigures).toContainEqual(["Estimated Akrostech cost", "$61K – $92K a year"]);
    expect(content.keyFigures).toContainEqual(["Annual savings", "$82K – $113K"]);
    expect(content.keyFigures).toContainEqual(["Break-even", "Month 1"]);
    expect(content.tableRows[0]).toHaveLength(6);
  });

  it("is candid when we'd cost more", () => {
    const input = financeOnly();
    const content = reportContent(
      input,
      calculate(input, flatCard(120)),
      flatCard(120),
      { name: "D" },
      NOW,
      "x",
    );
    expect(content.caveat).toMatch(
      /^Honestly, at these numbers an in-house hire may make more sense\. We'd become cheaper/,
    );
    expect(content.keyFigures).toContainEqual(["Annual savings", "None at these rates"]);
  });
});

describe("pdfSafe", () => {
  it("keeps Latin-1 and Windows-1252, replaces symbols, and never throws", () => {
    expect(pdfSafe("José Müller – “quotes” €5")).toBe("José Müller – “quotes” €5");
    expect(pdfSafe("15 → 5 ≈ 3 × 2 − 1")).toBe("15 -> 5 ~ 3 x 2 - 1");
    expect(pdfSafe("Łódź Ștefan")).toBe("Lódz Stefan");
    expect(pdfSafe("王小明 🚀\nnext")).toBe("??? ? next");
  });
});

describe("renderReportPdf", () => {
  it("produces a valid PDF with metadata, even for non-Latin names", async () => {
    const input = financeOnly();
    input.functions.admin = { enabled: true, hoursPerWeek: 30, salary: 78_000 };
    const content = reportContent(
      input,
      calculate(input, sampleRateCard),
      sampleRateCard,
      { name: "王小明", company: "Łódź Logistics" },
      NOW,
      "https://akrosstech.com",
    );
    const bytes = await renderReportPdf(content, "Akrostech");
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(doc.getTitle()).toBe("Akrostech Back-office cost report");
  });
});

describe("handleReportRequest", () => {
  const body = (extra: Record<string, unknown> = {}) => ({
    name: "Dana Whitfield",
    email: "Dana@Tidemark.example",
    company: "Tidemark Health",
    input: financeOnly(),
    ...extra,
  });

  it("validates name and email", async () => {
    const outcome = await handleReportRequest(
      { name: " ", email: "nope", input: {} },
      { config: baseConfig, rateCard: null, limiter: allowAll },
    );
    expect(outcome).toEqual({
      status: "invalid",
      errors: {
        name: "Add your name so we know who the report is for.",
        email: "That doesn't look like an email address.",
      },
    });
  });

  it("rejects malformed requests without field errors", async () => {
    const outcome = await handleReportRequest("x", { config: baseConfig, rateCard: null, limiter: allowAll });
    expect(outcome).toMatchObject({ status: "error", httpStatus: 400 });
  });

  it("gives bots an empty success and sends nothing", async () => {
    const fetchImpl = vi.fn();
    const outcome = await handleReportRequest(body({ website: "spam.example" }), {
      config: { ...baseConfig, slackWebhookUrl: "https://hooks.slack.test/x" },
      rateCard: null,
      limiter: allowAll,
      fetch: fetchImpl,
    });
    expect(outcome).toEqual({ status: "ok", pdf: new Uint8Array(), emailed: false });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rate limits per IP", async () => {
    const outcome = await handleReportRequest(body(), {
      config: baseConfig,
      rateCard: null,
      limiter: { hit: async () => false },
    });
    expect(outcome).toMatchObject({ status: "error", httpStatus: 429 });
  });

  it("requires Turnstile when configured", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ success: false }));
    const outcome = await handleReportRequest(body(), {
      config: { ...baseConfig, turnstileSecret: "secret" },
      rateCard: null,
      limiter: allowAll,
      fetch: fetchImpl as unknown as typeof fetch,
    });
    expect(outcome).toMatchObject({ status: "error", httpStatus: 403 });
  });

  it("refuses an empty calculation", async () => {
    const outcome = await handleReportRequest(body({ input: defaultInput() }), {
      config: baseConfig,
      rateCard: null,
      limiter: allowAll,
    });
    expect(outcome).toMatchObject({ status: "error", httpStatus: 422 });
  });

  it("returns the PDF without email when no sinks are configured", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const outcome = await handleReportRequest(body(), {
      config: baseConfig,
      rateCard: null,
      limiter: allowAll,
      now: NOW,
    });
    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.emailed).toBe(false);
    expect(outcome.pdf.byteLength).toBeGreaterThan(1000);
    expect(warn).toHaveBeenCalledWith(
      "[calculator] report lead (no sinks configured):",
      expect.objectContaining({ email: "dana@tidemark.example" }),
    );
    warn.mockRestore();
  });

  it("never logs lead details in production without sinks", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await handleReportRequest(body(), {
      config: { production: true, logOnly: false },
      rateCard: null,
      limiter: allowAll,
    });
    expect(warn).not.toHaveBeenCalled();
    expect(JSON.stringify(error.mock.calls)).not.toContain("tidemark");
    warn.mockRestore();
    error.mockRestore();
  });

  it("delivers the lead and emails the PDF, using the server's rate card only", async () => {
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init?.body)) as Record<string, unknown> });
      return new Response("{}", { status: 200 });
    });
    const outcome = await handleReportRequest(
      // A client-supplied rate card must be ignored.
      body({ rateCard: flatCard(1) }),
      {
        config: {
          ...baseConfig,
          hubspot: { portalId: "1", formId: "f", token: "t" },
          slackWebhookUrl: "https://hooks.slack.test/x",
          resend: { apiKey: "k", from: "Maya <maya@akrosstech.com>", notifyTo: "team@akrosstech.com" },
        },
        rateCard: null,
        limiter: allowAll,
        fetch: fetchImpl as unknown as typeof fetch,
        now: NOW,
      },
    );
    expect(outcome).toMatchObject({ status: "ok", emailed: true });

    const hubspot = calls.find((c) => c.url.includes("hsforms"))!;
    expect(hubspot.body.fields).toEqual(
      expect.arrayContaining([
        { objectTypeId: "0-1", name: "firstname", value: "Dana" },
        { objectTypeId: "0-1", name: "lastname", value: "Whitfield" },
        { objectTypeId: "0-1", name: "email", value: "dana@tidemark.example" },
        { objectTypeId: "0-1", name: "akros_lead_source", value: "Cost calculator report" },
      ]),
    );
    const calculatorField = (hubspot.body.fields as { name: string; value: string }[]).find(
      (f) => f.name === "akros_calculator",
    )!;
    expect(calculatorField.value).toContain("Today: $174,000/yr");
    expect(calculatorField.value).not.toContain("Akrostech:");

    const emails = calls.filter((c) => c.url.includes("resend"));
    expect(emails.map((e) => (e.body.to as string[])[0])).toEqual(
      expect.arrayContaining(["team@akrosstech.com", "dana@tidemark.example"]),
    );
    const toVisitor = emails.find((e) => (e.body.to as string[])[0] === "dana@tidemark.example")!;
    const [attachment] = toVisitor.body.attachments as { filename: string; content: string }[];
    expect(attachment!.filename).toBe("akrostech-back-office-cost-report.pdf");
    expect(Buffer.from(attachment!.content, "base64").subarray(0, 5).toString()).toBe("%PDF-");
    expect(calls.some((c) => c.url.includes("slack"))).toBe(true);
  });

  it("still returns the PDF when email delivery fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchImpl = vi.fn(async () => new Response("down", { status: 500 }));
    const outcome = await handleReportRequest(body(), {
      config: { ...baseConfig, resend: { apiKey: "k", from: "Maya <m@x.test>" } },
      rateCard: null,
      limiter: allowAll,
      fetch: fetchImpl as unknown as typeof fetch,
    });
    expect(outcome).toMatchObject({ status: "ok", emailed: false });
    error.mockRestore();
  });
});

describe("calculatorLeadSummary", () => {
  const stored = (input: unknown) => JSON.stringify({ v: 1, input, savedAt: 0 });

  it("summarises saved inputs for the sales team", () => {
    expect(calculatorLeadSummary(stored(financeOnly()), null)).toBe(
      "Today $174,000/yr · 1,920 h/yr (0.9 FTE) · Finance & payroll 40h/wk",
    );
    expect(calculatorLeadSummary(stored(financeOnly()), sampleRateCard)).toContain(
      "Akrostech $61K – $92K/yr",
    );
  });

  it("ignores junk, oversized, old-version and empty payloads", () => {
    expect(calculatorLeadSummary(null, null)).toBeUndefined();
    expect(calculatorLeadSummary("{not json", null)).toBeUndefined();
    expect(calculatorLeadSummary("x".repeat(5000), null)).toBeUndefined();
    expect(calculatorLeadSummary(JSON.stringify({ v: 0, input: financeOnly() }), null)).toBeUndefined();
    expect(calculatorLeadSummary(stored(defaultInput()), null)).toBeUndefined();
  });
});
