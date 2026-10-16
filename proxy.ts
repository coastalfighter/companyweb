import { NextResponse, type NextRequest } from "next/server";
import { caseStudies } from "@/content/case-studies";
import { comparisons } from "@/content/compare";
import { serviceContent } from "@/content/services";
import { goneHtml, isSpamUrl, isUnknownSlug } from "@/lib/edge/rules";
import { siteConfig } from "@/lib/site";

/** Sections whose pages are all known at build time. */
const KNOWN_SLUGS: Readonly<Record<string, ReadonlySet<string>>> = {
  services: new Set(Object.keys(serviceContent)),
  work: new Set(caseStudies.map((s) => s.slug)),
  compare: new Set(comparisons.map((c) => c.slug)),
};

/** A path that matches no route, so the app renders its 404 once, from one cache entry. */
const SHARED_NOT_FOUND = "/__not-found";

/**
 * Spam-URL cleanup and unknown-slug handling (lib/edge/rules.ts). Legacy 301s are in
 * next.config.ts, which runs first and is cached; this only sees what's left.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (isSpamUrl(pathname, searchParams)) {
    return new NextResponse(goneHtml(siteConfig.name), {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  if (isUnknownSlug(pathname, KNOWN_SLUGS)) {
    return NextResponse.rewrite(new URL(SHARED_NOT_FOUND, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next's own assets and the files this site serves at the root.
  matcher: [
    "/((?!_next/static|_next/image|icon\\.svg|favicon\\.ico|robots\\.txt|sitemap\\.xml|llms\\.txt|\\.well-known/|textures/).*)",
  ],
};
