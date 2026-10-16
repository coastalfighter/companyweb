"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  analyticsConfigured,
  readConsent,
  subscribeConsent,
  writeConsent,
  type Consent,
} from "@/lib/analytics/consent";
import { loadAnalytics, stopAnalytics, track } from "@/lib/analytics/track";
import { ctas } from "@/lib/site";

/** Links worth measuring (F5 `cta_click`): the two conversion paths and email. */
const CTA_PATHS: readonly string[] = [ctas.primary.href, ctas.secondary.href];

/** Where on the page a click happened, without reading any user content. */
export function ctaLocation(anchor: Element): string {
  if (anchor.closest("header")) return "header";
  if (anchor.closest("footer")) return "footer";
  if (anchor.closest("[data-cta-zone]")) return "closing-slab";
  const labelled = anchor.closest("section[aria-labelledby]")?.getAttribute("aria-labelledby");
  if (labelled) return labelled;
  const named = anchor.closest("[aria-label]")?.getAttribute("aria-label");
  return named ? named.toLowerCase().replace(/\s+/g, "-").slice(0, 40) : "page";
}

export function isCtaHref(href: string): boolean {
  if (href.startsWith("mailto:")) return true;
  try {
    const url = new URL(href, "https://x.invalid");
    return url.origin === "https://x.invalid" && CTA_PATHS.includes(url.pathname);
  } catch {
    return false;
  }
}

const noopSubscribe = () => () => {};
const serverConsent = (): Consent | null | "pending" => "pending";

function ConsentBanner() {
  return (
    <div
      role="region"
      aria-label="Analytics choice"
      className="fixed inset-x-(--gutter) bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-xl border border-line-strong bg-surface-3 p-5 shadow-e4 sm:right-auto sm:left-6 sm:mx-0"
    >
      <p className="text-body-sm text-fg">
        Can we count visits anonymously? It tells us which pages help. No cookies, no ads, nothing you type.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={() => writeConsent("granted")}>
          Allow
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => writeConsent("denied")}>
          No thanks
        </Button>
        <Link
          href="/legal/cookies#analytics"
          className="text-caption text-fg-muted underline underline-offset-4"
        >
          Details
        </Link>
      </div>
    </div>
  );
}

/**
 * Consent-gated analytics (blueprint 09: PostHog, consent first). Renders nothing
 * and attaches nothing unless NEXT_PUBLIC_POSTHOG_KEY is set at build time.
 */
export function AnalyticsProvider() {
  const configured = analyticsConfigured();
  const consent = useSyncExternalStore(
    configured ? subscribeConsent : noopSubscribe,
    readConsent,
    serverConsent,
  );

  useEffect(() => {
    if (!configured) return;
    if (consent === "granted") {
      void loadAnalytics().then((posthog) => posthog?.opt_in_capturing());
    } else if (consent === "denied") {
      stopAnalytics();
    }
  }, [configured, consent]);

  useEffect(() => {
    if (!configured || consent !== "granted") return;
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || !isCtaHref(href)) return;
      track("cta_click", {
        location: ctaLocation(anchor),
        label: (anchor.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
        href: href.startsWith("mailto:") ? "mailto" : href.split("#")[0]!.slice(0, 120),
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [configured, consent]);

  if (!configured || consent !== null) return null;
  return <ConsentBanner />;
}
