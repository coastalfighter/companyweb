import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { SectionHeader } from "@/components/marketing/section-header";
import { Badge } from "@/components/ui/badge";
import {
  MIN_LOGOS_FOR_BAR,
  MIN_LOGOS_FOR_MARQUEE,
  proof as verifiedProof,
  type Proof,
} from "@/content/proof";
import { prefetchFor } from "@/lib/site";
import { ClientLogoMark } from "./client-logo";
import { LogoMarquee } from "./logo-marquee";
import { CountUp } from "./count-up";

/**
 * Proof sections (blueprint 1.2, 1.7, 1.8). Each renders only when content/proof.ts
 * has real data for it, so the live homepage never shows placeholder or invented
 * proof. The design-review preview passes sample data explicitly.
 */

export function LogoBar({ proof = verifiedProof }: { proof?: Proof }) {
  const logos = proof.clientLogos;
  if (logos.length < MIN_LOGOS_FOR_BAR || !proof.logoBarLabel) return null;
  const marquee = logos.length >= MIN_LOGOS_FOR_MARQUEE;

  return (
    <section aria-label="Clients" className="border-y border-line py-16 md:py-24">
      <p className="mx-auto mb-10 max-w-(--container-content) px-(--gutter) text-center text-caption text-fg-subtle">
        {proof.logoBarLabel}
      </p>
      {marquee ? (
        <LogoMarquee logos={logos} />
      ) : (
        <ul className="mx-auto flex max-w-(--container-content) flex-wrap items-center justify-center gap-x-16 gap-y-8 px-(--gutter)">
          {logos.map((logo) => (
            <li key={logo.name}>
              <ClientLogoMark name={logo.name} src={logo.src} aspect={logo.aspect} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function StatsBand({ proof = verifiedProof }: { proof?: Proof }) {
  if (proof.stats.length === 0) return null;
  return (
    <section aria-label="Results in numbers" className="py-(--section-y)">
      <div className="mx-auto max-w-(--container-content) px-(--gutter)">
        <dl className="grid grid-cols-2 gap-y-12 lg:grid-cols-4">
          {proof.stats.map((stat, i) => (
            <div
              key={stat.label}
              data-reveal
              className={`flex flex-col gap-3 px-4 lg:px-8 ${i % 2 === 1 ? "border-l border-line" : ""} lg:border-l lg:first:border-l-0`}
            >
              <dt className="order-2 text-body-sm text-fg-muted">{stat.label}</dt>
              <dd className="tabular order-1 font-display text-stat font-medium text-fg">
                <CountUp value={stat.value} />
                {stat.unit ? <span className="text-volt-500">{stat.unit}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        {proof.statsFootnote ? (
          <p className="mt-12 text-caption text-fg-subtle">
            {proof.statsFootnote}{" "}
            <Link
              href="/about/security#methodology"
              prefetch={prefetchFor("/about/security")}
              className="underline underline-offset-4 hover:text-fg"
            >
              Methodology
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function ProofSection({ proof = verifiedProof }: { proof?: Proof }) {
  const study = proof.featuredCaseStudy;
  if (!study && proof.testimonials.length === 0) return null;

  return (
    <section aria-labelledby="proof-title" className="py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader id="proof-title" eyebrow="Proof" title="Don't take our word for it." />

        {study ? (
          <article
            data-reveal
            className="group relative grid overflow-hidden rounded-xl border border-line bg-surface-1 shadow-e1 transition-colors hover:border-volt-500/35 lg:grid-cols-2"
          >
            <div aria-hidden className="relative min-h-56 overflow-hidden bg-ink-900">
              <div className="absolute inset-0 bg-(image:--glow-volt) transition-transform duration-600 ease-out-expo group-hover:scale-[1.03]" />
              <div className="grid-overlay absolute inset-0" />
            </div>
            <div className="flex flex-col gap-6 p-6 md:p-10">
              <p className="text-overline font-medium text-fg-subtle uppercase">{study.eyebrow}</p>
              <h3 className="font-display text-h3 font-semibold text-fg">
                <Link
                  href={study.href}
                  prefetch={prefetchFor(study.href)}
                  className="outline-none after:absolute after:inset-0 focus-visible:underline"
                >
                  {study.title}
                </Link>
              </h3>
              <ul className="flex flex-wrap gap-2">
                {study.results.map((result) => (
                  <li
                    key={result}
                    className="rounded-xs border border-line px-2 py-1 font-mono text-caption text-ink-100"
                  >
                    {result}
                  </li>
                ))}
              </ul>
              <span
                aria-hidden
                className="mt-auto inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
              >
                Read the full story
                <ArrowRightIcon className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]" />
              </span>
            </div>
          </article>
        ) : null}

        {proof.testimonials.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            {proof.testimonials.map((t, i) => (
              <figure
                key={t.name}
                data-reveal
                style={{ "--reveal-i": i } as React.CSSProperties}
                className="flex flex-col gap-6 rounded-lg border border-line bg-surface-1 p-6 shadow-e1 md:p-8"
              >
                <span aria-hidden className="font-display text-h2 leading-none text-volt-500">
                  &ldquo;
                </span>
                <blockquote className="flex-1 text-body-lg text-fg">{t.quote}</blockquote>
                <figcaption className="flex flex-col gap-3 border-t border-line pt-5">
                  <div>
                    <p className="text-h5 font-semibold text-fg">{t.name}</p>
                    <p className="text-caption text-fg-subtle">
                      {t.title}, {t.company} · {t.context}
                    </p>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {t.services.map((service) => (
                      <li key={service}>
                        <Badge>{service}</Badge>
                      </li>
                    ))}
                  </ul>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
