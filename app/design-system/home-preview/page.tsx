import type { Metadata } from "next";
import { LogoBar, ProofSection, StatsBand } from "@/components/home/proof-sections";
import { SecurityBand } from "@/components/home/security-band";
import { sampleProof } from "@/content/samples";

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
      <div
        role="note"
        className="sticky top-16 z-30 border-y border-warning/40 bg-warning/15 px-(--gutter) py-3 text-center text-body-sm font-medium text-warning backdrop-blur-md"
      >
        Sample data for design review. Not real clients, numbers or quotes. Not for publication.
      </div>
      <LogoBar proof={sampleProof} />
      <StatsBand proof={sampleProof} />
      <ProofSection proof={sampleProof} />
      <SecurityBand certifications={sampleProof.certifications} />
    </div>
  );
}
