import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyArticle } from "@/components/work/case-study-article";
import { getCaseStudy, relatedCaseStudies } from "@/content/case-studies";
import { sampleCaseStudies } from "@/content/samples";
import { SampleBanner } from "../../sample-banner";

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "Case study template (sample data)",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return sampleCaseStudies.map((s) => ({ slug: s.slug }));
}

/** The case study template (10B) rendered with the fictional blueprint example (10C). */
export default async function CaseStudyPreviewPage({
  params,
}: PageProps<"/design-system/work-preview/[slug]">) {
  const { slug } = await params;
  const study = getCaseStudy(slug, sampleCaseStudies);
  if (!study) notFound();
  return (
    <>
      <div className="pt-24">
        <SampleBanner>
          Fictional case study for design review. Not a real client. Not for publication.
        </SampleBanner>
      </div>
      <CaseStudyArticle
        study={study}
        related={relatedCaseStudies(study, sampleCaseStudies)}
        basePath="/design-system/work-preview"
      />
    </>
  );
}
