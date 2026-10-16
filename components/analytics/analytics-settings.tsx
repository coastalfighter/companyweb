"use client";

import { resetConsent } from "@/lib/analytics/consent";

/** Footer control to change the analytics choice: withdrawing must be as easy as giving it. */
export function AnalyticsSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => resetConsent()} className={className}>
      Analytics settings
    </button>
  );
}
