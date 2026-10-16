"use client";

import { type ComponentPropsWithRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

/**
 * Shared control styling. Inputs carry a filled background as well as a border,
 * so the boundary is identifiable even though the resting hairline is < 3:1
 * (WCAG 1.4.11 note in docs/blueprint/08-responsive-accessibility.md).
 */
export const controlVariants = cva(
  [
    "w-full rounded-sm border border-line bg-surface-2 text-fg placeholder:text-fg-subtle",
    "transition-[border-color,box-shadow] duration-150 ease-out-expo",
    "hover:border-line-strong",
    "focus-visible:border-volt-500 focus-visible:ring-3 focus-visible:ring-volt-500/20 focus-visible:outline-none",
    "light:focus-visible:border-volt-800 light:focus-visible:ring-volt-800/20",
    "aria-invalid:border-error aria-invalid:focus-visible:ring-error/20",
    "disabled:cursor-not-allowed disabled:border-ink-700 disabled:bg-ink-900 disabled:text-fg-disabled",
    // <select> also matches :read-only, so scope the read-only look to text controls.
    "[&:is(input,textarea):read-only]:border-dashed [&:is(input,textarea):read-only]:border-line-strong [&:is(input,textarea):read-only]:bg-transparent",
  ],
  {
    variants: {
      size: {
        sm: "h-10 px-3 text-body-sm",
        // 16px minimum font size prevents iOS zoom-on-focus
        md: "h-12 px-3.5 text-base",
        lg: "h-14 px-4 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface InputProps
  extends Omit<ComponentPropsWithRef<"input">, "size">, VariantProps<typeof controlVariants> {}

export function Input({ className, size, type = "text", ...props }: InputProps) {
  const fieldProps = useFieldControl();
  return (
    <input type={type} className={cn(controlVariants({ size }), className)} {...fieldProps} {...props} />
  );
}
