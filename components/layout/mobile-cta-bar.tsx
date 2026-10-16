"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ctas, prefetchFor } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Shown once the visitor has scrolled roughly past the hero. */
const SHOW_AFTER_VIEWPORTS = 0.8;
/** The visual viewport shrinking this much means the on-screen keyboard is open. */
const KEYBOARD_RATIO = 0.75;
const HIDDEN_ON: readonly string[] = ["/contact"];

/**
 * Slim mobile bottom CTA bar (docs/blueprint/06-cta-conversion.md, F2.7).
 * Below 1024px only; safe-area aware; hidden near the top of the page, while the
 * on-screen keyboard is open, on the contact page, and while any element marked
 * `data-cta-zone` (the closing CTA slab, the footer) is on screen, so there is
 * never more than one primary CTA in view (F2 rule 1).
 */
export function MobileCtaBar() {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const [zoneInView, setZoneInView] = useState(false);
  const visible = pastHero && !zoneInView;

  useEffect(() => {
    const zones = document.querySelectorAll("[data-cta-zone]");
    if (zones.length === 0 || typeof IntersectionObserver === "undefined") return;
    const inView = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      }
      setZoneInView(inView.size > 0);
    });
    zones.forEach((zone) => observer.observe(zone));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.visualViewport;
      const keyboardOpen = viewport ? viewport.height < window.innerHeight * KEYBOARD_RATIO : false;
      setPastHero(window.scrollY > window.innerHeight * SHOW_AFTER_VIEWPORTS && !keyboardOpen);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.visualViewport?.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (HIDDEN_ON.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return null;

  return (
    <div
      data-visible={visible}
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-line-strong bg-surface-3/95 shadow-e3 backdrop-blur-md lg:hidden",
        "pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out-expo motion-reduce:transition-none",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex h-14 items-center gap-2 px-(--gutter)">
        <Button asChild variant="ghost" size="md" className="flex-1">
          <Link href={ctas.secondary.href} prefetch={prefetchFor(ctas.secondary.href)}>
            {ctas.secondary.short}
          </Link>
        </Button>
        <Button asChild size="md" iconRight="arrow" className="flex-[1.4]">
          <Link href={ctas.primary.href} prefetch={prefetchFor(ctas.primary.href)}>
            {ctas.primary.short}
          </Link>
        </Button>
      </div>
    </div>
  );
}
