import "server-only";
import { type ContactConfig } from "./config";
import { sendToHubspot } from "./integrations/hubspot";
import { type Fetch } from "./integrations/http";
import { sendConfirmation, sendLeadNotification } from "./integrations/resend";
import { sendToSlack } from "./integrations/slack";
import { leadSummary, type Lead } from "./lead";

export type Sink = "hubspot" | "slack" | "email" | "log";

export interface DeliveryResult {
  /** True when at least one sink holds the lead: the only condition for telling the visitor "sent". */
  delivered: boolean;
  sinks: Sink[];
  failed: { sink: Sink; error: string }[];
  confirmationSent: boolean;
}

interface Deps {
  fetch?: Fetch;
  log?: (message: string) => void;
}

/**
 * Hands a lead to every configured sink in parallel (blueprint F3.4).
 *
 * Policy: a lead is "delivered" only if at least one sink accepted it. With no sink
 * configured, development logs to the console; production refuses, so a missing key
 * can never silently drop leads behind a success screen. The visitor's confirmation
 * email is sent only after delivery, and its failure never fails the submission.
 */
export async function deliverLead(
  lead: Lead,
  config: ContactConfig,
  deps: Deps = {},
): Promise<DeliveryResult> {
  const fetchImpl = deps.fetch ?? fetch;
  // eslint-disable-next-line no-console -- the dev/E2E "log" sink is the console by design
  const log = deps.log ?? ((m: string) => console.info(m));

  const jobs: { sink: Sink; run: () => Promise<void> }[] = [];
  if (config.hubspot)
    jobs.push({ sink: "hubspot", run: () => sendToHubspot(lead, config.hubspot!, fetchImpl) });
  if (config.slackWebhookUrl)
    jobs.push({ sink: "slack", run: () => sendToSlack(lead, config.slackWebhookUrl!, fetchImpl) });
  if (config.resend?.notifyTo)
    jobs.push({ sink: "email", run: () => sendLeadNotification(lead, config.resend!, fetchImpl) });
  if (jobs.length === 0 && (config.logOnly || !config.production)) {
    jobs.push({
      sink: "log",
      run: async () => log(`[contact] New lead (no integrations configured)\n${leadSummary(lead)}`),
    });
  }

  const results = await Promise.allSettled(jobs.map((job) => job.run()));
  const sinks: Sink[] = [];
  const failed: DeliveryResult["failed"] = [];
  results.forEach((result, i) => {
    const { sink } = jobs[i]!;
    if (result.status === "fulfilled") sinks.push(sink);
    else
      failed.push({
        sink,
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      });
  });

  const delivered = sinks.length > 0;
  let confirmationSent = false;
  if (delivered && config.resend) {
    try {
      await sendConfirmation(lead, config.resend, fetchImpl);
      confirmationSent = true;
    } catch (error) {
      failed.push({
        sink: "email",
        error: `confirmation: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  return { delivered, sinks, failed, confirmationSent };
}
