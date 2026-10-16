"use client";

import { useState } from "react";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react/ssr";
import { type ClientLogo } from "@/content/proof";
import { cn } from "@/lib/utils";
import { ClientLogoMark } from "./client-logo";

/**
 * Logo marquee (blueprint G10): 40s linear loop, pauses on hover/focus, and has an
 * explicit pause control (WCAG 2.2.2: moving content > 5s). The duplicate track is
 * hidden from assistive tech. Reduced motion shows a static wrapped grid.
 */
export function LogoMarquee({ logos }: { logos: readonly ClientLogo[] }) {
  const [paused, setPaused] = useState(false);
  const track = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="marquee-track flex shrink-0 items-center gap-16 pr-16">
      {logos.map((logo) => (
        <li key={logo.name}>
          <ClientLogoMark name={logo.name} src={logo.src} aspect={logo.aspect} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative">
      <div
        data-paused={paused}
        className={cn(
          "marquee flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]",
        )}
      >
        {track(false)}
        {track(true)}
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Play logo animation" : "Pause logo animation"}
        className="absolute -bottom-12 left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-md text-fg-subtle opacity-0 transition-opacity hover:bg-white/[0.06] hover:text-fg focus-visible:opacity-100 motion-reduce:hidden [.relative:hover_&]:opacity-100"
      >
        {paused ? (
          <PlayIcon aria-hidden weight="fill" className="size-3.5" />
        ) : (
          <PauseIcon aria-hidden weight="fill" className="size-3.5" />
        )}
      </button>
    </div>
  );
}
