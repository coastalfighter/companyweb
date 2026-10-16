import { cacheLife } from "next/cache";
import Link from "next/link";
import { prefetchFor, primaryNav, siteConfig } from "@/lib/site";
import { Logo } from "./logo";

/** Minimal M0 footer. The full five-column footer (B2.5) lands in M1. */
/** Cached so the static shell can prerender; refreshes whenever the site is rebuilt. */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-10 px-(--gutter) py-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="max-w-xs text-body-sm text-fg-muted">{siteConfig.tagline}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-body-sm">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={prefetchFor(item.href)}
                    className="text-fg-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-fg-muted transition-colors hover:text-fg"
                >
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <p className="border-t border-line pt-6 text-caption text-fg-subtle">
          © <CopyrightYear /> Akrostech. Akrostech is not a law firm or CPA firm.
        </p>
      </div>
    </footer>
  );
}
