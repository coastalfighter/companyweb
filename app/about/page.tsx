import type { Metadata } from "next";
import {
  AboutHero,
  AboutTeasers,
  LeadershipSection,
  NumbersBand,
  OriginSection,
  PrinciplesSection,
  WhereWeWork,
} from "@/components/about/about-sections";
import { VoltSlab } from "@/components/marketing/volt-slab";
import { JsonLd } from "@/lib/json-ld";
import { ctas, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Akrostech exists, the rules we run by, and what we hold ourselves to: an operations team that shows its work, every day.",
  alternates: { canonical: "/about" },
};

/** About (docs/blueprint/03-page-blueprints.md, section 8). */
export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@type": "AboutPage",
          name: `About ${siteConfig.name}`,
          url: `${siteConfig.url}/about`,
          about: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        }}
      />
      <AboutHero />
      <OriginSection />
      <PrinciplesSection />
      <NumbersBand />
      <LeadershipSection />
      <WhereWeWork />
      <AboutTeasers />
      <VoltSlab
        heading="Let's see if we're a fit. 20 minutes, no slides."
        primary={{ label: ctas.primary.label, href: ctas.primary.href }}
      />
    </>
  );
}
