/**
 * The five service verticals. Copy from docs/blueprint/03-page-blueprints.md
 * (Services hub 2.2 and the mega-menu spec in 02-sitemap.md B2.1).
 * Service pages (M1c) will read the rest of their content from the CMS.
 */
export type ServiceSlug = "web-development" | "recruitment" | "virtual-assistance" | "accounting" | "legal";

export interface Service {
  slug: ServiceSlug;
  number: string;
  name: string;
  /** Short label for tight spaces (mobile menu, chips). */
  shortName: string;
  /** One-line outcome, as used in the mega-menu and services index. */
  outcome: string;
  /** Homepage bento outcome (blueprint 1.4). */
  pitch: string;
  /** Three scope chips for the homepage card. */
  chips: readonly [string, string, string];
  /** Homepage card link label, e.g. "Explore web". */
  explore: string;
  href: `/services/${ServiceSlug}`;
}

export const services: readonly Service[] = [
  {
    slug: "web-development",
    number: "01",
    name: "Web Development",
    shortName: "Web Development",
    outcome: "Sites that load in under a second and convert.",
    pitch: "Websites that load in under a second and actually convert.",
    chips: ["Next.js", "Webflow", "WordPress rescue"],
    explore: "Explore web",
    href: "/services/web-development",
  },
  {
    slug: "recruitment",
    number: "02",
    name: "Recruitment Assistance",
    shortName: "Recruitment",
    outcome: "Vetted shortlists in 10 business days.",
    pitch: "Shortlists of vetted candidates in 10 business days, not 10 weeks.",
    chips: ["Sourcing", "Screening", "Scheduling"],
    explore: "Explore recruitment",
    href: "/services/recruitment",
  },
  {
    slug: "virtual-assistance",
    number: "03",
    name: "Virtual Assistance",
    shortName: "Virtual Assistance",
    outcome: "A trained operator who clears the queue daily.",
    pitch: "A trained operator who clears your team's queue every day.",
    chips: ["Inbox", "Calendar", "CRM hygiene"],
    explore: "Explore assistance",
    href: "/services/virtual-assistance",
  },
  {
    slug: "accounting",
    number: "04",
    name: "Accounting Assistance",
    shortName: "Accounting",
    outcome: "Books closed by business day 5.",
    pitch: "Books closed by business day 5. Every month.",
    chips: ["Bookkeeping", "Payroll", "AP/AR"],
    explore: "Explore accounting",
    href: "/services/accounting",
  },
  {
    slug: "legal",
    number: "05",
    name: "Legal Assistance",
    shortName: "Legal",
    outcome: "Contracts tracked, redlined, renewed on time.",
    pitch: "Contracts tracked, redlined and renewed on time, under your counsel's direction.",
    chips: ["CLM", "NDAs", "Compliance calendars"],
    explore: "Explore legal ops",
    href: "/services/legal",
  },
];

export const servicesHubHref = "/services";
