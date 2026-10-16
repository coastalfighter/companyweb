"use client";

import { useRef } from "react";
import { useGsap } from "@/lib/motion/use-gsap";
import { ease, parallax } from "@/lib/motion/tokens";

/**
 * Fixed particle positions (percent of the layer), sizes (px) and drift periods (s).
 * Deterministic, so server and client render the same markup; 18 points (brief: 15–20).
 */
export const PARTICLES: readonly { x: number; y: number; size: 2 | 3 | 4; period: number }[] = [
  { x: 6, y: 12, size: 2, period: 11 },
  { x: 14, y: 64, size: 3, period: 14 },
  { x: 22, y: 31, size: 2, period: 9 },
  { x: 29, y: 86, size: 4, period: 16 },
  { x: 37, y: 8, size: 2, period: 12 },
  { x: 43, y: 52, size: 3, period: 10 },
  { x: 51, y: 77, size: 2, period: 15 },
  { x: 58, y: 22, size: 4, period: 13 },
  { x: 64, y: 44, size: 2, period: 9 },
  { x: 71, y: 91, size: 3, period: 17 },
  { x: 77, y: 15, size: 2, period: 11 },
  { x: 83, y: 60, size: 3, period: 14 },
  { x: 89, y: 35, size: 2, period: 10 },
  { x: 94, y: 81, size: 4, period: 12 },
  { x: 10, y: 42, size: 2, period: 13 },
  { x: 33, y: 58, size: 2, period: 15 },
  { x: 67, y: 68, size: 2, period: 10 },
  { x: 86, y: 5, size: 3, period: 16 },
];

/**
 * The atmosphere (§6), four layers behind every page:
 *
 * 1. Mesh: three huge, very dark lime-tinted radial fields drifting on 18–26s
 *    power2.inOut yoyo loops. Almost invisible; it stops the black reading as flat.
 * 2. Grid: 1px lines at 4% opacity, moving at 0.3× scroll.
 * 3. Data points: 18 lime dots (2–4px) on slow drift loops, moving at 0.5× scroll and
 *    shifting 0.05× with the pointer.
 * 4. Content (the page itself).
 *
 * Every layer is a composited transform (translate3d via GSAP's x/y, `will-change`
 * only on the moving layers). Loops pause with the tab (GSAP's ticker is rAF-driven).
 * Without GSAP or with reduced motion the layers simply stand still.
 */
export function Atmosphere() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap, ScrollTrigger, root }) => {
      if (!root) return;
      const fields = gsap.utils.toArray<HTMLElement>(".atmo-field", root);
      fields.forEach((field, i) => {
        gsap.to(field, {
          xPercent: i % 2 ? -12 : 14,
          yPercent: i % 2 ? 10 : -8,
          scale: 1.15,
          duration: 18 + i * 4,
          ease: ease.loop,
          repeat: -1,
          yoyo: true,
        });
      });

      gsap.utils.toArray<HTMLElement>(".atmo-point", root).forEach((point, i) => {
        const period = PARTICLES[i % PARTICLES.length]?.period ?? 12;
        gsap.to(point, {
          x: `random(-28, 28)`,
          y: `random(-36, 36)`,
          duration: period,
          ease: ease.loop,
          repeat: -1,
          yoyo: true,
          repeatRefresh: true,
        });
      });

      // Scroll parallax: wrap the grid and point layers so they loop seamlessly.
      const grid = root.querySelector<HTMLElement>(".atmo-grid");
      const points = root.querySelector<HTMLElement>(".atmo-points");
      const mesh = root.querySelector<HTMLElement>(".atmo-mesh");
      const wrapGrid = gsap.utils.wrap(-80, 0);
      const setGrid = grid ? gsap.quickSetter(grid, "y", "px") : null;
      const setMesh = mesh ? gsap.quickSetter(mesh, "y", "px") : null;
      const setPoints = points ? gsap.quickSetter(points, "y", "px") : null;
      const apply = (scrollY: number) => {
        setGrid?.(wrapGrid(-scrollY * parallax.grid));
        // The mesh only ever drifts a little: clamped, so the fields never leave the screen.
        setMesh?.(Math.max(-scrollY * parallax.mesh, -window.innerHeight * 0.35));
        const h = window.innerHeight;
        setPoints?.(gsap.utils.wrap(-h, 0, -scrollY * parallax.particles));
      };
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: () => apply(window.scrollY) });
      apply(window.scrollY);

      // Pointer parallax on the data points (0.05×): depth without a cursor follower.
      const layer = root.querySelector<HTMLElement>(".atmo-pointer");
      if (layer && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const toX = gsap.quickTo(layer, "x", { duration: 1.2, ease: ease.follow });
        const toY = gsap.quickTo(layer, "y", { duration: 1.2, ease: ease.follow });
        const onMove = (event: PointerEvent) => {
          toX((event.clientX - window.innerWidth / 2) * parallax.pointer);
          toY((event.clientY - window.innerHeight / 2) * parallax.pointer);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      }
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} aria-hidden className="atmosphere">
      <div className="atmo-mesh">
        <span className="atmo-field atmo-field-a" />
        <span className="atmo-field atmo-field-b" />
        <span className="atmo-field atmo-field-c" />
      </div>
      <div className="atmo-grid" />
      <div className="atmo-pointer">
        <div className="atmo-points">
          {[0, 100].map((offset) =>
            PARTICLES.map((p, i) => (
              <span
                key={`${offset}-${i}`}
                className="atmo-point"
                style={{
                  left: `${p.x}%`,
                  top: `${(p.y + offset) / 2}%`,
                  width: p.size,
                  height: p.size,
                }}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
}
