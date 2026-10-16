/**
 * URL rules for the old, spam-injected site's cleanup (docs/blueprint/02-sitemap.md,
 * "Migration from the compromised site"). Pure functions, shared by proxy.ts and
 * next.config.ts, and unit tested.
 *
 * 1. Legitimate legacy URLs → 301 to their new home (next.config redirects, cached).
 * 2. Spam-shaped URLs → 410 Gone (proxy.ts), which de-indexes faster than 404.
 * 3. Unknown slugs under routes with a fixed set of pages → one shared 404 (proxy.ts),
 *    so random URLs can't each leave a not-found entry in the cache.
 */

/**
 * Legacy path → new path. Seeded with the common equivalents of a typical old site;
 * add every legitimate URL from the Screaming Frog crawl and the Search Console
 * export here (blueprint step 2). Keys are lowercase, without a trailing slash.
 */
export const legacyRedirects: Readonly<Record<string, string>> = {
  "/about-us": "/about",
  "/our-story": "/about",
  "/contact-us": "/contact",
  "/get-in-touch": "/contact",
  "/get-started": "/contact",
  "/our-services": "/services",
  "/how-we-work": "/how-it-works",
  "/process": "/how-it-works",
  "/case-studies": "/work",
  "/portfolio": "/work",
  "/jobs": "/careers",
  "/join-us": "/careers",
  "/privacy-policy": "/legal/privacy",
  "/privacy": "/legal/privacy",
  "/terms": "/legal/terms",
  "/terms-of-service": "/legal/terms",
  "/terms-and-conditions": "/legal/terms",
  "/cookie-policy": "/legal/cookies",
  "/security": "/about/security",
};

/** Path patterns that never exist on this site and are typical of WordPress spam injection. */
const SPAM_PATH_PATTERNS: readonly RegExp[] = [
  /^\/wp-(admin|content|includes|login|json|signup|cron)\b/i,
  /^\/xmlrpc\.php/i,
  /\.(php\d?|aspx?|jsp|cgi|pl)$/i,
  /\.html?$/i,
  /^\/(feed|rss|comments\/feed)\/?$/i,
  /^\/(category|tag|author|page|archives?)\//i,
  /^\/\d{4}\/\d{2}(\/|$)/,
];

/** Injected keyword pages. Not applied inside this site's own sections (a client could be "Acme Pharma"). */
const SPAM_KEYWORDS: readonly RegExp[] = [
  /(viagra|cialis|levitra|pharma|pharmacy|casino|poker|slots?-|betting|gambl|replica|escort|porn|xxx|loan-|payday|essay-writ|crypto-casino|bitcoin-casino|weight-loss|keto-)/i,
];

/** Top-level sections of this site; keyword rules never fire inside them. */
export const SITE_SECTIONS: readonly string[] = [
  "/services",
  "/how-it-works",
  "/work",
  "/about",
  "/careers",
  "/resources",
  "/contact",
  "/legal",
  "/design-system",
  "/api",
];

/** Query parameters WordPress (and its spam) use; nothing on this site reads them. */
const SPAM_QUERY_KEYS: ReadonlySet<string> = new Set([
  "p",
  "page_id",
  "cat",
  "s",
  "m",
  "attachment_id",
  "author",
  "feed",
]);
const SPAM_QUERY_VALUE = /(viagra|cialis|casino|poker|porn|escort|replica|payday)/i;

/**
 * True for URLs the injected site served and this site never will. Non-ASCII
 * paths count too: every real path here is ASCII, and the injected pages were
 * largely foreign-language (blueprint step 3).
 */
export function isSpamUrl(pathname: string, search: URLSearchParams): boolean {
  if (/[^\x00-\x7f]/.test(safeDecode(pathname))) return true;
  if (SPAM_PATH_PATTERNS.some((re) => re.test(pathname))) return true;
  const ownSection = SITE_SECTIONS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!ownSection && SPAM_KEYWORDS.some((re) => re.test(pathname))) return true;
  for (const [key, value] of search) {
    if (SPAM_QUERY_KEYS.has(key.toLowerCase())) return true;
    if (SPAM_QUERY_VALUE.test(key) || SPAM_QUERY_VALUE.test(value)) return true;
  }
  return false;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // Malformed escapes are themselves a sign of junk; keep the raw value.
    return value;
  }
}

/**
 * For routes whose pages are all known at build time: the path's slug is unknown
 * (→ shared 404). Returns false for anything outside those prefixes.
 */
export function isUnknownSlug(
  pathname: string,
  known: Readonly<Record<string, ReadonlySet<string>>>,
): boolean {
  const match = /^\/([a-z-]+)\/([^/]+)\/?$/.exec(pathname);
  if (!match) return false;
  const slugs = known[match[1]!];
  return slugs !== undefined && !slugs.has(match[2]!);
}

/** The 410 page: minimal, self-contained, noindex. */
export function goneHtml(siteName: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gone · ${siteName}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0a;color:#f4f4f5;font:16px/1.5 system-ui,sans-serif}main{max-width:32rem;padding:2rem}a{color:#a3e635}</style></head><body><main><h1>This page is gone.</h1><p>It was never part of ${siteName}, and it isn't coming back.</p><p><a href="/">Go to the homepage</a></p></main></body></html>`;
}
