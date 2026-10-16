"use client";

import { type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";
import { controlVariants } from "./input";
import { useFieldControl } from "./field";

export interface TextareaProps extends ComponentPropsWithRef<"textarea"> {
  /** Shows a live character counter once 80% of maxLength is used. */
  showCount?: boolean;
}

export function Textarea({ className, showCount = false, maxLength, value, ...props }: TextareaProps) {
  const fieldProps = useFieldControl();
  const length = typeof value === "string" ? value.length : 0;
  const showCounter = showCount && maxLength !== undefined && length >= maxLength * 0.8;

  return (
    <div className="relative">
      <textarea
        className={cn(
          controlVariants({ size: "md" }),
          "[field-sizing:content] h-auto max-h-80 min-h-[120px] resize-y py-3",
          className,
        )}
        maxLength={maxLength}
        value={value}
        {...fieldProps}
        {...props}
      />
      {showCounter ? (
        <p aria-live="polite" className="tabular mt-1.5 text-right text-caption text-fg-subtle">
          {length} / {maxLength}
        </p>
      ) : null}
    </div>
  );
}
