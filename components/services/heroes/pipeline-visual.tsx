"use client";

import { useRef } from "react";
import { whenBooted } from "@/components/motion/preloader";
import { flowOffset } from "@/lib/motion/hero-math";
import { useGsap } from "@/lib/motion/use-gsap";
import { ease } from "@/lib/motion/tokens";

/** Stage, example count, node position in the 480-wide viewBox. Counts are illustrative, and labelled so. */
export const STAGES = [
  { label: "Source", count: 214, x: 64, y: 96 },
  { label: "Screen", count: 38, x: 192, y: 224 },
  { label: "Interview", count: 11, x: 304, y: 96 },
  { label: "Hire", count: 2, x: 416, y: 224 },
] as const;

/** Smooth S-curves between consecutive nodes. */
export function connectorPath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const mid = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mid} ${a.y} ${mid} ${b.y} ${b.x} ${b.y}`;
}

const PARTICLES_PER_PATH = 3;
/** Path lengths per second: a particle takes ~2.6s per connector. */
const SPEED = 0.38;

/**
 * Recruitment, "The Pipeline" (docs/blueprint/11-motion-system.md §3c).
 *
 * Four stages pop in 0.12s apart, the connectors draw between them, then candidates
 * (lime particles) flow along the paths toward the hire, thinning out stage by stage
 * as a real funnel does. The counts are an example, labelled as one. Particles run on
 * GSAP's ticker only while the hero is on screen and stop for the "Reduce motion"
 * switch (WCAG 2.2.2). Reduced motion: the drawn pipeline, no particles.
 */
export function PipelineVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap, ScrollTrigger, root }) => {
      if (!root) return;
      const nodes = gsap.utils.toArray<SVGGElement>(".pipe-node", root);
      const links = gsap.utils.toArray<SVGPathElement>(".pipe-link", root);
      const groups = gsap.utils.toArray<SVGGElement>(".pipe-particles", root);

      gsap.set(nodes, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(links, { strokeDashoffset: 1 });

      const lengths = links.map((path) => path.getTotalLength());
      let elapsed = 0;
      let running = false;
      let visible = true;

      const place = () => {
        groups.forEach((group, path) => {
          const link = links[path];
          const length = lengths[path] ?? 0;
          if (!link || !length) return;
          const dots = Array.from(group.children);
          dots.forEach((dot, i) => {
            const at = flowOffset(elapsed, i, dots.length, SPEED);
            const point = link.getPointAtLength(at * length);
            dot.setAttribute("transform", `translate(${point.x} ${point.y})`);
          });
        });
      };

      const tick = (_time: number, deltaMs: number) => {
        if (!running || !visible) return;
        elapsed += deltaMs / 1000;
        place();
      };

      const intro = gsap.timeline({ paused: true });
      intro
        .to(nodes, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.12, ease: ease.spring }, 0)
        .to(links, { strokeDashoffset: 0, duration: 0.6, stagger: 0.12, ease: ease.entrance }, 0.2)
        .call(() => {
          place();
          running = true;
        })
        .to(groups, { opacity: 1, duration: 0.4, ease: ease.entrance });
      void whenBooted().then(() => intro.delay(0.35).play());
      gsap.ticker.add(tick);

      const section = root.closest("section") ?? root;
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          visible = self.isActive;
        },
      });
      // Scroll-away: the funnel tilts back, as if handed over.
      gsap.to(".pipe-stage", {
        yPercent: 8,
        opacity: 0.5,
        ease: ease.linear,
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.6 },
      });

      return () => gsap.ticker.remove(tick);
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pipe-stage rounded-xl border border-line bg-ink-900 p-4 shadow-e4 sm:p-6"
    >
      <div className="mb-2 flex items-center justify-between font-mono text-[0.6875rem] text-fg-subtle uppercase">
        <span className="tracking-wider">Pipeline · one role</span>
        <span className="rounded-sm border border-line px-1.5 py-0.5 tracking-wider">Example</span>
      </div>
      <svg viewBox="0 30 480 262" className="block w-full" fill="none">
        {STAGES.slice(1).map((stage, i) => (
          <path key={stage.label} d={connectorPath(STAGES[i]!, stage)} pathLength={1} className="pipe-link" />
        ))}
        {/* Hidden until placed (CSS): with reduced motion they never show. Fewer flow past the screen. */}
        {STAGES.slice(1).map((stage, path) => (
          <g key={stage.label} className="pipe-particles">
            {Array.from({ length: path === 0 ? PARTICLES_PER_PATH : PARTICLES_PER_PATH - 1 }, (_, i) => (
              <circle key={i} r="3.5" className="fill-volt-500" />
            ))}
          </g>
        ))}
        {STAGES.map((stage, i) => (
          <g key={stage.label} className="pipe-node">
            <circle
              cx={stage.x}
              cy={stage.y}
              r="30"
              className={
                i === STAGES.length - 1 ? "fill-ink-850 stroke-volt-500" : "fill-ink-850 stroke-line-strong"
              }
              strokeWidth="1.5"
            />
            <text
              x={stage.x}
              y={stage.y + 7}
              textAnchor="middle"
              className="tabular fill-fg font-display text-[20px] font-semibold"
            >
              {stage.count}
            </text>
            <text
              x={stage.x}
              y={stage.y + (stage.y < 160 ? -42 : 54)}
              textAnchor="middle"
              className="fill-fg-muted font-mono text-[16px] tracking-wider uppercase"
            >
              {stage.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
