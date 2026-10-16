/**
 * VERIFIED PROOF ONLY.
 *
 * Everything in this file is shown on the live site. Add an entry only when it is
 * real, documented and (for clients) permissioned in writing. Sections that depend
 * on an empty list are not rendered at all (docs/blueprint/README.md, honesty gates;
 * FTC 16 CFR Part 465). Illustrative data for design review lives in ./samples.ts and
 * is only rendered on /design-system/home-preview.
 */

export interface ClientLogo {
  name: string;
  /** Path under /public, monochrome SVG using currentColor. */
  src: string;
  /** Width/height ratio, for optical sizing. */
  aspect: number;
  /** Where the written permission is filed (not rendered). */
  permission: string;
}

export interface ProofStat {
  value: string;
  /** Rendered in lime after the value, e.g. "%" or "m". */
  unit?: string;
  label: string;
  /** Data source + period (not rendered; required for the methodology page). */
  source: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  /** e.g. "Healthcare services · 380 employees" */
  context: string;
  services: readonly string[];
  /** Optional link to a third-party review (Clutch, G2). */
  verifiedUrl?: string;
  permission: string;
}

export interface CaseStudyTeaser {
  eyebrow: string;
  title: string;
  results: readonly string[];
  href: string;
}

export interface Proof {
  /** Specific count shown above the logos, e.g. "Trusted by operators at 140+ companies in 11 countries". */
  logoBarLabel: string | null;
  clientLogos: readonly ClientLogo[];
  stats: readonly ProofStat[];
  /** e.g. "Figures from Akrostech client data, Jan–Sep 2026." */
  statsFootnote: string | null;
  testimonials: readonly Testimonial[];
  featuredCaseStudy: CaseStudyTeaser | null;
  certifications: {
    soc2Type2: boolean;
    iso27001: boolean;
  };
}

export const proof: Proof = {
  logoBarLabel: null,
  clientLogos: [],
  stats: [],
  statsFootnote: null,
  testimonials: [],
  featuredCaseStudy: null,
  certifications: {
    soc2Type2: false,
    iso27001: false,
  },
};

/** The logo bar only renders with enough logos to look real (blueprint 1.2). */
export const MIN_LOGOS_FOR_BAR = 6;
/** Below this many logos, show a static row instead of a marquee. */
export const MIN_LOGOS_FOR_MARQUEE = 8;
