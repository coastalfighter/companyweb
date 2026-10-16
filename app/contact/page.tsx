import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, LockSimpleIcon } from "@phosphor-icons/react/ssr";
import { ContactFormIsland } from "@/components/contact/contact-form-island";
import { Eyebrow } from "@/components/ui/eyebrow";
import { prefetchFor, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Tell us what's eating your team's week. A lead replies with a few times for a 20-minute scoping call; NDA available before we talk.",
  alternates: { canonical: "/contact" },
};

const steps = [
  { title: "You send this form", detail: "2 minutes" },
  { title: "We reply with times", detail: `Within ${siteConfig.replySla}` },
  { title: "20-minute scoping call", detail: "With a lead, not a salesperson" },
  { title: "Written plan + quote", detail: "Within 48 hours" },
] as const;

/** Contact / Get started (docs/blueprint/03-page-blueprints.md, section 11). */
export default function ContactPage() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || undefined;
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK?.trim() || undefined;

  return (
    <section aria-labelledby="contact-title" className="pt-28 pb-(--section-y) md:pt-36">
      <div className="mx-auto grid max-w-(--container-content) gap-12 px-(--gutter) lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-10">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-5 lg:row-start-1">
          <Eyebrow>Get started</Eyebrow>
          <h1 id="contact-title" className="font-display text-h1 font-semibold text-fg">
            Tell us what&apos;s eating your team&apos;s week.
          </h1>
          <p className="text-body-lg text-fg-muted">
            We&apos;ll reply within {siteConfig.replySla} with a few times for a 20-minute call. No slides, no
            pressure, and an NDA on request before we talk.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-8 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1">
          <div className="rounded-xl border border-line-strong bg-surface-2 p-6 shadow-e2 sm:p-10">
            <ContactFormIsland turnstileSiteKey={turnstileSiteKey} />
          </div>

          <ul className="flex flex-col gap-3 text-body-sm">
            {calLink ? (
              <li>
                <a
                  href={`https://cal.com/${calLink}`}
                  className="group inline-flex items-center gap-1.5 text-fg-muted hover:text-fg"
                  rel="noopener"
                >
                  Prefer to pick a time now? Book directly
                  <ArrowRightIcon aria-hidden className="size-4 text-accent-text" />
                </a>
              </li>
            ) : null}
            <li>
              {/* A plain link (full load) so the form re-reads its prefill on the same route. */}
              <a
                href="/contact?topic=security"
                className="group inline-flex items-center gap-1.5 text-fg-muted hover:text-fg"
              >
                Security review first? Ask for our DPA and policies
                <ArrowRightIcon aria-hidden className="size-4 text-accent-text" />
              </a>
            </li>
            <li>
              <Link
                href="/careers"
                prefetch={prefetchFor("/careers")}
                className="group inline-flex items-center gap-1.5 text-fg-muted hover:text-fg"
              >
                Looking for a job? See open roles
                <ArrowRightIcon aria-hidden className="size-4 text-accent-text" />
              </Link>
            </li>
          </ul>
        </div>

        {/* DOM order is intro, form, reassurance: on phones the form comes right after the H1. */}
        <div className="flex min-w-0 flex-col gap-10 lg:col-span-5 lg:row-start-2">
          <div>
            <h2 className="text-h5 font-semibold text-fg">What happens next</h2>
            <ol className="mt-5 flex flex-col gap-5 border-l border-line pl-6">
              {steps.map((step, i) => (
                <li key={step.title} className="relative">
                  <span
                    aria-hidden
                    className="absolute top-0.5 -left-[33px] grid size-4 place-items-center rounded-full border border-volt-500 bg-bg font-mono text-[0.5625rem] text-volt-500"
                  >
                    {i + 1}
                  </span>
                  <p className="text-body-sm font-medium text-fg">{step.title}</p>
                  <p className="text-caption text-fg-muted">{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-2 text-body-sm">
            <h2 className="text-h5 font-semibold text-fg">Rather email?</h2>
            <a
              href={`mailto:${siteConfig.email}`}
              className="w-fit font-medium text-accent-text hover:underline"
            >
              {siteConfig.email}
            </a>
            <p className="text-caption text-fg-muted">
              {siteConfig.hours}, replies within {siteConfig.replySla}
            </p>
          </div>

          <p className="inline-flex w-fit items-center gap-2 rounded-xs border border-line px-2.5 py-1 text-caption text-fg-muted">
            <LockSimpleIcon aria-hidden weight="light" className="size-4 text-volt-500" />
            Mutual NDA available before the first call
          </p>
        </div>
      </div>
    </section>
  );
}
