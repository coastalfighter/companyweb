import { CalculatorTeaser } from "@/components/home/calculator-teaser";
import { ComparisonSection } from "@/components/home/comparison-section";
import { FaqSection } from "@/components/home/faq-section";
import { HowItWorksSummary } from "@/components/home/how-it-works-summary";
import { ProblemSection } from "@/components/home/problem-section";
import { LogoBar, ProofSection, StatsBand } from "@/components/home/proof-sections";
import { SecurityBand } from "@/components/home/security-band";
import { ServicesBento } from "@/components/home/services-bento";
import { VisibilitySection } from "@/components/home/visibility-section";
import { Hero } from "@/components/marketing/hero/hero";
import { VoltSlab } from "@/components/marketing/volt-slab";
import { ctas } from "@/lib/site";

/**
 * Homepage (docs/blueprint/03-page-blueprints.md, section 1).
 * LogoBar, StatsBand and ProofSection render only once content/proof.ts holds real,
 * permissioned data; review their design with sample data at /design-system/home-preview.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoBar />
      <ProblemSection />
      <ServicesBento />
      <HowItWorksSummary />
      <VisibilitySection />
      <StatsBand />
      <ProofSection />
      <ComparisonSection />
      <SecurityBand />
      <CalculatorTeaser />
      <FaqSection />
      <VoltSlab
        heading="Give us the work nobody wants. Keep the hours."
        subheading="20 minutes. No slides. You'll leave with a scoped plan, whether you hire us or not."
        primary={{ label: ctas.primary.label, href: ctas.primary.href }}
      />
    </>
  );
}
