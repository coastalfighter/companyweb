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
 * The closing call to action: the one large lime block per page
 * (docs/blueprint/03-page-blueprints.md, 1.13). Flat lime, Ink text, with a faint
 * Ink grid and a single light sweep as it scrolls into view.
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
      <div className="volt-slab relative isolate mx-auto max-w-(--container-wide) overflow-hidden rounded-2xl bg-volt-500 px-6 py-16 text-center text-ink-950 sm:px-12 md:py-24">
        <div aria-hidden className="volt-slab-grid pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden className="volt-slab-sweep pointer-events-none absolute inset-0 -z-10" />

        <h2
          id="volt-slab-title"
          className="mx-auto max-w-[18ch] font-display text-display-lg font-semibold text-ink-950"
        >
          {heading}
        </h2>
        {subheading ? (
          <p className="mx-auto mt-6 max-w-[52ch] text-body-lg text-ink-950/80">{subheading}</p>
        ) : null}

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Button asChild variant="primary-ink" size="lg" iconRight="arrow" className="max-sm:w-full">
            <Link href={primary.href} prefetch={prefetchFor(primary.href)}>
              {primary.label}
            </Link>
          </Button>
          {secondary ? (
            <a
              href={secondary.href}
              className="text-body font-medium text-ink-950 underline decoration-ink-950/40 underline-offset-4 transition-colors hover:decoration-ink-950 focus-visible:outline-ink-950"
            >
              {secondary.label}
            </a>
          ) : null}
        </div>

        {availability ? <p className="mt-6 text-caption text-ink-950/70">{availability}</p> : null}
      </div>
    </section>
  );
}
