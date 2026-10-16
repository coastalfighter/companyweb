import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection, homeFaqs } from "@/components/home/faq-section";
import { VoltSlab } from "@/components/marketing/volt-slab";
import { EngagementModels } from "@/components/services/hub-sections";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ctas, prefetchFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "How Akrostech prices: dedicated, pooled or project engagements, no setup fees, and a written quote within 48 hours of a 20-minute call.",
  alternates: { canonical: "/pricing" },
};

const pricingFaqs = homeFaqs.filter((faq) => ["pricing", "contract", "fit"].includes(faq.id));

/** /pricing (docs/blueprint/02-sitemap.md, P2): engagement models, no list prices. */
export default function PricingPage() {
  return (
    <>
      <section aria-labelledby="pricing-title" className="pt-32 md:pt-40">
        <div className="mx-auto flex max-w-(--container-content) flex-col gap-6 px-(--gutter)">
          <Eyebrow>Pricing</Eyebrow>
          <h1 id="pricing-title" className="max-w-[20ch] font-display text-h1 font-semibold text-fg">
            A written quote in 48 hours. No list prices to decode.
          </h1>
          <p className="max-w-[58ch] text-body-lg text-fg-muted">
            Every engagement is scoped to the work, so we don&apos;t publish a rate card that fits nobody.
            Tell us what you need in a 20-minute call; you&apos;ll have a fixed quote in writing two days
            later.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" iconRight="arrow" className="max-sm:w-full">
              <Link href={`${ctas.primary.href}?topic=quote`} prefetch={prefetchFor(ctas.primary.href)}>
                Get a quote
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="max-sm:w-full">
              <Link href={ctas.secondary.href} prefetch={prefetchFor(ctas.secondary.href)}>
                {ctas.secondary.label}
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <EngagementModels />
      <FaqSection items={pricingFaqs} title="Pricing questions." />
      <VoltSlab
        heading="Know the number before you commit to anything."
        primary={{ label: ctas.primary.label, href: ctas.primary.href }}
      />
    </>
  );
}
