"use client";

import { useEffect } from "react";

/** Elements that get the pointer spotlight and tilt (styles in app/globals.css, `.surface`). */
export const SURFACE_SELECTOR = ".surface";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Where the pointer is inside `rect`: pixel offsets for the spotlight and a −1…1
 * vector from the centre for the tilt. Exported for tests.
 */
export function surfacePoint(
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">,
  clientX: number,
  clientY: number,
): { x: number; y: number; tx: number; ty: number } {
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
  const tx = rect.width > 0 ? (x / rect.width) * 2 - 1 : 0;
  const ty = rect.height > 0 ? (y / rect.height) * 2 - 1 : 0;
  return { x, y, tx, ty };
}

function clear(el: HTMLElement) {
  el.removeAttribute("data-surface-active");
  el.style.removeProperty("--tx");
  el.style.removeProperty("--ty");
}

/**
 * One delegated pointer listener for every `.surface` card on the page (blueprint
 * A6.3a): it writes the pointer position into CSS variables, once per frame, and
 * CSS draws the spotlight, border glow and tilt. Pointer-fine devices only; it does
 * nothing with reduced motion. Renders nothing.
 */
export function PointerSurfaces() {
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const fine = window.matchMedia(FINE_POINTER);
    const reduced = window.matchMedia(REDUCED_MOTION);

    let active: HTMLElement | null = null;
    let frame = 0;
    let last: { x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!active || !last) return;
      const p = surfacePoint(active.getBoundingClientRect(), last.x, last.y);
      active.style.setProperty("--px", `${p.x.toFixed(1)}px`);
      active.style.setProperty("--py", `${p.y.toFixed(1)}px`);
      active.style.setProperty("--tx", p.tx.toFixed(3));
      active.style.setProperty("--ty", p.ty.toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      if (!fine.matches || reduced.matches) return;
      const target = event.target instanceof Element ? event.target : null;
      const surface = target?.closest<HTMLElement>(SURFACE_SELECTOR) ?? null;
      if (surface !== active) {
        if (active) clear(active);
        active = surface;
        active?.setAttribute("data-surface-active", "");
      }
      if (!active) return;
      last = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const onLeave = () => {
      if (active) clear(active);
      active = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (frame) cancelAnimationFrame(frame);
      onLeave();
    };
  }, []);

  return null;
}
