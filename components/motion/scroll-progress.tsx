"use client";

import { useRef } from "react";
import { useGsap } from "@/lib/motion/use-gsap";
import { ease } from "@/lib/motion/tokens";

/**
 * Reading progress (§7e): a 2px lime line across the very top of the viewport that
 * fills left to right with the page, ScrollTrigger-scrubbed (scaleX, so it never
 * triggers layout). It sits above the header so it reads as part of the frame.
 * Static pages shorter than the viewport show nothing.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useGsap(({ gsap }) => {
    const bar = barRef.current;
    if (!bar) return;
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: ease.linear,
        scrollTrigger: { start: 0, end: "max", scrub: 0.3, invalidateOnRefresh: true },
      },
    );
  });

  return <div ref={barRef} aria-hidden className="scroll-progress" />;
}
