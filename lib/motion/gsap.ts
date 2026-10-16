import type { gsap as GsapInstance } from "gsap";
import type { ScrollTrigger as ScrollTriggerInstance } from "gsap/ScrollTrigger";
import { duration, ease } from "./tokens";

export type Gsap = typeof GsapInstance;
export type ScrollTriggerStatic = typeof ScrollTriggerInstance;

export interface MotionEngine {
  gsap: Gsap;
  ScrollTrigger: ScrollTriggerStatic;
}

let engine: Promise<MotionEngine> | null = null;

/**
 * Loads GSAP core + ScrollTrigger once, on the client, as an async chunk (~38 KB gzip).
 *
 * Why a dynamic import: the homepage already ships 175 KB of render-critical JS against
 * a 200 KB budget (tests/e2e/budgets.spec.ts). Imported statically, GSAP would block the
 * first render of every page; loaded here, it downloads in parallel with hydration and
 * never delays the H1 (vercel-react-best-practices: "defer non-critical third-party
 * code"). Everything that animates is visible and usable before this resolves.
 *
 * Sets `data-motion-ready` on <html> so CSS can tell GSAP is driving (and so the
 * failsafe in globals.css reveals content if this chunk never arrives).
 */
export function loadMotion(): Promise<MotionEngine> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("GSAP is client-only; call loadMotion() from an effect."));
  }
  engine ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
    .then(([core, plugin]) => {
      const { gsap } = core;
      const { ScrollTrigger } = plugin;
      gsap.registerPlugin(ScrollTrigger);
      gsap.defaults({ ease: ease.entrance, duration: duration.reveal });
      gsap.config({ nullTargetWarn: false });
      // Mobile URL bars resize the viewport on every scroll direction change; refreshing
      // then would make pinned sections jump.
      ScrollTrigger.config({ ignoreMobileResize: true });
      document.documentElement.setAttribute("data-motion-ready", "");
      return { gsap, ScrollTrigger };
    })
    .catch((error: unknown) => {
      engine = null;
      throw error;
    });
  return engine;
}

/** True when the visitor asked for less motion (or the browser can't tell us). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True for a mouse or trackpad: hover effects, cursor, tilt and magnets only run here. */
export function hasFinePointer(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
