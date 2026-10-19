"use client";

import { useRef } from "react";
import { whenBooted } from "@/components/motion/preloader";
import { useGsap } from "@/lib/motion/use-gsap";
import { ease } from "@/lib/motion/tokens";

/** Clause headings of a generic services agreement. The body lines are drawn, not written. */
export const CLAUSES = [
  { heading: "1. Confidentiality", lines: [1, 0.92, 0.64] },
  { heading: "2. Term and renewal", lines: [0.96, 0.7] },
  { heading: "3. Data protection", lines: [1, 0.88, 0.94, 0.4] },
  { heading: "4. Limitation of liability", lines: [0.9, 1, 0.56] },
  { heading: "5. Governing law", lines: [0.82, 0.48] },
] as const;

/**
 * The seal's ring text. It says what the team does (checks against your playbook,
 * routes to your counsel), never that anything is legally approved.
 */
export const SEAL_TEXT = "PLAYBOOK CHECKED · ROUTED TO COUNSEL · ";

/**
 * Legal Assistance, "The Seal" (docs/blueprint/11-motion-system.md §3f).
 *
 * A contract under review. After the entrance, a seal stamps down onto it (scale 1.4
 * → 1 with an accelerating ease: an impact, not a float) and the page takes the hit
 * once: a 3px, two-frame shake, then still. As the hero scrolls away, the contract
 * scrolls under its window, as if being read. One impact, no loops.
 * Reduced motion: the stamped contract, still.
 */
export function SealVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap, root }) => {
      if (!root) return;
      const seal = root.querySelector<HTMLElement>(".seal");
      const page = root.querySelector<HTMLElement>(".seal-page");
      const ink = root.querySelector<SVGCircleElement>(".seal-ink");
      if (!seal || !page) return;

      gsap.set(seal, { scale: 1.4, rotation: -10, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(".seal-clause", { opacity: 0, y: 10 });
      gsap.set(ink, { opacity: 0 });

      const intro = gsap.timeline({ paused: true });
      intro
        .to(".seal-clause", { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: ease.entrance }, 0)
        .to(seal, { opacity: 1, duration: 0.08, ease: ease.linear }, 0.75)
        .to(seal, { scale: 1, rotation: 0, duration: 0.26, ease: "power4.in" }, 0.75)
        // The impact: two frames, 3px, once.
        .to(page, { x: 3, y: -2, duration: 1 / 60, ease: ease.linear })
        .to(page, { x: -2, y: 1, duration: 1 / 60, ease: ease.linear })
        .to(page, { x: 0, y: 0, duration: 1 / 60, ease: ease.linear, clearProps: "transform" })
        .fromTo(
          ink,
          { opacity: 0.5, scale: 1, transformOrigin: "50% 50%" },
          { opacity: 0, scale: 1.18, duration: 0.6, ease: ease.entrance },
          "<",
        );
      void whenBooted().then(() => intro.delay(0.3).play());

      const section = root.closest("section") ?? root;
      gsap
        .timeline({ scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.6 } })
        .to(".seal-scroll", { yPercent: -22, ease: ease.linear }, 0)
        .to(seal, { yPercent: -30, ease: ease.linear }, 0);
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} aria-hidden className="relative pr-6 pb-10 sm:pr-10">
      <div className="seal-page relative h-[22rem] overflow-hidden rounded-xl border border-line bg-ink-900 shadow-e4 sm:h-[26rem]">
        <div className="relative z-10 flex items-center justify-between border-b border-line bg-ink-900 px-5 py-3 font-mono text-[0.6875rem] text-fg-subtle uppercase">
          <span className="tracking-wider">Services agreement · redline v3</span>
          <span className="tracking-wider max-sm:hidden">For counsel</span>
        </div>
        <div className="seal-scroll px-5 pt-5">
          {[...CLAUSES, ...CLAUSES.slice(0, 2)].map((clause, i) => (
            <div key={`${clause.heading}-${i}`} className="seal-clause mb-5">
              <p className="font-serif-legal text-[0.9375rem] font-medium text-fg-muted">{clause.heading}</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {clause.lines.map((width, j) => (
                  <span
                    key={j}
                    className={
                      j === 1 && i === 2
                        ? "h-1.5 rounded-full bg-volt-500/35"
                        : "h-1.5 rounded-full bg-ink-700"
                    }
                    style={{ width: `${width * 100}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-ink-900 to-transparent" />
      </div>

      <div className="seal absolute right-0 bottom-0 size-32 -rotate-8 sm:size-40">
        <svg viewBox="0 0 160 160" className="size-full" fill="none">
          <defs>
            <path id="seal-ring" d="M80 80 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0" />
          </defs>
          <circle cx="80" cy="80" r="76" className="fill-ink-950/85 stroke-volt-500" strokeWidth="2" />
          <circle cx="80" cy="80" r="46" className="stroke-volt-500/60" strokeWidth="1" />
          <circle cx="80" cy="80" r="76" className="seal-ink stroke-volt-500" strokeWidth="3" opacity="0" />
          <text className="fill-volt-500 font-mono text-[11.5px] font-semibold tracking-[0.2em]">
            <textPath href="#seal-ring">{SEAL_TEXT}</textPath>
          </text>
          <path
            d="M62 81 75 94 99 66"
            className="stroke-volt-500"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
