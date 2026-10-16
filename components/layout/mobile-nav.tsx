"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightIcon, ListIcon, PlusIcon, XIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { services, servicesHubHref } from "@/lib/services";
import { ctas, prefetchFor, primaryNav, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

/**
 * Full-screen mobile menu (docs/blueprint/02-sitemap.md, B2.4), shown below 1024px.
 *
 * Built on the native modal <dialog>: the browser provides the focus trap, makes the
 * rest of the page inert, closes on Esc and restores focus to the trigger. Body
 * scroll is locked in globals.css while it is open. The Services group is a native
 * <details> accordion, so the whole menu adds no JS dependency.
 */
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  const close = useCallback(() => dialogRef.current?.close(), []);

  const show = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setOpen(true);
  };

  // Close when the route changes (e.g. browser back while the menu is open).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }
  useEffect(() => {
    if (!open && dialogRef.current?.open) dialogRef.current.close();
  }, [open]);

  // Keep React state in sync when the browser closes the dialog (Esc).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const servicesActive = pathname === servicesHubHref || pathname.startsWith(`${servicesHubHref}/`);
  const topLevel = primaryNav.filter((item) => item.href !== servicesHubHref);
  let index = 0;
  const stagger = () => ({ "--i": index++ }) as CSSProperties;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={show}
        className="lg:hidden"
      >
        <ListIcon aria-hidden />
      </Button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="mobile-sheet m-0 h-dvh max-h-none w-full max-w-none bg-ink-950 p-0 text-fg backdrop:bg-ink-950/80 lg:hidden"
      >
        <div className="flex h-full flex-col pb-[env(safe-area-inset-bottom)]">
          <div className="flex h-16 shrink-0 items-center justify-between px-(--gutter)">
            <Logo onNavigate={close} />
            <Button variant="ghost" size="icon" aria-label="Close menu" onClick={close} autoFocus>
              <XIcon aria-hidden />
            </Button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-(--gutter) pt-4">
            <ul className="flex flex-col">
              <li className="mobile-sheet-item border-b border-line" style={stagger()}>
                <details className="group" open={servicesActive}>
                  <summary
                    className={cn(
                      "flex min-h-14 cursor-pointer list-none items-center justify-between font-display text-[2rem] leading-tight font-semibold [&::-webkit-details-marker]:hidden",
                      servicesActive ? "text-fg" : "text-ink-100",
                    )}
                  >
                    Services
                    <PlusIcon
                      aria-hidden
                      className="size-5 text-fg-subtle transition-transform duration-200 ease-out-expo group-open:rotate-45"
                    />
                  </summary>
                  <ul className="flex flex-col pb-4">
                    {services.map((service) => (
                      <li key={service.slug}>
                        <Link
                          href={service.href}
                          prefetch={prefetchFor(service.href)}
                          onClick={close}
                          aria-current={pathname === service.href ? "page" : undefined}
                          className="flex min-h-11 items-center text-body-lg text-fg-muted transition-colors hover:text-fg aria-[current=page]:text-fg"
                        >
                          {service.shortName}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href={servicesHubHref}
                        prefetch={prefetchFor(servicesHubHref)}
                        onClick={close}
                        className="inline-flex min-h-11 items-center gap-1.5 text-body-lg font-medium text-accent-text"
                      >
                        All services
                        <ArrowRightIcon aria-hidden className="size-4" />
                      </Link>
                    </li>
                  </ul>
                </details>
              </li>
              {topLevel.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href} className="mobile-sheet-item border-b border-line" style={stagger()}>
                    <Link
                      href={item.href}
                      prefetch={prefetchFor(item.href)}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-14 items-center font-display text-[2rem] leading-tight font-semibold transition-colors hover:text-fg",
                        active ? "text-fg" : "text-ink-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className="mobile-sheet-item flex shrink-0 flex-col gap-3 border-t border-line px-(--gutter) pt-5 pb-6"
            style={stagger()}
          >
            <Button asChild variant="ghost" size="xl" fullWidth>
              <Link href={ctas.secondary.href} prefetch={prefetchFor(ctas.secondary.href)} onClick={close}>
                {ctas.secondary.short}
              </Link>
            </Button>
            <Button asChild size="xl" fullWidth iconRight="arrow">
              <Link href={ctas.primary.href} prefetch={prefetchFor(ctas.primary.href)} onClick={close}>
                {ctas.primary.label}
              </Link>
            </Button>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-caption text-fg-subtle">
              <a href={`mailto:${siteConfig.email}`} className="text-fg-muted hover:text-fg">
                {siteConfig.email}
              </a>
              <span>
                {siteConfig.hours} · replies within {siteConfig.replySla}
              </span>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
