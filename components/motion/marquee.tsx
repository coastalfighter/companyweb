"use client";

import { Fragment, useRef } from "react";
import { useGsap } from "@/lib/motion/use-gsap";
import { duration, ease } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

export interface MarqueeProps {
  items: readonly string[];
  /** Pixels per second at rest. */
  speed?: number;
  /** Travel right instead of left. */
  reverse?: boolean;
  className?: string;
}

/**
 * Marquee (§7b): an endless band of words at a constant speed, GSAP-driven so it can
 * ease to a stop on hover (timeScale 1 → 0 over 0.5s, not a jarring freeze), and lean
 * into the scroll: scrolling speeds it up in the scroll direction, then it settles
 * back (ScrollTrigger velocity, clamped). Words in muted ink with lime marks between
 * them: a display-size band of lime words read as a floodlight (brand accent ratio, A1.4).
 *
 * Decorative copy of words that are real content elsewhere on the page, so it's
 * hidden from assistive technology. With reduced motion it stands still.
 */
export function Marquee({ items, speed = 60, reverse = false, className }: MarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap, ScrollTrigger, root }) => {
      if (!root) return;
      const tracks = gsap.utils.toArray<HTMLElement>(".marquee-band-track", root);
      const width = tracks[0]?.offsetWidth ?? 0;
      if (!width) return;
      // Two identical tracks side by side; moving both by one track width loops seamlessly.
      const loop = gsap.fromTo(
        tracks,
        { x: reverse ? -width : 0 },
        { x: reverse ? 0 : -width, duration: width / speed, ease: ease.linear, repeat: -1 },
      );

      const pause = () =>
        gsap.to(loop, { timeScale: 0, duration: 0.5, ease: ease.entrance, overwrite: true });
      const play = () => gsap.to(loop, { timeScale: 1, duration: 0.5, ease: ease.entrance, overwrite: true });
      root.addEventListener("pointerenter", pause);
      root.addEventListener("pointerleave", play);

      // Scroll velocity nudges the band (px/s → timeScale), then it eases back to 1.
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        // Off-screen, it doesn't run at all (ui-ux-pro-max: stop moving content offscreen).
        onToggle: (self) => {
          loop.paused(!self.isActive);
        },
        onUpdate: (self) => {
          if (root.matches(":hover")) return;
          const boost = gsap.utils.clamp(0, 4, Math.abs(self.getVelocity()) / 300);
          gsap
            .timeline()
            .to(loop, { timeScale: 1 + boost, duration: duration.fast, ease: ease.linear, overwrite: true })
            .to(loop, { timeScale: 1, duration: 0.8, ease: ease.entrance });
        },
      });

      return () => {
        root.removeEventListener("pointerenter", pause);
        root.removeEventListener("pointerleave", play);
      };
    },
    { scope: rootRef, dependencies: [items.join("|"), speed, reverse] },
  );

  if (items.length === 0) return null;
  const track = (key: string) => (
    <div key={key} className="marquee-band-track gap-10 pr-10 md:gap-14 md:pr-14">
      {items.map((item, i) => (
        <Fragment key={`${item}-${i}`}>
          <span className="whitespace-nowrap">{item}</span>
          <span className="size-2 shrink-0 rotate-45 bg-volt-500 md:size-2.5" />
        </Fragment>
      ))}
    </div>
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        "marquee-band border-y border-line py-8 font-display text-[clamp(1.75rem,1.2rem+2.4vw,3.5rem)] leading-none font-semibold tracking-[-0.03em] text-fg-subtle select-none md:py-12",
        className,
      )}
    >
      {track("a")}
      {track("b")}
    </div>
  );
}
