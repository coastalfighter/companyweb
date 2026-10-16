"use client";

import { createContext, useContext, useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { Label as LabelPrimitive } from "radix-ui";
import { WarningCircleIcon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

/**
 * Field: label + control + hint + error with ARIA wiring.
 * Spec: docs/blueprint/07-component-library.md (G4). Labels always sit above the
 * control (never placeholder-only).
 */
interface FieldContextValue {
  controlId: string;
  hintId: string | undefined;
  errorId: string | undefined;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** Returns the ARIA props a control needs when rendered inside <Field>. */
export function useFieldControl(): {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
} {
  const ctx = useContext(FieldContext);
  if (!ctx) return {};
  const describedBy = [ctx.hintId, ctx.errorId].filter(Boolean).join(" ") || undefined;
  return {
    id: ctx.controlId,
    "aria-describedby": describedBy,
    "aria-invalid": ctx.invalid ? true : undefined,
    "aria-required": ctx.required ? true : undefined,
  };
}

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  /** Error message. When set, the control is marked aria-invalid. */
  error?: ReactNode;
  required?: boolean;
  /** Override the generated control id (e.g. to match an existing form library). */
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, required = false, id, className, children }: FieldProps) {
  const generated = useId();
  const controlId = id ?? `field-${generated}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  return (
    <FieldContext.Provider value={{ controlId, hintId, errorId, invalid: Boolean(error), required }}>
      <div className={cn("flex flex-col gap-2", className)}>
        <Label htmlFor={controlId}>
          {label}
          {required ? (
            <span className="text-fg-subtle">
              <span aria-hidden> *</span>
              <span className="sr-only"> (required)</span>
            </span>
          ) : null}
        </Label>
        {children}
        {hint && !error ? (
          <p id={hintId} className="text-caption text-fg-subtle">
            {hint}
          </p>
        ) : null}
        {hint && error ? (
          <p id={hintId} className="sr-only">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="flex items-start gap-1.5 text-caption text-error">
            <WarningCircleIcon aria-hidden className="mt-px size-4 shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

export function Label({ className, ...props }: ComponentPropsWithRef<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("text-body-sm font-medium text-ink-100 light:text-ink-950", className)}
      {...props}
    />
  );
}
