import { type ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  /** Optional element aligned right of the title on desktop (e.g. a link). */
  aside?: ReactNode;
  className?: string;
}

/**
 * Eyebrow + H2 + intro (component spec G11). `id` labels the parent section.
 * Each part reveals on its own, batched and staggered 0.09s: label, then the heading
 * materializing (blur 8px → 0), then the intro (docs/blueprint/11-motion-system.md §4).
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  intro,
  align = "left",
  aside,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-5", align === "center" ? "items-center" : "max-w-3xl")}>
        <Eyebrow data-reveal>{eyebrow}</Eyebrow>
        <h2 id={id} data-reveal="text" className="font-display text-h2 font-semibold text-fg">
          {title}
        </h2>
        {intro ? (
          <p data-reveal className="max-w-[60ch] text-body-lg text-fg-muted">
            {intro}
          </p>
        ) : null}
      </div>
      {aside ? (
        <div data-reveal className="shrink-0">
          {aside}
        </div>
      ) : null}
    </div>
  );
}
