import "server-only";
import { serviceLabels, timelineLabel, phoneE164, type Lead } from "../lead";
import { post, type Fetch } from "./http";

export interface HubspotConfig {
  portalId: string;
  formId: string;
  token: string;
}

/**
 * Submits the lead to a HubSpot form via the Forms API (secure endpoint, private
 * app token). HubSpot handles contact dedupe, attribution (hutk) and routing.
 * The HubSpot form must contain every field below; see README "Integrations".
 */
export function hubspotPayload(lead: Lead) {
  const contact = (name: string, value: string) => ({ objectTypeId: "0-1", name, value });
  const fields = [
    contact("firstname", lead.firstName),
    contact("lastname", lead.lastName),
    contact("email", lead.email),
    contact("company", lead.company),
    contact("message", lead.details),
    contact("akros_company_size", lead.companySize),
    contact("akros_services", serviceLabels(lead).join(";")),
    contact("akros_timeline", timelineLabel(lead) ?? ""),
    contact("akros_nda_requested", lead.nda ? "true" : "false"),
    contact("akros_utm_source", lead.attribution.utmSource ?? ""),
    contact("akros_utm_medium", lead.attribution.utmMedium ?? ""),
    contact("akros_utm_campaign", lead.attribution.utmCampaign ?? ""),
  ];
  if (lead.phone) fields.push(contact("phone", phoneE164(lead)));

  return {
    submittedAt: String(lead.submittedAt.getTime()),
    fields: fields.filter((f) => f.value !== ""),
    context: {
      ...(lead.attribution.hubspotUtk ? { hutk: lead.attribution.hubspotUtk } : {}),
      ...(lead.ip ? { ipAddress: lead.ip } : {}),
      pageUri: lead.attribution.landingPage ?? "",
      pageName: "Contact",
    },
  };
}

export async function sendToHubspot(
  lead: Lead,
  config: HubspotConfig,
  fetchImpl: Fetch = fetch,
): Promise<void> {
  const url = `https://api.hsforms.com/submissions/v3/integration/secure/submit/${encodeURIComponent(
    config.portalId,
  )}/${encodeURIComponent(config.formId)}`;
  await post("hubspot", fetchImpl, url, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.token}` },
    body: JSON.stringify(hubspotPayload(lead)),
  });
}
