import type { Metadata } from "next";
import { FaqSection } from "@/components/home/faq-section";
import { VoltSlab } from "@/components/marketing/volt-slab";
import {
  ArtifactsGallery,
  GuaranteesSection,
  LeavingWell,
  PhaseSection,
  ProcessHero,
} from "@/components/process/process-sections";
import { processFaqs } from "@/content/process";
import { ctas } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "From your first call to a running team in 10 business days: the five phases, the documents you get at each one, and what we need from you.",
  alternates: { canonical: "/how-it-works" },
};

/** How It Works (docs/blueprint/03-page-blueprints.md, section 9). */
export default function HowItWorksPage() {
  return (
    <>
      <ProcessHero />
      <PhaseSection />
      <ArtifactsGallery />
      <GuaranteesSection />
      <LeavingWell />
      <FaqSection items={processFaqs} title="Onboarding questions." />
      <VoltSlab
        heading="Ten business days from now, this could be someone else's job."
        primary={{ label: ctas.primary.label, href: ctas.primary.href }}
      />
    </>
  );
}
