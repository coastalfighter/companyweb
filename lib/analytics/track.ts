import { analyticsConfigured, readConsent } from "./consent";

/**
 * The measurement plan (docs/blueprint/06-cta-conversion.md, F5). Event names and
 * properties are fixed here so nothing else can be sent: no form values, no
 * emails, no free text beyond a link's own label.
 */
export interface AnalyticsEvents {
  cta_click: { location: string; label: string; href: string };
  calculator_start: Record<string, never>;
  calculator_complete: { functions: number; has_rate_card: boolean };
  calculator_pdf: { emailed: boolean };
  form_start: { form: "contact" };
  form_field_error: { form: "contact"; field: string };
  form_submit: { form: "contact"; services: number };
}

export type AnalyticsEvent = keyof AnalyticsEvents;

interface PostHogLike {
  capture(event: string, properties?: Record<string, unknown>): void;
  opt_out_capturing(): void;
  opt_in_capturing(): void;
}

let client: PostHogLike | null = null;
let loading: Promise<PostHogLike | null> | null = null;
/** Events fired between consent and the library finishing loading. */
const queue: [string, Record<string, unknown>][] = [];

/** For tests: forget the loaded client. */
export function resetAnalyticsForTests(): void {
  client = null;
  loading = null;
  queue.length = 0;
}

/**
 * Loads PostHog, only after consent and only once. The library (~100 KB) is a
 * dynamic import, so it never touches the JS budget for anyone who hasn't opted in.
 */
export function loadAnalytics(
  importer: () => Promise<{ default: unknown }> = () => import("posthog-js"),
): Promise<PostHogLike | null> {
  if (client) return Promise.resolve(client);
  if (loading) return loading;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key || readConsent() !== "granted") return Promise.resolve(null);

  loading = importer()
    .then((mod) => {
      const posthog = mod.default as PostHogLike & {
        init: (key: string, config: Record<string, unknown>) => void;
      };
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com",
        defaults: "2025-05-24",
        // No cookies: the cookies page promises none.
        persistence: "localStorage",
        // Only the events above, plus page views. No autocapture, replay, surveys or remote scripts.
        autocapture: false,
        capture_pageview: "history_change",
        capture_pageleave: false,
        disable_session_recording: true,
        disable_surveys: true,
        disable_product_tours: true,
        disable_conversations: true,
        disable_web_experiments: true,
        disable_external_dependency_loading: true,
        enable_heatmaps: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_performance: false,
        rageclick: false,
        respect_dnt: true,
        person_profiles: "never",
        // No feature flags are used, so don't fetch them.
        advanced_disable_flags: true,
        save_referrer: true,
      });
      client = posthog;
      for (const [event, properties] of queue.splice(0)) posthog.capture(event, properties);
      return posthog;
    })
    .catch((error: unknown) => {
      console.warn("[analytics] PostHog failed to load", error);
      loading = null;
      return null;
    });
  return loading;
}

/** Stops sending immediately when consent is withdrawn. */
export function stopAnalytics(): void {
  client?.opt_out_capturing();
  queue.length = 0;
}

/** Sends an event if, and only if, the visitor has allowed analytics. */
export function track<E extends AnalyticsEvent>(event: E, properties: AnalyticsEvents[E]): void {
  if (typeof window === "undefined" || !analyticsConfigured() || readConsent() !== "granted") return;
  if (client) client.capture(event, properties);
  else {
    if (queue.length < 50) queue.push([event, properties]);
    void loadAnalytics();
  }
}
