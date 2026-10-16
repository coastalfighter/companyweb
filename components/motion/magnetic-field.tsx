"use client";

import { hasFinePointer } from "@/lib/motion/gsap";
import { useGsap } from "@/lib/motion/use-gsap";
import { distance, ease } from "@/lib/motion/tokens";

/** Opt-in: any element with `data-magnetic` (optionally `="16"` for a custom pull in px). */
export const MAGNETIC_SELECTOR = "[data-magnetic]";

/**
 * How far an element is pulled toward the pointer: proportional to the offset from its
 * centre, zero beyond `reach` px from its edge, never more than `max` px. Exported for tests.
 */
export function magneticPull(
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  pointerX: number,
  pointerY: number,
  max: number = distance.magnet,
  reach: number = distance.magnetRadius,
): { x: number; y: number; inside: boolean } {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = pointerX - cx;
  const dy = pointerY - cy;
  // Distance from the element's edge, not its centre: wide buttons get the same reach.
  const ex = Math.max(Math.abs(dx) - rect.width / 2, 0);
  const ey = Math.max(Math.abs(dy) - rect.height / 2, 0);
  if (Math.hypot(ex, ey) > reach) return { x: 0, y: 0, inside: false };
  const span = Math.max(rect.width / 2 + reach, rect.height / 2 + reach);
  const clamp = (v: number) => Math.max(-max, Math.min(max, (v / span) * max * 2));
  return { x: clamp(dx), y: clamp(dy), inside: true };
}

/**
 * Magnetic elements (§5g): within 80px of the pointer, a `data-magnetic` element leans
 * toward it by up to 12px; on release it springs home with elastic.out(1, 0.55). One
 * overshoot, small amplitude: physical, not cartoony (emil-design-eng: decorative
 * pointer interactions are where a spring earns its place).
 *
 * One listener for the page, rAF-batched; elements are found per frame, so route
 * changes need no re-registration.
 */
export function MagneticField() {
  useGsap(
    ({ gsap }) => {
      const pulled = new Map<HTMLElement, { x: gsap.QuickToFunc; y: gsap.QuickToFunc }>();
      let frame = 0;
      let pointer: { x: number; y: number } | null = null;

      const release = (el: HTMLElement) => {
        pulled.delete(el);
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: ease.spring, overwrite: true });
      };

      const update = () => {
        frame = 0;
        if (!pointer) return;
        for (const el of document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR)) {
          const max = Number(el.dataset.magnetic) || distance.magnet;
          const pull = magneticPull(el.getBoundingClientRect(), pointer.x, pointer.y, max);
          let to = pulled.get(el);
          if (!pull.inside) {
            if (to) release(el);
            continue;
          }
          if (!to) {
            to = {
              x: gsap.quickTo(el, "x", { duration: 0.4, ease: ease.follow }),
              y: gsap.quickTo(el, "y", { duration: 0.4, ease: ease.follow }),
            };
            pulled.set(el, to);
          }
          to.x(pull.x);
          to.y(pull.y);
        }
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        pointer = { x: event.clientX, y: event.clientY };
        if (!frame) frame = requestAnimationFrame(update);
      };
      const onLeave = () => {
        pointer = null;
        pulled.forEach((_, el) => release(el));
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        if (frame) cancelAnimationFrame(frame);
      };
    },
    { enabled: typeof window !== "undefined" && hasFinePointer() },
  );

  return null;
}
