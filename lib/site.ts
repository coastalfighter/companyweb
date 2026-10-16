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
} as const;

/**
 * Routes that exist in the current build. Links to anything else are rendered
 * with prefetching off, so visitors don't trigger 404 prefetches for pages that
 * later milestones will add. Each milestone adds its routes here (and they then
 * appear in the sitemap automatically).
 */
export const liveRoutes = ["/"] as const;

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

export const ctas = {
  primary: { label: "Book a 20-minute call", short: "Book a call", href: "/contact" },
  secondary: {
    label: "See what it would cost",
    short: "Estimate savings",
    href: "/resources/back-office-calculator",
  },
} as const;
