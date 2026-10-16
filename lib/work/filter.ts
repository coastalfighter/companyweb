import { type CaseStudy } from "@/content/case-studies";
import { services, type ServiceSlug } from "@/lib/services";

export interface WorkFilter {
  service: ServiceSlug | null;
  industry: string | null;
}

export const NO_FILTER: WorkFilter = { service: null, industry: null };

const serviceSlugs = new Set<string>(services.map((s) => s.slug));

/**
 * Reads `?service=` and `?industry=` (blueprint 10A). Unknown services and
 * industries no study has are ignored, so a stale shared link shows everything
 * rather than an empty page.
 */
export function parseWorkFilter(params: URLSearchParams, studies: readonly CaseStudy[]): WorkFilter {
  const service = params.get("service");
  const industry = params.get("industry");
  return {
    service: service && serviceSlugs.has(service) ? (service as ServiceSlug) : null,
    industry: industry && studies.some((s) => s.industry === industry) ? industry : null,
  };
}

export function applyWorkFilter(studies: readonly CaseStudy[], filter: WorkFilter): CaseStudy[] {
  return studies.filter(
    (study) =>
      (!filter.service || study.services.includes(filter.service)) &&
      (!filter.industry || study.industry === filter.industry),
  );
}

/** The index URL for a filter, keeping parameters in a stable order. */
export function workFilterHref(basePath: string, filter: WorkFilter): string {
  const params = new URLSearchParams();
  if (filter.service) params.set("service", filter.service);
  if (filter.industry) params.set("industry", filter.industry);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
