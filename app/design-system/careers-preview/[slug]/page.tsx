import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetail } from "@/components/careers/job-detail";
import { sampleJobs } from "@/content/samples";
import { SampleBanner } from "../../sample-banner";

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "Job detail (sample data)",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return sampleJobs.map((job) => ({ slug: job.slug }));
}

/** The job detail template (12.7) with a fictional role. */
export default async function JobPreviewPage({ params }: PageProps<"/design-system/careers-preview/[slug]">) {
  const { slug } = await params;
  const job = sampleJobs.find((j) => j.slug === slug);
  if (!job) notFound();
  return (
    <>
      <div className="pt-24">
        <SampleBanner>Fictional role for design review. Not a real opening.</SampleBanner>
      </div>
      <JobDetail job={job} basePath="/design-system/careers-preview" />
    </>
  );
}
