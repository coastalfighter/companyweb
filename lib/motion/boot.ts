/**
 * Boot state shared by the inline <head> script, the preloader and CSS.
 *
 * `<html data-motion="on">`   motion allowed (no prefers-reduced-motion), set before first paint
 * `<html data-boot="pending">` first page of this tab's session: the preloader plays
 * `<html data-boot="done">`    preloader finished, or already played this session
 * `<html data-motion-ready>`   GSAP has loaded (lib/motion/gsap.ts)
 *
 * The preloader plays once per session, not on every navigation (route changes get
 * the 0.6s curtain instead). Per emil-design-eng's frequency rule, a sequence a buyer
 * would sit through on every click stops being delight and becomes latency.
 */

import { STORAGE_KEY as MOTION_STORAGE_KEY } from "./preference";

/** sessionStorage key: "the boot sequence has played in this tab". Disclosed in content/trust.ts. */
export const STORAGE_KEY = "akros:booted";

/**
 * Runs in <head> before the first paint, so the right first frame paints: with
 * reduced motion (the OS setting or the site's own "Reduce motion" switch), an
 * already-booted session or no storage, the preloader is never
 * drawn at all (no flash). Kept tiny and dependency-free on purpose.
 */
export const bootScript = `(function(){try{var d=document.documentElement;if(window.localStorage.getItem(${JSON.stringify(MOTION_STORAGE_KEY)})==="reduced"){d.setAttribute("data-motion-pref","reduced");return}if(window.matchMedia&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-motion","on");d.setAttribute("data-boot",window.sessionStorage.getItem(${JSON.stringify(STORAGE_KEY)})?"done":"pending")}}catch(e){}})();`;

/** Marks the boot sequence as played for the rest of this tab's session. */
export function markBooted(): void {
  document.documentElement.setAttribute("data-boot", "done");
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Storage blocked (private mode, policy): the preloader may play again next load.
  }
}
