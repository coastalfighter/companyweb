/**
 * Site-wide configuration. Values marked VERIFY must be confirmed by
 * Akrostech before launch (see docs/blueprint/README.md, "Honesty gates").
 */
export const siteConfig = {
  name: "Akrostech",
  tagline: "The operations team behind growing companies.",
  description:
    "Akrostech is the operations team behind growing companies: engineering, hiring, admin, finance and legal work, delivered by dedicated specialists on timelines you can audit.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@akrosstech.com",
  /** VERIFY: replace once the response-time SLA is confirmed. */
  replySla: "4 business hours",
  /** VERIFY: confirm staffed hours. Shown in the mobile menu. */
  hours: "Mon–Fri",
} as const;

/**
 * Routes that exist in the current build. Links to anything else are rendered
 * with prefetching off, so visitors don't trigger 404 prefetches for pages that
 * later milestones will add. Each milestone adds its routes here (and they then
 * appear in the sitemap automatically).
 */
export const liveRoutes = [
  "/",
  "/services",
  "/services/web-development",
  "/services/recruitment",
  "/services/virtual-assistance",
  "/services/accounting",
  "/services/legal",
  "/contact",
  "/about",
  "/how-it-works",
] as const;

const liveRouteSet: ReadonlySet<string> = new Set(liveRoutes);

export function isLiveRoute(href: string): boolean {
  return liveRouteSet.has(href.split(/[?#]/)[0] ?? href);
}

/** `prefetch` prop for next/link: default behavior for live routes, off otherwise. */
export function prefetchFor(href: string): false | undefined {
  return isLiveRoute(href) ? undefined : false;
}

export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: readonly NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
];

export interface NavGroup {
  title: string;
  items: readonly NavItem[];
}

/**
 * Footer columns (docs/blueprint/02-sitemap.md, B2.5). Phase 2 destinations
 * (Field notes, Guides, Status page, Client login) are added when they exist,
 * never as dead links.
 */
export const footerNav: readonly NavGroup[] = [
  {
    title: "Services",
    items: [
      { label: "Web Development", href: "/services/web-development" },
      { label: "Recruitment", href: "/services/recruitment" },
      { label: "Virtual Assistance", href: "/services/virtual-assistance" },
      { label: "Accounting", href: "/services/accounting" },
      { label: "Legal", href: "/services/legal" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Proof",
    items: [
      { label: "Case studies", href: "/work" },
      { label: "Security & trust", href: "/about/security" },
    ],
  },
  {
    title: "Resources",
    items: [{ label: "Cost calculator", href: "/resources/back-office-calculator" }],
  },
];

export const legalNav: readonly NavItem[] = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Cookies", href: "/legal/cookies" },
  { label: "DPA", href: "/legal/dpa" },
  { label: "Accessibility", href: "/legal/accessibility" },
];

/**
 * Certifications and badges shown in the footer. Empty until Akrostech confirms
 * which it actually holds (docs/blueprint/05-trust-credibility.md, E4). The footer
 * row only renders when this list is non-empty.
 */
export const trustBadges: readonly { label: string; href?: string }[] = [];

/** Social profiles. Add real URLs; entries without one are not rendered. */
export const socialLinks: readonly { label: "LinkedIn" | "GitHub"; href: string }[] = [];

export const ctas = {
  primary: { label: "Book a 20-minute call", short: "Book a call", href: "/contact" },
  secondary: {
    label: "See what it would cost",
    short: "Estimate savings",
    href: "/resources/back-office-calculator",
  },
} as const;
