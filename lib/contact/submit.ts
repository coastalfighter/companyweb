import "server-only";
import { rateCard } from "@/content/rate-card";
import { calculatorLeadSummary } from "@/lib/calculator/lead-summary";
import { siteConfig } from "@/lib/site";
import { readContactConfig, type ContactConfig } from "./config";
import { deliverLead } from "./deliver";
import { verifyTurnstile } from "./integrations/turnstile";
import { type Fetch } from "./integrations/http";
import { memoryRateLimiter, upstashRateLimiter, type RateLimiter } from "./rate-limit";
import { HONEYPOT_FIELD, attributionFromFormData, contactInputFromFormData, validateContact } from "./schema";
import { type ContactState } from "./state";

/** 5 submissions per IP per hour (blueprint F3.2). */
const LIMIT = 5;
const WINDOW_SECONDS = 60 * 60;

const memoryLimiter = memoryRateLimiter(LIMIT, WINDOW_SECONDS * 1000);

const sendFailedMessage = `That didn't send. Your answers are still here; try again, or email ${siteConfig.email}.`;

export interface SubmitContext {
  ip?: string;
  userAgent?: string;
  config?: ContactConfig;
  fetch?: Fetch;
  limiter?: RateLimiter;
  now?: Date;
}

/**
 * The whole server-side contact flow, independent of Next.js request APIs so it can
 * be unit tested. Order matters: cheap rejections first, delivery last.
 * Server actions are reachable by direct POST, so every check lives here.
 */
export async function handleContactSubmission(
  form: FormData,
  ctx: SubmitContext = {},
): Promise<ContactState> {
  const config = ctx.config ?? readContactConfig();
  const fetchImpl = ctx.fetch ?? fetch;

  // 1. Honeypot: bots get a convincing success and nothing is delivered.
  const honeypot = form.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "success", firstName: "", services: [] };
  }

  // 2. Rate limit per IP.
  const limiter =
    ctx.limiter ??
    (config.upstash ? upstashRateLimiter(config.upstash, LIMIT, WINDOW_SECONDS, fetchImpl) : memoryLimiter);
  if (!(await limiter.hit(ctx.ip ?? "unknown"))) {
    return {
      status: "error",
      message: `You've sent a few of these already. Give it an hour, or email ${siteConfig.email} directly.`,
    };
  }

  // 3. Bot check (only when Turnstile is configured).
  if (config.turnstileSecret) {
    const token = form.get("cf-turnstile-response");
    const verified = await verifyTurnstile(
      typeof token === "string" ? token : "",
      config.turnstileSecret,
      ctx.ip,
      fetchImpl,
    );
    if (!verified) {
      return { status: "error", message: "We couldn't verify you're human. Refresh the page and try again." };
    }
  }

  // 4. Validate (the server is the source of truth).
  const validation = validateContact(contactInputFromFormData(form));
  if (!validation.ok) return { status: "invalid", errors: validation.errors };

  // 5. Deliver.
  const result = await deliverLead(
    {
      ...validation.data,
      attribution: attributionFromFormData(form),
      submittedAt: ctx.now ?? new Date(),
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      calculator: calculatorLeadSummary(form.get("calculator"), rateCard),
    },
    config,
    { fetch: fetchImpl },
  );
  if (result.failed.length > 0) {
    console.error("[contact] delivery problems", { sinks: result.sinks, failed: result.failed });
  }
  if (!result.delivered) return { status: "error", message: sendFailedMessage };

  return { status: "success", firstName: validation.data.firstName, services: validation.data.services };
}
