"use client";

import { useEffect, useRef, type DependencyList, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { loadMotion, type MotionEngine } from "./gsap";

export { usePrefersReducedMotion as useReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface GsapSetupApi extends MotionEngine {
  /** The gsap.context() this setup runs in. Tweens made later (in event handlers) join it via `ctx.add(() => gsap.to(...))`. */
  ctx: gsap.Context;
  /** The scope element, when one was given. */
  root: HTMLElement | null;
}

export interface UseGsapOptions {
  /** Selector text inside the setup only matches inside this element (gsap-react: always scope). */
  scope?: RefObject<HTMLElement | null>;
  /** Re-run (after reverting) when these change. */
  dependencies?: DependencyList;
  /**
   * Run even with prefers-reduced-motion: reduce. For setups that branch on
   * `reduced` themselves to keep opacity/state feedback (impeccable: "reduced motion
   * means fewer and gentler animations, not zero").
   */
  runWhenReduced?: boolean;
  /** Skip entirely (e.g. no fine pointer). */
  enabled?: boolean;
}

type Setup = (api: GsapSetupApi & { reduced: boolean }) => void | (() => void);

/**
 * GSAP in React without @gsap/react: the gsap-react skill's documented alternative,
 * `gsap.context()` inside `useEffect()` with `ctx.revert()` in cleanup. Used here
 * because GSAP is loaded asynchronously (see loadMotion), so the hook must wait for
 * the engine and must not run the setup if the component unmounted in the meantime.
 *
 * Everything created inside `setup` (tweens, timelines, ScrollTriggers, matchMedia)
 * is reverted on unmount, on dependency change and when the reduced-motion
 * preference flips, restoring the elements' original inline styles.
 */
export function useGsap(setup: Setup, options: UseGsapOptions = {}): void {
  const { scope, dependencies = [], runWhenReduced = false, enabled = true } = options;
  const reduced = usePrefersReducedMotion();
  const setupRef = useRef(setup);
  // Always run the latest setup without re-running the effect on every render.
  useEffect(() => {
    setupRef.current = setup;
  });

  useEffect(() => {
    if (!enabled || (reduced && !runWhenReduced)) return;
    let cancelled = false;
    let ctx: gsap.Context | undefined;

    loadMotion()
      .then((engine) => {
        if (cancelled) return;
        const root = scope?.current ?? null;
        ctx = engine.gsap.context(
          (self) => setupRef.current({ ...engine, ctx: self, root, reduced }),
          root ?? undefined,
        );
      })
      .catch(() => {
        // The chunk failed to load (offline, blocked): the page stays static and readable.
      });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // `dependencies` is the caller's dependency list, spread on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reduced, runWhenReduced, ...dependencies]);
}
