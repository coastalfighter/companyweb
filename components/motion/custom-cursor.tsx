"use client";

import { useRef } from "react";
import { hasFinePointer } from "@/lib/motion/gsap";
import { useGsap } from "@/lib/motion/use-gsap";
import { duration, ease } from "@/lib/motion/tokens";

/** What the cursor treats as interactive. */
const INTERACTIVE = 'a[href], button:not(:disabled), [role="button"], summary, label[for], [data-cursor]';
/** Text fields: the ring stays out of the way of the caret. */
const TEXT_ENTRY =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, select, [contenteditable="true"]';

/** The ring's label for an element: `data-cursor` wins, then "Click" for buttons, "View" for links. */
export function cursorLabel(el: Element): string {
  const explicit = el.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
  if (explicit !== undefined) return explicit;
  const interactive = el.closest(INTERACTIVE);
  if (!interactive) return "";
  return interactive.matches("a[href]") ? "View" : "Click";
}

/**
 * Pointer companion (docs/blueprint/11-motion-system.md §5e). Revised against the UX
 * guidelines (ui-ux-pro-max `system-controls`, `focus-states`): the system cursor is
 * never hidden. People who enlarge or recolor their cursor for low vision keep it,
 * and nothing depends on our script to show where the pointer is.
 *
 * Over links and buttons a hollow 40px lime ring settles around the pointer
 * (gsap.quickTo, 0.35s, power3.out), with a one-word label beside it ("View",
 * "Click", or `data-cursor`). It's hollow, so it never covers the words you're about
 * to click. It dips to 0.9 on press. Mouse or trackpad only; not with reduced motion.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap }) => {
      const root = rootRef.current;
      if (!root) return;
      const ring = root.querySelector<HTMLElement>(".cursor-ring")!;
      const label = root.querySelector<HTMLElement>(".cursor-label")!;
      const html = document.documentElement;

      gsap.set(ring, { xPercent: -50, yPercent: -50, x: -100, y: -100, scale: 0.4, opacity: 0 });
      const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: ease.follow });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: ease.follow });

      let hovering: Element | null = null;
      let placed = false;

      const setHover = (target: Element | null) => {
        if (target === hovering) return;
        hovering = target;
        label.textContent = target ? cursorLabel(target) : "";
        root.toggleAttribute("data-active", target !== null);
        gsap.to(ring, {
          scale: target ? 1 : 0.4,
          opacity: target ? 1 : 0,
          duration: target ? duration.base : duration.fast,
          ease: target ? ease.focal : ease.exit,
          overwrite: "auto",
        });
      };

      let last: { x: number; y: number } | null = null;
      const hoverAt = (target: Element | null) => {
        const inText = !!target?.closest(TEXT_ENTRY);
        setHover(inText ? null : (target?.closest(INTERACTIVE) ?? null));
      };
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        last = { x: event.clientX, y: event.clientY };
        if (!placed) {
          placed = true;
          gsap.set(ring, { x: event.clientX, y: event.clientY });
        }
        ringX(event.clientX);
        ringY(event.clientY);
        hoverAt(event.target instanceof Element ? event.target : null);
      };
      // The page can move under a still pointer (scrolling, a route change): re-check
      // what is under it, so the ring never labels a link that has gone.
      let frame = 0;
      const recheck = () => {
        frame = 0;
        if (last) hoverAt(document.elementFromPoint(last.x, last.y));
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(recheck);
      };
      let settle = 0;
      const onClick = () => {
        window.clearTimeout(settle);
        settle = window.setTimeout(recheck, 700);
      };
      const onLeave = () => {
        placed = false;
        setHover(null);
      };
      // Press feedback: the ring dips to 0.9 (emil-design-eng: pressables answer the press).
      const onDown = () => hovering && gsap.to(ring, { scale: 0.9, duration: duration.press });
      const onUp = () => hovering && gsap.to(ring, { scale: 1, duration: duration.base, ease: ease.focal });

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("click", onClick);
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
      html.addEventListener("pointerleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("click", onClick);
        if (frame) cancelAnimationFrame(frame);
        window.clearTimeout(settle);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        html.removeEventListener("pointerleave", onLeave);
        // Tweens started from these listeners live outside the context: stop them too.
        gsap.killTweensOf(ring);
      };
    },
    { enabled: typeof window !== "undefined" && hasFinePointer() },
  );

  return (
    <div ref={rootRef} aria-hidden className="cursor">
      <span className="cursor-ring">
        <span className="cursor-label" />
      </span>
    </div>
  );
}
