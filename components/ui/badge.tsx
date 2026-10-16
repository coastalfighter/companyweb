import { type ComponentPropsWithRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-xs border px-2 py-0.5 text-micro font-medium tracking-[0.02em] whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "border-line bg-surface-2 text-fg-muted",
        volt: "border-volt-500/40 bg-volt-950 text-volt-500 light:border-volt-700/40 light:bg-volt-100 light:text-volt-900",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
        error: "border-error/30 bg-error/10 text-error",
        mono: "border-line bg-transparent font-mono text-[0.625rem] tracking-wider text-fg-subtle",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends ComponentPropsWithRef<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
