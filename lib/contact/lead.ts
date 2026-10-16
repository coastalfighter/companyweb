import { SERVICE_OPTIONS, TIMELINES, normalizePhone, type Attribution, type ContactData } from "./schema";

/** A validated submission plus request context, ready to hand to integrations. */
export interface Lead extends ContactData {
  attribution: Attribution;
  submittedAt: Date;
  ip?: string;
  userAgent?: string;
  /** One-line calculator summary, when the visitor ran the cost calculator first. */
  calculator?: string;
}

export function serviceLabels(lead: Pick<Lead, "services">): string[] {
  return lead.services.map((value) => SERVICE_OPTIONS.find((s) => s.value === value)?.label ?? value);
}

export function timelineLabel(lead: Pick<Lead, "timeline">): string | undefined {
  return TIMELINES.find((t) => t.value === lead.timeline)?.label;
}

export function phoneE164(lead: Pick<Lead, "phone">): string {
  return normalizePhone(lead.phone);
}

/** Strips CR/LF so user input can never inject email headers. */
export function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** Plain-text summary used by the notification email and logs. */
export function leadSummary(lead: Lead): string {
  const lines = [
    `Name: ${lead.firstName} ${lead.lastName}`,
    `Email: ${lead.email}`,
    `Company: ${lead.company} (${lead.companySize})`,
    `Services: ${serviceLabels(lead).join(", ")}`,
    `Timeline: ${timelineLabel(lead) ?? "Not given"}`,
    `NDA first: ${lead.nda ? "Yes, send a mutual NDA" : "No"}`,
  ];
  if (lead.phone) lines.push(`Phone: ${phoneE164(lead)}`);
  lines.push("", lead.details ? `Details:\n${lead.details}` : "Details: (none)");
  if (lead.calculator) lines.push("", `Calculator: ${lead.calculator}`);
  const a = lead.attribution;
  const source = [a.utmSource, a.utmMedium, a.utmCampaign].filter(Boolean).join(" / ");
  lines.push("", `Source: ${source || "direct"}`, `Landing page: ${a.landingPage ?? "unknown"}`);
  if (a.referrer) lines.push(`Referrer: ${a.referrer}`);
  return lines.join("\n");
}
