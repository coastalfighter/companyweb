import "server-only";
import * as z from "zod/mini";
import { post, type Fetch } from "@/lib/contact/integrations/http";
import { memoryRateLimiter, type RateLimiter } from "@/lib/contact/rate-limit";

export interface NewsletterConfig {
  portalId: string;
  formId: string;
  token: string;
}

/** The newsletter only exists when its HubSpot form is configured (no form, no footer field). */
export function readNewsletterConfig(env: NodeJS.ProcessEnv = process.env): NewsletterConfig | null {
  const token = env.HUBSPOT_PRIVATE_APP_TOKEN?.trim();
  const portalId = env.HUBSPOT_PORTAL_ID?.trim();
  const formId = env.HUBSPOT_NEWSLETTER_FORM_ID?.trim();
  return token && portalId && formId ? { token, portalId, formId } : null;
}

export const subscriptionSchema = z.object({
  email: z.string().check(z.trim(), z.maxLength(254), z.email({ error: "Enter a valid email address." })),
  /** Honeypot: humans never see this field. */
  website: z.optional(z.string().check(z.maxLength(0))),
  page: z.optional(z.string().check(z.maxLength(200), z.startsWith("/"))),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

export type SubscriptionOutcome =
  | { status: "ok" }
  | { status: "invalid"; message: string }
  | { status: "error"; httpStatus: number; message: string };

const limiter: RateLimiter = memoryRateLimiter(5, 60 * 60 * 1000);

/**
 * Validates and forwards a newsletter sign-up to HubSpot (Forms API, secure endpoint).
 * Bots that fill the honeypot get a silent "ok" so they learn nothing.
 */
export async function handleSubscription(
  body: unknown,
  deps: { ip?: string; config: NewsletterConfig | null; fetchImpl?: Fetch; rateLimiter?: RateLimiter },
): Promise<SubscriptionOutcome> {
  if (!deps.config) return { status: "error", httpStatus: 404, message: "The newsletter isn't available." };
  const raw = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  if (typeof raw.website === "string" && raw.website.length > 0) return { status: "ok" };
  const parsed = subscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }
  const allowed = await (deps.rateLimiter ?? limiter).hit(`newsletter:${deps.ip ?? "unknown"}`);
  if (!allowed)
    return { status: "error", httpStatus: 429, message: "Too many attempts. Try again in an hour." };

  const url = `https://api.hsforms.com/submissions/v3/integration/secure/submit/${encodeURIComponent(
    deps.config.portalId,
  )}/${encodeURIComponent(deps.config.formId)}`;
  try {
    await post("hubspot-newsletter", deps.fetchImpl ?? fetch, url, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${deps.config.token}` },
      body: JSON.stringify({
        submittedAt: String(Date.now()),
        fields: [{ objectTypeId: "0-1", name: "email", value: parsed.data.email }],
        context: {
          ...(deps.ip ? { ipAddress: deps.ip } : {}),
          pageUri: parsed.data.page ?? "/",
          pageName: "Footer newsletter",
        },
      }),
    });
  } catch {
    return { status: "error", httpStatus: 502, message: "That didn't go through. Try again in a minute." };
  }
  return { status: "ok" };
}
