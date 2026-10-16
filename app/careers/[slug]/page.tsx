import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetail, jobPostingJsonLd } from "@/components/careers/job-detail";
import { blocksToText } from "@/lib/careers/html-text";
import { getJob, getJobs } from "@/lib/careers/jobs";
import { JsonLd } from "@/lib/json-ld";

/** Whole route static, so unknown slugs get a real 404 on the first request (see /services/[slug]). */
export const ensureStatic = "navigation";

/** Cache Components needs one param to validate the route; this placeholder 404s. */
const PLACEHOLDER_SLUG = "__no-open-roles__";

export async function generateStaticParams() {
  const { jobs } = await getJobs();
  return jobs.length > 0 ? jobs.map((job) => ({ slug: job.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};
  const summary = blocksToText(job.description).replace(/\s+/g, " ").slice(0, 155);
  return {
    title: `${job.title} · Careers`,
    description: summary || `${job.title}, ${job.team}. ${job.location}`,
    alternates: { canonical: `/careers/${job.slug}` },
  };
}

/** Job detail (docs/blueprint/03-page-blueprints.md, 12.7). */
export default async function JobPage({ params }: PageProps<"/careers/[slug]">) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();
  return (
    <>
      <JsonLd data={jobPostingJsonLd(job)} />
      <JobDetail job={job} basePath="/careers" />
    </>
  );
}
