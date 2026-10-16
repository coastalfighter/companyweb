"use client";

import { useEffect } from "react";

export const ATTRIBUTION_STORAGE_KEY = "akros:attribution";

export interface StoredAttribution {
  landing_page: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/**
 * Records the first page, referrer and UTM tags of the session (sessionStorage only:
 * no cookies, nothing sent anywhere) so a later contact submission can say where the
 * lead came from (blueprint F3.2 hidden fields).
 */
export function AttributionTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)) return;
      const params = new URLSearchParams(window.location.search);
      const record: StoredAttribution = {
        landing_page: window.location.pathname + window.location.search,
        referrer: document.referrer,
      };
      for (const key of UTM_KEYS) {
        const value = params.get(key);
        if (value) record[key] = value.slice(0, 200);
      }
      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Storage unavailable (private mode, blocked): attribution is optional.
    }
  }, []);
  return null;
}

export function readStoredAttribution(): Partial<StoredAttribution> {
  try {
    return JSON.parse(sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) ?? "{}") as Partial<StoredAttribution>;
  } catch {
    return {};
  }
}
