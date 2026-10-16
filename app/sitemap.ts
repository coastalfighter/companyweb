import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/case-studies";
import { liveRoutes, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
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
  return [...pages, ...studies];
}
