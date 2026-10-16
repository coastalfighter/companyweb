import { type ReactNode } from "react";
import { InfoIcon, WarningDiamondIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

const variants = {
  note: { Icon: InfoIcon, className: "border-info/30 bg-info/10", icon: "text-info" },
  warning: { Icon: WarningDiamondIcon, className: "border-warning/30 bg-warning/10", icon: "text-warning" },
} as const;

/** Callout (G11) for compliance notes and "what we don't do" context. */
export function Callout({
  variant = "note",
  children,
  className,
}: {
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
}) {
  const { Icon, className: tone, icon } = variants[variant];
  return (
    <div
      role="note"
      className={cn("flex gap-3 rounded-md border p-4 text-body-sm text-ink-100", tone, className)}
    >
      <Icon aria-hidden weight="light" className={cn("mt-px size-5 shrink-0", icon)} />
      <div>{children}</div>
    </div>
  );
}
