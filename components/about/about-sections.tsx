import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, LinkedinLogoIcon, ShieldCheckIcon, UsersThreeIcon } from "@phosphor-icons/react/ssr";
import { CountUp } from "@/components/home/count-up";
import { SectionHeader } from "@/components/marketing/section-header";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  company as verifiedCompany,
  initials,
  operatingRules,
  principles,
  type CompanyFacts,
  type Leader,
} from "@/content/company";
import { prefetchFor } from "@/lib/site";
import { cn } from "@/lib/utils";
import { HubClocks } from "./hub-clocks";
import { landDots, MAP_COLUMNS, MAP_ROWS, project } from "./world-dots";

/**
 * About page sections (docs/blueprint/03-page-blueprints.md, section 8). Sections
 * built on company facts render only when content/company.ts has them; the design
 * preview passes sample data explicitly.
 */

/** Splits a headline into words that rise in sequence (8.1). Transform-only, so LCP is unaffected. */
export function WordRise({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <span key={`${word}-${i}`}>
      <span className="word-rise inline-block" style={{ "--w": i } as React.CSSProperties}>
        {word}
      </span>{" "}
    </span>
  ));
}

export function AboutHero() {
  return (
    <section
      aria-labelledby="about-title"
      className="grain isolate overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24"
    >
      <div aria-hidden className="grid-overlay pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto grid max-w-(--container-content) px-(--gutter) lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-9">
          <Eyebrow>About Akrostech</Eyebrow>
          <h1 id="about-title" className="font-display text-display-lg font-semibold text-fg">
            <WordRise text="We started Akrostech because outsourcing had a trust problem." />
          </h1>
          <p className="max-w-[60ch] text-body-lg text-fg-muted">
            Too many companies have been burned by vendors who overpromise in the sales call and disappear by
            month three. We built the opposite: a team that shows its work, every day.
          </p>
        </div>
      </div>
    </section>
  );
}

/** 8.2: the true story when supplied; the three operating rules always. */
export function OriginSection({ company = verifiedCompany }: { company?: CompanyFacts }) {
  const hasStory = company.originStory.length > 0;
  return (
    <section aria-labelledby="origin-title" className="border-t border-line py-(--section-y)">
      <div className="mx-auto grid max-w-(--container-content) gap-12 px-(--gutter) lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div data-reveal className="flex flex-col gap-5 lg:sticky lg:top-32">
            <Eyebrow>{hasStory ? "Our story" : "How we run"}</Eyebrow>
            <h2 id="origin-title" className="font-display text-h2 font-semibold text-fg">
              Three rules we set on day one.
            </h2>
            <p className="max-w-[44ch] text-body text-fg-muted">
              They decide how we hire, how we report and how we price. They haven&apos;t changed.
            </p>
          </div>
        </div>
        <div data-reveal className="flex flex-col gap-8 lg:col-span-6 lg:col-start-7">
          {company.originStory.map((paragraph) => (
            <p key={paragraph} className="text-body-lg text-fg-muted">
              {paragraph}
            </p>
          ))}
          <ol className="flex flex-col border-t border-line">
            {operatingRules.map((rule, i) => (
              <li key={rule.title} className="flex gap-6 border-b border-line py-6">
                <span aria-hidden className="tabular pt-1 font-mono text-body-sm text-accent-text">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-body-lg text-fg-muted">
                  <strong className="font-semibold text-fg">{rule.title}</strong> {rule.body}
                </p>
              </li>
            ))}
          </ol>
          {company.originToday ? <p className="text-body-lg text-fg">{company.originToday}</p> : null}
        </div>
      </div>
    </section>
  );
}

/** 8.3: 2×2 text cards with a 10% lime numeral watermark. */
export function PrinciplesSection() {
  return (
    <section aria-labelledby="principles-title" className="py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader id="principles-title" eyebrow="Principles" title="What we hold ourselves to." />
        <ul className="grid gap-4 md:grid-cols-2 md:gap-6">
          {principles.map((principle, i) => (
            <li
              key={principle.title}
              data-reveal
              style={{ "--reveal-i": i % 2 } as React.CSSProperties}
              className="relative isolate overflow-hidden rounded-lg border border-line bg-surface-1 p-8 shadow-e1 md:p-10"
            >
              <span
                aria-hidden
                className="tabular pointer-events-none absolute -top-4 left-4 -z-10 font-display text-[7.5rem] leading-none font-semibold text-volt-500/10"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-12 font-display text-h3 font-semibold text-fg">{principle.title}</h3>
              <p className="mt-4 max-w-[44ch] text-body-lg text-fg-muted">{principle.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 8.4: verified numbers only, counted up once. */
export function NumbersBand({ company = verifiedCompany }: { company?: CompanyFacts }) {
  if (company.numbers.length === 0) return null;
  return (
    <section aria-label="Akrostech in numbers" className="border-y border-line py-16 md:py-24">
      <dl className="mx-auto grid max-w-(--container-content) grid-cols-2 gap-y-12 px-(--gutter) lg:grid-cols-4">
        {company.numbers.map((number, i) => (
          <div
            key={number.label}
            data-reveal
            className={cn(
              "flex flex-col gap-2 px-4 lg:px-8 lg:first:border-l-0",
              i % 2 === 1 && "border-l border-line",
              "lg:border-l",
            )}
          >
            <dt className="order-2 text-body-sm text-fg-muted">{number.label}</dt>
            <dd className="order-1 font-display text-stat font-medium text-fg">
              {/* Years are labels, not quantities: they don't count up. */}
              {/^(19|20)\d\d$/.test(number.value) ? number.value : <CountUp value={number.value} />}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <li className="group flex flex-col gap-5">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-ink-900">
        {leader.portrait ? (
          <>
            <Image
              src={leader.portrait}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover grayscale transition-[filter] duration-360 ease-out-expo group-focus-within:grayscale-0 group-hover:grayscale-0"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-volt-500 mix-blend-multiply transition-opacity duration-360 ease-out-expo group-focus-within:opacity-0 group-hover:opacity-0"
            />
          </>
        ) : (
          <span
            aria-hidden
            className="grid-overlay absolute inset-0 grid place-items-center font-display text-h1 font-semibold text-ink-500"
          >
            {initials(leader.name)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h5 font-semibold text-fg">{leader.name}</h3>
          {leader.linkedin ? (
            <a
              href={leader.linkedin}
              rel="noopener"
              className="grid size-8 shrink-0 place-items-center rounded-md text-fg-muted transition-colors hover:bg-ink-800 hover:text-fg"
            >
              <LinkedinLogoIcon aria-hidden className="size-5" />
              <span className="sr-only">{leader.name} on LinkedIn</span>
            </a>
          ) : null}
        </div>
        <p className="text-body-sm text-accent-text">{leader.role}</p>
        <p className="text-body-sm text-fg-muted">{leader.background}</p>
        {leader.previously.length > 0 ? (
          <p className="mt-1 font-mono text-caption text-fg-muted">
            Previously: {leader.previously.join(", ")}
          </p>
        ) : null}
      </div>
    </li>
  );
}

/** 8.5: real leadership only. */
export function LeadershipSection({ company = verifiedCompany }: { company?: CompanyFacts }) {
  if (company.leadership.length === 0) return null;
  return (
    <section id="leadership" aria-labelledby="leadership-title" className="py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <SectionHeader
          id="leadership-title"
          eyebrow="Leadership"
          title="The people accountable for your account."
        />
        <ul data-reveal className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {company.leadership.map((leader) => (
            <LeaderCard key={leader.name} leader={leader} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/** 8.6: dot-matrix map (hubs in lime, pulsing once in sequence) and live local times. */
export function WhereWeWork({ company = verifiedCompany }: { company?: CompanyFacts }) {
  if (company.hubs.length === 0) return null;
  const hubCells = company.hubs.map((hub) => project(hub.lat, hub.lon));
  const isHub = (col: number, row: number) => hubCells.some((c) => c.col === col && c.row === row);

  return (
    <section aria-labelledby="hubs-title" className="border-y border-line bg-surface-1 py-(--section-y)">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
        <div data-reveal className="flex flex-col gap-6">
          <Eyebrow>Where we work</Eyebrow>
          <h2 id="hubs-title" className="max-w-[24ch] font-display text-h3 font-semibold text-fg">
            Distributed by design. Overlapping with you by default.
          </h2>
          <HubClocks hubs={company.hubs} />
        </div>
        <div data-reveal className="hub-map">
          <svg
            aria-hidden
            viewBox={`0 0 ${MAP_COLUMNS * 10} ${MAP_ROWS * 10}`}
            className="h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {landDots
              .filter((dot) => !isHub(dot.col, dot.row))
              .map((dot) => (
                <circle
                  key={`${dot.col}-${dot.row}`}
                  cx={dot.col * 10 + 5}
                  cy={dot.row * 10 + 5}
                  r={1.6}
                  className="fill-ink-500"
                />
              ))}
            {hubCells.map((cell, i) => (
              <g key={company.hubs[i]!.city} style={{ "--hub-i": i } as React.CSSProperties}>
                <circle
                  cx={cell.col * 10 + 5}
                  cy={cell.row * 10 + 5}
                  r={6}
                  className="hub-pulse fill-volt-500/30"
                />
                <circle cx={cell.col * 10 + 5} cy={cell.row * 10 + 5} r={3.2} className="fill-volt-500" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

/** 8.7 + 8.8: security and careers link cards. */
export function AboutTeasers() {
  const cards = [
    {
      href: "/contact?topic=security",
      icon: ShieldCheckIcon,
      title: "Running a security review?",
      body: "Ask for our DPA, access policy and sub-processor list before the first call.",
      cta: "Request the security pack",
    },
    {
      href: "/careers",
      icon: UsersThreeIcon,
      title: "We're hiring operators who care about the details.",
      body: "Senior work, real overlap hours and training that's actually funded.",
      cta: "See open roles",
    },
  ] as const;

  return (
    <section aria-label="More about Akrostech" className="py-(--section-y)">
      <ul className="mx-auto grid max-w-(--container-content) gap-4 px-(--gutter) md:grid-cols-2 md:gap-6">
        {cards.map((card) => (
          <li
            key={card.href}
            data-reveal
            className="group relative flex flex-col gap-4 rounded-lg border border-line bg-surface-1 p-8 shadow-e1 transition-[border-color,transform] duration-150 ease-out-expo focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus hover:-translate-y-0.5 hover:border-volt-500/35"
          >
            <card.icon aria-hidden weight="light" className="size-8 text-volt-500" />
            <h2 className="font-display text-h4 font-semibold text-fg">
              <Link
                href={card.href}
                prefetch={prefetchFor(card.href)}
                className="outline-none after:absolute after:inset-0"
              >
                {card.title}
              </Link>
            </h2>
            <p className="text-body text-fg-muted">{card.body}</p>
            <span
              aria-hidden
              className="mt-auto inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
            >
              {card.cta}
              <ArrowRightIcon className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]" />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
