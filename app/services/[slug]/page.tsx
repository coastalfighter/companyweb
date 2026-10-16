import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqSection } from "@/components/home/faq-section";
import { VoltSlab } from "@/components/marketing/volt-slab";
import { ServiceHero } from "@/components/services/service-hero";
import {
  RelatedServices,
  ServiceMetrics,
  ServiceProof,
  ServiceScope,
  ServiceTeamAndSlas,
  ServiceTimeline,
  ServiceTools,
} from "@/components/services/service-sections";
import { getServiceContent, serviceContent } from "@/content/services";
import { JsonLd } from "@/lib/json-ld";
import { services } from "@/lib/services";
import { ctas, siteConfig } from "@/lib/site";

/**
 * The whole route must be static output. Besides guarding against request-time work,
 * this makes Next.js finish rendering unknown slugs before responding, so they get a
 * real 404 status on the first request instead of a 200 streaming shell (soft 404).
 */
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return Object.keys(serviceContent).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const content = getServiceContent(slug);
  if (!content) return {};
  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical: `/services/${slug}` },
    openGraph: { title: `${content.seo.title} · ${siteConfig.name}`, description: content.seo.description },
  };
}

/** Service detail template S1–S12 (docs/blueprint/03-page-blueprints.md). */
export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const content = getServiceContent(slug);
  if (!content) notFound();
  const service = services.find((s) => s.slug === content.slug)!;

  return (
    <>
      <JsonLd
        data={{
          "@type": "Service",
          name: service.name,
          serviceType: service.name,
          description: content.seo.description,
          url: `${siteConfig.url}${service.href}`,
          provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        }}
      />
      <ServiceHero content={content} />
      <ServiceMetrics content={content} />
      <ServiceScope content={content} name={service.name} />
      <ServiceTimeline content={content} />
      <ServiceTools content={content} />
      <ServiceTeamAndSlas content={content} />
      <ServiceProof content={content} />
      <FaqSection items={content.faqs} title={`${service.shortName} questions, answered.`} />
      <RelatedServices content={content} />
      <VoltSlab
        heading={content.slab}
        subheading="20 minutes with a lead, not a salesperson. You'll leave with a scoped plan."
        primary={{ label: content.hero.cta, href: `${ctas.primary.href}?service=${content.slug}` }}
      />
    </>
  );
}
