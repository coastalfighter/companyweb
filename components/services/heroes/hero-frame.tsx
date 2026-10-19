"use client";

import { Fragment, useRef, type ReactNode } from "react";
import Link from "next/link";
import { whenBooted } from "@/components/motion/preloader";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useGsap } from "@/lib/motion/use-gsap";
import { duration, ease, stagger } from "@/lib/motion/tokens";
import { prefetchFor } from "@/lib/site";
import { cn } from "@/lib/utils";

export type HeroLayout = "split" | "split-reverse" | "center";
/** Headline treatments: each service has its own voice (docs/blueprint/11-motion-system.md §3). */
export type HeadlineTreatment = "plain" | "scan" | "serif" | "ledger";

export interface ServiceHeroFrameProps {
  breadcrumb: readonly { label: string; href: string }[];
  eyebrow: string;
  title: string;
  subtitle: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  note?: string;
  layout?: HeroLayout;
  headline?: HeadlineTreatment;
  /** Extra classes for the H1 (e.g. the next/font variable for the Legal serif face). */
  titleClassName?: string;
  /** The service's own visual. Decorative: it must be `aria-hidden` itself. */
  visual: ReactNode;
}

/** Splits a headline into words for the word-by-word entrance (spaces stay between spans). */
export function headlineWords(title: string): string[] {
  return title.split(/\s+/).filter(Boolean);
}

/**
 * Shared frame for the five service heroes (M5b): breadcrumb, eyebrow, headline, one
 * supporting sentence, the service's primary CTA (consistent site-wide) plus a real
 * secondary destination, and the service's own visual.
 *
 * Entrance (same rules as the homepage, §3a): the H1 paints at first paint, blurred
 * and low (still the LCP candidate), and sharpens word by word (0.06s apart, expo.out)
 * once GSAP is ready and the boot screen, if any, has lifted. The rest rises 24px,
 * 0.09s apart. Headline treatments:
 * - `scan`: a lime scan line sweeps across the headline twice (on arrival and once
 *   more at 6s), then again on hover. Never on an endless loop (WCAG 2.2.2).
 * - `ledger`: the headline sits on ruled ledger lines that draw in from the left.
 * - `serif`: the Legal page's serif voice (face passed via `titleClassName`).
 */
export function ServiceHeroFrame({
  breadcrumb,
  eyebrow,
  title,
  subtitle,
  primary,
  secondary,
  note,
  layout = "split",
  headline = "plain",
  titleClassName,
  visual,
}: ServiceHeroFrameProps) {
  const rootRef = useRef<HTMLElement>(null);
  const centered = layout === "center";

  useGsap(
    ({ gsap, root, reduced }) => {
      if (!root || reduced) return;
      const words = gsap.utils.toArray<HTMLElement>(".hero-word", root);
      const enter = gsap.utils.toArray<HTMLElement>(".hero-enter", root);
      const scan = root.querySelector<HTMLElement>(".hero-scan");
      const rules = gsap.utils.toArray<HTMLElement>(".ledger-rule", root);

      const sweep = () => {
        if (!scan) return;
        gsap.fromTo(
          scan,
          { xPercent: -100, opacity: 1 },
          {
            xPercent: 100,
            duration: 0.9,
            ease: ease.curtain,
            overwrite: true,
            onComplete: () => gsap.set(scan, { opacity: 0 }),
          },
        );
      };

      const tl = gsap.timeline({ paused: true, defaults: { ease: ease.focal } });
      if (rules.length) {
        tl.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 0.7, stagger: 0.08, ease: ease.entrance }, 0);
      }
      tl.to(
        words,
        {
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          stagger: stagger.words,
          onComplete: () => {
            root.setAttribute("data-entered", "");
            gsap.set(words, { clearProps: "filter,transform" });
          },
        },
        0.05,
      ).fromTo(
        enter,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: duration.reveal,
          ease: ease.entrance,
          stagger: stagger.base,
          clearProps: "transform",
        },
        0.35,
      );
      if (scan) {
        tl.call(sweep, undefined, 0.7);
        gsap.delayedCall(6, sweep);
      }
      void whenBooted().then(() => tl.play());

      // Scroll-away: the copy lifts and dims as the visual takes over.
      gsap.to(".hero-copy", {
        yPercent: -8,
        opacity: 0.35,
        ease: ease.linear,
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.6 },
      });

      const h1 = root.querySelector("h1");
      if (scan && h1 && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        h1.addEventListener("pointerenter", sweep);
        return () => h1.removeEventListener("pointerenter", sweep);
      }
    },
    { scope: rootRef, runWhenReduced: false },
  );

  const copy = (
    <div
      className={cn(
        "hero-copy flex min-w-0 flex-col gap-6",
        centered ? "items-center text-center" : "lg:col-span-6",
      )}
    >
      <Breadcrumb items={breadcrumb} />
      <Eyebrow>{eyebrow}</Eyebrow>
      <div className="relative">
        <h1
          id="service-title"
          className={cn(
            "relative max-w-[16ch] text-[clamp(2.75rem,1.6rem+4.2vw,5.25rem)] leading-[0.95] text-fg",
            headline === "serif"
              ? "font-serif-legal font-medium tracking-[-0.02em]"
              : "font-display font-semibold tracking-[-0.04em]",
            headline === "ledger" && "tabular",
            centered && "mx-auto",
            titleClassName,
          )}
        >
          {headlineWords(title).map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              <span className="hero-word">{word}</span>{" "}
            </Fragment>
          ))}
          {headline === "ledger" ? (
            // Ruled like a ledger: one rule under every line of the headline, drawn in from the left.
            <span
              aria-hidden
              className="ledger-rule pointer-events-none absolute inset-0 -z-10 origin-left"
            />
          ) : null}
          {headline === "scan" ? (
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="hero-scan absolute inset-y-0 left-0 w-full opacity-0" />
            </span>
          ) : null}
        </h1>
      </div>
      <p className={cn("hero-enter max-w-[48ch] text-body-lg text-fg-muted", centered && "mx-auto")}>
        {subtitle}
      </p>
      <div className={cn("hero-enter mt-2 flex flex-col gap-3 sm:flex-row", centered && "sm:justify-center")}>
        <Button asChild size="lg" iconRight="arrow" className="max-sm:h-14" data-magnetic="">
          <Link href={primary.href} prefetch={prefetchFor(primary.href)}>
            {primary.label}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" iconRight="arrow" className="max-sm:h-14">
          <Link
            href={secondary.href}
            prefetch={secondary.href.startsWith("/") ? prefetchFor(secondary.href) : undefined}
          >
            {secondary.label}
          </Link>
        </Button>
      </div>
      {note ? (
        <p className={cn("hero-enter max-w-[56ch] text-caption text-fg-subtle", centered && "mx-auto")}>
          {note}
        </p>
      ) : null}
    </div>
  );

  return (
    <section
      ref={rootRef}
      aria-labelledby="service-title"
      className="relative isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24"
    >
      <div
        className={cn(
          "mx-auto grid max-w-(--container-content) items-center gap-12 px-(--gutter)",
          centered ? "grid-cols-1" : "lg:grid-cols-12 lg:gap-8",
        )}
      >
        {copy}
        <div
          className={cn(
            // The visual rises with the rest of the entrance; the H1 never waits for it.
            "hero-enter w-full",
            layout === "split" && "lg:col-span-6",
            layout === "split-reverse" && "lg:order-first lg:col-span-6",
          )}
        >
          {visual}
        </div>
      </div>
    </section>
  );
}
