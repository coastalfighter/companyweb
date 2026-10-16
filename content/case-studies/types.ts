import { type ServiceSlug } from "@/lib/services";

/**
 * A published case study (docs/blueprint/03-page-blueprints.md, 10B: T1–T9).
 * Shaped like the planned Sanity `caseStudy` document, so moving to the CMS is
 * an import, not a redesign.
 */

export interface CaseStudyStat {
  /** e.g. "15 → 5", "$212K", "0". Before → after values use the arrow. */
  value: string;
  label: string;
}

export interface CaseStudyResult {
  label: string;
  before?: string;
  after: string;
  /** e.g. "net of Akrostech fees". */
  note?: string;
}

export interface CaseStudyStep {
  title: string;
  body: string;
}

export interface CaseStudyQuote {
  text: string;
  name: string;
  title: string;
  /** Path under /public; real, permissioned photo only. */
  photo?: string;
}

export interface CaseStudy {
  slug: string;
  client: string;
  /** Monochrome SVG under /public using currentColor; omitted renders the name. */
  logo?: string;
  services: readonly ServiceSlug[];
  /** Filter value and eyebrow label, e.g. "Healthcare". */
  industry: string;
  /** H1, outcome-first. */
  title: string;
  oneLiner: string;
  /** T1 hero stats, 2–3. */
  stats: readonly CaseStudyStat[];
  snapshot: {
    size: string;
    team: string;
    duration: string;
    tools: readonly string[];
  };
  /** T3, 150–250 words as paragraphs. */
  situation: readonly string[];
  /** T4 intro (optional) and numbered steps. */
  approachIntro?: string;
  approach: readonly CaseStudyStep[];
  /** T5, 3–4 results. */
  results: readonly CaseStudyResult[];
  quote: CaseStudyQuote | null;
  /** T7 */
  whatsNext: string;
  /** ISO date the study went live. */
  publishedAt: string;
  /** Where the client's written permission to publish is filed (not rendered). */
  permission: string;
}
