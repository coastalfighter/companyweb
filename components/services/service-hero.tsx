import Link from "next/link";
import { ServiceVignette } from "@/components/home/vignettes";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { type ServiceContent } from "@/content/services";
import { services, servicesHubHref } from "@/lib/services";
import { ctas, prefetchFor } from "@/lib/site";

/** S1: copy cols 1–6, vignette cols 7–12; the vignette plays once on load, then idles. */
export function ServiceHero({ content }: { content: ServiceContent }) {
  const service = services.find((s) => s.slug === content.slug)!;
  return (
    <section
      aria-labelledby="service-title"
      className="grain isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24"
    >
      <div aria-hidden className="grid-overlay pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <div className="mx-auto grid max-w-(--container-content) items-center gap-12 px-(--gutter) lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <Breadcrumb
            items={[
              { label: "Services", href: servicesHubHref },
              { label: service.name, href: service.href },
            ]}
          />
          <Eyebrow>{content.hero.eyebrow}</Eyebrow>
          <h1 id="service-title" className="font-display text-h1 font-semibold text-fg">
            {content.hero.title}
          </h1>
          <p className="max-w-[56ch] text-body-lg text-fg-muted">{content.hero.subtitle}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" iconRight="arrow" className="max-sm:h-14">
              <Link
                href={`${ctas.primary.href}?service=${content.slug}`}
                prefetch={prefetchFor(ctas.primary.href)}
              >
                {content.hero.cta}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="max-sm:h-14">
              <Link href={`${servicesHubHref}#engagement-models`}>See pricing models</Link>
            </Button>
          </div>
        </div>
        <div className="vig-autoplay lg:col-span-5 lg:col-start-8">
          <div className="rounded-xl border border-line bg-surface-1 p-4 shadow-e4 sm:p-6">
            <ServiceVignette slug={content.slug} />
          </div>
        </div>
      </div>
    </section>
  );
}
