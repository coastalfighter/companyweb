import type { Metadata } from "next";
import { CalculatorIsland } from "@/components/calculator/calculator-island";
import { sampleRateCard } from "@/content/samples";
import { SampleBanner } from "../sample-banner";

export const metadata: Metadata = {
  title: "Calculator with a sample rate card",
  robots: { index: false, follow: false },
};

/** The calculator's savings view, which stays off until Akrostech approves a rate card. */
export default function CalculatorPreviewPage() {
  return (
    <div className="pt-24">
      <SampleBanner>
        Fictional rate card for design review. Not Akrostech&apos;s prices. Not for publication.
      </SampleBanner>
      <div className="mx-auto max-w-(--container-content) px-(--gutter) py-16">
        <CalculatorIsland rateCard={sampleRateCard} contactHref="/contact" />
      </div>
    </div>
  );
}
