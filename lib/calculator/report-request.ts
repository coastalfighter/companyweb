import "server-only";
import * as z from "zod/mini";
import { readContactConfig, type ContactConfig } from "@/lib/contact/config";
import { post, type Fetch } from "@/lib/contact/integrations/http";
import { sendEmail } from "@/lib/contact/integrations/resend";
import { slackEscape } from "@/lib/contact/integrations/slack";
import { verifyTurnstile } from "@/lib/contact/integrations/turnstile";
import { headerSafe } from "@/lib/contact/lead";
import { memoryRateLimiter, upstashRateLimiter, type RateLimiter } from "@/lib/contact/rate-limit";
import { HONEYPOT_FIELD } from "@/lib/contact/schema";
import { siteConfig } from "@/lib/site";
import { calculate, formatHours, formatMoney, formatRange, sanitizeInput, type RateCard } from "./model";
import { reportContent } from "./report-content";
import { renderReportPdf } from "./report-pdf";

/** 5 reports per IP per hour, like the contact form. */
const LIMIT = 5;
const WINDOW_SECONDS = 60 * 60;
const memoryLimiter = memoryRateLimiter(LIMIT, WINDOW_SECONDS * 1000);

export const REPORT_FILENAME = "akrostech-back-office-cost-report.pdf";

const requestSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, { error: "Add your name so we know who the report is for." }),
      z.maxLength(80, { error: "Keep your name under 80 characters." }),
    ),
  email: z
    .string()
    .check(
      z.trim(),
      z.toLowerCase(),
      z.minLength(1, { error: "We need an email to send the report to." }),
      z.maxLength(254, { error: "That email is too long." }),
      z.email({ error: "That doesn't look like an email address." }),
    ),
  company: z.optional(
    z.string().check(z.trim(), z.maxLength(120, { error: "Keep the company name under 120 characters." })),
  ),
  input: z.unknown(),
  [HONEYPOT_FIELD]: z.optional(z.string()),
  turnstileToken: z.optional(z.string().check(z.maxLength(4096))),
});

export type ReportField = "name" | "email" | "company";

export type ReportOutcome =
  | { status: "ok"; pdf: Uint8Array; emailed: boolean }
  | { status: "invalid"; errors: Partial<Record<ReportField, string>> }
  | { status: "error"; httpStatus: number; message: string };

export interface ReportContext {
  ip?: string;
  config?: ContactConfig;
  rateCard: RateCard | null;
  fetch?: Fetch;
  limiter?: RateLimiter;
  now?: Date;
}

interface ReportLead {
  name: string;
  email: string;
  company?: string;
  summary: string;
  figures: string;
  ip?: string;
  submittedAt: Date;
}

function hubspotReportPayload(lead: ReportLead) {
  const [firstname, ...rest] = lead.name.split(/\s+/);
  const contact = (name: string, value: string) => ({ objectTypeId: "0-1", name, value });
  return {
    submittedAt: String(lead.submittedAt.getTime()),
    fields: [
      contact("firstname", firstname ?? lead.name),
      contact("lastname", rest.join(" ")),
      contact("email", lead.email),
      contact("company", lead.company ?? ""),
      contact("akros_calculator", `${lead.figures}\n${lead.summary}`),
      contact("akros_lead_source", "Cost calculator report"),
    ].filter((f) => f.value !== ""),
    context: {
      ...(lead.ip ? { ipAddress: lead.ip } : {}),
      pageUri: `${siteConfig.url}/resources/back-office-calculator`,
      pageName: "Back-office cost calculator",
    },
  };
}

function slackReportPayload(lead: ReportLead) {
  const e = slackEscape;
  const headline = `Calculator report: ${e(lead.name)}${lead.company ? `, ${e(lead.company)}` : ""}`;
  return {
    text: headline,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `*${headline}*` } },
      { type: "section", text: { type: "mrkdwn", text: `*Email:* ${e(lead.email)}\n${e(lead.figures)}` } },
      { type: "section", text: { type: "mrkdwn", text: `>${e(lead.summary)}` } },
    ],
  };
}

/**
 * The gated report (blueprint F4): validate, recompute the numbers on the server
 * from the sanitized inputs and the server's own rate card (never the client's),
 * render the PDF, hand the lead to the same sinks as the contact form, and email
 * the PDF when Resend is configured. The PDF is also returned for an immediate
 * download, so the visitor gets it even if email isn't set up.
 */
export async function handleReportRequest(body: unknown, ctx: ReportContext): Promise<ReportOutcome> {
  const config = ctx.config ?? readContactConfig();
  const fetchImpl = ctx.fetch ?? fetch;
  const now = ctx.now ?? new Date();

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors as Partial<Record<string, string[]>>;
    const errors: Partial<Record<ReportField, string>> = {};
    for (const field of ["name", "email", "company"] as const) {
      if (flat[field]?.[0]) errors[field] = flat[field][0];
    }
    if (Object.keys(errors).length > 0) return { status: "invalid", errors };
    return {
      status: "error",
      httpStatus: 400,
      message: "That request didn't look right. Refresh and try again.",
    };
  }
  const data = parsed.data;

  // Bots that fill the honeypot get a 200 with an empty body and nothing is sent.
  if (data[HONEYPOT_FIELD]?.trim()) return { status: "ok", pdf: new Uint8Array(), emailed: false };

  const limiter =
    ctx.limiter ??
    (config.upstash ? upstashRateLimiter(config.upstash, LIMIT, WINDOW_SECONDS, fetchImpl) : memoryLimiter);
  if (!(await limiter.hit(`calculator-report:${ctx.ip ?? "unknown"}`))) {
    return {
      status: "error",
      httpStatus: 429,
      message: "You've asked for a few reports already. Give it an hour.",
    };
  }

  if (config.turnstileSecret) {
    const verified = await verifyTurnstile(
      data.turnstileToken ?? "",
      config.turnstileSecret,
      ctx.ip,
      fetchImpl,
    );
    if (!verified) {
      return {
        status: "error",
        httpStatus: 403,
        message: "We couldn't verify you're human. Refresh and try again.",
      };
    }
  }

  const input = sanitizeInput(data.input);
  const result = calculate(input, ctx.rateCard);
  if (result.verdict === "empty") {
    return {
      status: "error",
      httpStatus: 422,
      message: "Add at least one function with hours and a salary first.",
    };
  }

  const recipient = { name: data.name, company: data.company || undefined };
  const content = reportContent(input, result, ctx.rateCard, recipient, now, siteConfig.url);
  const pdf = await renderReportPdf(content, siteConfig.name);

  const figures = [
    `Today: ${formatMoney(result.currentCost)}/yr`,
    `${formatHours(result.annualHours)} h/yr (${result.fte.toFixed(1)} FTE)`,
    result.akrostech ? `Akrostech: ${formatRange(result.akrostech)}/yr` : null,
    `Verdict: ${result.verdict}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const lead: ReportLead = {
    name: data.name,
    email: data.email,
    company: recipient.company,
    summary: content.summary,
    figures,
    ip: ctx.ip,
    submittedAt: now,
  };

  // Lead delivery is best-effort here: the visitor gets the report either way.
  const deliveries: Promise<unknown>[] = [];
  if (config.hubspot) {
    const { portalId, formId, token } = config.hubspot;
    deliveries.push(
      post(
        "hubspot",
        fetchImpl,
        `https://api.hsforms.com/submissions/v3/integration/secure/submit/${encodeURIComponent(portalId)}/${encodeURIComponent(formId)}`,
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(hubspotReportPayload(lead)),
        },
      ),
    );
  }
  if (config.slackWebhookUrl) {
    deliveries.push(
      post("slack", fetchImpl, config.slackWebhookUrl, {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackReportPayload(lead)),
      }),
    );
  }
  if (config.resend?.notifyTo) {
    deliveries.push(
      sendEmail(config.resend, fetchImpl, {
        to: config.resend.notifyTo,
        subject: `Calculator report: ${lead.name}${lead.company ? `, ${lead.company}` : ""}`,
        text: [
          `Name: ${lead.name}`,
          `Email: ${lead.email}`,
          `Company: ${lead.company ?? "(not given)"}`,
          "",
          figures,
          "",
          content.summary,
        ].join("\n"),
        replyTo: lead.email,
      }),
    );
  }
  if (deliveries.length === 0) {
    // Same rule as the contact form: lead details reach the logs only outside production.
    if (!config.production || config.logOnly) {
      console.warn("[calculator] report lead (no sinks configured):", { ...lead, ip: undefined });
    } else {
      console.error(
        "[calculator] report generated but no lead sink is configured; the lead was not captured",
      );
    }
  }

  let emailed = false;
  if (config.resend) {
    deliveries.push(
      sendEmail(config.resend, fetchImpl, {
        to: lead.email,
        subject: headerSafe("Your back-office cost report"),
        text: [
          `Hi ${lead.name.split(/\s+/)[0]},`,
          "",
          "Your report is attached, with the numbers and the method behind them.",
          "",
          content.nextStep,
          "",
          "Akrostech",
        ].join("\n"),
        replyTo: config.resend.notifyTo,
        attachments: [{ filename: REPORT_FILENAME, content: Buffer.from(pdf).toString("base64") }],
      }).then(() => {
        emailed = true;
      }),
    );
  }

  const settled = await Promise.allSettled(deliveries);
  const failed = settled.filter((s) => s.status === "rejected");
  if (failed.length > 0) {
    console.error(
      "[calculator] report delivery problems",
      failed.map((f) => (f as PromiseRejectedResult).reason),
    );
  }

  return { status: "ok", pdf, emailed };
}
