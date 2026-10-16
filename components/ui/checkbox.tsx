import { type ComponentPropsWithRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<ComponentPropsWithRef<"input">, "type"> {
  label: ReactNode;
  description?: ReactNode;
}

/**
 * Checkbox (G4): native input, custom 18px box with a lime fill and Ink tick.
 * The whole row is the click target (min 44px).
 */
export function Checkbox({ label, description, className, id, ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn("group flex min-h-11 cursor-pointer items-start gap-3 py-2", className)}
    >
      <span className="relative mt-0.5 grid size-[18px] shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          className="peer size-[18px] cursor-pointer appearance-none rounded-xs border border-ink-300 bg-surface-2 transition-colors checked:border-volt-500 checked:bg-volt-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          {...props}
        />
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="pointer-events-none absolute size-3 text-ink-950 opacity-0 transition-opacity duration-75 peer-checked:opacity-100"
        >
          <path
            d="M2.5 6.2 5 8.7 9.5 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-body-sm text-ink-100">{label}</span>
        {description ? <span className="text-caption text-fg-subtle">{description}</span> : null}
      </span>
    </label>
  );
}
