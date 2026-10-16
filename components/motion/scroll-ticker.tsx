import { Fragment } from "react";
import { cn } from "@/lib/utils";

function Row({ items, className }: { items: readonly string[]; className: string }) {
  // Repeated so the band never shows its end, whichever way it slides.
  const loop = [...items, ...items, ...items];
  return (
    <div className={cn("ticker-row flex w-max items-center gap-8 md:gap-12", className)}>
      {loop.map((item, i) => (
        <Fragment key={`${item}-${i}`}>
          <span className="whitespace-nowrap">{item}</span>
          <span className="ticker-glyph size-3 shrink-0 rotate-45 rounded-[2px] bg-volt-500 md:size-4" />
        </Fragment>
      ))}
    </div>
  );
}

/**
 * Two bands of words that slide in opposite directions as the page scrolls past
 * (blueprint A6.3a). Decorative: the same words are real content elsewhere on the
 * page, so the band is hidden from assistive technology. It never moves on its own.
 */
export function ScrollTicker({
  items,
  secondary,
  className,
}: {
  items: readonly string[];
  /** Second band; defaults to the first one reversed. */
  secondary?: readonly string[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div
      aria-hidden
      className={cn(
        "ticker flex flex-col gap-3 overflow-clip border-y border-line py-10 font-display text-[clamp(2.25rem,1.4rem+3.6vw,4.75rem)] leading-none font-semibold tracking-[-0.03em] select-none md:gap-5 md:py-14",
        className,
      )}
    >
      <Row items={items} className="ticker-forward text-fg" />
      <Row items={secondary ?? [...items].reverse()} className="ticker-back text-fg-subtle" />
    </div>
  );
}
