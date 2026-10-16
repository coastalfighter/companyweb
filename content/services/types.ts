import { type FaqItem } from "@/content/faq";
import { type ProofStat, type Testimonial } from "@/content/proof";
import { type ServiceSlug } from "@/lib/services";

/**
 * Service page content (docs/blueprint/03-page-blueprints.md, "Service detail
 * template" S1–S12). Shaped like the planned Sanity `service` document
 * (docs/blueprint/09-tech-stack.md, I2) so moving it into the CMS is a mechanical
 * import, not a redesign.
 */
export interface ServiceContent {
  slug: ServiceSlug;
  seo: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    /** Primary CTA label, e.g. "Book a web scoping call". */
    cta: string;
  };
  /**
   * S2 outcome metrics. VERIFIED ONLY: the section is not rendered while empty.
   * Candidate figures from the blueprint are listed in README "Proof to supply".
   */
  metrics: readonly ProofStat[];
  /** S3: exactly six scope items. */
  scope: readonly { title: string; body: string }[];
  /** S4: honest limits. */
  limits: readonly string[];
  /** Optional regulatory note shown with the limits (legal, accounting). */
  limitsNote?: string;
  /** S5 */
  timeline: {
    label: string;
    steps: readonly { when: string; title: string; body: string }[];
  };
  /** S6: tool names (text, no third-party logos). */
  tools: readonly string[];
  /** S7: exactly three roles. */
  roles: readonly { title: string; detail: string }[];
  /** S8: [commitment, standard] pairs. Commitments; listed in README "Claims to confirm". */
  slas: readonly (readonly [string, string])[];
  /** S9: VERIFIED ONLY. Not rendered while empty/null. */
  proof: { caseStudy: { summary: string; href: string } | null; testimonial: Testimonial | null };
  /** S10 */
  faqs: readonly FaqItem[];
  /** S11: two related services (never the page's own). */
  related: readonly [ServiceSlug, ServiceSlug];
  /** S12 closing slab heading. */
  slab: string;
}
