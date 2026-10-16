import "server-only";
import { type HubspotConfig } from "./integrations/hubspot";
import { type ResendConfig } from "./integrations/resend";

/** Lead pipeline configuration, read from the environment (see .env.example). */
export interface ContactConfig {
  production: boolean;
  /** Development/E2E only: log leads to the server console and count that as delivered. */
  logOnly: boolean;
  hubspot?: HubspotConfig;
  slackWebhookUrl?: string;
  resend?: ResendConfig;
  turnstileSecret?: string;
  turnstileSiteKey?: string;
  upstash?: { url: string; token: string };
}

export function readContactConfig(env: NodeJS.ProcessEnv = process.env): ContactConfig {
  const v = (key: string) => {
    const value = env[key]?.trim();
    return value ? value : undefined;
  };
  const hubspotToken = v("HUBSPOT_PRIVATE_APP_TOKEN");
  const hubspotPortal = v("HUBSPOT_PORTAL_ID");
  const hubspotForm = v("HUBSPOT_FORM_ID");
  const resendKey = v("RESEND_API_KEY");
  const from = v("LEADS_FROM_EMAIL");
  const upstashUrl = v("UPSTASH_REDIS_REST_URL");
  const upstashToken = v("UPSTASH_REDIS_REST_TOKEN");

  return {
    production: env.NODE_ENV === "production",
    logOnly: v("LEADS_LOG_ONLY") === "true",
    hubspot:
      hubspotToken && hubspotPortal && hubspotForm
        ? { token: hubspotToken, portalId: hubspotPortal, formId: hubspotForm }
        : undefined,
    slackWebhookUrl: v("SLACK_LEADS_WEBHOOK_URL"),
    resend: resendKey && from ? { apiKey: resendKey, from, notifyTo: v("LEADS_NOTIFY_EMAIL") } : undefined,
    turnstileSecret: v("TURNSTILE_SECRET_KEY"),
    turnstileSiteKey: v("NEXT_PUBLIC_TURNSTILE_SITE_KEY"),
    upstash: upstashUrl && upstashToken ? { url: upstashUrl, token: upstashToken } : undefined,
  };
}
