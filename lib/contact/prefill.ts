import { bundles } from "@/lib/services";
import { SERVICE_OPTIONS, type ServiceOption } from "./schema";

export interface ContactPrefill {
  services: ServiceOption[];
  nda: boolean;
  details: string;
}

export const SECURITY_TOPIC_DETAILS =
  "We'd like to review your security documentation (DPA, policies, sub-processors) before a call.";

const valid = new Set<string>(SERVICE_OPTIONS.map((s) => s.value));

/**
 * Turns links like /contact?service=accounting, ?bundle=finance-backbone or
 * ?topic=security into form prefills. Unknown values are ignored.
 */
export function prefillFromSearch(params: URLSearchParams): ContactPrefill {
  const services = new Set<ServiceOption>();
  for (const service of params.getAll("service"))
    if (valid.has(service)) services.add(service as ServiceOption);
  const bundle = bundles.find((b) => b.id === params.get("bundle"));
  bundle?.services.forEach((s) => services.add(s));
  const security = params.get("topic") === "security";
  return { services: [...services], nda: security, details: security ? SECURITY_TOPIC_DETAILS : "" };
}
