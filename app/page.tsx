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
import { ScrollRail, type RailSection } from "@/components/motion/scroll-rail";
import { ScrollTicker } from "@/components/motion/scroll-ticker";
import { services } from "@/lib/services";
import { ctas } from "@/lib/site";

/** The "On this page" rail. Gated sections (stats, proof) are left out until they render. */
const railSections: readonly RailSection[] = [
  { id: "hero-title", label: "Intro" },
  { id: "problem-title", label: "The problem" },
  { id: "services-title", label: "Services" },
  { id: "how-title", label: "How it works" },
  { id: "visibility-title", label: "Visibility" },
  { id: "compare-title", label: "Compare" },
  { id: "security-title", label: "Security" },
  { id: "teaser-title", label: "Cost check" },
  { id: "faq-title", label: "FAQ" },
  { id: "volt-slab-title", label: "Book a call" },
];

/** Commitments the hero already states; the ticker only repeats them. */
const tickerCommitments = [
  "Live in 10 business days",
  "No long-term lock-in",
  "NDA before the first call",
  "A report every Friday",
] as const;

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
      <ScrollTicker items={services.map((s) => s.name)} secondary={tickerCommitments} />
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
      <ScrollRail sections={railSections} />
    </>
  );
}
