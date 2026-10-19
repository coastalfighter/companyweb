"use client";

import { useRef } from "react";
import { whenBooted } from "@/components/motion/preloader";
import { hasFinePointer } from "@/lib/motion/gsap";
import { glyphCount, pointerTilt } from "@/lib/motion/hero-math";
import { useGsap } from "@/lib/motion/use-gsap";
import { ease } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

type TokenKind = "comment" | "keyword" | "name" | "tag" | "plain";
interface Token {
  text: string;
  kind: TokenKind;
}

/** A real (if tiny) App Router page: what "zero to production" starts as. ≤38 glyphs a line, so it fits at 320px. */
export const CODE: readonly (readonly Token[])[] = [
  [{ text: "// app/page.tsx", kind: "comment" }],
  [
    { text: "export default async function ", kind: "keyword" },
    { text: "Page", kind: "name" },
    { text: "() {", kind: "plain" },
  ],
  [
    { text: "  const ", kind: "keyword" },
    { text: "items = ", kind: "plain" },
    { text: "await ", kind: "keyword" },
    { text: "getItems", kind: "name" },
    { text: "();", kind: "plain" },
  ],
  [
    { text: "  return ", kind: "keyword" },
    { text: "<Store", kind: "tag" },
    { text: " items={items} ", kind: "plain" },
    { text: "/>", kind: "tag" },
    { text: ";", kind: "plain" },
  ],
  [{ text: "}", kind: "plain" }],
];

const tokenClass: Record<TokenKind, string> = {
  comment: "text-fg-subtle",
  keyword: "text-accent-text",
  name: "text-fg",
  tag: "text-volt-200",
  plain: "text-fg-muted",
};

/** The page the code describes: nav, headline, sub, CTA, three cards (x, y, w, h in a 240×150 frame). */
const WIREFRAME = [
  [10, 10, 220, 12],
  [10, 32, 140, 10],
  [10, 48, 100, 8],
  [10, 64, 56, 14],
  [10, 92, 68, 48],
  [86, 92, 68, 48],
  [162, 92, 68, 48],
] as const;

/** Seconds per typed glyph. */
const GLYPH = 0.028;

/**
 * Web Development, "The Build" (docs/blueprint/11-motion-system.md §3b).
 *
 * A code editor types a Next.js page glyph by glyph (a clip-path on `steps(n)`, one
 * step per monospace character, so no per-letter DOM), then, as the hero scrolls away,
 * the code "compiles" into the page it describes: a wireframe whose outlines draw in
 * with the scroll (stroke-dashoffset, pathLength=1). The editor leans up to 4° toward
 * the pointer. Reduced motion: the finished code and the drawn wireframe, still.
 */
export function BuildVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGsap(
    ({ gsap, root }) => {
      if (!root) return;
      const lines = gsap.utils.toArray<HTMLElement>(".code-line", root);
      const frames = gsap.utils.toArray<SVGElement>(".wire-shape", root);
      const caret = root.querySelector<HTMLElement>(".code-caret");
      const status = root.querySelector<HTMLElement>(".build-status");
      const editor = root.querySelector<HTMLElement>(".build-tilt");

      gsap.set(lines, { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(frames, { strokeDashoffset: 1, fillOpacity: 0 });
      gsap.set([caret, status], { opacity: 0 });

      const typing = gsap.timeline({ paused: true });
      lines.forEach((line) => {
        const glyphs = Number(line.dataset.glyphs) || 1;
        typing.to(line, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: glyphs * GLYPH,
          ease: `steps(${glyphs})`,
        });
      });
      typing
        .set(caret, { opacity: 1 })
        .to(status, { opacity: 1, duration: 0.3, ease: ease.entrance }, "+=0.15")
        // A few blinks, then the caret rests (no endless loop).
        .to(caret, { opacity: 0, duration: 0.5, ease: "steps(1)", repeat: 5, yoyo: true }, "<");
      void whenBooted().then(() => typing.delay(0.45).play());

      // Scroll: the code compiles into the page.
      const section = root.closest("section") ?? root;
      gsap
        .timeline({ scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.6 } })
        .to(frames, { strokeDashoffset: 0, stagger: 0.06, ease: ease.linear }, 0)
        .to(frames, { fillOpacity: 1, stagger: 0.06, ease: ease.linear }, 0.25)
        .to(".build-preview", { yPercent: -10, ease: ease.linear }, 0)
        .to(".build-editor", { opacity: 0.55, ease: ease.linear }, 0);

      if (!editor || !hasFinePointer()) return;
      gsap.set(editor, { transformPerspective: 900 });
      const toX = gsap.quickTo(editor, "rotationX", { duration: 0.8, ease: ease.follow });
      const toY = gsap.quickTo(editor, "rotationY", { duration: 0.8, ease: ease.follow });
      const onMove = (event: PointerEvent) => {
        const tilt = pointerTilt(event.clientX, event.clientY, window.innerWidth, window.innerHeight, 4);
        toX(tilt.rotateX);
        toY(tilt.rotateY);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} aria-hidden className="relative">
      <div className="build-editor">
        <div className="build-tilt w-[90%] overflow-hidden rounded-xl border border-line bg-ink-900 shadow-e4">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="size-2.5 rounded-full bg-ink-600" />
            <span className="size-2.5 rounded-full bg-ink-600" />
            <span className="size-2.5 rounded-full bg-ink-600" />
            <span className="ml-3 font-mono text-[0.6875rem] text-fg-subtle">page.tsx</span>
          </div>
          <pre className="overflow-hidden px-4 py-5 font-mono text-[0.625rem] leading-6 sm:text-xs sm:leading-7">
            {CODE.map((line, i) => (
              <span key={i} className="code-line block w-max whitespace-pre" data-glyphs={glyphCount(line)}>
                {line.map((token, j) => (
                  <span key={j} className={tokenClass[token.kind]}>
                    {token.text}
                  </span>
                ))}
                {i === CODE.length - 1 ? <span className="code-caret ml-0.5 text-accent-text">▍</span> : null}
              </span>
            ))}
          </pre>
          <p className="build-status flex items-center gap-2 border-t border-line px-4 py-2.5 font-mono text-[0.6875rem] text-fg-subtle">
            <span className="size-1.5 rounded-full bg-accent" />
            Build ready
          </p>
        </div>
      </div>

      <div className="build-preview relative z-10 -mt-10 ml-auto w-[58%] rounded-lg border border-line bg-surface-1 p-2 shadow-e4">
        <svg viewBox="0 0 240 150" className="block w-full" fill="none">
          <rect x="1" y="1" width="238" height="148" rx="6" className="stroke-line" />
          {/* The page's blueprint is always there, faintly; the scroll draws it in lime and fills it. */}
          {WIREFRAME.map(([x, y, w, h], i) => (
            <rect key={`g${i}`} x={x} y={y} width={w} height={h} rx="3" className="stroke-line" />
          ))}
          {WIREFRAME.map(([x, y, w, h], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={h}
              rx="3"
              pathLength={1}
              className={cn("wire-shape", i === 3 ? "fill-volt-500/25" : "fill-ink-800")}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
