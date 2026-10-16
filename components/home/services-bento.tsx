import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { ServiceGlyph } from "@/components/marketing/service-glyph";
import { SectionHeader } from "@/components/marketing/section-header";
import { Badge } from "@/components/ui/badge";
import { services, servicesHubHref, type Service } from "@/lib/services";
import { prefetchFor } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ServiceVignette } from "./vignettes";

/** Bento placement on the 12-col grid (blueprint 1.4). */
const placement: Record<Service["slug"], string> = {
  "web-development": "md:col-span-2 lg:col-span-7",
  recruitment: "lg:col-span-5",
  "virtual-assistance": "lg:col-span-4",
  accounting: "lg:col-span-4",
  legal: "lg:col-span-4",
};

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <article
      data-reveal
      style={{ "--reveal-i": index % 3 } as React.CSSProperties}
      className={cn(
        "surface depth-in vig-card group relative flex flex-col gap-6 rounded-lg border border-line bg-surface-1 p-6 shadow-e1 md:p-8",
        "transition-[transform,border-color,box-shadow] duration-150 ease-out-expo",
        "hover:-translate-y-0.5 hover:border-volt-500/35 hover:shadow-e2",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
        placement[service.slug],
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <ServiceGlyph slug={service.slug} />
        <span className="font-mono text-micro text-fg-subtle">{service.number}</span>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-h4 font-semibold text-fg">
          <Link
            href={service.href}
            prefetch={prefetchFor(service.href)}
            className="outline-none after:absolute after:inset-0 after:rounded-lg"
          >
            {service.name}
          </Link>
        </h3>
        <p className="max-w-[44ch] text-body-sm text-fg-muted">{service.pitch}</p>
      </div>
      <ul className="flex flex-wrap gap-2" aria-label={`${service.name} scope`}>
        {service.chips.map((chip) => (
          <li key={chip}>
            <Badge>{chip}</Badge>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <ServiceVignette slug={service.slug} />
      </div>
      <span
        aria-hidden
        className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
      >
        {service.explore}
        <ArrowRightIcon className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]" />
      </span>
    </article>
  );
}

/** Homepage 1.4: "Five teams. One contract. Zero babysitting." */
export function ServicesBento() {
  return (
    <section aria-labelledby="services-title" className="py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader
          id="services-title"
          eyebrow="What we run"
          title="Five teams. One contract. Zero babysitting."
          intro="Use one service or all five. Each is run by a dedicated lead who already knows the tools you use."
          aside={
            <Link
              href={servicesHubHref}
              prefetch={prefetchFor(servicesHubHref)}
              className="link-sweep group inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
            >
              Compare all services
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
              />
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
