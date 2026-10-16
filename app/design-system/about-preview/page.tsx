import type { Metadata } from "next";
import {
  LeadershipSection,
  NumbersBand,
  OriginSection,
  WhereWeWork,
} from "@/components/about/about-sections";
import { GuaranteesSection } from "@/components/process/process-sections";
import { guarantees, pendingGuarantees } from "@/content/process";
import { sampleCompany } from "@/content/samples";

export const metadata: Metadata = {
  title: "About page facts (sample data)",
  robots: { index: false, follow: false },
};

/**
 * Design review for the About and How It Works sections that stay hidden until
 * Akrostech supplies real facts or signs off a policy. Everything here is SAMPLE data.
 */
export default function AboutPreviewPage() {
  return (
    <div className="pt-24">
      <div
        role="note"
        className="sticky top-16 z-30 border-y border-warning/40 bg-warning/15 px-(--gutter) py-3 text-center text-body-sm font-medium text-warning backdrop-blur-md"
      >
        Sample data for design review. Not real people, numbers, locations or policies. Not for publication.
      </div>
      <OriginSection company={sampleCompany} />
      <NumbersBand company={sampleCompany} />
      <LeadershipSection company={sampleCompany} />
      <WhereWeWork company={sampleCompany} />
      <GuaranteesSection items={[...pendingGuarantees, ...guarantees]} />
    </div>
  );
}
