import {
  BookOpenTextIcon,
  CodeIcon,
  FunnelSimpleIcon,
  ListChecksIcon,
  ScalesIcon,
} from "@phosphor-icons/react/ssr";
import { type ServiceSlug } from "@/lib/services";
import { cn } from "@/lib/utils";

/**
 * Stand-in glyphs from Phosphor (Light weight) until the five custom service
 * icons in docs/blueprint/01-brand-design-system.md (A8) are drawn.
 */
const glyphs: Record<ServiceSlug, typeof CodeIcon> = {
  "web-development": CodeIcon,
  recruitment: FunnelSimpleIcon,
  "virtual-assistance": ListChecksIcon,
  accounting: BookOpenTextIcon,
  legal: ScalesIcon,
};

export interface ServiceGlyphProps {
  slug: ServiceSlug;
  className?: string;
  /** Lime icon + border: for hover/active/selected states only. */
  active?: boolean;
}

/** 40px icon container (A8): ink-800 fill, hairline border; lime on hover via `group`. */
export function ServiceGlyph({ slug, className, active = false }: ServiceGlyphProps) {
  const Glyph = glyphs[slug];
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-md border bg-ink-800 transition-colors duration-150",
        active
          ? "border-volt-500/40 text-volt-500"
          : "border-line text-ink-200 group-hover:border-volt-500/40 group-hover:text-volt-500 group-focus-visible:border-volt-500/40 group-focus-visible:text-volt-500",
        className,
      )}
    >
      <Glyph weight="light" className="size-5" />
    </span>
  );
}
