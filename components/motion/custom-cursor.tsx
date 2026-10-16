"use client";

import { useRef } from "react";
import { hasFinePointer } from "@/lib/motion/gsap";
import { useGsap } from "@/lib/motion/use-gsap";
import { duration, ease } from "@/lib/motion/tokens";

/** What the cursor treats as interactive. */
const INTERACTIVE = 'a[href], button:not(:disabled), [role="button"], summary, label[for], [data-cursor]';
/** Where the native text caret must stay (the custom cursor would hide where you type). */
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
 * Custom cursor (docs/blueprint/11-motion-system.md §5e): an 8px lime dot that tracks
 * the pointer with a 0.1s lag, and a 40px ring that grows in over links and buttons
 * with a one-word label. Both move through gsap.quickTo (gsap-performance: one reused
 * tween per axis instead of a new tween per mousemove).
 *
 * Only for a mouse or trackpad, and never with reduced motion. The native cursor is
 * hidden only after the custom one has drawn at the pointer, comes back the moment
 * the pointer leaves the window, and is never hidden over text fields (where the
 * caret matters) or in forced-colors mode.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap }) => {
      const root = rootRef.current;
      if (!root) return;
      const dot = root.querySelector<HTMLElement>(".cursor-dot")!;
      const ring = root.querySelector<HTMLElement>(".cursor-ring")!;
      const label = root.querySelector<HTMLElement>(".cursor-label")!;
      const html = document.documentElement;

      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
      gsap.set(ring, { scale: 0.2, opacity: 0 });
      const dotX = gsap.quickTo(dot, "x", { duration: duration.follow, ease: ease.follow });
      const dotY = gsap.quickTo(dot, "y", { duration: duration.follow, ease: ease.follow });
      const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: ease.follow });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: ease.follow });

      let hovering: Element | null = null;
      let shown = false;

      const setHover = (target: Element | null) => {
        if (target === hovering) return;
        hovering = target;
        const text = target ? cursorLabel(target) : "";
        label.textContent = text;
        gsap.to(ring, {
          scale: target ? 1 : 0.2,
          opacity: target ? 1 : 0,
          duration: duration.base,
          ease: ease.focal,
          overwrite: "auto",
        });
        gsap.to(dot, { scale: target ? 0 : 1, duration: duration.fast, overwrite: "auto" });
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const target = event.target instanceof Element ? event.target : null;
        const inText = !!target?.closest(TEXT_ENTRY);
        root.toggleAttribute("data-hidden", inText);
        if (!shown) {
          shown = true;
          gsap.set([dot, ring], { x: event.clientX, y: event.clientY });
          root.setAttribute("data-active", "");
          html.setAttribute("data-custom-cursor", "");
        }
        dotX(event.clientX);
        dotY(event.clientY);
        ringX(event.clientX);
        ringY(event.clientY);
        setHover(inText ? null : (target?.closest(INTERACTIVE) ?? null));
      };
      const onLeave = () => {
        shown = false;
        root.removeAttribute("data-active");
        html.removeAttribute("data-custom-cursor");
        setHover(null);
      };
      // Press feedback: the ring dips to 0.9 (emil-design-eng: pressables must answer the press).
      const onDown = () => gsap.to(ring, { scale: hovering ? 0.9 : 0.2, duration: duration.press });
      const onUp = () =>
        gsap.to(ring, { scale: hovering ? 1 : 0.2, duration: duration.base, ease: ease.focal });

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
      html.addEventListener("pointerleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        html.removeEventListener("pointerleave", onLeave);
        html.removeAttribute("data-custom-cursor");
        // Tweens started from these listeners live outside the context: stop them too.
        gsap.killTweensOf([dot, ring]);
      };
    },
    { enabled: typeof window !== "undefined" && hasFinePointer() },
  );

  return (
    <div ref={rootRef} aria-hidden className="cursor">
      <span className="cursor-ring">
        <span className="cursor-label" />
      </span>
      <span className="cursor-dot" />
    </div>
  );
}
