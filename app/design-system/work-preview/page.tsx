import type { Metadata } from "next";
import { WorkIndex } from "@/components/work/work-index";
import { sampleCaseStudies } from "@/content/samples";
import { SampleBanner } from "../sample-banner";

export const metadata: Metadata = {
  title: "Case studies (sample data)",
  robots: { index: false, follow: false },
};

/** Design review for /work with fictional case studies (content/samples.ts). */
export default function WorkPreviewPage() {
  return (
    <div className="pt-24">
      <SampleBanner>
        Sample case studies for design review. Fictional clients and numbers. Not for publication.
      </SampleBanner>
      <section aria-label="Case studies" className="py-16">
        <div className="mx-auto max-w-(--container-content) px-(--gutter)">
          <WorkIndex studies={sampleCaseStudies} basePath="/design-system/work-preview" />
        </div>
      </section>
    </div>
  );
}
