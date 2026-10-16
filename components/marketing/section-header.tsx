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

/** Eyebrow + H2 + intro (component spec G11). `id` labels the parent section. */
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
      data-reveal
      className={cn(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-5", align === "center" ? "items-center" : "max-w-3xl")}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id} className="font-display text-h2 font-semibold text-fg">
          {title}
        </h2>
        {intro ? <p className="max-w-[60ch] text-body-lg text-fg-muted">{intro}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}
