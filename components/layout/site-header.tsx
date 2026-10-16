"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ctas, prefetchFor, primaryNav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const SCROLLED_AT = 24;
const HIDE_AFTER = 400;

/**
 * Sticky header (docs/blueprint/02-sitemap.md, B2.3).
 * Transparent at top → blurred Ink after 24px; hides on scroll-down past 400px and
 * returns on any scroll-up. It never hides while focus is inside it.
 * M1 adds the Services mega-menu and the full-screen mobile menu.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const focusInside = headerRef.current?.contains(document.activeElement) ?? false;
      setScrolled(y > SCROLLED_AT);
      setHidden(!focusInside && y > HIDE_AFTER && y > lastY);
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled}
      data-hidden={hidden}
      onFocusCapture={() => setHidden(false)}
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[transform,background-color,border-color] duration-200 ease-out-expo",
        scrolled
          ? "border-line bg-ink-950/72 backdrop-blur-md backdrop-saturate-[1.4]"
          : "border-transparent bg-transparent",
        hidden && "-translate-y-full",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-(--container-content) items-center justify-between px-(--gutter) transition-[height] duration-200 ease-out-expo",
          scrolled ? "h-16" : "h-20",
        )}
      >
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-body-sm">
            {primaryNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={prefetchFor(item.href)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative py-2 transition-colors duration-150 hover:text-fg",
                      active ? "text-fg" : "text-fg-muted",
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-volt-500"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
            <Link href={ctas.secondary.href} prefetch={prefetchFor(ctas.secondary.href)}>
              {ctas.secondary.short}
            </Link>
          </Button>
          <Button asChild size="sm" iconRight="arrow">
            <Link href={ctas.primary.href} prefetch={prefetchFor(ctas.primary.href)}>
              {ctas.primary.short}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
