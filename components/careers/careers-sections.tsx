import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  GlobeHemisphereWestIcon,
  SealCheckIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeader } from "@/components/marketing/section-header";
import {
  careersFacts as verifiedFacts,
  cultureItems,
  hiringSteps,
  type CareersFacts,
} from "@/content/careers";
import { type JobsResult } from "@/lib/careers/types";
import { siteConfig } from "@/lib/site";
import { OpenRolesList } from "./open-roles";

/** Careers sections (docs/blueprint/03-page-blueprints.md, section 12). */

/**
 * Where "Join the talent pool" goes: the ATS general application when configured
 * (NEXT_PUBLIC_TALENT_POOL_URL, https only), otherwise an email to the team.
 */
export function talentPoolHref(url = process.env.NEXT_PUBLIC_TALENT_POOL_URL?.trim()): string {
  if (url) {
    try {
      if (new URL(url).protocol === "https:") return url;
    } catch {
      // Fall through to email.
    }
  }
  return `mailto:${siteConfig.email}?subject=${encodeURIComponent("Talent pool")}`;
}

export function CareersHero() {
  return (
    <section
      aria-labelledby="careers-title"
      className="grain isolate overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24"
    >
      <div aria-hidden className="grid-overlay pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-6 px-(--gutter)">
        <Eyebrow>Careers</Eyebrow>
        <h1 id="careers-title" className="max-w-[18ch] font-display text-h1 font-semibold text-fg">
          Do the work that makes great companies run.
        </h1>
        <p className="max-w-[60ch] text-body-lg text-fg-muted">
          We hire operators who notice the details everyone else misses: the miscoded transaction, the
          double-booked interview, the 3-second load time. If that&apos;s you, you&apos;ll fit here.
        </p>
        <div className="mt-4">
          <Button asChild size="lg" className="max-sm:w-full">
            <a href="#open-roles">
              See open roles
              <ArrowDownIcon aria-hidden className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

const cultureIcons = [BriefcaseIcon, GraduationCapIcon, GlobeHemisphereWestIcon] as const;

/** 12.2 */
export function CultureSection({ facts = verifiedFacts }: { facts?: CareersFacts }) {
  return (
    <section aria-labelledby="culture-title" className="border-t border-line py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader
          id="culture-title"
          eyebrow="What it's like here"
          title="Fewer people, more ownership."
        />
        <ul className="grid gap-8 md:grid-cols-3">
          {cultureItems(facts).map((item, i) => {
            const Icon = cultureIcons[i]!;
            return (
              <li
                key={item.title}
                data-reveal
                style={{ "--reveal-i": i } as React.CSSProperties}
                className="flex flex-col gap-4"
              >
                <Icon aria-hidden weight="light" className="size-8 text-volt-500" />
                <h3 className="text-h5 font-semibold text-fg">{item.title}</h3>
                <p className="text-body text-fg-muted">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** 12.3: confirmed benefits only. */
export function BenefitsSection({ facts = verifiedFacts }: { facts?: CareersFacts }) {
  if (facts.benefits.length === 0) return null;
  return (
    <section aria-labelledby="benefits-title" className="py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader id="benefits-title" eyebrow="Benefits" title="The basics, done properly." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facts.benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="flex items-start gap-4 rounded-lg border border-line bg-surface-1 p-6 shadow-e1"
            >
              <SealCheckIcon aria-hidden weight="light" className="mt-0.5 size-6 shrink-0 text-volt-500" />
              <div className="flex flex-col gap-1">
                <h3 className="text-body font-semibold text-fg">{benefit.title}</h3>
                {benefit.detail ? <p className="text-body-sm text-fg-muted">{benefit.detail}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 12.4 */
export function HowWeHire({ headingLevel = "h2" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <section aria-labelledby="hiring-title" className="flex flex-col gap-8">
      <Heading id="hiring-title" className="font-display text-h3 font-semibold text-fg">
        How we hire
      </Heading>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {hiringSteps.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-2 border-t border-line-strong pt-4">
            <span aria-hidden className="tabular font-mono text-caption text-accent-text">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-body font-semibold text-fg">{step.title}</span>
            <span className="text-body-sm text-fg-muted">{step.detail}</span>
          </li>
        ))}
      </ol>
      <p className="text-body text-fg-muted">We reply to every applicant. Yes, including the no&apos;s.</p>
    </section>
  );
}

/** 12.5 */
export function OpenRoles({ result, basePath }: { result: JobsResult; basePath: string }) {
  return (
    <section id="open-roles" aria-labelledby="roles-title" className="scroll-mt-24 py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-10 px-(--gutter)">
        <SectionHeader id="roles-title" eyebrow="Open roles" title="Where we need you." />
        {result.jobs.length > 0 ? (
          <OpenRolesList jobs={result.jobs} basePath={basePath} />
        ) : result.status === "error" ? (
          <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-line-strong bg-surface-1 p-8 md:p-12">
            <p className="max-w-[48ch] text-body-lg text-fg">
              Our roles list didn&apos;t load just now. They&apos;re all on our job board.
            </p>
            <a
              href={result.boardUrl}
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
            >
              Open the job board
              <ArrowSquareOutIcon aria-hidden className="size-4" />
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-line-strong bg-surface-1 p-8 md:p-12">
            <p className="max-w-[48ch] text-body-lg text-fg">
              No open roles right now. Send us your profile and we&apos;ll reach out when something fits.
            </p>
            <a
              href={talentPoolHref()}
              className="group inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
            >
              Join the talent pool
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
              />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/** 12.7: a quiet band, not the lime slab (that is reserved for buyers). */
export function TalentPoolBand() {
  return (
    <section
      aria-labelledby="talent-title"
      className="mx-auto max-w-(--container-content) px-(--gutter) py-(--section-y)"
    >
      <div className="flex flex-col items-start gap-6 rounded-2xl border border-line-strong bg-surface-2 px-6 py-12 shadow-e2 sm:px-12 md:flex-row md:items-center md:justify-between">
        <h2 id="talent-title" className="max-w-[24ch] font-display text-h3 font-semibold text-fg">
          Don&apos;t see your role? We hire for talent first.
        </h2>
        <Button asChild variant="secondary" size="lg" iconRight="arrow" className="max-sm:w-full">
          <a href={talentPoolHref()}>Join the talent pool</a>
        </Button>
      </div>
    </section>
  );
}
