import { type ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

const widths = {
  content: "max-w-(--container-content)",
  wide: "max-w-(--container-wide)",
  prose: "max-w-(--container-prose)",
} as const;

export interface ContainerProps extends ComponentPropsWithRef<"div"> {
  width?: keyof typeof widths;
}

export function Container({ className, width = "content", ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-(--gutter)", widths[width], className)} {...props} />;
}
