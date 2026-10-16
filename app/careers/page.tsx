import type { Metadata } from "next";
import {
  BenefitsSection,
  CareersHero,
  CultureSection,
  HowWeHire,
  OpenRoles,
  TalentPoolBand,
  TeamQuote,
} from "@/components/careers/careers-sections";
import { getJobs } from "@/lib/careers/jobs";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Remote roles in engineering, recruiting, assistance, finance and legal operations, with senior work, real overlap hours and funded training.",
  alternates: { canonical: "/careers" },
};

/** Careers (docs/blueprint/03-page-blueprints.md, section 12). Roles come from the ATS, refreshed hourly. */
export default async function CareersPage() {
  const result = await getJobs();
  return (
    <>
      <CareersHero />
      <CultureSection />
      <BenefitsSection />
      <div className="mx-auto max-w-(--container-content) px-(--gutter) py-(--section-y)">
        <HowWeHire />
      </div>
      <OpenRoles result={result} basePath="/careers" />
      <TeamQuote />
      <TalentPoolBand />
    </>
  );
}
