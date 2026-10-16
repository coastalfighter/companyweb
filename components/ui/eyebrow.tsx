import { type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export interface EyebrowProps extends ComponentPropsWithRef<"p"> {
  /** Pulsing lime dot: use only for "live" sections (hero, status). */
  live?: boolean;
}

export function Eyebrow({ className, live = false, children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2.5 text-overline font-medium text-fg-subtle uppercase",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full bg-volt-500 light:bg-volt-700", live && "animate-live-pulse")}
      />
      {children}
    </p>
  );
}
