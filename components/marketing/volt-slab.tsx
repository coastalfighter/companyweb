import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prefetchFor, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export interface VoltSlabProps {
  heading: string;
  subheading?: string;
  primary: { label: string; href: string };
  /** Secondary text link. Defaults to "Email us instead" (mailto). */
  secondary?: { label: string; href: string } | false;
  /** e.g. "Next available: Tomorrow, 10:00 AM EST". From the Cal.com API (M1d); omitted until real. */
  availability?: string;
  className?: string;
}

/**
 * The closing call to action (docs/blueprint/03-page-blueprints.md, 1.13).
 *
 * Revised (brand color ratio, A1.4): an Ink slab lit from its top edge, not a lime
 * field. A full lime block took 32–47% of a screen on every page, against the brand's
 * 5–10% accent ratio, and it out-shouted its own button. Now lime is the edge light,
 * a faint grid, one glow and the primary button, so the CTA is the brightest thing on
 * screen.
 */
export function VoltSlab({
  heading,
  subheading,
  primary,
  secondary = { label: "Email us instead", href: `mailto:${siteConfig.email}` },
  availability,
  className,
}: VoltSlabProps) {
  return (
    <section
      aria-labelledby="volt-slab-title"
      data-cta-zone
      className={cn("px-(--gutter) py-(--section-y)", className)}
    >
      <div className="volt-slab relative isolate mx-auto max-w-(--container-wide) overflow-hidden rounded-2xl border border-volt-500/25 bg-ink-900 px-6 py-16 text-center text-fg shadow-e3 sm:px-12 md:py-24">
        <div aria-hidden className="volt-slab-grid pointer-events-none absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="volt-slab-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
        />
        <div aria-hidden className="volt-slab-edge pointer-events-none absolute inset-x-0 top-0 h-px" />
        <div aria-hidden className="volt-slab-sweep pointer-events-none absolute inset-x-0 top-0 h-px" />

        <h2
          id="volt-slab-title"
          className="mx-auto max-w-[18ch] font-display text-display-lg font-semibold text-fg"
        >
          {heading}
        </h2>
        {subheading ? (
          <p className="mx-auto mt-6 max-w-[52ch] text-body-lg text-fg-muted">{subheading}</p>
        ) : null}

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Button asChild size="lg" iconRight="arrow" className="max-sm:w-full" data-magnetic="">
            <Link href={primary.href} prefetch={prefetchFor(primary.href)}>
              {primary.label}
            </Link>
          </Button>
          {secondary ? (
            <a
              href={secondary.href}
              className="text-body font-medium text-fg underline decoration-volt-500/50 underline-offset-4 transition-colors hover:decoration-volt-500"
            >
              {secondary.label}
            </a>
          ) : null}
        </div>

        {availability ? <p className="mt-6 text-caption text-fg-subtle">{availability}</p> : null}
      </div>
    </section>
  );
}
