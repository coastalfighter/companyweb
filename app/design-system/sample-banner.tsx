import { type ReactNode } from "react";

/** The warning strip on every /design-system preview that shows sample data. */
export function SampleBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="note"
      className="sticky top-16 z-30 border-y border-warning/40 bg-warning/15 px-(--gutter) py-3 text-center text-body-sm font-medium text-warning backdrop-blur-md"
    >
      {children}
    </div>
  );
}
