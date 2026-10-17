"use client";

import { useSyncExternalStore } from "react";
import { hasReducedMotionPref, MOTION_PREF_EVENT } from "@/lib/motion/preference";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  window.addEventListener(MOTION_PREF_EVENT, onChange);
  return () => {
    mql.removeEventListener("change", onChange);
    window.removeEventListener(MOTION_PREF_EVENT, onChange);
  };
}

/** The OS setting or the site's own "Reduce motion" switch. */
const getSnapshot = () => hasReducedMotionPref() || window.matchMedia(QUERY).matches;
// Server render assumes motion is allowed; the client corrects on hydration.
const getServerSnapshot = () => false;

/** Live reduced-motion state (OS `prefers-reduced-motion` or the site switch), SSR-safe. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
