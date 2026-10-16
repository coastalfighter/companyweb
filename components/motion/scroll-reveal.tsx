"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useGsap } from "@/lib/motion/use-gsap";
import { distance, duration, ease, stagger } from "@/lib/motion/tokens";

/**
 * The reveal vocabulary (§4). Mark an element with `data-reveal="<variant>"`:
 *
 * | variant   | from                               | why                                         |
 * | --------- | ---------------------------------- | ------------------------------------------- |
 * | (empty)   | y 48, opacity 0                    | default for blocks                          |
 * | `text`    | y 48, opacity 0, blur 8px → 0      | "materialize": headings and statements      |
 * | `card`    | y 80, opacity 0                    | cards and media travel further: more mass   |
 * | `stagger` | children y 60, opacity 0, 0.09s    | lists that arrive as lists                  |
 * | `fade`    | opacity 0                          | things that must not move (tables, figures) |
 *
 * Siblings entering together are batched (ScrollTrigger.batch) and staggered 0.09s, so a
 * row of cards cascades instead of popping at once. Reveals fire once, at 85% of the
 * viewport, with power3.out over 0.8s.
 *
 * Other hooks on the same engine:
 * - `data-parallax="0.5"`: moves at that fraction of scroll speed (background layers).
 * - `data-draw`: an SVG line (pathLength=1) that draws itself, scrubbed, as it scrolls in.
 *
 * Content is never hidden by CSS: the from-state is applied by GSAP, at runtime, only
 * to elements still below the fold. If GSAP never loads, everything simply stays put.
 */
export type RevealVariant = "" | "text" | "card" | "stagger" | "fade";

export const REVEAL_FROM: Record<Exclude<RevealVariant, "stagger">, gsap.TweenVars> = {
  "": { y: distance.text, opacity: 0 },
  text: { y: distance.text, opacity: 0, filter: `blur(${distance.blur}px)` },
  card: { y: distance.card, opacity: 0 },
  fade: { opacity: 0 },
};

const REVEAL_TO: gsap.TweenVars = { y: 0, opacity: 1, filter: "blur(0px)" };

function variantOf(el: Element): RevealVariant {
  const v = el.getAttribute("data-reveal") ?? "";
  return v === "text" || v === "card" || v === "stagger" || v === "fade" ? v : "";
}

const markRevealed = (els: Element[]) => els.forEach((el) => el.setAttribute("data-revealed", ""));

export function ScrollReveal() {
  const pathname = usePathname();

  useGsap(
    ({ gsap, ScrollTrigger, reduced }) => {
      const root = document.documentElement;
      const all = gsap.utils.toArray<HTMLElement>("[data-reveal]:not([data-revealed])");
      const fold = window.innerHeight * 0.92;
      const below = all.filter((el) => el.getBoundingClientRect().top >= fold);
      // Already on screen: revealed as painted (no flash of hidden content).
      markRevealed(all.filter((el) => !below.includes(el)));
      root.setAttribute("data-reveal-ready", "");

      // Reduced motion: opacity only, quickly (keeps "something arrived" without travel).
      const fromFor = (variant: RevealVariant): gsap.TweenVars =>
        reduced ? { opacity: 0 } : REVEAL_FROM[variant === "stagger" ? "" : variant];

      const groups = new Map<RevealVariant, HTMLElement[]>();
      for (const el of below) {
        const v = variantOf(el);
        groups.set(v, [...(groups.get(v) ?? []), el]);
      }

      for (const [variant, els] of groups) {
        if (variant === "stagger") {
          for (const list of els) {
            const items = Array.from(list.children) as HTMLElement[];
            gsap.set(items, reduced ? { opacity: 0 } : { y: 60, opacity: 0 });
            ScrollTrigger.create({
              trigger: list,
              start: "top 85%",
              once: true,
              onEnter: () => {
                markRevealed([list]);
                gsap.to(items, {
                  ...REVEAL_TO,
                  duration: reduced ? 0.2 : duration.reveal,
                  ease: ease.entrance,
                  stagger: stagger.base,
                  clearProps: "transform,opacity,filter",
                });
              },
            });
          }
          continue;
        }
        gsap.set(els, { ...fromFor(variant), willChange: "transform, opacity" });
        ScrollTrigger.batch(els, {
          start: "top 85%",
          once: true,
          onEnter: (batch) => {
            markRevealed(batch);
            gsap.to(batch, {
              ...REVEAL_TO,
              duration: reduced ? 0.2 : duration.reveal,
              ease: ease.entrance,
              stagger: stagger.base,
              // will-change only while moving (gsap-performance), then the inline styles go.
              clearProps: "transform,opacity,filter,willChange",
            });
          },
        });
      }

      if (!reduced) {
        for (const el of gsap.utils.toArray<HTMLElement>("[data-parallax]")) {
          const speed = Number(el.dataset.parallax) || 0.5;
          gsap.fromTo(
            el,
            { yPercent: speed * 12 },
            {
              yPercent: -speed * 12,
              ease: ease.linear,
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
        for (const line of gsap.utils.toArray<SVGGeometryElement>("[data-draw]")) {
          gsap.fromTo(
            line,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: ease.linear,
              scrollTrigger: {
                trigger: line.closest("svg") ?? line,
                start: "top 92%",
                end: "top 45%",
                scrub: 0.4,
              },
            },
          );
        }
      }

      // Late layout shifts (web fonts, images) move trigger positions.
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());
      return () => root.removeAttribute("data-reveal-ready");
    },
    { dependencies: [pathname], runWhenReduced: true },
  );

  // Failsafe: if GSAP never arrives, anything waiting on `data-revealed` (vignettes,
  // map pulses) still plays.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (document.documentElement.hasAttribute("data-motion-ready")) return;
      markRevealed(Array.from(document.querySelectorAll("[data-reveal]")));
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
