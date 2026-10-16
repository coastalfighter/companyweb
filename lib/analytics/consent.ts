/**
 * Analytics consent (docs/blueprint/09-tech-stack.md: consent before analytics).
 * Stored in localStorage, never a cookie. Global Privacy Control counts as a "no"
 * and is never asked about. Kept tiny: the header, footer and banner import it.
 */
export const CONSENT_STORAGE_KEY = "akros:consent";
const CHANGE_EVENT = "akros:consent";

export type Consent = "granted" | "denied";

/** Analytics is only offered when it's configured at build time. */
export function analyticsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
}

/** The browser's Global Privacy Control signal (Sec-GPC), treated as opting out. */
export function globalPrivacyControl(): boolean {
  try {
    return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  } catch {
    return false;
  }
}

/** The stored choice, or null when the visitor hasn't been asked (or GPC applies). */
export function readConsent(): Consent | null {
  if (globalPrivacyControl()) return "denied";
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(consent: Consent): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, consent);
  } catch {
    // Blocked storage: the choice holds for this page view only.
  }
  window.dispatchEvent(new CustomEvent<Consent>(CHANGE_EVENT, { detail: consent }));
}

/** Clears the choice so the banner asks again ("Analytics settings" in the footer). */
export function resetConsent(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // Nothing stored.
  }
  window.dispatchEvent(new CustomEvent<Consent | null>(CHANGE_EVENT, { detail: null }));
}

/** For useSyncExternalStore. */
export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
