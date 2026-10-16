import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { type CaseStudy } from "@/content/case-studies";
import { services } from "@/lib/services";
import { prefetchFor } from "@/lib/site";
import { cn } from "@/lib/utils";

export type CaseStudyCardVariant = "featured" | "grid" | "mini";

export interface CaseStudyCardProps {
  study: CaseStudy;
  href: string;
  variant?: CaseStudyCardVariant;
  /** Heading level inside the card (h2 on the index, h3 under a section heading). */
  as?: "h2" | "h3";
}

export function serviceNames(study: CaseStudy): string[] {
  return study.services.map((slug) => services.find((s) => s.slug === slug)?.shortName ?? slug);
}

/** Client logo (monochrome SVG) or, until one is supplied, the client name as a wordmark. */
export function ClientMark({ study, className }: { study: CaseStudy; className?: string }) {
  if (study.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- monochrome SVG logo, height fixed
      <img src={study.logo} alt={study.client} height={24} className={cn("h-6 w-auto", className)} />
    );
  }
  return (
    <span className={cn("text-body-sm font-semibold tracking-tight text-fg", className)}>{study.client}</span>
  );
}

/**
 * Case study card (docs/blueprint/07-component-library.md, G2.3). The whole card is
 * one link (the headline's ::after covers it); hover scales the media, tints the
 * border lime and nudges the arrow.
 */
export function CaseStudyCard({ study, href, variant = "grid", as: Heading = "h3" }: CaseStudyCardProps) {
  const featured = variant === "featured";
  const mini = variant === "mini";

  return (
    <article
      data-reveal="card"
      className={cn(
        "surface group relative overflow-hidden rounded-xl border border-line bg-surface-1 shadow-e1 transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus hover:border-volt-500/35",
        featured ? "grid lg:grid-cols-2" : "flex flex-col",
      )}
    >
      {mini ? null : (
        <div
          aria-hidden
          className={cn("media-hover bg-ink-900", featured ? "min-h-56 lg:min-h-full" : "aspect-[16/10]")}
        >
          <div className="media-inner absolute inset-0">
            <div className="absolute inset-0 bg-(image:--glow-volt)" />
            <div className="grid-overlay absolute inset-0" />
            <span className="tabular absolute bottom-5 left-6 font-display text-display-lg font-semibold text-fg/90">
              {study.stats[0]?.value}
            </span>
          </div>
          <span className="media-label">Read the case study</span>
        </div>
      )}
      <div
        className={cn("flex flex-1 flex-col gap-5", mini ? "p-5" : featured ? "p-6 md:p-10" : "p-6 md:p-8")}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ClientMark study={study} />
          <ul className="flex flex-wrap gap-2">
            {serviceNames(study).map((name) => (
              <li key={name}>
                <Badge>{name}</Badge>
              </li>
            ))}
          </ul>
        </div>
        <Heading
          className={cn(
            "font-display font-semibold text-fg",
            featured ? "text-h3" : mini ? "text-h5" : "text-h4",
          )}
        >
          <Link
            href={href}
            prefetch={prefetchFor(href)}
            className="outline-none after:absolute after:inset-0"
          >
            {study.title}
          </Link>
        </Heading>
        {mini ? null : (
          <ul className="flex flex-wrap gap-2">
            {study.stats.slice(0, 3).map((stat) => (
              <li
                key={stat.label}
                className="rounded-xs border border-line px-2 py-1 font-mono text-caption text-fg-muted"
              >
                <span className="text-fg">{stat.value}</span> {stat.label}
              </li>
            ))}
          </ul>
        )}
        <span
          aria-hidden
          className="mt-auto inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
        >
          Read the story
          <ArrowRightIcon className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]" />
        </span>
      </div>
    </article>
  );
}
