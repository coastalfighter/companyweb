"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { XIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const sizes = {
  sm: "sm:max-w-[440px]",
  md: "sm:max-w-[640px]",
  lg: "sm:max-w-[880px]",
} as const;

export interface DialogProps {
  /** Content of the trigger button. */
  trigger: ReactNode;
  triggerClassName?: string;
  title: ReactNode;
  description?: ReactNode;
  size?: keyof typeof sizes;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Modal dialog (docs/blueprint/07-component-library.md, G7) on the native <dialog>:
 * browser-provided focus trap, inert page, Esc to close and focus return. Adds
 * click-outside to close. Renders as a bottom sheet below 640px.
 */
export function Dialog({
  trigger,
  triggerClassName,
  title,
  description,
  size = "md",
  children,
  footer,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  const show = useCallback(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setOpen(true);
  }, []);
  const close = useCallback(() => ref.current?.close(), []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={triggerClassName}
      >
        {trigger}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(event) => {
          // A click on the ::backdrop targets the <dialog> element itself.
          if (event.target === event.currentTarget) close();
        }}
        className={cn(
          "app-dialog m-0 mt-auto max-h-[90dvh] w-full max-w-none rounded-t-xl border border-line-strong bg-surface-3 p-0 text-fg shadow-e4 backdrop:bg-ink-950/70 backdrop:backdrop-blur-sm",
          "sm:m-auto sm:max-h-[85dvh] sm:rounded-xl",
          sizes[size],
        )}
      >
        <div className="flex max-h-[inherit] flex-col">
          <div className="flex items-start justify-between gap-6 border-b border-line px-6 pt-6 pb-5 sm:px-8">
            <div className="flex flex-col gap-1.5">
              <h2 id={titleId} className="font-display text-h4 font-semibold text-fg">
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="text-body-sm text-fg-muted">
                  {description}
                </p>
              ) : null}
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={close} autoFocus>
              <XIcon aria-hidden />
            </Button>
          </div>
          {/* Focusable so keyboard users can scroll long content (axe: scrollable-region-focusable). */}
          <div
            tabIndex={0}
            className="overflow-y-auto px-6 py-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:px-8"
          >
            {children}
          </div>
          {footer ? (
            <div className="flex flex-col-reverse gap-3 border-t border-line px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
              {footer}
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
