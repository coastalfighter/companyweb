/**
 * The visitor's own motion setting (docs/blueprint/11-motion-system.md §8).
 *
 * The OS-level `prefers-reduced-motion` covers people who know about it. This adds a
 * visible switch on the page ("Reduce motion", in the footer and the mobile menu), so
 * anyone can stop ambient loops, the marquee, the boot screen and route curtains: the
 * pause mechanism WCAG 2.2.2 asks for, and ui-ux-pro-max's `auto-rotation-controls`.
 *
 * `<html data-motion-pref="reduced">` marks the choice. The inline boot script reads it
 * before first paint (lib/motion/boot.ts), and every motion check treats it exactly
 * like the OS setting.
 */

/** localStorage key: "this visitor switched motion off". Disclosed in content/trust.ts. */
export const STORAGE_KEY = "akros:motion";
export const MOTION_PREF_EVENT = "akros:motion-pref";
const ATTR = "data-motion-pref";

/** True when the visitor switched motion off on this site. */
export function hasReducedMotionPref(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute(ATTR) === "reduced";
}

/** Saves the choice, updates <html> and tells every listener. */
export function setReducedMotionPref(reduced: boolean): void {
  const html = document.documentElement;
  if (reduced) {
    html.setAttribute(ATTR, "reduced");
    // The "motion allowed" first-frame states (blurred hero words) no longer apply.
    html.removeAttribute("data-motion");
  } else {
    html.removeAttribute(ATTR);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      html.setAttribute("data-motion", "on");
  }
  try {
    if (reduced) window.localStorage.setItem(STORAGE_KEY, "reduced");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: the choice still holds for this page view.
  }
  window.dispatchEvent(new Event(MOTION_PREF_EVENT));
}
