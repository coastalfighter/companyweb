"use client";

import { useRef, type CSSProperties } from "react";
import { whenBooted } from "@/components/motion/preloader";
import { hasFinePointer } from "@/lib/motion/gsap";
import { depthLevel, orbitAngles, orbitPoint } from "@/lib/motion/hero-math";
import { useGsap } from "@/lib/motion/use-gsap";
import { ease } from "@/lib/motion/tokens";

/** Generic delegated work: examples of the kind of task, not client results. */
export const TASKS = [
  "Inbox triaged",
  "Meetings booked",
  "Invoices chased",
  "CRM updated",
  "Travel booked",
  "Research brief",
  "Expenses filed",
] as const;

/** Depth buckets: blur and stacking change only when a card crosses one. */
const LEVELS = 3;
/** Radians per second: one lap in ~42s, calm enough to read the cards. */
const ORBIT_SPEED = 0.15;
/** Orbit radii as a share of the stage (matches the CSS `cqw`/`cqh` fallback). */
const RX = 0.38;
const RY = 0.3;
const START = -Math.PI / 2;

/** Card scale for a stage width: 1 from 640px, down to 0.72 on the smallest phones. */
export function cardFit(width: number): number {
  return Math.min(1, Math.max(0.72, width / 640));
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-accent-text" fill="none">
      <path
        d="M3 8.5 6.5 12 13 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Virtual Assistance, "The Swarm" (docs/blueprint/11-motion-system.md §3d).
 *
 * Task cards orbit the assistant in 3D: an ellipse with far cards smaller, dimmer and
 * softer (blur in 3 fixed steps, never per frame), so the ring reads as depth without
 * WebGL. The camera drifts with the pointer, and the orbit tightens as the hero
 * scrolls away, as if the work were being gathered in. It turns only while on screen.
 *
 * The resting layout is pure CSS (container units), so reduced motion and the first
 * paint show the same ring, still.
 */
export function SwarmVisual() {
  const rootRef = useRef<HTMLDivElement>(null);
  const angles = orbitAngles(TASKS.length, START);

  useGsap(
    ({ gsap, ScrollTrigger, root }) => {
      if (!root) return;
      const cards = gsap.utils.toArray<HTMLElement>(".swarm-card", root);
      const state = { spin: 0, tight: 1, camX: 0, camY: 0, reveal: 0 };
      let width = root.clientWidth;
      let height = root.clientHeight;
      let visible = true;
      // Narrow stages get smaller cards, so the ring never piles up at 320px.
      let fit = cardFit(width);

      const draw = () => {
        const rx = width * RX * state.tight;
        const ry = height * RY * state.tight;
        cards.forEach((card, i) => {
          const point = orbitPoint((angles[i] ?? 0) + state.spin, rx, ry);
          // Near cards drift more with the camera than far ones: parallax.
          const parallax = 0.6 + 0.4 * ((point.z + 1) / 2);
          const x = point.x + state.camX * parallax;
          const y = point.y + state.camY * parallax;
          const scale = point.scale * fit * (0.85 + 0.15 * state.reveal);
          card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
          const level = String(depthLevel(point.z, LEVELS));
          if (card.dataset.depth !== level) card.dataset.depth = level;
        });
      };

      const observer = new ResizeObserver(() => {
        width = root.clientWidth;
        height = root.clientHeight;
        fit = cardFit(width);
        draw();
      });
      observer.observe(root);

      const tick = (_time: number, deltaMs: number) => {
        if (!visible) return;
        state.spin += (deltaMs / 1000) * ORBIT_SPEED;
        draw();
      };

      gsap.set(cards, { opacity: 0 });
      draw();
      const intro = gsap.timeline({ paused: true });
      intro
        .to(state, { reveal: 1, duration: 1.2, ease: ease.focal }, 0)
        .to(
          cards,
          { opacity: 1, duration: 0.5, stagger: 0.08, ease: ease.entrance, clearProps: "opacity" },
          0,
        )
        .fromTo(
          ".swarm-core",
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, ease: ease.spring },
          0,
        );
      void whenBooted().then(() => {
        intro.delay(0.4).play();
        gsap.ticker.add(tick);
      });

      const section = root.closest("section") ?? root;
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          visible = self.isActive;
        },
      });
      gsap.to(state, {
        tight: 0.78,
        ease: ease.linear,
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.6 },
      });

      const toCamX = gsap.quickTo(state, "camX", { duration: 1.1, ease: ease.follow });
      const toCamY = gsap.quickTo(state, "camY", { duration: 1.1, ease: ease.follow });
      const onMove = (event: PointerEvent) => {
        toCamX(((event.clientX / window.innerWidth) * 2 - 1) * 18);
        toCamY(((event.clientY / window.innerHeight) * 2 - 1) * 12);
      };
      const pointer = hasFinePointer();
      if (pointer) window.addEventListener("pointermove", onMove, { passive: true });

      return () => {
        gsap.ticker.remove(tick);
        observer.disconnect();
        if (pointer) window.removeEventListener("pointermove", onMove);
        // Hand the resting layout back to CSS.
        cards.forEach((card) => {
          card.style.removeProperty("transform");
          delete card.dataset.depth;
        });
      };
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="swarm-stage relative mx-auto h-[22rem] w-full max-w-3xl sm:h-[26rem]"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
        fill="none"
      >
        <ellipse
          cx="50"
          cy="50"
          rx={RX * 100}
          ry={RY * 100}
          className="stroke-line"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="swarm-core absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-full border border-line-strong bg-ink-900 px-5 py-4 shadow-e4">
        <span className="size-2 rounded-full bg-accent" />
        <span className="font-mono text-[0.6875rem] tracking-wider text-fg-muted uppercase">Your VA</span>
      </div>
      {TASKS.map((task, i) => {
        const point = orbitPoint(angles[i] ?? 0, 1, 1);
        return (
          <div
            key={task}
            className="swarm-card"
            data-depth={depthLevel(point.z, LEVELS)}
            style={
              {
                "--ox": point.x.toFixed(4),
                "--oy": point.y.toFixed(4),
                "--os": point.scale.toFixed(3),
              } as CSSProperties
            }
          >
            <Check />
            <span>{task}</span>
          </div>
        );
      })}
    </div>
  );
}
