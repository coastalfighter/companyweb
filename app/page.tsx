import { Hero } from "@/components/marketing/hero/hero";
import { VoltSlab } from "@/components/marketing/volt-slab";
import { ctas } from "@/lib/site";

/**
 * Homepage. Built so far: hero (1.1) and the closing CTA (1.13). Sections 1.2–1.12
 * (docs/blueprint/03-page-blueprints.md) are built in M1b.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <VoltSlab
        heading="Give us the work nobody wants. Keep the hours."
        subheading="20 minutes. No slides. You'll leave with a scoped plan, whether you hire us or not."
        primary={{ label: ctas.primary.label, href: ctas.primary.href }}
      />
    </>
  );
}
