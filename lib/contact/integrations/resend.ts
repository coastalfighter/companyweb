import "server-only";
import { siteConfig } from "@/lib/site";
import { headerSafe, leadSummary, serviceLabels, type Lead } from "../lead";
import { post, type Fetch } from "./http";

export interface ResendConfig {
  apiKey: string;
  /** e.g. "Maya at Akrostech <maya@akrosstech.com>" (a named person, not noreply). */
  from: string;
  /** Team inbox for new-lead notifications. */
  notifyTo?: string;
}

export interface EmailAttachment {
  filename: string;
  /** Base64-encoded file content. */
  content: string;
}

export async function sendEmail(
  config: ResendConfig,
  fetchImpl: Fetch,
  email: { to: string; subject: string; text: string; replyTo?: string; attachments?: EmailAttachment[] },
): Promise<void> {
  await post("resend", fetchImpl, "https://api.resend.com/emails", {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      from: config.from,
      to: [email.to],
      subject: headerSafe(email.subject),
      text: email.text,
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      ...(email.attachments?.length ? { attachments: email.attachments } : {}),
    }),
  });
}

/** Internal notification: a delivery sink in its own right. Reply-to is the lead. */
export async function sendLeadNotification(
  lead: Lead,
  config: ResendConfig,
  fetchImpl: Fetch = fetch,
): Promise<void> {
  if (!config.notifyTo) throw new Error("resend: no notification address configured");
  await sendEmail(config, fetchImpl, {
    to: config.notifyTo,
    subject: `New lead: ${lead.firstName} ${lead.lastName}, ${lead.company}`,
    text: leadSummary(lead),
    replyTo: lead.email,
  });
}

/**
 * Confirmation to the person who wrote in (F3.4): plain text, from a named sender,
 * so it lands in Primary rather than Promotions. Best-effort; never blocks success.
 */
export function confirmationText(lead: Lead): string {
  const services = serviceLabels(lead).join(", ");
  return [
    `Hi ${lead.firstName},`,
    "",
    `Thanks for getting in touch about ${services}. A real person on our team has your note and will reply personally within ${siteConfig.replySla}, with a few times for a 20-minute call.`,
    lead.nda ? "\nYou asked for a mutual NDA first; it will come before any call." : "",
    "",
    "If anything changes in the meantime, just reply to this email.",
    "",
    "Akrostech",
    siteConfig.url.replace(/^https?:\/\//, ""),
  ]
    .filter((line, i, all) => !(line === "" && all[i - 1] === ""))
    .join("\n");
}

export async function sendConfirmation(
  lead: Lead,
  config: ResendConfig,
  fetchImpl: Fetch = fetch,
): Promise<void> {
  await sendEmail(config, fetchImpl, {
    to: lead.email,
    subject: "We've got your note",
    text: confirmationText(lead),
    replyTo: config.notifyTo,
  });
}
