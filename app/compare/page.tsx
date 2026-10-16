import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { ComparisonSection } from "@/components/home/comparison-section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { comparisons } from "@/content/compare";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Akrostech compared with freelancers, offshore BPOs and an in-house hire, including when each of them is the better choice.",
  alternates: { canonical: "/compare" },
};

/** /compare: the full comparison table and the detailed comparisons. */
export default function CompareIndexPage() {
  return (
    <>
      <section aria-labelledby="compare-index-title" className="pt-32 md:pt-40">
        <div className="mx-auto flex max-w-(--container-content) flex-col gap-6 px-(--gutter)">
          <Eyebrow>Compare</Eyebrow>
          <h1 id="compare-index-title" className="max-w-[20ch] font-display text-h1 font-semibold text-fg">
            The honest comparison.
          </h1>
          <p className="max-w-[58ch] text-body-lg text-fg-muted">
            Every option on this page is the right one for somebody. Here&apos;s how to tell which is right
            for you.
          </p>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {comparisons.map((c) => (
              <li key={c.slug}>
                <Link
                  data-reveal="card"
                  href={`/compare/${c.slug}`}
                  className="surface group flex items-center justify-between gap-4 rounded-lg border border-line bg-surface-1 p-6 shadow-e1 transition-colors hover:border-volt-500/35"
                >
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-h5 font-semibold text-fg">{c.eyebrow}</span>
                    <span className="text-body-sm text-fg-muted">{c.title}</span>
                  </span>
                  <ArrowRightIcon
                    aria-hidden
                    className="size-5 shrink-0 text-accent-text transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ComparisonSection />
    </>
  );
}
