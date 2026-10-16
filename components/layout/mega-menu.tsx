"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightIcon, CaretDownIcon } from "@phosphor-icons/react/ssr";
import { ServiceGlyph } from "@/components/marketing/service-glyph";
import { Eyebrow } from "@/components/ui/eyebrow";
import { services, servicesHubHref } from "@/lib/services";
import { ctas, prefetchFor, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const OPEN_DELAY = 150;
const CLOSE_GRACE = 300;

export interface ServicesMegaMenuProps {
  /** Lets the header stay pinned while the panel is open. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Desktop "Services" mega-menu (docs/blueprint/02-sitemap.md, B2.1).
 *
 * Implemented as the WAI disclosure-navigation pattern (a button that shows and
 * hides a panel of links) rather than an ARIA menu: it's the recommended pattern
 * for site navigation and needs no library. Opens on hover after a 150ms intent
 * delay or on click/Enter/Space; closes on Esc (focus returns to the trigger),
 * outside click, focus leaving, pointer leaving (300ms grace) or navigation.
 */
export function ServicesMegaMenu({ onOpenChange }: ServicesMegaMenuProps) {
  const [open, setOpenState] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const pathname = usePathname();
  const active = pathname === servicesHubHref || pathname.startsWith(`${servicesHubHref}/`);

  const setOpen = useCallback((next: boolean) => {
    window.clearTimeout(timer.current);
    setOpenState(next);
  }, []);

  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };

  // Close on navigation (adjust state during render instead of in an effect).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenState(false);
  }

  // Report open state to the header so it stays pinned while the panel is open.
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // Outside click.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, setOpen]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse") schedule(true, open ? 0 : OPEN_DELAY);
  };
  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType === "mouse") schedule(false, CLOSE_GRACE);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      ref={wrapperRef}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (open && !wrapperRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        data-active={active || undefined}
        className={cn(
          "nav-link group inline-flex items-center gap-1 py-2",
          open || active ? "text-fg" : "text-fg-muted",
        )}
      >
        Services
        <CaretDownIcon
          aria-hidden
          weight="bold"
          className={cn("size-3 transition-transform duration-200 ease-out-expo", open && "rotate-180")}
        />
      </button>

      {/* Hit-area bridge so the pointer can travel from trigger to panel without closing it. */}
      <div aria-hidden className={cn("absolute inset-x-0 top-full h-3", !open && "hidden")} />

      <div
        id={panelId}
        data-state={open ? "open" : "closed"}
        className={cn(
          "absolute inset-x-(--gutter) top-[calc(100%+0.5rem)] origin-top rounded-xl border border-line-strong bg-surface-3 shadow-e3",
          "duration-200 ease-out-expo motion-reduce:transition-none",
          open
            ? // Visibility flips instantly on open so links are focusable on the very first frame…
              "visible translate-y-0 scale-100 opacity-100 transition-[opacity,transform]"
            : // …and is only delayed on close, so the fade-out can finish.
              "pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0 transition-[opacity,transform,visibility] duration-150",
        )}
      >
        <div className="grid grid-cols-12 gap-6 p-6">
          <ul className="col-span-8 grid grid-cols-2 gap-1" aria-label="Services">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={service.href}
                  prefetch={prefetchFor(service.href)}
                  onClick={() => setOpen(false)}
                  className="group flex gap-4 rounded-lg p-3 transition-colors duration-150 hover:bg-white/[0.04]"
                >
                  <ServiceGlyph slug={service.slug} />
                  <span className="flex flex-col gap-1">
                    <span className="text-h5 font-semibold text-fg">{service.name}</span>
                    <span className="text-body-sm text-fg-muted">{service.outcome}</span>
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={servicesHubHref}
                prefetch={prefetchFor(servicesHubHref)}
                onClick={() => setOpen(false)}
                className="group flex h-full items-center gap-2 rounded-lg p-3 text-h5 font-semibold text-fg transition-colors duration-150 hover:bg-white/[0.04]"
              >
                All services
                <ArrowRightIcon
                  aria-hidden
                  className="size-4 text-accent-text transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
                />
              </Link>
            </li>
          </ul>

          {/* Proof slot: swap for the latest published case study once one is permissioned (blueprint E2.3). */}
          <div className="col-span-4 flex flex-col justify-between rounded-lg border border-line bg-surface-1 p-5">
            <div>
              <Eyebrow>The process</Eyebrow>
              <p className="mt-4 font-display text-h4 font-semibold text-fg">
                No mystery. Here&apos;s exactly what happens after your first call.
              </p>
            </div>
            <Link
              href="/how-it-works"
              prefetch={prefetchFor("/how-it-works")}
              onClick={() => setOpen(false)}
              className="group mt-6 inline-flex items-center gap-1.5 text-body-sm font-medium text-accent-text"
            >
              See how it works
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
              />
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 border-t border-line px-6 py-4 text-body-sm">
          <Link
            href={ctas.secondary.href}
            prefetch={prefetchFor(ctas.secondary.href)}
            onClick={() => setOpen(false)}
            className="group inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-fg"
          >
            Not sure where to start? Take the 2-minute calculator
            <ArrowRightIcon
              aria-hidden
              className="size-4 text-accent-text transition-transform duration-150 ease-out-expo group-hover:translate-x-[3px]"
            />
          </Link>
          <a href={`mailto:${siteConfig.email}`} className="text-fg-muted transition-colors hover:text-fg">
            {siteConfig.email}
          </a>
        </div>
      </div>
    </div>
  );
}
