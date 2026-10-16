import Link from "next/link";
import { CheckIcon } from "@phosphor-icons/react/ssr";
import { FaqSection } from "@/components/home/faq-section";
import { VoltSlab } from "@/components/marketing/volt-slab";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { comparisonRows, COMPETITOR_LABELS, type Comparison } from "@/content/compare";
import { proof } from "@/content/proof";
import { ctas, prefetchFor } from "@/lib/site";

function Reasons({
  title,
  points,
  highlight,
}: {
  title: string;
  points: readonly string[];
  highlight: boolean;
}) {
  return (
    <div
      data-reveal="card"
      className={
        highlight
          ? "surface flex flex-col gap-5 rounded-lg border border-t-2 border-volt-500/40 border-t-volt-500 bg-volt-950 p-6 shadow-e1 md:p-8"
          : "surface flex flex-col gap-5 rounded-lg border border-line bg-surface-1 p-6 shadow-e1 md:p-8"
      }
    >
      <h2 className="font-display text-h4 font-semibold text-fg">{title}</h2>
      <ul className="flex flex-col gap-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-body text-fg-muted">
            <CheckIcon
              aria-hidden
              className={
                highlight ? "mt-1 size-4 shrink-0 text-volt-500" : "mt-1 size-4 shrink-0 text-fg-muted"
              }
            />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * /compare/* (docs/blueprint/02-sitemap.md, P2): the homepage comparison (1.9)
 * expanded for one alternative, with the case for that alternative stated first.
 */
export function ComparePage({ comparison }: { comparison: Comparison }) {
  const them = COMPETITOR_LABELS[comparison.competitor];
  const rows = comparisonRows(proof.certifications.soc2Type2);

  return (
    <>
      <section aria-labelledby="compare-page-title" className="pt-32 pb-16 md:pt-40">
        <div className="mx-auto flex max-w-(--container-content) flex-col gap-6 px-(--gutter)">
          <Breadcrumb
            items={[
              { label: "Compare", href: "/compare" },
              { label: comparison.eyebrow, href: `/compare/${comparison.slug}` },
            ]}
          />
          <Eyebrow>{comparison.eyebrow}</Eyebrow>
          <h1 id="compare-page-title" className="max-w-[20ch] font-display text-h1 font-semibold text-fg">
            {comparison.title}
          </h1>
          <p className="max-w-[58ch] text-body-lg text-fg-muted">{comparison.intro}</p>
        </div>
      </section>

      <section aria-label="Side by side" className="pb-(--section-y)">
        <div className="mx-auto max-w-(--container-content) px-(--gutter)">
          <div
            role="region"
            aria-label={`${them} compared with Akrostech`}
            tabIndex={0}
            className="overflow-x-auto rounded-lg border border-line focus-visible:outline-2 focus-visible:outline-focus"
          >
            <table className="w-full min-w-[480px] border-collapse text-left text-body-sm">
              <caption className="sr-only">{`${them} compared with Akrostech`}</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-1/3 p-4 font-medium text-fg-subtle">
                    <span className="sr-only">Criteria</span>
                  </th>
                  <th scope="col" className="p-4 font-medium text-fg-muted">
                    {them}
                  </th>
                  <th
                    scope="col"
                    className="border-t-2 border-volt-500 bg-volt-950 p-4 font-display text-h5 font-semibold text-volt-500"
                  >
                    Akrostech
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <th scope="row" className="p-4 font-medium text-fg">
                      {row.label}
                    </th>
                    <td className="p-4 text-fg-muted">{row.values[comparison.competitor]}</td>
                    <td className="bg-volt-950/60 p-4 font-medium text-fg">{row.akrostech}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-label="When each is the right call" className="pb-(--section-y)">
        <div className="mx-auto grid max-w-(--container-content) grid-cols-1 gap-4 px-(--gutter) md:grid-cols-2 md:gap-6">
          <Reasons title={comparison.theyWin.title} points={comparison.theyWin.points} highlight={false} />
          <Reasons title={comparison.weWin.title} points={comparison.weWin.points} highlight />
        </div>
      </section>

      <section aria-labelledby="cost-title" className="border-y border-line bg-surface-1 py-(--section-y)">
        <div className="mx-auto flex max-w-(--container-prose) flex-col items-start gap-5 px-(--gutter)">
          <h2 id="cost-title" className="font-display text-h3 font-semibold text-fg">
            The cost question
          </h2>
          <p className="text-body-lg text-fg-muted">{comparison.costNote}</p>
          <Button asChild variant="secondary" size="lg" iconRight="arrow" className="max-sm:w-full">
            <Link href={ctas.secondary.href} prefetch={prefetchFor(ctas.secondary.href)}>
              Run the numbers for your team
            </Link>
          </Button>
        </div>
      </section>

      <FaqSection items={comparison.faqs} title="What people ask next." />
      <VoltSlab heading={comparison.slab} primary={{ label: ctas.primary.label, href: ctas.primary.href }} />
    </>
  );
}
