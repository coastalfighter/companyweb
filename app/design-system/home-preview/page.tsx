import type { Metadata } from "next";
import { LogoBar, ProofSection, StatsBand } from "@/components/home/proof-sections";
import { SecurityBand } from "@/components/home/security-band";
import { sampleProof } from "@/content/samples";

import { SampleBanner } from "../sample-banner";

export const metadata: Metadata = {
  title: "Homepage proof sections (sample data)",
  robots: { index: false, follow: false },
};

/**
 * Design review for the homepage sections that stay hidden until Akrostech supplies
 * real proof. Everything here is SAMPLE data from content/samples.ts.
 */
export default function HomePreviewPage() {
  return (
    <div className="pt-24">
      <SampleBanner>
        Sample data for design review. Not real clients, numbers or quotes. Not for publication.
      </SampleBanner>
      <LogoBar proof={sampleProof} />
      <StatsBand proof={sampleProof} />
      <ProofSection proof={sampleProof} />
      <SecurityBand certifications={sampleProof.certifications} />
    </div>
  );
}
