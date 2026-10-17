"use client";

import { useEffect, useRef } from "react";
import { loadMotion, prefersReducedMotion } from "@/lib/motion/gsap";
import { markBooted } from "@/lib/motion/boot";
import { duration, ease } from "@/lib/motion/tokens";

/** What the meter reports, in percent, as each real readiness stage resolves. */
export const READINESS = { fonts: 55, load: 90, ready: 100 } as const;

/** Resolves when web fonts are ready and the window has loaded, reporting each stage. */
export function trackReadiness(onStage: (percent: number) => void): Promise<void> {
  // Callbacks are wrapped so their return value is ignored: a GSAP tween is a thenable,
  // and returning one here would make readiness wait on (possibly overwritten) animation.
  const fonts = (document.fonts?.ready ?? Promise.resolve()).then(() => {
    onStage(READINESS.fonts);
  });
  const load =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
  return Promise.all([
    fonts,
    load.then(() => {
      onStage(READINESS.load);
    }),
  ]).then(() => undefined);
}

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
 * Revised in the color & UX review (ui-ux-pro-max `loading-states`: feedback must match
 * the real wait). The meter is no longer a 1-second timer dressed up as progress: it
 * reports the page actually getting ready (fonts 55%, window load 90%, then 100%),
 * and the screen lifts as soon as that's true:
 *   - never before 0.85s (the mark has to be readable: letters scramble and lock,
 *     the tagline types itself),
 *   - never after 2s (the page is already rendered underneath; it isn't held hostage),
 *   - immediately on any key, click, wheel or touch.
 * The exit is the shutters splitting from a lime seam (power4.inOut, 0.35s).
 *
 * Plays once per session (lib/motion/boot.ts), never with reduced motion or the site's
 * "Reduce motion" switch. If GSAP never loads, a CSS failsafe lifts it at 2.6s.
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
        ctx = gsap.context((self) => {
          // GSAP is driving now: cancel the CSS failsafe.
          gsap.set(root, { animation: "none" });
          const letters = gsap.utils.toArray<HTMLElement>(".preloader-letter", root);
          const bar = root.querySelector<HTMLElement>(".preloader-bar");
          const pct = root.querySelector<HTMLElement>(".preloader-pct");
          const typed = root.querySelector<HTMLElement>(".preloader-typed");
          const meter = { value: 0 };
          const typing = { chars: 0 };
          let lifted = false;

          const renderMeter = () => {
            const v = Math.round(meter.value);
            if (pct) pct.textContent = String(v).padStart(3, "0");
            if (bar) gsap.set(bar, { scaleX: v / 100 });
          };
          const toMeter = (value: number, seconds = 0.3) =>
            gsap.to(meter, {
              value,
              duration: seconds,
              ease: ease.entrance,
              overwrite: true,
              onUpdate: renderMeter,
            });

          // The mark: grid, boot line, letters locking in, the tagline typing.
          const intro = gsap.timeline({ defaults: { ease: ease.entrance } });
          intro
            .fromTo(".preloader-grid", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
            .fromTo(".preloader-log", { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 }, 0)
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
            );

          const lift = () => {
            if (lifted || cancelled) return;
            lifted = true;
            // Created after setup, so added to the context explicitly (reverted on unmount).
            self.add(() => {
              toMeter(READINESS.ready, 0.15);
              gsap
                .timeline({ onComplete: finish, delay: 0.12 })
                .to(".preloader-stage", { opacity: 0, scale: 0.98, duration: 0.18, ease: ease.exit }, 0)
                .fromTo(
                  ".preloader-seam",
                  { scaleX: 0, opacity: 1 },
                  { scaleX: 1, duration: 0.2, ease: ease.focal },
                  0,
                )
                .to(".preloader-seam", { opacity: 0, duration: 0.12 }, 0.2)
                .to(".preloader-shutter-top", { yPercent: -100, duration: 0.35, ease: ease.curtain }, 0.04)
                .to(".preloader-shutter-bottom", { yPercent: 100, duration: 0.35, ease: ease.curtain }, 0.04);
            });
          };

          // Lift when the page is really ready and the mark has had its moment; cap the wait.
          // Both limits count from navigation start, not from when GSAP arrived, so a slow
          // chunk can't stretch the boot screen.
          const sinceNav = performance.now() / 1000;
          const floor = Math.max(duration.preloaderMin - sinceNav, 0.55);
          const ceiling = Math.max(duration.preloaderMax - sinceNav, floor);
          const minimum = new Promise<void>((resolve) => gsap.delayedCall(floor, resolve));
          void Promise.all([
            trackReadiness((p) => {
              if (!lifted) toMeter(p);
            }),
            minimum,
          ]).then(lift);
          gsap.delayedCall(ceiling, lift);

          // Any key, click, wheel or touch: the visitor wants in, so lift now.
          const skip = () => lift();
          const events = ["keydown", "pointerdown", "wheel", "touchstart"] as const;
          events.forEach((type) => window.addEventListener(type, skip, { once: true, passive: true }));
          return () => events.forEach((type) => window.removeEventListener(type, skip));
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
