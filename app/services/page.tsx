import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection, homeFaqs } from "@/components/home/faq-section";
import { VoltSlab } from "@/components/marketing/volt-slab";
import {
  Bundles,
  EngagementModels,
  ServicesIndex,
  SharedStandards,
} from "@/components/services/hub-sections";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ctas, prefetchFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Five specialist teams with one standard of delivery: web development, recruitment, virtual assistance, accounting and legal operations support.",
  alternates: { canonical: "/services" },
};

const hubFaqs = homeFaqs.filter((faq) => ["pricing", "contract", "tools"].includes(faq.id));

/** Services hub (docs/blueprint/03-page-blueprints.md, section 2). */
export default function ServicesPage() {
  return (
    <>
      <section aria-labelledby="services-hub-title" className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto flex max-w-(--container-content) flex-col gap-6 px-(--gutter)">
          <Eyebrow>Services</Eyebrow>
          <h1 id="services-hub-title" className="max-w-[18ch] font-display text-h1 font-semibold text-fg">
            The work that keeps a company running. Handled.
          </h1>
          <p className="max-w-[56ch] text-body-lg text-fg-muted">
            Five specialist teams, one standard of delivery. Start with the function that&apos;s hurting most;
            add the others when you&apos;re ready.
          </p>
          <div className="mt-4">
            <Button asChild size="lg" iconRight="arrow">
              <Link href={ctas.primary.href} prefetch={prefetchFor(ctas.primary.href)}>
                Not sure where to start? Book a call
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <ServicesIndex />
      <SharedStandards />
      <Bundles />
      <EngagementModels />
      <FaqSection items={hubFaqs} title="Before you ask." />
      <VoltSlab
        heading="Tell us what's hurting. We'll tell you where to start."
        subheading="20 minutes. No slides. A scoped plan whether you hire us or not."
        primary={{ label: ctas.primary.label, href: ctas.primary.href }}
      />
    </>
  );
}
