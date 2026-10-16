import { type ComponentPropsWithRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Card surface. Elevation on dark is surface lightness + inner top highlight
 * + border; shadows only add depth (docs/blueprint/01-brand-design-system.md, A5).
 */
export const cardVariants = cva("relative rounded-lg border", {
  variants: {
    elevation: {
      1: "border-line bg-surface-1 shadow-e1",
      2: "border-line-strong bg-surface-2 shadow-e2",
      3: "border-line-strong bg-surface-3 shadow-e3",
    },
    interactive: {
      true: [
        "transition-[transform,border-color,box-shadow] duration-150 ease-out-expo",
        "hover:-translate-y-0.5 hover:border-volt-500/35 hover:shadow-e2",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
      ],
      false: "",
    },
    padding: {
      none: "",
      md: "p-6 md:p-8",
      lg: "p-8 md:p-10",
    },
  },
  defaultVariants: { elevation: 1, interactive: false, padding: "md" },
});

export interface CardProps extends ComponentPropsWithRef<"div">, VariantProps<typeof cardVariants> {
  /** Adds the 1px lime "edge light" along the top border. */
  edgeLight?: boolean;
}

export function Card({
  className,
  elevation,
  interactive,
  padding,
  edgeLight,
  children,
  ...props
}: CardProps) {
  return (
    <div className={cn(cardVariants({ elevation, interactive, padding }), className)} {...props}>
      {edgeLight ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 -top-px h-px bg-(image:--edge-light)"
        />
      ) : null}
      {children}
    </div>
  );
}

export function CardTitle({ className, ...props }: ComponentPropsWithRef<"h3">) {
  return <h3 className={cn("font-display text-h4 font-semibold text-fg", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentPropsWithRef<"p">) {
  return <p className={cn("text-body-sm text-fg-muted", className)} {...props} />;
}
