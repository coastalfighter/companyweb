"use client";

import { hasFinePointer } from "@/lib/motion/gsap";
import { useGsap } from "@/lib/motion/use-gsap";
import { duration, ease, tilt } from "@/lib/motion/tokens";

/** Cards that get the 3D tilt, glare and drawn border (styles in app/globals.css, `.surface`). */
export const SURFACE_SELECTOR = ".surface";

/**
 * Where the pointer is inside `rect`: pixel offsets for the glare and a −1…1 vector
 * from the centre for the tilt. Exported for tests.
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

const SVG_NS = "http://www.w3.org/2000/svg";

/** The lime border that draws itself around a card on hover (stroke-dashoffset 1 → 0). */
function ensureBorder(card: HTMLElement): SVGRectElement {
  const existing = card.querySelector<SVGRectElement>(":scope > .surface-border rect");
  if (existing) return existing;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "surface-border");
  svg.setAttribute("aria-hidden", "true");
  const rect = document.createElementNS(SVG_NS, "rect");
  const radius = Number.parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;
  rect.setAttribute("width", "100%");
  rect.setAttribute("height", "100%");
  rect.setAttribute("rx", String(radius));
  rect.setAttribute("pathLength", "1");
  svg.append(rect);
  card.append(svg);
  return rect;
}

/**
 * Card hover (§5b + §7d), one delegated listener for every `.surface` on the page:
 *
 * - 3D tilt toward the pointer, up to 8° (10° for `data-tilt="media"`), through
 *   gsap.quickTo on rotationX/rotationY with transformPerspective 900px.
 * - A lime glare that follows the pointer (CSS radial gradient positioned by --gx/--gy).
 * - A 1px lime border that draws itself around the card (SVG stroke-dashoffset).
 * - The lift (-8px), deeper shadow and 4px content shift are CSS transitions in
 *   globals.css: hover is seen tens of times a visit, and CSS transitions are
 *   interruptible and run off the main thread (emil-design-eng).
 *
 * Pointer-fine devices only; nothing with reduced motion.
 */
export function PointerSurfaces() {
  useGsap(
    ({ gsap }) => {
      let active: HTMLElement | null = null;
      let rotX: gsap.QuickToFunc | null = null;
      let rotY: gsap.QuickToFunc | null = null;
      let glareX: gsap.QuickToFunc | null = null;
      let glareY: gsap.QuickToFunc | null = null;
      let frame = 0;
      let last: { x: number; y: number } | null = null;

      const enter = (card: HTMLElement) => {
        active = card;
        card.setAttribute("data-surface-active", "");
        gsap.set(card, { transformPerspective: 900 });
        rotX = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: ease.follow });
        rotY = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: ease.follow });
        glareX = gsap.quickTo(card, "--gx", { duration: 0.3, ease: ease.follow });
        glareY = gsap.quickTo(card, "--gy", { duration: 0.3, ease: ease.follow });
        const border = ensureBorder(card);
        gsap.fromTo(
          border,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.6, ease: ease.focal, overwrite: true },
        );
      };

      const leave = (card: HTMLElement) => {
        card.removeAttribute("data-surface-active");
        gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.6, ease: ease.focal, overwrite: "auto" });
        const border = card.querySelector(":scope > .surface-border rect");
        if (border)
          gsap.to(border, { strokeDashoffset: 1, duration: duration.base, ease: ease.exit, overwrite: true });
        active = null;
        rotX = rotY = glareX = glareY = null;
      };

      const flush = () => {
        frame = 0;
        if (!active || !last || !rotX || !rotY || !glareX || !glareY) return;
        const p = surfacePoint(active.getBoundingClientRect(), last.x, last.y);
        const max = active.dataset.tilt === "media" ? tilt.maxMedia : tilt.max;
        // Pointer at the top → the top tips away (rotationX +); right → the right side tips away.
        rotX(-p.ty * max);
        rotY(p.tx * max);
        glareX(p.x);
        glareY(p.y);
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        const target = event.target instanceof Element ? event.target : null;
        const card = target?.closest<HTMLElement>(SURFACE_SELECTOR) ?? null;
        if (card !== active) {
          if (active) leave(active);
          if (card) enter(card);
        }
        if (!active) return;
        last = { x: event.clientX, y: event.clientY };
        if (!frame) frame = requestAnimationFrame(flush);
      };
      const onLeaveWindow = () => {
        if (active) leave(active);
      };

      document.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeaveWindow);
      window.addEventListener("blur", onLeaveWindow);
      return () => {
        document.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
        window.removeEventListener("blur", onLeaveWindow);
        if (frame) cancelAnimationFrame(frame);
        if (active) active.removeAttribute("data-surface-active");
      };
    },
    { enabled: typeof window !== "undefined" && hasFinePointer() },
  );

  return null;
}
