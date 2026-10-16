"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { hasSavedCalculatorInput, subscribeCalculatorInput } from "@/lib/calculator/saved";
import { servicesHubHref } from "@/lib/services";
import { ctas, prefetchFor, primaryNav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ServicesMegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";

const SCROLLED_AT = 24;
const HIDE_AFTER = 400;

/**
 * Sticky header (docs/blueprint/02-sitemap.md, B2.1 + B2.3).
 * Transparent at top → blurred Ink after 24px; hides on scroll-down past 400px and
 * returns on any scroll-up. It never hides while focus is inside it or while the
 * Services mega-menu is open.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuOpenRef = useRef(false);
  // Return visitors with calculator inputs saved get "Pick up where you left off" (blueprint F1).
  const resume = useSyncExternalStore(subscribeCalculatorInput, hasSavedCalculatorInput, () => false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const pinned = menuOpenRef.current || (headerRef.current?.contains(document.activeElement) ?? false);
      setScrolled(y > SCROLLED_AT);
      setHidden(!pinned && y > HIDE_AFTER && y > lastY);
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

  const onMenuOpenChange = useCallback((open: boolean) => {
    menuOpenRef.current = open;
    setMenuOpen(open);
    if (open) setHidden(false);
  }, []);

  const links = primaryNav.filter((item) => item.href !== servicesHubHref);

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled}
      data-hidden={hidden}
      onFocusCapture={() => setHidden(false)}
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[transform,background-color,border-color] duration-200 ease-out-expo",
        menuOpen
          ? "border-line bg-ink-950"
          : scrolled
            ? "border-line bg-ink-950/72 backdrop-blur-md backdrop-saturate-[1.4]"
            : "border-transparent bg-transparent",
        hidden && "-translate-y-full",
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex max-w-(--container-content) items-center justify-between px-(--gutter) transition-[height] duration-200 ease-out-expo",
          scrolled ? "h-16" : "h-20",
        )}
      >
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-body-sm">
            <li>
              <ServicesMegaMenu onOpenChange={onMenuOpenChange} />
            </li>
            {links.map((item) => {
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

        <div className="flex items-center gap-2 lg:gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
            <Link href={ctas.secondary.href} prefetch={prefetchFor(ctas.secondary.href)}>
              {resume ? "Pick up where you left off" : ctas.secondary.short}
            </Link>
          </Button>
          <Button asChild size="sm" iconRight="arrow">
            <Link href={ctas.primary.href} prefetch={prefetchFor(ctas.primary.href)}>
              {ctas.primary.short}
            </Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
