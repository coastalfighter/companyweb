"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scroll reveal for elements marked `data-reveal` (blueprint A6.3: fade + 16px rise,
 * once). Content is never hidden without JS: the hidden pre-state only applies once
 * this sets `data-reveal-ready` on <html>, and anything already on screen is revealed
 * synchronously first, so above-the-fold content never flashes.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"));
    const reveal = (el: Element) => el.setAttribute("data-revealed", "");

    if (typeof IntersectionObserver === "undefined") {
      pending.forEach(reveal);
      return;
    }

    const viewportBottom = window.innerHeight;
    const offscreen = pending.filter((el) => {
      if (el.getBoundingClientRect().top < viewportBottom) {
        reveal(el);
        return false;
      }
      return true;
    });
    root.setAttribute("data-reveal-ready", "");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    offscreen.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
