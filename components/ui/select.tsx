"use client";

import { type ComponentPropsWithRef } from "react";
import { CaretDownIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";
import { controlVariants } from "./input";

export interface NativeSelectProps extends Omit<ComponentPropsWithRef<"select">, "size"> {
  placeholder?: string;
}

/**
 * Native <select> styled like Input (G4). Native beats a custom listbox here: free
 * keyboard support, the OS picker on phones, and zero JS.
 */
export function NativeSelect({ className, placeholder, children, ...props }: NativeSelectProps) {
  const fieldProps = useFieldControl();
  return (
    <div className="relative">
      <select
        className={cn(
          controlVariants({ size: "md" }),
          "appearance-none pr-10 invalid:text-fg-subtle",
          className,
        )}
        {...fieldProps}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <CaretDownIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-fg-subtle"
      />
    </div>
  );
}
