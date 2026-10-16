"use client";

import { useRef, type ReactNode } from "react";
import { useGsap } from "@/lib/motion/use-gsap";
import { ease, palette, stagger } from "@/lib/motion/tokens";

/**
 * The homepage's pinned section (§4): "How it works" holds still while you scroll
 * through it (≥1024px), and the connector draws itself across the four steps, scrubbed.
 * Each step rises in and its number lights lime as the line reaches it, the way the
 * blueprint first specified it (1.5: "scrubbed to scroll position, GSAP ScrollTrigger").
 *
 * Below 1024px nothing pins (a pinned section on a phone fights the thumb); the steps
 * stagger in as a list. Without GSAP or with reduced motion, the end state shows: the
 * line drawn and every number lit.
 */
export function ProcessPin({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap, root }) => {
      if (!root) return;
      const section = root.closest("section") ?? root;
      const line = root.querySelector<HTMLElement>(".process-line");
      const numbers = gsap.utils.toArray<HTMLElement>(".process-number", root);
      const items = gsap.utils.toArray<HTMLElement>(".process-item", root);
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        gsap.set(line, { scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(numbers, { color: "#3F3F46" });
        gsap.set(items, { y: 32, opacity: 0 });
        const tl = gsap.timeline({
          defaults: { ease: ease.entrance },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=110%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        });
        tl.to(line, { scaleX: 1, duration: items.length, ease: ease.linear }, 0);
        items.forEach((item, i) => {
          tl.to(item, { y: 0, opacity: 1, duration: 0.6 }, i * 0.9).to(
            numbers[i] ?? null,
            { color: palette.volt, duration: 0.3 },
            i * 0.9 + 0.2,
          );
        });
        tl.to({}, { duration: 0.4 });
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.from(items, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: stagger.base,
          ease: ease.entrance,
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="process-steps relative">
      {children}
    </div>
  );
}
