import "server-only";
import { serviceLabels, timelineLabel, type Lead } from "../lead";
import { post, type Fetch } from "./http";

/** Escapes Slack mrkdwn control characters so user input can't ping channels or inject links. */
export function slackEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function slackPayload(lead: Lead) {
  const e = slackEscape;
  const services = serviceLabels(lead).join(", ");
  const headline = `New lead: ${e(lead.firstName)} ${e(lead.lastName)}, ${e(lead.company)} (${e(lead.companySize)})`;
  const facts = [
    `*Services:* ${e(services)}`,
    `*Timeline:* ${e(timelineLabel(lead) ?? "Not given")}`,
    `*Email:* ${e(lead.email)}`,
    lead.nda ? "*NDA:* requested before the call" : null,
    lead.calculator ? `*Calculator:* ${e(lead.calculator)}` : null,
    `*Source:* ${e([lead.attribution.utmSource, lead.attribution.utmCampaign].filter(Boolean).join(" / ") || "direct")}`,
  ].filter(Boolean);

  return {
    text: headline,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `*${headline}*` } },
      { type: "section", text: { type: "mrkdwn", text: facts.join("\n") } },
      ...(lead.details
        ? [
            {
              type: "section",
              text: { type: "mrkdwn", text: `>${e(lead.details).slice(0, 2800).replace(/\n/g, "\n>")}` },
            },
          ]
        : []),
    ],
  };
}

export async function sendToSlack(lead: Lead, webhookUrl: string, fetchImpl: Fetch = fetch): Promise<void> {
  await post("slack", fetchImpl, webhookUrl, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(slackPayload(lead)),
  });
}
