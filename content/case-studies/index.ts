import { type CaseStudy } from "./types";

export type { CaseStudy, CaseStudyQuote, CaseStudyResult, CaseStudyStat, CaseStudyStep } from "./types";

/**
 * PUBLISHED CASE STUDIES ONLY.
 *
 * Add a study here only with the client's written permission on file (record
 * where in `permission`). Every number must come from client data you can show
 * an auditor. Each entry becomes a live page at /work/<slug> and an index card.
 * The fictional Tidemark Health study from the blueprint (10C) lives in
 * ../samples.ts and is only rendered under /design-system/work-preview.
 */
export const caseStudies: readonly CaseStudy[] = [];

export function getCaseStudy(slug: string, from: readonly CaseStudy[] = caseStudies): CaseStudy | undefined {
  return from.find((study) => study.slug === slug);
}

/** Newest first. */
export function sortCaseStudies(studies: readonly CaseStudy[]): CaseStudy[] {
  return [...studies].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * Up to `limit` other studies, same service first, then same industry (T8).
 * Studies sharing neither are not "related" and are left out.
 */
export function relatedCaseStudies(
  study: CaseStudy,
  from: readonly CaseStudy[] = caseStudies,
  limit = 2,
): CaseStudy[] {
  const score = (other: CaseStudy) =>
    (other.services.some((s) => study.services.includes(s)) ? 2 : 0) +
    (other.industry === study.industry ? 1 : 0);
  return sortCaseStudies(from)
    .filter((other) => other.slug !== study.slug && score(other) > 0)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

/** Distinct industries, alphabetical: the options of the index's industry filter. */
export function industriesOf(studies: readonly CaseStudy[]): string[] {
  return [...new Set(studies.map((s) => s.industry))].sort((a, b) => a.localeCompare(b));
}
