import Link from "next/link";
import { JsonLd } from "@/lib/json-ld";
import { prefetchFor, siteConfig } from "@/lib/site";

export interface Crumb {
  label: string;
  href: string;
}

/** Breadcrumb (G3.4): caption size, "/" separators, current page marked, BreadcrumbList JSON-LD. */
export function Breadcrumb({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            item: `${siteConfig.url}${item.href}`,
          })),
        }}
      />
      <ol className="flex flex-wrap items-center gap-2 text-caption text-fg-subtle">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-fg-muted">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    prefetch={prefetchFor(item.href)}
                    className="transition-colors hover:text-fg"
                  >
                    {item.label}
                  </Link>
                  <span aria-hidden className="text-ink-500">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
