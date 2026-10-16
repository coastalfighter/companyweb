import Link from "next/link";
import { ArrowRightIcon, XIcon } from "@phosphor-icons/react/ssr";
import { ServiceGlyph } from "@/components/marketing/service-glyph";
import { SectionHeader } from "@/components/marketing/section-header";
import { Callout } from "@/components/ui/callout";
import { Button } from "@/components/ui/button";
import { type ServiceContent } from "@/content/services";
import { services } from "@/lib/services";
import { ctas, prefetchFor } from "@/lib/site";

const sectionClass = "py-(--section-y)";
const containerClass = "mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)";

/** S2: outcome metrics. VERIFIED ONLY: renders nothing while the list is empty. */
export function ServiceMetrics({ content }: { content: ServiceContent }) {
  if (content.metrics.length === 0) return null;
  return (
    <section aria-label="Results in numbers" className="border-y border-line py-16">
      <dl className="mx-auto grid max-w-(--container-content) gap-10 px-(--gutter) sm:grid-cols-3">
        {content.metrics.map((metric) => (
          <div key={metric.label} data-reveal className="flex flex-col gap-2">
            <dt className="order-2 text-body-sm text-fg-muted">{metric.label}</dt>
            <dd className="tabular order-1 font-display text-stat font-medium text-fg">
              {metric.value}
              {metric.unit ? <span className="text-volt-500">{metric.unit}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** S3 + S4: what we handle, and (honestly) what we don't. */
export function ServiceScope({ content, name }: { content: ServiceContent; name: string }) {
  return (
    <section aria-labelledby="scope-title" className={sectionClass}>
      <div className={containerClass}>
        <SectionHeader id="scope-title" eyebrow="Scope" title="What we handle." />
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {content.scope.map((item, i) => (
            <li
              key={item.title}
              data-reveal
              style={{ "--reveal-i": i % 3 } as React.CSSProperties}
              className="group flex flex-col gap-4 rounded-lg border border-line bg-surface-1 p-6 shadow-e1 transition-colors duration-150 hover:border-volt-500/35 md:p-8"
            >
              <span className="font-mono text-caption text-accent-text">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-h4 font-semibold text-fg">{item.title}</h3>
              <p className="text-body-sm text-fg-muted">{item.body}</p>
            </li>
          ))}
        </ul>

        <div
          data-reveal
          className="flex flex-col gap-5 rounded-lg border border-l-2 border-line border-l-warning bg-surface-1 p-6 md:p-8"
        >
          <h3 className="font-display text-h4 font-semibold text-fg">What we don&apos;t do</h3>
          <ul className="grid gap-3 md:grid-cols-2">
            {content.limits.map((limit) => (
              <li key={limit} className="flex items-start gap-3 text-body-sm text-fg-muted">
                <XIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                <span>
                  <span className="sr-only">{name} does not include: </span>
                  {limit}
                </span>
              </li>
            ))}
          </ul>
          {content.limitsNote ? <Callout>{content.limitsNote}</Callout> : null}
        </div>
      </div>
    </section>
  );
}

/** S5: week-by-week timeline with a sticky "first 30 days" summary. */
export function ServiceTimeline({ content }: { content: ServiceContent }) {
  return (
    <section aria-labelledby="timeline-title" className={`${sectionClass} bg-bg-alt`}>
      <div className={containerClass}>
        <SectionHeader
          id="timeline-title"
          eyebrow="How an engagement runs"
          title={`${content.timeline.label}, step by step.`}
        />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <ol className="relative flex flex-col gap-10 border-l border-line pl-8 lg:col-span-8">
            {content.timeline.steps.map((step) => (
              <li key={step.title} data-reveal className="relative flex flex-col gap-2">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-[37px] size-2.5 rounded-full border-2 border-volt-500 bg-bg-alt"
                />
                <p className="font-mono text-caption text-accent-text">{step.when}</p>
                <h3 className="font-display text-h4 font-semibold text-fg">{step.title}</h3>
                <p className="max-w-[60ch] text-body-sm text-fg-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <aside aria-label="Summary" className="lg:col-span-4">
            <div className="flex flex-col gap-5 rounded-lg border border-line bg-surface-1 p-6 shadow-e1 lg:sticky lg:top-28">
              <p className="text-overline font-medium text-fg-subtle uppercase">At a glance</p>
              <ul className="flex flex-col gap-3">
                {content.timeline.steps.map((step) => (
                  <li key={step.title} className="flex items-baseline justify-between gap-4 text-body-sm">
                    <span className="text-fg">{step.title}</span>
                    <span className="shrink-0 font-mono text-caption text-fg-muted">{step.when}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="md" iconRight="arrow" fullWidth>
                <Link
                  href={`${ctas.primary.href}?service=${content.slug}`}
                  prefetch={prefetchFor(ctas.primary.href)}
                >
                  {content.hero.cta}
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/** S6: tools, as text in a hairline grid (no third-party logos). */
export function ServiceTools({ content }: { content: ServiceContent }) {
  return (
    <section aria-labelledby="tools-title" className={sectionClass}>
      <div className={containerClass}>
        <SectionHeader
          id="tools-title"
          eyebrow="Tools"
          title="We already work in your stack."
          intro="Work happens inside your tools and accounts. If you use something that isn't listed, ask: the list is what we use most, not everything we use."
        />
        <ul
          data-reveal
          className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:grid-cols-6"
        >
          {content.tools.map((tool) => (
            <li
              key={tool}
              className="flex min-h-20 items-center justify-center bg-bg px-4 py-6 text-center text-body-sm font-medium text-ink-100"
            >
              {tool}
            </li>
          ))}
          {/* Pad to whole rows (6 is a multiple of the 2/3/6-column layouts) so no gap shows. */}
          {Array.from({ length: (6 - (content.tools.length % 6)) % 6 }, (_, i) => (
            <li key={`pad-${i}`} aria-hidden className="bg-bg" />
          ))}
        </ul>
      </div>
    </section>
  );
}

/** S7 + S8: the roles you'll work with, and the commitments they work to. */
export function ServiceTeamAndSlas({ content }: { content: ServiceContent }) {
  return (
    <section aria-labelledby="team-title" className={sectionClass}>
      <div className={containerClass}>
        <SectionHeader id="team-title" eyebrow="Your team" title="Who you'll work with." />
        <ul className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {content.roles.map((role, i) => (
            <li
              key={role.title}
              data-reveal
              style={{ "--reveal-i": i } as React.CSSProperties}
              className="flex flex-col gap-3 rounded-lg border border-line bg-surface-1 p-6 shadow-e1 md:p-8"
            >
              <p className="font-mono text-micro text-fg-subtle">Role {String(i + 1).padStart(2, "0")}</p>
              <h3 className="font-display text-h4 font-semibold text-fg">{role.title}</h3>
              <p className="text-body-sm text-fg-muted">{role.detail}</p>
            </li>
          ))}
        </ul>

        <div data-reveal className="flex flex-col gap-6">
          <h3 id="sla-title" className="font-display text-h3 font-semibold text-fg">
            Service-level commitments
          </h3>
          <div className="overflow-hidden rounded-lg border border-line">
            <table aria-labelledby="sla-title" className="w-full border-collapse text-left text-body-sm">
              <thead className="bg-surface-1">
                <tr>
                  <th scope="col" className="p-4 font-medium text-fg-muted">
                    Commitment
                  </th>
                  <th scope="col" className="p-4 font-medium text-fg-muted">
                    Standard
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.slas.map(([commitment, standard]) => (
                  <tr key={commitment} className="border-t border-line">
                    <th scope="row" className="p-4 font-medium text-fg">
                      {commitment}
                    </th>
                    <td className="p-4 font-mono text-caption text-ink-100">{standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/** S9: case study snippet + testimonial. VERIFIED ONLY. */
export function ServiceProof({ content }: { content: ServiceContent }) {
  const { caseStudy, testimonial } = content.proof;
  if (!caseStudy && !testimonial) return null;
  return (
    <section aria-labelledby="service-proof-title" className={sectionClass}>
      <div className={containerClass}>
        <SectionHeader id="service-proof-title" eyebrow="Proof" title="What it looked like for a client." />
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          {caseStudy ? (
            <article className="rounded-lg border border-line bg-surface-1 p-6 md:p-8 lg:col-span-7">
              <p className="text-body-lg text-fg">{caseStudy.summary}</p>
              <Link
                href={caseStudy.href}
                prefetch={prefetchFor(caseStudy.href)}
                className="mt-6 inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
              >
                Read the case study <ArrowRightIcon aria-hidden className="size-4" />
              </Link>
            </article>
          ) : null}
          {testimonial ? (
            <figure className="flex flex-col gap-5 rounded-lg border border-line bg-surface-1 p-6 md:p-8 lg:col-span-5">
              <blockquote className="text-body-lg text-fg">{testimonial.quote}</blockquote>
              <figcaption className="text-caption text-fg-muted">
                {testimonial.name}, {testimonial.title}, {testimonial.company}
              </figcaption>
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** S11: two related services. */
export function RelatedServices({ content }: { content: ServiceContent }) {
  const related = content.related.map((slug) => services.find((s) => s.slug === slug)!);
  return (
    <section aria-labelledby="related-title" className={sectionClass}>
      <div className={containerClass}>
        <SectionHeader id="related-title" eyebrow="Pairs well with" title="Often run alongside." />
        <ul className="grid gap-4 md:grid-cols-2 lg:gap-6">
          {related.map((service) => (
            <li
              key={service.slug}
              data-reveal
              className="group relative flex items-start gap-5 rounded-lg border border-line bg-surface-1 p-6 shadow-e1 transition-[transform,border-color] duration-150 ease-out-expo focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus hover:-translate-y-0.5 hover:border-volt-500/35 md:p-8"
            >
              <ServiceGlyph slug={service.slug} />
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-h4 font-semibold text-fg">
                  <Link
                    href={service.href}
                    prefetch={prefetchFor(service.href)}
                    className="outline-none after:absolute after:inset-0 after:rounded-lg"
                  >
                    {service.name}
                  </Link>
                </h3>
                <p className="text-body-sm text-fg-muted">{service.outcome}</p>
              </div>
              <ArrowRightIcon
                aria-hidden
                className="ml-auto size-5 shrink-0 text-accent-text transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
