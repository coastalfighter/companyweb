import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyArticle } from "@/components/work/case-study-article";
import { caseStudies, getCaseStudy, relatedCaseStudies } from "@/content/case-studies";
import { JsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";

/** Whole route static, so unknown slugs get a real 404 on the first request (see /services/[slug]). */
export const ensureStatic = "navigation";

/**
 * Cache Components needs at least one param to validate the route. Until a case
 * study is published, a placeholder slug is generated and 404s like any unknown one.
 */
const PLACEHOLDER_SLUG = "__no-published-case-studies__";

export function generateStaticParams() {
  return caseStudies.length > 0 ? caseStudies.map((s) => ({ slug: s.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: study.title,
    description: study.oneLiner,
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: { type: "article", title: study.title, description: study.oneLiner },
  };
}

/** Case study template (docs/blueprint/03-page-blueprints.md, 10B). */
export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@type": "Article",
          headline: study.title,
          description: study.oneLiner,
          datePublished: study.publishedAt,
          url: `${siteConfig.url}/work/${study.slug}`,
          author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          about: { "@type": "Organization", name: study.client },
        }}
      />
      <CaseStudyArticle study={study} related={relatedCaseStudies(study)} basePath="/work" />
    </>
  );
}
