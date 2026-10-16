import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/edge/rules";

const isDev = process.env.NODE_ENV === "development";

/**
 * Static-friendly CSP (no nonces, so pages stay prerendered on the CDN).
 * Hardening path: enable `experimental.sri` and drop 'unsafe-inline' from
 * script-src once it is stable. See docs/blueprint/09-tech-stack.md (I3).
 * Allowlist new third parties here explicitly (e.g. Cal.com, PostHog, Turnstile in M1d).
 */
/**
 * PostHog (M4c) is loaded only after consent, and only when configured. It needs its
 * ingestion host and the matching assets host for config; nothing else.
 */
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
  ? new URL(process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com").origin
  : null;
const analyticsOrigins = posthogHost
  ? ` ${posthogHost} ${posthogHost.replace(".i.posthog.com", "-assets.i.posthog.com")}`
  : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  // challenges.cloudflare.com: Turnstile on the contact form (loaded only on intent).
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
  "frame-src https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self' https://challenges.cloudflare.com${analyticsOrigins}${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // typedRoutes: enable in M1 once /services, /contact etc. exist (M0 links point at not-yet-built routes).
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Design-review pages hold sample data: never indexed, even if linked from elsewhere.
      { source: "/design-system/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  // Legitimate URLs from the old site (blueprint B1 migration, step 2).
  async redirects() {
    return Object.entries(legacyRedirects).map(([source, destination]) => ({
      source,
      destination,
      statusCode: 301 as const,
    }));
  },
};

export default nextConfig;
