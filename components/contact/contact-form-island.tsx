"use client";

import { Suspense, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { prefillFromSearch, type ContactPrefill } from "@/lib/contact/prefill";
import { ContactForm } from "./contact-form";

const noopSubscribe = () => () => {};
const EMPTY: ContactPrefill = { services: [], nda: false, details: "" };

interface IslandProps {
  turnstileSiteKey?: string;
}

/**
 * Prefills from the router's search params, which (unlike window.location) are
 * already correct during a client-side navigation to /contact?service=….
 *
 * An unsent draft lives in sessionStorage, so it can only be read after hydration:
 * `hydrated` is false for server/hydration renders, then true, and the key change
 * remounts the form once with the draft, avoiding a hydration mismatch.
 */
function ContactFormWithParams({ turnstileSiteKey }: IslandProps) {
  const params = useSearchParams();
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return (
    <ContactForm
      key={hydrated ? "client" : "server"}
      prefill={prefillFromSearch(params)}
      restoreDraft={hydrated}
      ready={hydrated}
      turnstileSiteKey={turnstileSiteKey}
    />
  );
}

/**
 * The page stays static: the prerendered HTML contains the un-prefilled form (the
 * Suspense fallback), which the params-aware form replaces on the client. Both save
 * every keystroke to the session draft and the replacement restores it, so typing
 * carries across the swap. Only keystrokes made before React hydrates (typically the
 * first ~200 ms) can be lost; that's inherent to any server-rendered form.
 */
export function ContactFormIsland({ turnstileSiteKey }: IslandProps) {
  return (
    <Suspense fallback={<ContactForm prefill={EMPTY} turnstileSiteKey={turnstileSiteKey} />}>
      <ContactFormWithParams turnstileSiteKey={turnstileSiteKey} />
    </Suspense>
  );
}
