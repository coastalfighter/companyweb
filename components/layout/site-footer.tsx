import { cacheLife } from "next/cache";
import Link from "next/link";
import { GithubLogoIcon, LinkedinLogoIcon, PlusIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  ctas,
  footerNav,
  legalNav,
  prefetchFor,
  siteConfig,
  socialLinks,
  trustBadges,
  type NavItem,
} from "@/lib/site";
import { AnalyticsSettingsButton } from "@/components/analytics/analytics-settings";
import { readNewsletterConfig } from "@/lib/newsletter";
import { BackToTop } from "./back-to-top";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

/** Cached so the static shell can prerender; refreshes whenever the site is rebuilt. */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const socialIcons = { LinkedIn: LinkedinLogoIcon, GitHub: GithubLogoIcon } as const;

function FooterLink({ item }: { item: NavItem }) {
  return (
    <Link
      href={item.href}
      prefetch={prefetchFor(item.href)}
      className="inline-flex min-h-8 items-center text-body-sm text-fg-muted transition-colors duration-150 hover:text-fg"
    >
      {item.label}
    </Link>
  );
}

/**
 * Site footer (docs/blueprint/02-sitemap.md, B2.5).
 * Five columns at ≥1024px, brand + two columns at md, accordions below 640px
 * (native <details>, works without JS). The disclaimer line is intentional:
 * legal protection, and a trust signal for CFOs.
 *
 * Motion system §9: the name returns at 50vw in 5% lime behind everything (a designed
 * close, not a sitemap), social icons fill lime with a small hop, a magnetic back-to-top
 * "whooshes" the page home, and the newsletter field (only when its HubSpot form is
 * configured) slides its arrow in on focus.
 */
export function SiteFooter() {
  const newsletter = readNewsletterConfig() !== null;
  return (
    <footer data-cta-zone className="relative isolate overflow-hidden border-t border-line bg-bg">
      {/* Decoration, drawn by CSS (::before) so it is never read or scanned as text. */}
      <div
        aria-hidden
        data-parallax="0.4"
        className="footer-wordmark pointer-events-none absolute -bottom-[0.12em] left-1/2 -z-10 -translate-x-1/2"
      />
      <div className="mx-auto max-w-(--container-content) px-(--gutter) pt-16 pb-10 lg:pt-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="flex flex-col items-start gap-5 md:col-span-12 lg:col-span-4">
            <Logo />
            <p className="max-w-xs text-body-sm text-fg-muted">{siteConfig.tagline}</p>
            <Button asChild size="md" iconRight="arrow">
              <Link href={ctas.primary.href} prefetch={prefetchFor(ctas.primary.href)}>
                {ctas.primary.short}
              </Link>
            </Button>
            {newsletter ? (
              <div className="mt-4 w-full">
                <NewsletterForm />
              </div>
            ) : null}
          </div>

          {/* ≥640px: columns */}
          <nav
            aria-label="Footer"
            className="hidden gap-8 sm:grid sm:grid-cols-4 md:col-span-12 lg:col-span-8"
          >
            {footerNav.map((group) => (
              <div key={group.title}>
                <h2 className="text-overline font-medium text-fg-subtle uppercase">{group.title}</h2>
                <ul className="mt-4 flex flex-col gap-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* <640px: accordions */}
          <nav aria-label="Footer" className="-mt-4 sm:hidden">
            {footerNav.map((group) => (
              <details key={group.title} className="group border-b border-line">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-body font-medium text-fg [&::-webkit-details-marker]:hidden">
                  {group.title}
                  <PlusIcon
                    aria-hidden
                    className="size-4 text-fg-subtle transition-transform duration-200 ease-out-expo group-open:rotate-45"
                  />
                </summary>
                <ul className="flex flex-col gap-1 pb-4">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </nav>
        </div>

        {trustBadges.length > 0 ? (
          <ul
            aria-label="Certifications"
            className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-8"
          >
            {trustBadges.map((badge) => (
              <li
                key={badge.label}
                className="rounded-xs border border-line px-2.5 py-1 text-micro font-medium text-fg-subtle"
              >
                {badge.href ? (
                  <a href={badge.href} className="hover:text-fg">
                    {badge.label}
                  </a>
                ) : (
                  badge.label
                )}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8 flex flex-col gap-6 border-t border-line pt-8 sm:mt-12 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-caption text-fg-subtle">
            © <CopyrightYear /> Akrostech. Akrostech is not a law firm or CPA firm.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-5 gap-y-1">
                {legalNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={prefetchFor(item.href)}
                      className="inline-flex min-h-8 items-center text-caption text-fg-subtle transition-colors hover:text-fg"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                {process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ? (
                  <li>
                    <AnalyticsSettingsButton className="inline-flex min-h-8 cursor-pointer items-center text-caption text-fg-subtle transition-colors hover:text-fg" />
                  </li>
                ) : null}
              </ul>
            </nav>
            {socialLinks.length > 0 ? (
              <ul className="flex gap-1">
                {socialLinks.map((social) => {
                  const Icon = socialIcons[social.label];
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        aria-label={`Akrostech on ${social.label}`}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="social-icon grid size-9 place-items-center rounded-md text-fg-subtle"
                      >
                        <Icon aria-hidden className="size-5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            <BackToTop />
          </div>
        </div>
      </div>
      {/* Room for the wordmark to rise into. */}
      <div aria-hidden className="h-[18vw] min-h-24" />
    </footer>
  );
}
