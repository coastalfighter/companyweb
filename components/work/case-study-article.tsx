import Image from "next/image";
import { ArrowRightIcon, CaretDownIcon } from "@phosphor-icons/react/ssr";
import { CountUp } from "@/components/home/count-up";
import { VoltSlab } from "@/components/marketing/volt-slab";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { type CaseStudy } from "@/content/case-studies";
import { initials } from "@/content/company";
import { ctas } from "@/lib/site";
import { CaseStudyCard, ClientMark, serviceNames } from "./case-study-card";
import { CaseStudyNav } from "./case-study-nav";

export interface CaseStudyArticleProps {
  study: CaseStudy;
  related: readonly CaseStudy[];
  /** "/work" on the live site; the design preview passes its own route. */
  basePath: string;
}

export const caseStudySections = [
  { id: "situation", label: "The situation" },
  { id: "what-we-did", label: "What we did" },
  { id: "results", label: "Results" },
  { id: "whats-next", label: "What's next" },
] as const;

/** 2px lime reading-progress bar (10B). Pure CSS scroll-driven animation; absent where unsupported. */
export function ReadingProgress() {
  return <div aria-hidden className="reading-progress" />;
}

function Snapshot({ study }: { study: CaseStudy }) {
  const rows = [
    ["Client", study.client],
    ["Industry", study.industry],
    ["Size", study.snapshot.size],
    ["Services", serviceNames(study).join(", ")],
    ["Team", study.snapshot.team],
    ["Duration", study.snapshot.duration],
    ["Tools", study.snapshot.tools.join(", ")],
  ] as const;
  return (
    <dl className="flex flex-col divide-y divide-line">
      {rows.map(([term, detail]) => (
        <div key={term} className="flex flex-col gap-0.5 py-3 first:pt-0">
          <dt className="text-caption text-fg-muted">{term}</dt>
          <dd className="text-body-sm text-fg">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Case study template T1–T9 (docs/blueprint/03-page-blueprints.md, 10B). The hero
 * stays dark; the long-form body switches to the Paper theme for reading.
 */
export function CaseStudyArticle({ study, related, basePath }: CaseStudyArticleProps) {
  return (
    <article aria-labelledby="case-study-title">
      <ReadingProgress />

      {/* T1 Hero */}
      <header className="grain isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div aria-hidden className="grid-overlay pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <div className="mx-auto grid max-w-(--container-content) px-(--gutter) lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-8">
            <Breadcrumb
              items={[
                { label: "Work", href: basePath },
                { label: study.client, href: `${basePath}/${study.slug}` },
              ]}
            />
            <ClientMark study={study} className="text-h5" />
            <p className="text-overline font-medium text-fg-subtle uppercase">
              {[...serviceNames(study), study.industry].join(" · ")}
            </p>
            <h1 id="case-study-title" className="font-display text-h1 font-semibold text-fg">
              {study.title}
            </h1>
            <p className="max-w-[60ch] text-body-lg text-fg-muted">{study.oneLiner}</p>
            <dl className="mt-4 flex flex-wrap gap-x-12 gap-y-6">
              {study.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <dt className="order-2 text-body-sm text-fg-muted">{stat.label}</dt>
                  <dd className="tabular order-1 font-display text-h2 font-semibold text-fg">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </header>

      {/* T2–T7 on Paper */}
      <div className="theme-paper bg-bg text-fg">
        <div className="mx-auto grid max-w-(--container-content) gap-10 px-(--gutter) py-16 md:py-24 lg:grid-cols-12 lg:gap-8">
          {/* T2 Snapshot: sticky right column on desktop, collapsible box on mobile. */}
          <aside aria-label="Snapshot" className="lg:order-2 lg:col-span-3 lg:col-start-10">
            <div className="flex flex-col gap-8 lg:sticky lg:top-28">
              <details className="group rounded-lg border border-line bg-surface-1 p-5 lg:hidden">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-body font-semibold [&::-webkit-details-marker]:hidden">
                  Snapshot
                  <CaretDownIcon
                    aria-hidden
                    className="size-4 text-fg-muted transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="pt-4">
                  <Snapshot study={study} />
                </div>
              </details>
              <div className="hidden flex-col gap-8 lg:flex">
                <div className="rounded-lg border border-line bg-surface-1 p-6">
                  <h2 className="mb-4 text-overline font-medium text-fg-muted uppercase">Snapshot</h2>
                  <Snapshot study={study} />
                </div>
                <CaseStudyNav sections={caseStudySections} />
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-16 lg:order-1 lg:col-span-8">
            {/* T3 */}
            <section id="situation" aria-labelledby="situation-title" className="scroll-mt-28">
              <h2 id="situation-title" className="font-display text-h3 font-semibold">
                The situation
              </h2>
              <div className="mt-6 flex max-w-(--container-prose) flex-col gap-5 text-body-lg text-fg-muted">
                {study.situation.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* T4 */}
            <section id="what-we-did" aria-labelledby="what-we-did-title" className="scroll-mt-28">
              <h2 id="what-we-did-title" className="font-display text-h3 font-semibold">
                What we did
              </h2>
              {study.approachIntro ? (
                <p className="mt-6 max-w-(--container-prose) text-body-lg text-fg-muted">
                  {study.approachIntro}
                </p>
              ) : null}
              <ol className="mt-6 flex max-w-(--container-prose) flex-col gap-6">
                {study.approach.map((step, i) => (
                  <li key={step.title} className="flex gap-5">
                    <span
                      aria-hidden
                      className="tabular grid size-8 shrink-0 place-items-center rounded-full border border-line-strong font-mono text-caption text-fg"
                    >
                      {i + 1}
                    </span>
                    <p className="text-body-lg text-fg-muted">
                      <strong className="font-semibold text-fg">{step.title}</strong> {step.body}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {/* T5: dark stats band inside the reading column. */}
            <section
              id="results"
              aria-labelledby="results-title"
              className="results-band scroll-mt-28 rounded-xl bg-ink-950 p-8 text-white md:p-12"
            >
              <h2 id="results-title" className="font-display text-h3 font-semibold text-white">
                Results
              </h2>
              <dl className="mt-8 grid gap-8 sm:grid-cols-2">
                {study.results.map((result) => (
                  <div key={result.label} className="flex flex-col gap-2 border-t border-ink-700 pt-5">
                    <dt className="order-2 text-body-sm text-ink-200">
                      {result.label}
                      {result.note ? (
                        <span className="block text-caption text-ink-300">{result.note}</span>
                      ) : null}
                    </dt>
                    <dd className="tabular order-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-h3 font-semibold text-white">
                      {result.before ? (
                        <>
                          <span className="text-ink-300 line-through decoration-1">{result.before}</span>
                          <ArrowRightIcon aria-label="to" className="size-6 self-center text-volt-500" />
                        </>
                      ) : null}
                      <CountUp value={result.after} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* T6 */}
            {study.quote ? (
              <figure className="flex flex-col gap-6 border-l-2 border-fg pl-6 md:pl-10">
                <blockquote className="font-display text-h3 font-medium text-fg">
                  &ldquo;{study.quote.text}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-4">
                  {study.quote.photo ? (
                    <Image
                      src={study.quote.photo}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="grid size-12 place-items-center rounded-full bg-surface-2 font-display text-body font-semibold text-fg-muted"
                    >
                      {initials(study.quote.name)}
                    </span>
                  )}
                  <span className="flex flex-col">
                    <span className="text-body font-semibold text-fg">{study.quote.name}</span>
                    <span className="text-body-sm text-fg-muted">{study.quote.title}</span>
                  </span>
                </figcaption>
              </figure>
            ) : null}

            {/* T7 */}
            <section id="whats-next" aria-labelledby="whats-next-title" className="scroll-mt-28">
              <h2 id="whats-next-title" className="font-display text-h3 font-semibold">
                What&apos;s next
              </h2>
              <p className="mt-6 max-w-(--container-prose) text-body-lg text-fg-muted">{study.whatsNext}</p>
            </section>
          </div>
        </div>
      </div>

      {/* T8 */}
      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="py-(--section-y)">
          <div className="mx-auto flex max-w-(--container-content) flex-col gap-10 px-(--gutter)">
            <h2 id="related-title" className="font-display text-h3 font-semibold text-fg">
              Related case studies
            </h2>
            <ul className="grid gap-6 md:grid-cols-2">
              {related.map((other) => (
                <li key={other.slug}>
                  <CaseStudyCard study={other} href={`${basePath}/${other.slug}`} variant="mini" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* T9 */}
      <VoltSlab
        heading={`Want results like ${study.client}'s?`}
        subheading="20 minutes. No slides. A scoped plan whether you hire us or not."
        primary={{ label: ctas.primary.label, href: `${ctas.primary.href}?service=${study.services[0]}` }}
      />
    </article>
  );
}
