"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { hasFinePointer } from "@/lib/motion/gsap";

const PointerLayer = lazy(() => import("./pointer-layer"));

/**
 * Loads the pointer effects (card tilt, magnets, cursor ring) only on devices with a
 * mouse or trackpad, and only once the browser is idle. They're enhancements nobody
 * needs for the first render, so they stay out of the render-critical JS budget
 * (tests/e2e/budgets.spec.ts) and phones never download them.
 */
export function DeferredEffects() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasFinePointer()) return;
    const start = () => setReady(true);
    // Safari has no requestIdleCallback: fall back to a short timeout.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(start, 300);
    return () => clearTimeout(timer);
  }, []);

  return ready ? (
    <Suspense fallback={null}>
      <PointerLayer />
    </Suspense>
  ) : null;
}
