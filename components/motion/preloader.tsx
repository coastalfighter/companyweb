"use client";

import { useEffect, useRef } from "react";
import { loadMotion, prefersReducedMotion } from "@/lib/motion/gsap";
import { markBooted } from "@/lib/motion/boot";
import { ease } from "@/lib/motion/tokens";

/** Authored length of the timeline below; asserted against the token in tests. */
export const PRELOADER_TOTAL = 1.45;

const WORD_A = "AKROS";
const WORD_B = "TECH";
const TAGLINE = "Operations, handled.";
const GLYPHS = "01<>/#$%&*+=ABCDEFGHJKLMNPRSTUVXYZ";

/** Fired on window when the boot sequence has lifted (heroes wait for it). */
export const BOOT_EVENT = "akros:booted";

/** Resolves once the preloader is gone, or immediately when it isn't playing. */
export function whenBooted(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (document.documentElement.getAttribute("data-boot") !== "pending") return Promise.resolve();
  return new Promise((resolve) => window.addEventListener(BOOT_EVENT, () => resolve(), { once: true }));
}

/** A random glyph that is never the target letter (so every letter visibly "resolves"). */
export function scrambleGlyph(target: string, random: () => number = Math.random): string {
  let glyph = target;
  while (glyph === target) glyph = GLYPHS[Math.floor(random() * GLYPHS.length)] ?? "#";
  return glyph;
}

function Letters({ word, className }: { word: string; className: string }) {
  return (
    <span className={className}>
      {[...word].map((letter, i) => (
        <span key={i} data-letter={letter} className="preloader-letter">
          {letter}
        </span>
      ))}
    </span>
  );
}

/**
 * Boot preloader (docs/blueprint/11-motion-system.md §2.1): "a system booting up".
 *
 * Sequence, 1.45s total (GSAP timeline, ease tokens from lib/motion/tokens):
 *   0.00  grid fades up; the boot log line appears
 *   0.05  AKROS·TECH letters scramble through glyphs and lock, 40ms apart
 *   0.10  meter fills 000 → 100 (power2.inOut: a load bar that eases at both ends reads as real work)
 *   0.30  the tagline types itself, one character per 24ms (steps(), no easing: typing is discrete)
 *   1.05  content dims and the two shutters split from a lime seam (power4.inOut, 0.4s)
 *
 * Plays once per session (lib/motion/boot.ts) and never with reduced motion: the
 * inline head script decides before the first paint, so it is never drawn and then
 * removed. Any key or click skips it. If GSAP never loads, a CSS failsafe lifts it at
 * 2.6s, so the page can't be held hostage by a failed chunk. The page underneath is
 * fully rendered (and its H1 painted) the whole time.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || document.documentElement.getAttribute("data-boot") !== "pending") return;
    if (prefersReducedMotion()) {
      markBooted();
      return;
    }

    let cancelled = false;
    let ctx: gsap.Context | undefined;
    const finish = () => {
      markBooted();
      window.dispatchEvent(new Event(BOOT_EVENT));
    };

    loadMotion()
      .then(({ gsap }) => {
        if (cancelled) return;
        ctx = gsap.context(() => {
          // GSAP is driving now: cancel the CSS failsafe.
          gsap.set(root, { animation: "none" });
          const letters = gsap.utils.toArray<HTMLElement>(".preloader-letter", root);
          const meter = root.querySelector<HTMLElement>(".preloader-bar");
          const pct = root.querySelector<HTMLElement>(".preloader-pct");
          const typed = root.querySelector<HTMLElement>(".preloader-typed");
          const progress = { value: 0 };
          const typing = { chars: 0 };

          const tl = gsap.timeline({ defaults: { ease: ease.entrance }, onComplete: finish });
          tl.fromTo(".preloader-grid", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
            .fromTo(".preloader-log", { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 }, 0)
            // Letters: each cycles glyphs for 0.32s, then locks to its real letter.
            .fromTo(
              letters,
              { opacity: 0, yPercent: 30 },
              {
                opacity: 1,
                yPercent: 0,
                duration: 0.32,
                ease: ease.focal,
                stagger: {
                  each: 0.04,
                  onUpdate(this: gsap.core.Tween) {
                    const el = this.targets()[0] as HTMLElement;
                    const scrambling = this.progress() < 0.85;
                    el.classList.toggle("is-scrambling", scrambling);
                    if (scrambling) el.dataset.glyph = scrambleGlyph(el.dataset.letter ?? "");
                  },
                },
              },
              0.05,
            )
            .to(
              progress,
              {
                value: 100,
                duration: 0.95,
                ease: ease.loop,
                onUpdate: () => {
                  const v = Math.round(progress.value);
                  if (pct) pct.textContent = String(v).padStart(3, "0");
                  if (meter) gsap.set(meter, { scaleX: v / 100 });
                },
              },
              0.1,
            )
            .to(
              typing,
              {
                chars: TAGLINE.length,
                duration: TAGLINE.length * 0.024,
                ease: `steps(${TAGLINE.length})`,
                onUpdate: () => {
                  if (typed) typed.textContent = TAGLINE.slice(0, Math.round(typing.chars));
                },
              },
              0.3,
            )
            // Exit: content dims, the lime seam flashes, the shutters part.
            .to(".preloader-stage", { opacity: 0, scale: 0.98, duration: 0.2, ease: ease.exit }, 1.05)
            .fromTo(
              ".preloader-seam",
              { scaleX: 0, opacity: 1 },
              { scaleX: 1, duration: 0.22, ease: ease.focal },
              1.02,
            )
            .to(".preloader-seam", { opacity: 0, duration: 0.15 }, 1.24)
            .to(
              ".preloader-shutter-top",
              { yPercent: -100, duration: PRELOADER_TOTAL - 1.05, ease: ease.curtain },
              1.05,
            )
            .to(
              ".preloader-shutter-bottom",
              { yPercent: 100, duration: PRELOADER_TOTAL - 1.05, ease: ease.curtain },
              1.05,
            );

          // Any key or click skips ahead (a returning buyer shouldn't have to wait).
          const skip = () => tl.timeScale(4);
          window.addEventListener("keydown", skip, { once: true });
          window.addEventListener("pointerdown", skip, { once: true });
          return () => {
            window.removeEventListener("keydown", skip);
            window.removeEventListener("pointerdown", skip);
          };
        }, root);
      })
      .catch(() => {
        // No GSAP: the CSS failsafe lifts the preloader; record the session as booted.
        window.setTimeout(finish, 2600);
      });

    return () => {
      // Reverting restores the CSS failsafe, so an unmount mid-sequence still lifts it.
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="preloader">
      <div className="preloader-shutter preloader-shutter-top" />
      <div className="preloader-shutter preloader-shutter-bottom" />
      <div className="preloader-seam" />
      <div className="preloader-stage">
        <div className="preloader-grid" />
        <p className="preloader-log">akros/os · boot sequence</p>
        <p className="preloader-mark">
          <Letters word={WORD_A} className="text-fg" />
          <Letters word={WORD_B} className="text-volt-500" />
        </p>
        <p className="preloader-tagline">
          <span className="preloader-typed" />
          <span className="preloader-caret" />
        </p>
        <div className="preloader-meter">
          <span className="preloader-track">
            <span className="preloader-bar" />
          </span>
          <span className="preloader-pct tabular">000</span>
        </div>
      </div>
    </div>
  );
}
