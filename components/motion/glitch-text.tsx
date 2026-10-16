"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";

const GLITCH_MS = 360;

export interface GlitchTextProps {
  /** The text, also copied into `data-text` for the split layers. */
  text: string;
  as?: ElementType;
  className?: string;
  /** Glitch once after this many ms (e.g. when the hero has assembled). */
  onLoadDelay?: number;
  /** Glitch on hover (pointer devices). Default true. */
  onHover?: boolean;
  children?: ReactNode;
}

/**
 * Glitch text (§7c): RGB-split slices for three frames (360ms, steps(1); CSS in
 * styles/motion.css). Triggered on hover and, optionally, once on load.
 *
 * Deliberately not on a 4-second loop: anything that flashes or moves by itself for
 * more than 5 seconds needs a pause control (WCAG 2.2.2), and a headline that keeps
 * glitching reads as a broken screen to a CFO, not as craft. Once, on arrival, it
 * reads as a signal locking in.
 */
export function GlitchText({
  text,
  as: Tag = "span",
  className,
  onLoadDelay,
  onHover = true,
  children,
}: GlitchTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let timer = 0;
    const fire = () => {
      if (el.classList.contains("is-glitching")) return;
      el.classList.add("is-glitching");
      timer = window.setTimeout(() => el.classList.remove("is-glitching"), GLITCH_MS);
    };
    const load = onLoadDelay !== undefined ? window.setTimeout(fire, onLoadDelay) : 0;
    const hover = onHover && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (hover) el.addEventListener("pointerenter", fire);
    return () => {
      window.clearTimeout(load);
      window.clearTimeout(timer);
      if (hover) el.removeEventListener("pointerenter", fire);
    };
  }, [onLoadDelay, onHover]);

  return (
    <Tag ref={ref} data-text={text} className={cn("glitch", className)}>
      {children ?? text}
    </Tag>
  );
}
