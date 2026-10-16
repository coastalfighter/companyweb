"use client";

import { useRef } from "react";
import { useGsap } from "@/lib/motion/use-gsap";
import { duration, ease } from "@/lib/motion/tokens";

/** Splits "3h 41" into a number to animate ("41") and its fixed prefix ("3h "). */
export function parseCountable(value: string): { prefix: string; target: number; decimals: number } | null {
  const match = /^(.*?)(\d+(?:\.\d+)?)$/.exec(value);
  if (!match) return null;
  const [, prefix = "", digits = "0"] = match;
  return {
    prefix,
    target: Number(digits),
    decimals: digits.includes(".") ? digits.split(".")[1]!.length : 0,
  };
}

/** The text shown at `progress` (0–1) of the count. Exported for tests. */
export function countFrame(value: string, progress: number): string {
  const parsed = parseCountable(value);
  if (!parsed) return value;
  const current = parsed.target * Math.min(Math.max(progress, 0), 1);
  return `${parsed.prefix}${current.toFixed(parsed.decimals)}`;
}

/**
 * Animated stat (§7a). The final value is server-rendered, so it's what search engines,
 * no-JS visitors and screen readers get (the counting digits are aria-hidden). Once GSAP
 * loads, a stat still below the fold resets to 0 and counts up when it scrolls into view:
 * 1.5s, power2.out (fast at first, settling on the number), tabular digits so the width
 * never jitters. The suffix ("+", "%", "hr") pops in with a short scale once the number
 * lands. On screen already, or with reduced motion, it just shows the value.
 *
 * Numbers come only from content/proof.ts (verified, permissioned data).
 */
export function CountUp({
  value,
  suffix,
  suffixClassName,
}: {
  value: string;
  suffix?: string;
  suffixClassName?: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useGsap(
    ({ gsap, root }) => {
      if (!root || !parseCountable(value)) return;
      if (root.getBoundingClientRect().top < window.innerHeight) return;
      const digits = root.querySelector<HTMLElement>("[data-count]");
      const unit = root.querySelector<HTMLElement>("[data-suffix]");
      if (!digits) return;
      const state = { p: 0 };
      digits.textContent = countFrame(value, 0);
      if (unit) gsap.set(unit, { scale: 0.4, opacity: 0, transformOrigin: "0% 80%" });

      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 85%", once: true } })
        .to(state, {
          p: 1,
          duration: duration.count,
          ease: "power2.out",
          onUpdate: () => {
            digits.textContent = countFrame(value, state.p);
          },
        })
        .to(unit, { scale: 1, opacity: 1, duration: 0.35, ease: ease.focal }, "-=0.1");
    },
    { scope: rootRef, dependencies: [value] },
  );

  return (
    <span ref={rootRef} className="tabular">
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden data-count>
        {value}
      </span>
      {suffix ? (
        <span aria-hidden data-suffix className={suffixClassName ?? "inline-block"}>
          {suffix}
        </span>
      ) : null}
    </span>
  );
}
