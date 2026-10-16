"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const DURATION = 1200;

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

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

/**
 * Counts a stat up once when half visible (blueprint A6.3). Screen readers get the
 * final value only (visually hidden text); digits are tabular so the width never jitters.
 * Reduced motion and non-numeric values render the final value immediately.
 */
export function CountUp({ value }: { value: string }) {
  const parsed = parseCountable(value);
  const reduceMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parsed || reduceMotion || typeof IntersectionObserver === "undefined") return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          setProgress(t);
          if (t < 1) frame = requestAnimationFrame(step);
        };
        setProgress(0);
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // parsed is derived from value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  if (!parsed || progress === null) {
    return (
      <span ref={ref} className="tabular">
        {value}
      </span>
    );
  }
  const current = (parsed.target * easeOutExpo(progress)).toFixed(parsed.decimals);
  return (
    <span ref={ref} className="tabular">
      <span className="sr-only">{value}</span>
      <span aria-hidden>
        {parsed.prefix}
        {current}
      </span>
    </span>
  );
}
