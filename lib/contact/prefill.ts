import { bundles } from "@/lib/services";
import { SERVICE_OPTIONS, type ServiceOption } from "./schema";

export interface ContactPrefill {
  services: ServiceOption[];
  nda: boolean;
  details: string;
}

export const SECURITY_TOPIC_DETAILS =
  "We'd like to review your security documentation (DPA, policies, sub-processors) before a call.";

export const REFERENCE_TOPIC_DETAILS =
  "We'd like to speak with a current client as a reference before deciding.";

const valid = new Set<string>(SERVICE_OPTIONS.map((s) => s.value));

/**
 * Turns links like /contact?service=accounting, ?bundle=finance-backbone or
 * ?topic=security / ?topic=reference into form prefills. Unknown values are ignored.
 */
export function prefillFromSearch(params: URLSearchParams): ContactPrefill {
  const services = new Set<ServiceOption>();
  for (const service of params.getAll("service"))
    if (valid.has(service)) services.add(service as ServiceOption);
  const bundle = bundles.find((b) => b.id === params.get("bundle"));
  bundle?.services.forEach((s) => services.add(s));
  const topic = params.get("topic");
  const security = topic === "security";
  const details = security ? SECURITY_TOPIC_DETAILS : topic === "reference" ? REFERENCE_TOPIC_DETAILS : "";
  return { services: [...services], nda: security, details };
}
