"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
  if (existing)
    return window.turnstile
      ? Promise.resolve()
      : new Promise((r) => existing.addEventListener("load", () => r()));
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Turnstile failed to load")));
    document.head.appendChild(script);
  });
}

/**
 * Cloudflare Turnstile, loaded on intent (first focus in the form) so it never costs
 * the page load. "interaction-only" stays invisible unless Cloudflare needs a click.
 * The widget writes its token into a hidden `cf-turnstile-response` input in the form.
 */
export function TurnstileWidget({ siteKey, load }: { siteKey: string; load: boolean }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!load || !container.current) return;
    let widgetId: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId = window.turnstile.render(container.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          theme: "dark",
          "response-field-name": "cf-turnstile-response",
        });
      })
      .catch((error: unknown) => console.error("[contact]", error));
    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [load, siteKey]);

  return <div ref={container} />;
}
