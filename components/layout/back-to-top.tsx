"use client";

import { ArrowUpIcon } from "@phosphor-icons/react/ssr";
import { loadMotion, prefersReducedMotion } from "@/lib/motion/gsap";
import { ease } from "@/lib/motion/tokens";

/** Moves focus to the top of the content without a second scroll jump. */
function focusTop() {
  document.getElementById("main")?.focus({ preventScroll: true });
}

/**
 * Back to top (§9): a small magnetic circle. On click the page "whooshes": content and
 * footer dip to 96% around the middle of the screen (0.25s, power2.in, the page
 * leaving), the view resets to the top, and the top of the page settles back to full
 * size (0.45s, expo.out, the page arriving). Focus moves to the top of the content.
 * With reduced motion it's an instant jump.
 */
export function BackToTop() {
  const onClick = async () => {
    if (prefersReducedMotion()) {
      window.scrollTo({ top: 0, behavior: "instant" });
      focusTop();
      return;
    }
    try {
      const { gsap } = await loadMotion();
      const parts = [document.getElementById("main"), document.querySelector<HTMLElement>("footer")].filter(
        (el): el is HTMLElement => el !== null,
      );
      const origin = (el: HTMLElement) => `50% ${window.innerHeight / 2 - el.getBoundingClientRect().top}px`;
      parts.forEach((el) => gsap.set(el, { transformOrigin: origin(el) }));
      gsap
        .timeline({ onComplete: focusTop })
        .to(parts, { scale: 0.96, opacity: 0.55, duration: 0.25, ease: "power2.in" })
        .add(() => {
          window.scrollTo({ top: 0, behavior: "instant" });
          parts.forEach((el) => gsap.set(el, { transformOrigin: origin(el) }));
        })
        .to(parts, {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: ease.focal,
          clearProps: "transform,opacity,transformOrigin",
        });
    } catch {
      window.scrollTo({ top: 0, behavior: "smooth" });
      focusTop();
    }
  };

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      data-magnetic="10"
      data-cursor="Top"
      className="grid size-11 cursor-pointer place-items-center rounded-full border border-line-strong text-fg transition-colors duration-200 hover:border-volt-500 hover:text-volt-500"
    >
      <ArrowUpIcon aria-hidden className="size-4" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
