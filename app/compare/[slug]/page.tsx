import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparePage } from "@/components/compare/compare-page";
import { comparisons, getComparison } from "@/content/compare";

/** Whole route static, so unknown slugs get a real 404 on the first request. */
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/compare/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) return {};
  return {
    title: comparison.seo.title,
    description: comparison.seo.description,
    alternates: { canonical: `/compare/${comparison.slug}` },
  };
}

export default async function CompareSlugPage({ params }: PageProps<"/compare/[slug]">) {
  const { slug } = await params;
  const comparison = getComparison(slug);
  if (!comparison) notFound();
  return <ComparePage comparison={comparison} />;
}
