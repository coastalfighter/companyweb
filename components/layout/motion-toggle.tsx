"use client";

import { useSyncExternalStore } from "react";
import { hasReducedMotionPref, MOTION_PREF_EVENT, setReducedMotionPref } from "@/lib/motion/preference";
import { cn } from "@/lib/utils";

const OS_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(OS_QUERY);
  mql.addEventListener("change", onChange);
  window.addEventListener(MOTION_PREF_EVENT, onChange);
  return () => {
    mql.removeEventListener("change", onChange);
    window.removeEventListener(MOTION_PREF_EVENT, onChange);
  };
}

/** "site" = switched off here, "os" = the device setting, "on" = motion plays. */
function snapshot(): "site" | "os" | "on" {
  if (window.matchMedia(OS_QUERY).matches) return "os";
  return hasReducedMotionPref() ? "site" : "on";
}

/**
 * "Reduce motion" switch (lib/motion/preference.ts). It stops the ambient loops, the
 * marquee, the boot screen, route curtains, parallax and pointer effects for this
 * visitor and remembers the choice. It always sits in the same place (footer, mobile
 * menu), per WCAG 2.2 "consistent help". When the device already asks for reduced
 * motion, it says so instead of offering a choice it can't override.
 */
export function MotionToggle({ className }: { className?: string }) {
  const state = useSyncExternalStore(subscribe, snapshot, () => "on" as const);
  const reduced = state !== "on";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={reduced}
      disabled={state === "os"}
      title={state === "os" ? "Your device is set to reduce motion" : undefined}
      onClick={() => setReducedMotionPref(state !== "site")}
      className={cn(
        "group inline-flex min-h-8 cursor-pointer items-center gap-2 text-caption text-fg-subtle transition-colors hover:text-fg disabled:cursor-default disabled:hover:text-fg-subtle",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border transition-colors duration-200",
          reduced ? "border-volt-500 bg-volt-500/20" : "border-line-field bg-transparent",
        )}
      >
        <span
          className={cn(
            "absolute size-2.5 rounded-full transition-[translate,background-color] duration-200 ease-out-expo",
            reduced ? "translate-x-[14px] bg-volt-500" : "translate-x-[2px] bg-fg-subtle",
          )}
        />
      </span>
      {state === "os" ? "Motion reduced (device setting)" : "Reduce motion"}
    </button>
  );
}
