import { cn } from "@/lib/utils";

/**
 * Section divider (§7f): a 1px lime line that draws itself across the screen as it
 * scrolls in (stroke-dashoffset 1 → 0, scrubbed by the reveal engine via `data-draw`),
 * with a short node at the left that marks where the next part of the argument starts.
 * Without GSAP, or with reduced motion, it is simply drawn.
 */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("mx-auto max-w-(--container-wide) px-(--gutter)", className)}>
      <svg className="section-divider block h-3 w-full overflow-visible" preserveAspectRatio="none">
        <line x1="0" y1="6" x2="100%" y2="6" pathLength={1} data-draw />
        <rect x="0" y="3" width="6" height="6" fill="var(--volt-500)" />
      </svg>
    </div>
  );
}
