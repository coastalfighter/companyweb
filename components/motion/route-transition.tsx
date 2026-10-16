"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loadMotion, prefersReducedMotion, type MotionEngine } from "@/lib/motion/gsap";
import { duration, ease } from "@/lib/motion/tokens";

/** How long the curtain may wait for a slow route before lifting anyway. */
const MAX_WAIT_MS = 6000;

/**
 * Should this click get the curtain? Only plain left clicks on same-origin links to a
 * different path. Everything else (new tabs, downloads, hash jumps, same-page query
 * changes, mailto:, external sites) keeps the browser's own behavior. Exported for tests.
 */
export function transitionTarget(event: MouseEvent, location: Location): URL | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const target = event.target instanceof Element ? event.target : null;
  const anchor = target?.closest<HTMLAnchorElement>("a[href]");
  if (!anchor) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download") || anchor.dataset.transition === "off") return null;
  let url: URL;
  try {
    url = new URL(anchor.href, location.href);
  } catch {
    return null;
  }
  if (url.origin !== location.origin) return null;
  if (url.pathname === location.pathname) return null;
  // Route handlers and files are not pages.
  if (/\.[a-z0-9]+$/i.test(url.pathname) || url.pathname.startsWith("/api/")) return null;
  return url;
}

/**
 * Route curtain (docs/blueprint/11-motion-system.md §2.2): a lime panel rises over the
 * page (0.3s, power4.inOut), the route changes behind it, then it lifts away (0.3s)
 * while the new page assembles. 0.6s in total, never a hard cut or a white flash.
 *
 * How: one capture-phase click listener on window runs before Next's <Link> handler
 * and calls preventDefault(), which <Link> respects (it skips navigation when
 * `defaultPrevented`). We play the cover, then `router.push()`; the reveal plays when
 * `usePathname()` reports the new route. Prefetching, scroll restoration and the route
 * announcer all stay Next's. Back/forward stay instant (they're expected to be).
 *
 * Off with reduced motion: navigation is then instant, which is the accessible default.
 */
export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const pending = useRef<{ from: string; timer: number } | null>(null);
  const engineRef = useRef<MotionEngine | null>(null);

  const reveal = useCallback(() => {
    const engine = engineRef.current;
    const panel = panelRef.current;
    const state = pending.current;
    pending.current = null;
    if (state) window.clearTimeout(state.timer);
    if (!engine || !panel) return;
    const { gsap } = engine;
    const main = document.getElementById("main");
    gsap
      .timeline()
      .set(main, { y: 32, opacity: 0 })
      .to(panel, { yPercent: -100, duration: duration.curtainHalf, ease: ease.curtain }, 0)
      .to(main, { y: 0, opacity: 1, duration: 0.5, ease: ease.focal, clearProps: "transform,opacity" }, 0.12)
      .set(panel, { visibility: "hidden" });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let active = true;
    loadMotion()
      .then((engine) => {
        if (active) engineRef.current = engine;
      })
      .catch(() => {});

    const onClick = (event: MouseEvent) => {
      const engine = engineRef.current;
      const panel = panelRef.current;
      if (!engine || !panel || pending.current) return;
      const url = transitionTarget(event, window.location);
      if (!url) return;
      event.preventDefault();

      const { gsap } = engine;
      const main = document.getElementById("main");
      if (labelRef.current) labelRef.current.textContent = url.pathname;
      const href = `${url.pathname}${url.search}${url.hash}`;
      pending.current = {
        from: window.location.pathname,
        timer: window.setTimeout(() => reveal(), MAX_WAIT_MS),
      };

      gsap.killTweensOf([panel, main]);
      gsap
        .timeline({ onComplete: () => router.push(href) })
        .set(panel, { visibility: "visible", yPercent: 100 })
        // The page steps back as the panel arrives: exit faster than enter (emil-design-eng).
        .to(main, { y: -24, opacity: 0.4, duration: duration.curtainHalf, ease: ease.exit }, 0)
        .to(panel, { yPercent: 0, duration: duration.curtainHalf, ease: ease.curtain }, 0);
    };

    window.addEventListener("click", onClick, true);
    return () => {
      active = false;
      window.removeEventListener("click", onClick, true);
    };
  }, [router, reveal]);

  // The new route has committed: lift the curtain and assemble the page.
  useEffect(() => {
    if (pending.current && pending.current.from !== pathname) reveal();
  }, [pathname, reveal]);

  return (
    <div ref={panelRef} aria-hidden className="route-curtain">
      <span className="route-curtain-label">
        <span className="route-curtain-dot" />
        <span ref={labelRef} />
      </span>
    </div>
  );
}
