"use client";

import { Fragment, useRef } from "react";
import Link from "next/link";
import { CheckIcon } from "@phosphor-icons/react/ssr";
import { whenBooted } from "@/components/motion/preloader";
import { Button } from "@/components/ui/button";
import { useGsap } from "@/lib/motion/use-gsap";
import { duration, ease, stagger } from "@/lib/motion/tokens";
import { depthBucket, icosahedron, project, rotate, torus, type Mesh } from "@/lib/motion/wireframe";
import { ctas, prefetchFor } from "@/lib/site";

const HEADLINE = ["Your", "Back", "Office."] as const;
const ACCENT = "Rebuilt.";

const commitments = [
  "Live in 10 business days",
  "No long-term lock-in",
  "NDA before the first call",
] as const;

/** Depth buckets: one stroke() per bucket per frame instead of one per edge. */
const BUCKETS = 7;

interface ShapeState {
  /** Base spin (radians), advanced every frame. */
  spin: number;
  /** Spin speed multiplier: 1 at rest, scrubbed up as the hero scrolls away. */
  speed: number;
  /** Pointer tilt targets (radians), eased by quickTo. */
  tiltX: number;
  tiltY: number;
  /** Overall scale and alpha, for the entrance and the scroll-away. */
  scale: number;
  alpha: number;
}

function drawMesh(
  ctx: CanvasRenderingContext2D,
  mesh: Mesh,
  angles: [number, number, number],
  cx: number,
  cy: number,
  focal: number,
  alphaScale: number,
  extent: number,
) {
  const projected = mesh.vertices.map((v) => project(rotate(v, ...angles), cx, cy, focal));
  const paths = Array.from({ length: BUCKETS }, () => new Path2D());
  for (const [a, b] of mesh.edges) {
    const pa = projected[a]!;
    const pb = projected[b]!;
    const bucket = depthBucket((pa[2] + pb[2]) / 2, extent, BUCKETS);
    paths[bucket]!.moveTo(pa[0], pa[1]);
    paths[bucket]!.lineTo(pb[0], pb[1]);
  }
  paths.forEach((path, i) => {
    // Far edges almost vanish, near edges hit full lime: depth without lighting.
    ctx.globalAlpha = alphaScale * (0.06 + (0.84 * (i + 1)) / BUCKETS);
    ctx.stroke(path);
  });
  return projected;
}

/**
 * Homepage hero, "The Engine Room" (docs/blueprint/11-motion-system.md §3a).
 *
 * - A lime wireframe torus with a counter-rotating icosahedron core, drawn on a canvas
 *   by lib/motion/wireframe (no WebGL): the machine that runs underneath the business.
 *   It turns slowly at rest, tilts toward the pointer (quickTo, 1.1s, power3.out), and
 *   spins up and recedes as the hero scrolls away (scrubbed). Off-screen, it stops drawing.
 * - The headline assembles word by word: blurred and low → sharp, 0.06s apart, expo.out.
 *   It paints blurred at first paint (still an LCP candidate) and sharpens when GSAP is
 *   ready, after the boot screen if one is playing. "Rebuilt." glitches once on arrival.
 * - The grid behind fades up with the entrance and drifts at 0.5× scroll (no loop).
 * - Both CTAs are magnetic (data-magnetic, components/motion/magnetic-field.tsx).
 */
export function EngineHero() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGsap(
    ({ gsap, ScrollTrigger, root, reduced }) => {
      const canvas = canvasRef.current;
      if (!root || !canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      const ring = torus(1, 0.36, 40, 14);
      const core = icosahedron(0.42);
      const state: ShapeState = {
        spin: 0.6,
        speed: 1,
        tiltX: 0,
        tiltY: 0,
        scale: reduced ? 1 : 0.86,
        alpha: reduced ? 1 : 0,
      };
      let width = 0;
      let height = 0;
      let visible = true;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const draw = () => {
        context.clearRect(0, 0, width, height);
        if (state.alpha <= 0.001) return;
        const focal = Math.min(width, height) * 0.33 * state.scale;
        const cx = width / 2;
        const cy = height / 2;
        context.strokeStyle = "#A3E635";
        context.lineWidth = 1;
        const tilt: [number, number, number] = [
          1.05 + state.tiltX,
          state.spin * 0.35 + state.tiltY,
          state.spin,
        ];
        drawMesh(context, ring, tilt, cx, cy, focal, state.alpha, 1.4);
        const coreAngles: [number, number, number] = [
          -state.spin * 0.8,
          -state.spin * 1.1 + state.tiltY,
          0.3,
        ];
        const nodes = drawMesh(context, core, coreAngles, cx, cy, focal, state.alpha, 0.5);
        // Core vertices as small lit nodes: the "laser" points of lime in a dark field.
        context.fillStyle = "#C6F56B";
        for (const [x, y, z] of nodes) {
          context.globalAlpha = state.alpha * (0.35 + 0.65 * ((z + 0.42) / 0.84));
          context.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
        context.globalAlpha = 1;
      };

      resize();
      const observer = new ResizeObserver(() => {
        resize();
        draw();
      });
      observer.observe(canvas);

      if (reduced) {
        // One still frame: the shape, the copy, no travel.
        draw();
        return () => observer.disconnect();
      }

      // Render on GSAP's ticker (one rAF for every animation on the page).
      const tick = (_time: number, deltaMs: number) => {
        if (!visible) return;
        state.spin += (deltaMs / 1000) * 0.12 * state.speed;
        draw();
      };
      gsap.ticker.add(tick);

      // Pointer tilt: the camera leans toward the cursor.
      const toTiltX = gsap.quickTo(state, "tiltX", { duration: 1.1, ease: ease.follow });
      const toTiltY = gsap.quickTo(state, "tiltY", { duration: 1.1, ease: ease.follow });
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        toTiltX(((event.clientY / window.innerHeight) * 2 - 1) * 0.35);
        toTiltY(((event.clientX / window.innerWidth) * 2 - 1) * 0.45);
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      // Entrance, after the boot screen lifts (if it is playing).
      const words = gsap.utils.toArray<HTMLElement>(".hero-word", root);
      const enter = gsap.utils.toArray<HTMLElement>(".hero-enter", root);
      const accent = root.querySelector<HTMLElement>(".glitch");
      const intro = gsap.timeline({ paused: true, defaults: { ease: ease.focal } });
      intro
        .to(state, { alpha: 1, scale: 1, duration: 1.4 }, 0)
        .fromTo(".engine-grid", { opacity: 0 }, { opacity: 1, duration: 1, ease: ease.entrance }, 0)
        .to(
          words,
          {
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            stagger: stagger.words,
            // Hand the resting state to CSS in one step, once every word has landed
            // (clearing per word would let CSS re-blur the early ones for a frame).
            onComplete: () => {
              root.setAttribute("data-entered", "");
              gsap.set(words, { clearProps: "filter,transform" });
            },
          },
          0.05,
        )
        .call(
          () => {
            if (!accent) return;
            accent.classList.add("is-glitching");
            window.setTimeout(() => accent.classList.remove("is-glitching"), 360);
          },
          undefined,
          0.62,
        )
        .fromTo(
          enter,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: duration.reveal,
            ease: ease.entrance,
            stagger: stagger.base,
            clearProps: "transform",
          },
          0.4,
        );
      // (The grid no longer pulses on a loop: one moving focal element per view, the
      // wireframe; ui-ux-pro-max `excessive-motion`.)
      void whenBooted().then(() => intro.play());

      // Scroll-away: copy lifts and dims at 1×, the shape recedes at 0.5× and spins up.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        })
        .to(state, { speed: 5, scale: 1.3, alpha: 0.35, ease: ease.linear }, 0)
        .to(".engine-stage", { yPercent: 18, ease: ease.linear }, 0)
        .to(".engine-copy", { yPercent: -12, opacity: 0.25, ease: ease.linear }, 0)
        .to(".engine-grid-wrap", { yPercent: 10, ease: ease.linear }, 0);

      // Stop drawing once the hero is fully off screen.
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          visible = self.isActive;
        },
      });

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("pointermove", onMove);
        observer.disconnect();
      };
    },
    { scope: rootRef, runWhenReduced: true },
  );

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[max(640px,100svh)] items-end overflow-hidden pt-28 pb-16 sm:pb-20 lg:items-center lg:pt-24"
    >
      <div aria-hidden className="engine-grid-wrap pointer-events-none absolute inset-0 -z-20">
        <div className="engine-grid absolute inset-0" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]"
      >
        <div className="engine-stage absolute max-lg:-top-[4%] max-lg:-right-[30%] max-lg:size-[125vw] max-lg:opacity-60 lg:top-1/2 lg:right-[-6%] lg:size-[min(78vh,760px)] lg:-translate-y-1/2">
          <canvas ref={canvasRef} className="engine-canvas" />
        </div>
      </div>

      <div className="engine-copy mx-auto w-full max-w-(--container-content) px-(--gutter)">
        <h1
          id="hero-title"
          className="max-w-[12ch] font-display text-[clamp(3.5rem,1.6rem+7.4vw,8rem)] leading-[0.9] font-semibold tracking-[-0.045em] text-fg"
        >
          {/* Spaces sit between the inline-block words, where they can't collapse. */}
          {HEADLINE.map((word) => (
            <Fragment key={word}>
              <span className="hero-word">{word}</span>{" "}
            </Fragment>
          ))}
          <span className="hero-word">
            <span className="glitch text-volt-500" data-text={ACCENT}>
              {ACCENT}
            </span>
          </span>
        </h1>

        <div className="mt-8 lg:mt-10">
          <div className="flex max-w-xl flex-col gap-8">
            <p className="hero-enter text-body-lg text-fg-muted">
              We handle the operations so your team handles the vision.
            </p>
            <div className="hero-enter flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" iconRight="arrow" className="max-sm:h-14" data-magnetic="">
                <Link href={ctas.primary.href} prefetch={prefetchFor(ctas.primary.href)}>
                  {ctas.primary.label}
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                iconRight="arrow"
                className="max-sm:h-14"
                data-magnetic=""
              >
                <Link href={ctas.secondary.href} prefetch={prefetchFor(ctas.secondary.href)}>
                  {ctas.secondary.label}
                </Link>
              </Button>
            </div>
            <ul
              aria-label="Commitments"
              className="hero-enter flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-fg-subtle"
            >
              {commitments.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckIcon aria-hidden weight="bold" className="size-3.5 text-volt-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
