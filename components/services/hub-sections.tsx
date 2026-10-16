import Link from "next/link";
import {
  ArrowRightIcon,
  CheckIcon,
  LifebuoyIcon,
  UsersIcon,
  WrenchIcon,
  FileTextIcon,
} from "@phosphor-icons/react/ssr";
import { ServiceGlyph } from "@/components/marketing/service-glyph";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";
import { serviceContent } from "@/content/services";
import { bundles, services, type ServiceSlug } from "@/lib/services";
import { ctas, prefetchFor } from "@/lib/site";
import { cn } from "@/lib/utils";

const startingPoints: Record<ServiceSlug, string> = {
  "web-development": "Rebuilds, migrations, maintenance",
  recruitment: "Sourcing, screening, scheduling",
  "virtual-assistance": "Exec, admin and ops support",
  accounting: "Bookkeeping, payroll, AP/AR",
  legal: "CLM, NDAs, compliance ops",
};

/**
 * Hub 2.2: an editorial index. On pointer devices a row expands on hover/focus to
 * preview scope; on touch every row is expanded (no hover dependency).
 */
export function ServicesIndex() {
  return (
    <section aria-label="All services" className="pb-(--section-y)">
      <div className="mx-auto max-w-(--container-content) px-(--gutter)">
        <ol className="border-t border-line">
          {services.map((service) => (
            <li
              key={service.slug}
              data-reveal
              className="svc-row group relative border-b border-line focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-focus"
            >
              <div className="grid grid-cols-12 items-center gap-4 py-8 md:gap-8">
                <span className="col-span-2 font-mono text-caption text-fg-subtle md:col-span-1">
                  {service.number}
                </span>
                <h2 className="col-span-10 font-display text-h3 font-semibold text-fg md:col-span-4">
                  <Link
                    href={service.href}
                    prefetch={prefetchFor(service.href)}
                    className="outline-none after:absolute after:inset-0"
                  >
                    {service.name}
                  </Link>
                </h2>
                <p className="col-span-10 col-start-3 text-body text-fg-muted md:col-span-5 md:col-start-auto">
                  {service.outcome}
                  <span className="mt-1 block text-caption text-fg-subtle">
                    {startingPoints[service.slug]}
                  </span>
                </p>
                <ArrowRightIcon
                  aria-hidden
                  className="col-span-1 hidden size-5 justify-self-end text-accent-text transition-transform duration-150 ease-out-expo group-hover:translate-x-1 md:col-start-12 md:block"
                />
              </div>
              <div className="svc-row-detail grid">
                <div className="overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 pb-8 md:gap-8">
                    <ul className="col-span-10 col-start-3 flex flex-col gap-2 md:col-span-6 md:col-start-6">
                      {serviceContent[service.slug].scope.slice(0, 3).map((item) => (
                        <li key={item.title} className="flex items-start gap-2 text-body-sm text-ink-100">
                          <CheckIcon
                            aria-hidden
                            weight="bold"
                            className="mt-0.5 size-4 shrink-0 text-volt-500"
                          />
                          {item.title.replace(/\.$/, "")}
                        </li>
                      ))}
                    </ul>
                    <div className="col-span-1 hidden justify-self-end md:col-start-12 md:block">
                      <ServiceGlyph slug={service.slug} active />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Hub 2.3: common combinations. */
export function Bundles() {
  return (
    <section aria-labelledby="bundles-title" className="py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader
          id="bundles-title"
          eyebrow="Better together"
          title="Common combinations."
          intro="Bundled engagements share one lead and one Friday report."
        />
        <ul className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {bundles.map((bundle, i) => (
            <li
              key={bundle.id}
              data-reveal
              style={{ "--reveal-i": i } as React.CSSProperties}
              className="surface depth-in group flex flex-col gap-5 rounded-lg border border-line bg-surface-1 p-6 shadow-e1 transition-[transform,border-color] duration-150 ease-out-expo hover:-translate-y-0.5 hover:border-volt-500/35 md:p-8"
            >
              <div aria-hidden className="flex">
                {bundle.services.map((slug, j) => (
                  <ServiceGlyph
                    key={slug}
                    slug={slug}
                    className={cn(
                      "transition-transform duration-200 ease-out-expo",
                      j > 0 && "-ml-2 group-hover:translate-x-1",
                    )}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-h4 font-semibold text-fg">{bundle.name}</h3>
                <p className="text-caption text-fg-subtle">
                  {bundle.services
                    .map((slug) => services.find((s) => s.slug === slug)!.shortName)
                    .join(" + ")}
                </p>
              </div>
              <p className="flex-1 text-body-sm text-fg-muted">{bundle.body}</p>
              <Link
                href={`${ctas.primary.href}?bundle=${bundle.id}`}
                prefetch={prefetchFor(ctas.primary.href)}
                className="inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
              >
                Scope this bundle
                <ArrowRightIcon
                  aria-hidden
                  className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const standards = [
  { Icon: UsersIcon, title: "Dedicated lead", body: "One name, one inbox." },
  { Icon: LifebuoyIcon, title: "Backup on every role", body: "Vacations don't stall your work." },
  { Icon: WrenchIcon, title: "Your tools, not ours", body: "Work happens in your accounts." },
  { Icon: FileTextIcon, title: "Friday report, every week", body: "Done, blocked, next. One page." },
] as const;

/** Hub 2.4: the standards every service shares. */
export function SharedStandards() {
  return (
    <section aria-labelledby="standards-title" className="border-y border-line bg-bg-alt py-16 md:py-20">
      <div className="mx-auto max-w-(--container-content) px-(--gutter)">
        <h2 id="standards-title" className="sr-only">
          What every service includes
        </h2>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {standards.map(({ Icon, title, body }) => (
            <li key={title} data-reveal className="flex gap-4">
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-ink-800 text-ink-200"
              >
                <Icon weight="light" className="size-5" />
              </span>
              <div>
                <h3 className="text-h5 font-semibold text-fg">{title}</h3>
                <p className="mt-1 text-body-sm text-fg-muted">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const models = [
  {
    name: "Dedicated",
    tagline: "A full-time specialist, yours exclusively.",
    bestFor: "Ongoing, daily work",
    billing: "Fixed monthly fee per role",
    terms: "90-day minimum, then month-to-month",
    highlight: true,
  },
  {
    name: "Pooled",
    tagline: "A block of hours across a team.",
    bestFor: "Variable or multi-function work",
    billing: "Monthly retainer, from 40 hours",
    terms: "Unused hours roll over once",
    highlight: false,
  },
  {
    name: "Project",
    tagline: "Fixed scope, fixed price, fixed date.",
    bestFor: "Site builds, hiring sprints, contract migrations",
    billing: "40% at start · 40% at midpoint · 20% on acceptance",
    terms: "Fixed quote after scoping",
    highlight: false,
  },
] as const;

/** Hub 2.5 (G9): engagement models. Structure published, no list prices. */
export function EngagementModels() {
  return (
    <section id="engagement-models" aria-labelledby="models-title" className="scroll-mt-24 py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader
          id="models-title"
          eyebrow="Engagement models"
          title="Three ways to work with us."
          intro="No setup fees, and no list prices: every engagement is scoped. You'll have a written quote within 48 hours of your scoping call."
        />
        <ul className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {models.map((model) => (
            <li
              key={model.name}
              data-reveal
              className={cn(
                "relative flex flex-col gap-6 rounded-lg border p-6 shadow-e1 md:p-8",
                model.highlight
                  ? "border-t-2 border-volt-500/40 border-t-volt-500 bg-volt-950"
                  : "border-line bg-surface-1",
              )}
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-h3 font-semibold text-fg">{model.name}</h3>
                <p className="text-body-sm text-fg-muted">{model.tagline}</p>
              </div>
              <dl className="flex flex-col gap-4 border-t border-line pt-6 text-body-sm">
                {(
                  [
                    ["Best for", model.bestFor],
                    ["Billing", model.billing],
                    ["Terms", model.terms],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <dt className="text-caption text-fg-muted">{label}</dt>
                    <dd className="text-fg">{value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <div data-reveal className="flex justify-center">
          <Button asChild size="lg" iconRight="arrow">
            <Link href={`${ctas.primary.href}?topic=quote`} prefetch={prefetchFor(ctas.primary.href)}>
              Get a quote in 48 hours
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
