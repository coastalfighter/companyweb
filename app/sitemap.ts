import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/case-studies";
import { getJobs } from "@/lib/careers/jobs";
import { liveRoutes, siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = liveRoutes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
  const studies: MetadataRoute.Sitemap = caseStudies.map((study) => ({
    url: `${siteConfig.url}/work/${study.slug}`,
    lastModified: study.publishedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  const { jobs } = await getJobs();
  const roles: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${siteConfig.url}/careers/${job.slug}`,
    lastModified: job.publishedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));
  return [...pages, ...studies, ...roles];
}
