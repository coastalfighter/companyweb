import type { Metadata } from "next";
import { BenefitsSection, CultureSection, OpenRoles } from "@/components/careers/careers-sections";
import { TeamQuote } from "@/components/careers/team-quote";
import { sampleCareersFacts, sampleJobs } from "@/content/samples";
import { SampleBanner } from "../sample-banner";

export const metadata: Metadata = {
  title: "Careers (sample data)",
  robots: { index: false, follow: false },
};

/** Design review for the careers sections gated on HR-confirmed facts and on the ATS. */
export default function CareersPreviewPage() {
  return (
    <div className="pt-24">
      <SampleBanner>
        Sample roles, benefits and quote for design review. Not real. Not for publication.
      </SampleBanner>
      <CultureSection facts={sampleCareersFacts} />
      <BenefitsSection facts={sampleCareersFacts} />
      <OpenRoles result={{ status: "ok", jobs: [...sampleJobs] }} basePath="/design-system/careers-preview" />
      <TeamQuote facts={sampleCareersFacts} />
    </div>
  );
}
